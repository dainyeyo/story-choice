"use client";

// 앱 전체에서 공유하는 상태: 로그인, 동화 진행(useStory), 낭독(useNarration), 내 서재, 설정.
//
// 로그인은 "이 기기에 저장되는 간편 로그인"(닉네임 + 숫자 4자리)이다. 서버 계정이 아니므로 보안용이 아니다.
// 진짜 계정(Supabase/Firebase 등)으로 바꿀 때는 AuthProvider 안의 signUp / logIn / logOut 세 함수만 교체하면 된다.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { parseLibrary, type SavedStory } from "@/lib/library";
import { readRaw, removeKey, useStored, writeRaw } from "@/lib/localStore";
import { DEFAULT_SETTINGS, parseSettings, type Settings } from "@/lib/settings";
import { useNarration } from "./useNarration";
import { usePet } from "./usePet";
import { useStory } from "./useStory";

// ───────── 로그인 ─────────

const USERS_KEY = "story-choice:users";
const SESSION_KEY = "story-choice:session";

// 데모용 단순 해시 (보안 용도가 아님)
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function readUsers(): Record<string, string> {
  try {
    return JSON.parse(readRaw(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function validate(nick: string, pin: string): string {
  if (!nick.trim()) return "닉네임을 입력해 주세요.";
  if (nick.trim().length > 20) return "닉네임은 20자 이하로 써 주세요.";
  if (!/^\d{4}$/.test(pin)) return "비밀번호는 숫자 4자리예요.";
  return "";
}

interface AuthValue {
  ready: boolean; // 저장된 로그인 정보를 읽었는지
  user: string | null; // 로그인한 닉네임
  signUp: (nick: string, pin: string) => string; // 실패하면 에러 문장, 성공하면 ""
  logIn: (nick: string, pin: string) => string;
  logOut: () => void;
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

function StoryProvider({ user, children }: { user: string; children: ReactNode }) {
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
    removeKey(libKey);
    removeKey(`story-choice:lastMemo:${user}`);
    removeKey(`story-choice:pet:${user}`);
    removeKey(`story-choice:draft:${user}`);
    s.saveMemo("");
    s.reset();
  }, [libKey, user, s]);

  const setSettings = useCallback((next: Settings) => writeRaw(settingsKey, JSON.stringify(next)), [settingsKey]);

  const value: AppValue = { user, s, n, pet, library, settings: settings ?? DEFAULT_SETTINGS, setSettings, saveMemo, deleteStory, clearMyData };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const session = useStored(SESSION_KEY);
  const ready = session !== null;
  const user = session || null;

  const signUp = useCallback((nick: string, pin: string) => {
    const err = validate(nick, pin);
    if (err) return err;
    const name = nick.trim();
    const users = readUsers();
    if (users[name]) return "이미 있는 닉네임이에요. 로그인해 주세요.";
    writeRaw(USERS_KEY, JSON.stringify({ ...users, [name]: hash(`${name}:${pin}`) }));
    writeRaw(SESSION_KEY, name);
    return "";
  }, []);

  const logIn = useCallback((nick: string, pin: string) => {
    const err = validate(nick, pin);
    if (err) return err;
    const name = nick.trim();
    if (readUsers()[name] !== hash(`${name}:${pin}`)) return "닉네임이나 비밀번호가 맞지 않아요.";
    writeRaw(SESSION_KEY, name);
    return "";
  }, []);

  const logOut = useCallback(() => removeKey(SESSION_KEY), []);

  const auth: AuthValue = { ready, user, signUp, logIn, logOut };

  return (
    <AuthCtx.Provider value={auth}>
      {/* 계정이 바뀌면 동화 진행 상태도 새로 시작하도록 key를 준다 */}
      {user ? (
        <StoryProvider key={user} user={user}>
          {children}
        </StoryProvider>
      ) : (
        children
      )}
    </AuthCtx.Provider>
  );
}
