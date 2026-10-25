import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Studio OS — Creator Workspace",
  description: "Plan, write, produce and publish better videos in one creator workspace."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
