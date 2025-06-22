import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import localFont from "next/font/local";
import toast, { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { auth } from "../../auth";
import { RootLayoutProps } from "@/types";
import { CourseProvider } from "@/components/course-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LearnAI Studio",
  description:
    "Transforming prompts into personalized learning experiences with AI",
};

const fontHeading = localFont({
  src: "../../public/assets/fonts/CalSans-SemiBold.ttf",
  variable: "--font-heading",
});
const fontHeadingAlt = localFont({
  src: "../../public/assets/fonts/cd-semi.otf",
  variable: "--font-headingAlt",
});

const fontSubHeading = localFont({
  src: "../../public/assets/fonts/product-font.ttf",
  variable: "--font-subheading",
});
const fontSubAlt = localFont({
  src: "../../public/assets/fonts/jakarta.ttf",
  variable: "--font-subalt",
});

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`antialiased overflow-x-hidden overflow-y-auto relative h-full w-full bg-slate-950 text-slate-900 dark:text-slate-50 ${inter.className} ${fontHeading.variable} ${fontSubHeading.variable} ${fontHeadingAlt.variable} ${fontSubAlt.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SessionProvider session={session}>
            <CourseProvider>
              {children}
            </CourseProvider>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
