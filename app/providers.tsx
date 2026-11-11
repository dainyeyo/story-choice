"use client";

// 앱 전체에서 공유하는 상태: 로그인, 동화 진행(useStory), 낭독(useNarration), 내 서재, 설정.
//
// 계정 인증과 사용자 데이터 저장은 Supabase Auth 및 RLS가 적용된 Postgres를 사용한다.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { parseLibrary, type SavedStory } from "@/lib/library";
import { clearUserData, clearUserDataMemory, hydrateUserData, readRaw, useStored, waitForUserDataWrites, writeRaw } from "@/lib/localStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DEFAULT_SETTINGS, parseSettings, type Settings } from "@/lib/settings";
import { useNarration } from "./useNarration";
import { usePet } from "./usePet";
import { useStory } from "./useStory";

// ───────── 로그인 ─────────

interface AuthValue {
  ready: boolean;
  user: string | null;
  displayName: string;
  authError: string;
  signUp: (email: string, password: string, nickname: string) => Promise<{ error: string; notice?: string }>;
  logIn: (email: string, password: string) => Promise<{ error: string; notice?: string }>;
  logOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthValue | null>(null);

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth는 AppProviders 안에서만 쓸 수 있어요.");
  return v;
}

// ───────── 앱 상태 ─────────

type StoryHook = ReturnType<typeof useStory>;
type NarrationHook = ReturnType<typeof useNarration>;
type PetHook = ReturnType<typeof usePet>;

interface AppValue {
  user: string;
  displayName: string;
  s: StoryHook;
  n: NarrationHook;
  pet: PetHook;
  library: SavedStory[];
  settings: Settings;
  setSettings: (next: Settings) => void;
  saveMemo: (text: string) => void; // 방금 읽은 동화의 메모로 저장 + 다음 동화에 이어짐
  deleteStory: (id: string) => void;
  clearMyData: () => void;
}

const AppCtx = createContext<AppValue | null>(null);

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp은 로그인한 화면 안에서만 쓸 수 있어요.");
  return v;
}

function StoryProvider({ user, displayName, children }: { user: string; displayName: string; children: ReactNode }) {
  const s = useStory(user);
  const n = useNarration();

  const libKey = `story-choice:library:${user}`;
  const settingsKey = `story-choice:settings:${user}`;
  const libRaw = useStored(libKey);
  const settingsRaw = useStored(settingsKey);
  const library = useMemo(() => parseLibrary(libRaw), [libRaw]);
  const settings = useMemo(() => parseSettings(settingsRaw), [settingsRaw]);
  const pet = usePet(user, library);
  const markPetCare = pet.markCare;
  const clearStoryDraft = s.clearDraft;

  // 부모 카드가 만들어지면 그 동화를 서재에 한 번 저장한다.
  const savedCard = useRef<unknown>(null);
  const currentId = useRef("");
  useEffect(() => {
    if (s.step !== "card" || !s.card || !s.req || savedCard.current === s.card) return;
    savedCard.current = s.card;
    const id = String(Date.now());
    currentId.current = id;
    const entry: SavedStory = {
      id,
      createdAt: Date.now(),
      title: s.title,
      situation: s.req.situation,
      age: s.req.age,
      protagonist: s.req.protagonist,
      scenes: s.scenes,
      choices: s.chosen,
      card: s.card,
      memo: "",
    };
    writeRaw(libKey, JSON.stringify([entry, ...parseLibrary(readRaw(libKey))]));
    markPetCare();
    clearStoryDraft();
  }, [s.step, s.card, s.req, s.title, s.scenes, s.chosen, libKey, markPetCare, clearStoryDraft]);

  const saveMemo = useCallback(
    (text: string) => {
      s.saveMemo(text);
      const list = parseLibrary(readRaw(libKey));
      const i = list.findIndex((x) => x.id === currentId.current);
      if (i >= 0) {
        list[i] = { ...list[i], memo: text.trim() };
        writeRaw(libKey, JSON.stringify(list));
      }
      if (text.trim()) markPetCare();
    },
    [s, libKey, markPetCare],
  );

  const deleteStory = useCallback(
    (id: string) => writeRaw(libKey, JSON.stringify(parseLibrary(readRaw(libKey)).filter((x) => x.id !== id))),
    [libKey],
  );

  const clearMyData = useCallback(() => {
    void clearUserData().catch((error) => console.error("[clear user data]", error));
    s.reset();
  }, [s]);

  const setSettings = useCallback((next: Settings) => writeRaw(settingsKey, JSON.stringify(next)), [settingsKey]);

  const value: AppValue = { user, displayName, s, n, pet, library, settings: settings ?? DEFAULT_SETTINGS, setSettings, saveMemo, deleteStory, clearMyData };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");

  const activateUser = useCallback(async (id: string, name: string) => {
    await hydrateUserData(id);
    setUser(id);
    setDisplayName(name || "보호자");
    setAuthError("");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        const client = getSupabaseBrowserClient();
        if (!client) {
          setAuthError("Supabase 설정이 아직 연결되지 않았어요. 프로젝트 관리자에게 환경변수 설정을 요청해 주세요.");
          setReady(true);
          return;
        }
        try {
          const { data, error } = await client.auth.getUser();
          if (error && error.name !== "AuthSessionMissingError") throw error;
          if (data.user) await activateUser(data.user.id, String(data.user.user_metadata?.nickname ?? data.user.email?.split("@")[0] ?? "보호자"));
        } catch (error) {
          setAuthError(error instanceof Error ? `계정 정보를 불러오지 못했어요: ${error.message}` : "계정 정보를 불러오지 못했어요.");
        } finally {
          setReady(true);
        }
      })();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activateUser]);

  const signUp = useCallback(async (email: string, password: string, nickname: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) return { error: "Supabase 설정이 아직 연결되지 않았어요." };
    if (!email.trim()) return { error: "이메일을 입력해 주세요." };
    if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 해요." };
    if (!nickname.trim()) return { error: "보호자 닉네임을 입력해 주세요." };
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nickname: nickname.trim().slice(0, 20) } },
    });
    if (error) return { error: error.message };
    if (data.user && data.session) {
      try { await activateUser(data.user.id, nickname.trim()); }
      catch { return { error: "계정은 만들어졌지만 DB를 불러오지 못했어요. 잠시 후 다시 로그인해 주세요." }; }
      return { error: "" };
    }
    return { error: "", notice: "가입 확인 링크를 이메일로 보냈어요. 확인한 뒤 로그인해 주세요." };
  }, [activateUser]);

  const logIn = useCallback(async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) return { error: "Supabase 설정이 아직 연결되지 않았어요." };
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    try {
      await activateUser(data.user.id, String(data.user.user_metadata?.nickname ?? data.user.email?.split("@")[0] ?? "보호자"));
      return { error: "" };
    } catch {
      return { error: "DB를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." };
    }
  }, [activateUser]);

  const logOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    await waitForUserDataWrites();
    clearUserDataMemory();
    setUser(null);
    setDisplayName("");
    if (client) await client.auth.signOut();
  }, []);

  const auth: AuthValue = { ready, user, displayName, authError, signUp, logIn, logOut };

  return (
    <AuthCtx.Provider value={auth}>
      {/* 계정이 바뀌면 동화 진행 상태도 새로 시작하도록 key를 준다 */}
      {user ? (
        <StoryProvider key={user} user={user} displayName={displayName}>
          {children}
        </StoryProvider>
      ) : (
        children
      )}
    </AuthCtx.Provider>
  );
}
