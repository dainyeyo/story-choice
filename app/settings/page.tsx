"use client";

import { useRouter } from "next/navigation";
import { FONT_CLASS } from "@/lib/settings";
import { useApp, useAuth } from "../providers";
import { btnSecondary, Card, PageHeader, Segmented } from "../components/ui";

export default function SettingsPage() {
  const { user, settings, setSettings, clearMyData } = useApp();
  const { logOut } = useAuth();
  const router = useRouter();

  return (
    <main className="rise mx-auto w-full max-w-md space-y-8 px-4 py-8 md:max-w-2xl md:px-8 md:py-12">
      <PageHeader title="설정" sub={`${user} 보호자님`} />

      <Card className="space-y-4">
        <h2 className="story text-xl text-ink">동화 글자 크기</h2>
        <Segmented
          label="동화 글자 크기"
          value={settings.fontSize}
          onChange={(fontSize) => setSettings({ ...settings, fontSize })}
          options={[
            { value: "md" as const, label: "보통" },
            { value: "lg" as const, label: "크게" },
            { value: "xl" as const, label: "아주 크게" },
          ]}
        />
        <p className={`story rounded-xl bg-sunk px-4 py-3 text-ink ${FONT_CLASS[settings.fontSize]}`}>
          옛날 옛적에, 작은 토끼가 살았어요.
        </p>
      </Card>

      <Card className="space-y-4">
        <h2 className="story text-xl text-ink">내 기록</h2>
        <p className="text-[15px] leading-7 text-ink-2">서재의 동화와 메모는 이 기기에만 저장돼요.</p>
        <button
          onClick={() => {
            if (window.confirm("서재의 동화와 메모를 모두 지울까요? 되돌릴 수 없어요.")) clearMyData();
          }}
          className={`${btnSecondary} text-danger`}
        >
          내 기록 모두 지우기
        </button>
      </Card>

      <button
        onClick={() => {
          logOut();
          router.replace("/");
        }}
        className={`${btnSecondary} w-full`}
      >
        로그아웃
      </button>
    </main>
  );
}
