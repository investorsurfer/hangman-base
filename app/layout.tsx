import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hangman-base.vercel.app";

export const metadata: Metadata = {
  title: "Hangman on Base",
  description: "Pay to guess the word. Wrong guesses cost lives. No refunds.",
  other: {
    "base:app_id": "6a147000ed0edcf2e9a87720",
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/og`,
      button: {
        title: "Play Hangman for ETH",
        action: {
          type: "launch_frame",
          name: "Hangman on Base",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/splash`,
          splashBackgroundColor: "#0a0a0a",
        },
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
