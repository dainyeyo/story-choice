import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Gowun_Dodum } from "next/font/google";
import "./globals.css";
import Shell from "./components/Shell";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 동화 본문·제목용 손글씨 느낌 한글 폰트 (한글은 용량이 커서 preload 끔)
const storyFont = Gowun_Dodum({
  variable: "--font-story",
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  title: "우리 아이 동화",
  description: "아이의 선택에서 부모와의 대화가 시작되는 동화",
};

// 로그인 정보를 브라우저(localStorage)에서만 읽는 앱이라 정적 첫 화면에는 "불러오는 중"만 있다.
// 그래서 Next의 instant navigation 검사(개발 모드 경고)를 끈다. 서버 로그인으로 바꾸면 다시 켤 수 있다.
export const instant = false;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${storyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
