import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Resvor - Lounge Manager",
  description: "Resvor lounge manager dashboard",
  icons: {
    icon: "/images/logo.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#F4F4FF] overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
