"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { bigBtn, Card, inputCls } from "../components/ui";

export default function LoginPage() {
  const { logIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nick, setNick] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = mode === "login" ? logIn(nick, pin) : signUp(nick, pin);
    if (err) setError(err);
    else router.replace("/");
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
      <div className="space-y-1 text-center">
        <div className="text-5xl">🌙</div>
        <h1 className="font-[family-name:var(--font-story)] text-3xl text-amber-800">
          {mode === "login" ? "다시 만나서 반가워요" : "처음이시군요!"}
        </h1>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-amber-50 p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`rounded-xl py-2 font-bold ${mode === m ? "bg-amber-500 text-white" : "text-amber-800"}`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="font-semibold text-amber-900">보호자 닉네임</span>
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              maxLength={20}
              autoComplete="username"
              placeholder="예: 하윤맘"
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block">
            <span className="font-semibold text-amber-900">비밀번호 (숫자 4자리)</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••"
              className={`${inputCls} mt-1`}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <button type="submit" className={bigBtn}>
            {mode === "login" ? "로그인" : "가입하고 시작하기"}
          </button>
        </form>
      </Card>

      <p className="text-center text-xs text-stone-500">
        이 기기에 저장되는 간편 로그인이에요. 아이 이름 같은 개인정보는 쓰지 마세요.
      </p>
    </main>
  );
}
