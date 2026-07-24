import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/hooks/query/ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/context/AuthProvider";
import NoInternetPopup from "@/components/global/NoInternetPopup";
import WalkthroughWrapper from "@/components/walkthrough/WalkthroughWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Resvor - Lounge Manager",
  description: "Resvor lounge manager dashboard",
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-[#F4F4FF] overflow-x-hidden`}
      >
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
          }}
        />
        <NoInternetPopup />
        <ReactQueryProvider>
          <AuthProvider>
            <WalkthroughWrapper />
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
