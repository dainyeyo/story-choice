"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { btnPrimary, errorCls, inputCls, Label, Segmented } from "../components/ui";

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
    <main className="rise mx-auto w-full max-w-sm px-4 py-12 md:py-20">
      <h1 className="story text-center text-3xl font-bold text-ink md:text-4xl">{mode === "login" ? "로그인" : "가입하기"}</h1>
      <p className="mt-2 text-center text-[15px] text-ink-2">
        {mode === "login" ? "지난 동화와 메모를 이어서 봅니다" : "닉네임과 숫자 4자리면 충분해요"}
      </p>

      <div className="mt-8">
        <Segmented
          label="로그인 방식"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError("");
          }}
          options={[
            { value: "login", label: "로그인" },
            { value: "signup", label: "가입하기" },
          ]}
        />
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block space-y-1">
          <Label>보호자 닉네임</Label>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            maxLength={20}
            autoComplete="username"
            placeholder="예: 하윤맘"
            className={inputCls}
          />
        </label>
        <label className="block space-y-1">
          <Label>비밀번호 (숫자 4자리)</Label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={inputCls}
          />
        </label>

        {error && (
          <p role="alert" className={errorCls}>
            {error}
          </p>
        )}

        <button type="submit" className={btnPrimary}>
          {mode === "login" ? "로그인" : "가입하고 시작"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-3">이 기기에 저장되는 간편 로그인입니다. 아이 이름 같은 개인정보는 적지 마세요.</p>
    </main>
  );
}
