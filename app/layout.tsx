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

// 사용자 세션과 개인화 데이터를 확인한 다음 화면을 렌더링한다.
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
      <body className="min-h-full flex flex-col">
        <SkyBackground />
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
