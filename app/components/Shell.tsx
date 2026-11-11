"use client";

// 모든 화면을 감싸는 틀: 메뉴(PC는 위, 폰은 아래 탭) + 로그인 확인.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../providers";

const PUBLIC = ["/", "/login"];

const MENU = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/create", label: "동화 만들기", icon: "✨" },
  { href: "/library", label: "내 서재", icon: "📚" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

export default function Shell({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC.includes(pathname);
  const blocked = ready && !user && !isPublic;

  useEffect(() => {
    if (blocked) router.replace("/login");
    if (ready && user && pathname === "/login") router.replace("/");
  }, [blocked, ready, user, pathname, router]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  // 읽는 중에는 "동화 만들기" 탭을 켜 둔다
  const isMenuActive = (href: string) =>
    active(href) || (href === "/create" && (pathname.startsWith("/read") || pathname.startsWith("/card")));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-amber-200/60 bg-[#fff7e8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="font-[family-name:var(--font-story)] text-xl text-amber-800">
            🌙 우리 아이 동화
          </Link>

          {user ? (
            <nav className="hidden items-center gap-1 md:flex" aria-label="주 메뉴">
              {MENU.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`rounded-full px-4 py-2 text-base ${
                    isMenuActive(m.href) ? "bg-amber-500 font-bold text-white" : "text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  {m.label}
                </Link>
              ))}
            </nav>
          ) : (
            ready && (
              <Link href="/login" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white">
                로그인
              </Link>
            )
          )}
        </div>
      </header>

      <div className={`flex-1 ${user ? "pb-24 md:pb-8" : "pb-8"}`}>
        {!ready || blocked ? (
          <p className="mt-24 text-center text-amber-800/60">불러오는 중…</p>
        ) : (
          children
        )}
      </div>

      {user && (
        <nav
          aria-label="주 메뉴"
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-amber-200 bg-[#fffaf0]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                isMenuActive(m.href) ? "font-bold text-amber-700" : "text-stone-500"
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              {m.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
