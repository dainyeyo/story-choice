"use client";

// 모든 화면을 감싸는 틀: 메뉴(PC는 위, 폰은 아래 탭) + 로그인 확인.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../providers";
import Icon, { type IconName } from "./Icon";
import Logo from "./Logo";

const PUBLIC = ["/", "/login"];

const MENU: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/create", label: "새 동화", icon: "plus" },
  { href: "/library", label: "내 서재", icon: "book" },
  { href: "/settings", label: "설정", icon: "sliders" },
];

export default function Shell({ children }: { children: ReactNode }) {
  const { ready, user, logOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC.includes(pathname);
  const blocked = ready && !user && !isPublic;

  useEffect(() => {
    if (blocked) router.replace("/login");
    if (ready && user && pathname === "/login") router.replace("/");
  }, [blocked, ready, user, pathname, router]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  // 읽는 중에는 "새 동화" 탭을 켜 둔다
  const isMenuActive = (href: string) =>
    active(href) || (href === "/create" && (pathname.startsWith("/read") || pathname.startsWith("/card")));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        {/* 왼쪽 빈칸 · 가운데 로고 · 오른쪽 끝 메뉴 */}
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4 md:h-16 md:px-8">
          <div aria-hidden />
          <Link href="/" aria-label="픽토리 홈">
            <Logo />
          </Link>

          {user ? (
            <nav className="hidden items-center justify-end gap-1 md:flex" aria-label="주 메뉴">
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
              <button
                onClick={() => {
                  logOut();
                  router.replace("/");
                }}
                className="calm ml-2 inline-flex h-9 items-center rounded-lg border-l border-line pl-4 pr-3 text-[15px] text-ink-2 hover:text-ink"
              >
                로그아웃
              </button>
            </nav>
          ) : (
            <div className="flex justify-end">
              {ready && (
                <Link href="/login" className="calm text-[15px] text-ink-2 hover:text-ink">
                  로그인
                </Link>
              )}
            </div>
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
