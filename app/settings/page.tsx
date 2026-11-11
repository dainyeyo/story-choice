"use client";

import { useApp } from "../providers";
import SettingsPanel from "../components/SettingsPanel";
import { PageHeader } from "../components/ui";

export default function SettingsPage() {
  const { displayName } = useApp();

  return (
    <main className="page-turn mx-auto w-full max-w-md space-y-8 px-4 py-8 md:max-w-2xl md:px-8 md:py-12">
      <PageHeader title="설정" sub={displayName} />
      <SettingsPanel />
    </main>
  );
}
