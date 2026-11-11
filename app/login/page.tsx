"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { btnPrimary, errorCls, inputCls, Label, Segmented } from "../components/ui";

export default function LoginPage() {
  const { logIn, signUp, authError } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [accountId, setAccountId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const result = mode === "login"
        ? await logIn(accountId, password)
        : await signUp(accountId, password, nickname);
      if (result.error) setError(result.error);
      else if (result.notice) setNotice(result.notice);
      else router.replace("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "로그인 요청을 완료하지 못했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-turn mx-auto w-full max-w-sm px-4 py-12 md:py-20">
      <h1 className="story text-center text-3xl font-bold text-sky-ink md:text-4xl">{mode === "login" ? "로그인" : "가입하기"}</h1>
      <p className="mt-2 text-center text-[15px] text-sky-ink-2">
        {mode === "login" ? "저장한 동화와 마음 기록을 이어서 봅니다" : "계정을 만들고 여러 기기에서 기록을 이어가요"}
      </p>

      <div className="mt-8">
        <Segmented
          label="로그인 방식"
          fullWidth
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError("");
            setNotice("");
          }}
          options={[
            { value: "login", label: "로그인" },
            { value: "signup", label: "가입하기" },
          ]}
        />
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "signup" && <label className="block space-y-1">
          <Label onSky>보호자 닉네임</Label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            autoComplete="nickname"
            placeholder="예: 하윤맘"
            className={inputCls}
          />
        </label>}
        <label className="block space-y-1">
          <Label onSky>아이디</Label>
          <input
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={mode === "login" ? 80 : 20}
            placeholder={mode === "login" ? "아이디" : "영문 소문자·숫자 4~20자"}
            className={inputCls}
          />
        </label>
        <label className="block space-y-1">
          <Label onSky>비밀번호 (8자 이상)</Label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={inputCls}
          />
        </label>

        {authError && <p role="alert" className={errorCls}>{authError}</p>}
        {error && (
          <p role="alert" className={errorCls}>
            {error}
          </p>
        )}
        {notice && <p role="status" className="rounded-xl bg-sunk px-4 py-3 text-sm text-ink-2">{notice}</p>}

        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "연결 중…" : mode === "login" ? "로그인" : "가입하고 시작"}
        </button>
      </form>

      <p className="mt-6 text-sm text-sky-ink-2">아이디와 비밀번호로 다른 기기에서도 기록을 이어갈 수 있어요. 아이 이름이나 자세한 개인정보는 기록하지 마세요.</p>
    </main>
  );
}
