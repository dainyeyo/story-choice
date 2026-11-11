"use client";

// 사용자 데이터는 브라우저 메모리에서 읽고 즉시 갱신한 뒤 Supabase에 저장한다.
// localStorage에는 사용자 데이터나 인증 정보를 남기지 않는다.

import { useSyncExternalStore } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const EVT = "story-choice:store";
const values = new Map<string, string>();
let activeUserId: string | null = null;
const pendingWrites = new Map<string, Promise<unknown>>();

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function readRaw(key: string): string {
  return values.get(key) ?? "";
}

function persistRaw(key: string, value: string): Promise<void> {
  if (!activeUserId) return Promise.resolve();
  const client = getSupabaseBrowserClient();
  if (!client) return Promise.reject(new Error("Supabase 설정을 확인해 주세요."));
  let jsonValue: unknown = value;
  try { jsonValue = JSON.parse(value); } catch { /* raw string value */ }
  const id = activeUserId;
  const writeKey = `${id}:${key}`;
  const previous = pendingWrites.get(writeKey) ?? Promise.resolve();
  const write = previous.catch(() => undefined).then(async () => {
    const { error } = await client.from("user_data").upsert(
      { user_id: id, key, value: jsonValue, updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" },
    );
    if (error) throw new Error(error.message);
  });
  pendingWrites.set(writeKey, write);
  void write.then(
    () => { if (pendingWrites.get(writeKey) === write) pendingWrites.delete(writeKey); },
    () => { if (pendingWrites.get(writeKey) === write) pendingWrites.delete(writeKey); },
  );
  return write;
}

export function writeRaw(key: string, value: string) {
  values.set(key, value);
  window.dispatchEvent(new Event(EVT));
  void persistRaw(key, value).catch((error) => console.error("[user_data upsert]", error));
}

export async function writeRawAndWait(key: string, value: string) {
  values.set(key, value);
  window.dispatchEvent(new Event(EVT));
  await persistRaw(key, value);
}

export function removeKey(key: string) {
  values.delete(key);
  window.dispatchEvent(new Event(EVT));
  if (!activeUserId) return;
  const client = getSupabaseBrowserClient();
  if (!client) return;
  const id = activeUserId;
  const writeKey = `${id}:${key}`;
  const previous = pendingWrites.get(writeKey) ?? Promise.resolve();
  const deletion = previous.then(() => client.from("user_data").delete().eq("user_id", id).eq("key", key))
    .then(({ error }) => { if (error) console.error("[user_data delete]", error.message); });
  pendingWrites.set(writeKey, deletion);
  void deletion.then(
    () => { if (pendingWrites.get(writeKey) === deletion) pendingWrites.delete(writeKey); },
    () => { if (pendingWrites.get(writeKey) === deletion) pendingWrites.delete(writeKey); },
  );
}

export async function hydrateUserData(userId: string) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  const { data, error } = await client.from("user_data").select("key,value").eq("user_id", userId);
  if (error) throw error;
  let rows: { key: string; value: unknown }[] = data ?? [];

  // 기존 닉네임 로그인에서 쓰던 이 기기의 자료를 최초 한 번 계정으로 옮긴다.
  if (typeof localStorage !== "undefined") {
    const oldNickname = localStorage.getItem("story-choice:session");
    if (oldNickname) {
      const keys = ["library", "settings", "pet", "draft", "lastMemo", "insight", "situations", "theme"];
      const present = new Set(rows.map((row) => row.key));
      const legacy = keys.flatMap((part) => {
        const key = `story-choice:${part}:${oldNickname}`;
        const raw = part === "theme"
          ? localStorage.getItem("story-choice:theme")
          : localStorage.getItem(key);
        if (raw === null || present.has(key)) return [];
        try { return [{ user_id: userId, key, value: JSON.parse(raw) }]; }
        catch { return [{ user_id: userId, key, value: raw }]; }
      });
      if (legacy.length) {
        const { error: migrationError } = await client.from("user_data").upsert(legacy, { onConflict: "user_id,key" });
        if (migrationError) throw migrationError;
        rows = [...rows, ...legacy];
      }
      localStorage.removeItem("story-choice:session");
      localStorage.removeItem("story-choice:users");
      localStorage.removeItem("story-choice:theme");
      for (const part of keys) localStorage.removeItem(`story-choice:${part}:${oldNickname}`);
    }
  }

  activeUserId = userId;
  values.clear();
  for (const row of rows) values.set(row.key, typeof row.value === "string" ? row.value : JSON.stringify(row.value));
  window.dispatchEvent(new Event(EVT));
  window.dispatchEvent(new Event("story-choice:memo"));
}

export async function clearUserData() {
  const client = getSupabaseBrowserClient();
  const id = activeUserId;
  values.clear();
  window.dispatchEvent(new Event(EVT));
  window.dispatchEvent(new Event("story-choice:memo"));
  if (!client || !id) return;
  await Promise.allSettled(pendingWrites.values());
  const { error } = await client.from("user_data").delete().eq("user_id", id);
  if (error) throw error;
}

export function clearUserDataMemory() {
  activeUserId = null;
  values.clear();
  pendingWrites.clear();
  window.dispatchEvent(new Event(EVT));
}

export async function waitForUserDataWrites() {
  await Promise.allSettled(pendingWrites.values());
}

/** key의 문자열 값을 구독한다. 서버/하이드레이션 중에는 null. */
export function useStored(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
}
