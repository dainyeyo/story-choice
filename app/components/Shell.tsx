"use client";

// 모든 화면을 감싸는 틀: 메뉴(PC는 위, 폰은 아래 탭) + 로그인 확인.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../providers";
import Icon, { type IconName } from "./Icon";

const PUBLIC = ["/", "/login"];

const MENU: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/create", label: "동화 만들기", icon: "plus" },
  { href: "/library", label: "내 서재", icon: "book" },
  { href: "/settings", label: "설정", icon: "sliders" },
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
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:h-16 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-ink">
            <Icon name="moon" size={20} className="text-accent-text" />
            <span className="story text-lg">우리 아이 동화</span>
          </Link>

          {user ? (
            <nav className="hidden items-center gap-1 md:flex" aria-label="주 메뉴">
              {MENU.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={isMenuActive(m.href) ? "page" : undefined}
                  className={`calm inline-flex h-9 items-center rounded-lg px-3 text-[15px] ${
                    isMenuActive(m.href) ? "bg-sunk font-medium text-ink" : "text-ink-2 hover:bg-sunk hover:text-ink"
                  }`}
                >
                  {m.label}
                </Link>
              ))}
            </nav>
          ) : (
            ready && (
              <Link href="/login" className="calm text-[15px] text-ink-2 hover:text-ink">
                로그인
              </Link>
            )
          )}
        </div>
      </header>

      <div className={`flex-1 ${user ? "pb-20 md:pb-12" : "pb-12"}`}>
        {!ready || blocked ? <p className="mt-24 text-center text-ink-3">불러오는 중</p> : children}
      </div>

      {user && (
        <nav
          aria-label="주 메뉴"
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {MENU.map((m) => {
            const on = isMenuActive(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={on ? "page" : undefined}
                className={`calm flex h-14 flex-col items-center justify-center gap-1 text-xs ${
                  on ? "font-medium text-accent-text" : "text-ink-3"
                }`}
              >
                <Icon name={m.icon} size={20} />
                {m.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
