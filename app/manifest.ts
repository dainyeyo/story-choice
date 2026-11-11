import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "픽토리 Pictory",
    short_name: "픽토리",
    description: "아이의 그림이 하나의 이야기가 됩니다",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7e8",
    theme_color: "#f59e0b",
    lang: "ko",
    icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
