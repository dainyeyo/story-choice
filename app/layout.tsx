import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Gowun_Dodum } from "next/font/google";
import "./globals.css";
import Shell from "./components/Shell";
import SkyBackground from "./components/SkyBackground";
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
  title: "픽토리 | 아이의 그림이 하나의 이야기가 됩니다",
  description: "아이의 그림(Picture)이 하나의 이야기(Story)가 되고, 아이가 고른 선택에서 부모와의 대화가 시작됩니다",
};

// 로그인 정보를 브라우저(localStorage)에서만 읽는 앱이라 정적 첫 화면에는 "불러오는 중"만 있다.
// 그래서 Next의 instant navigation 검사(개발 모드 경고)를 끈다. 서버 로그인으로 바꾸면 다시 켤 수 있다.
export const instant = false;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f59e0b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${storyFont.variable} h-full antialiased`}
    >
      <head>
        {/* 저장된 라이트/다크 선택을 첫 그림보다 먼저 적용해서 화면이 번쩍이지 않게 한다 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("story-choice:theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SkyBackground />
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
