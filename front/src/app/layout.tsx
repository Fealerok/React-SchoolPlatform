import "./globals.css";
import { AuthProvider } from "./_context/authContext";
import { AsideProvider } from "./_context/asideContext";

import {Roboto_Mono} from "next/font/google";

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700']
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <AuthProvider>
      <AsideProvider>
        <html lang="en">
            <body
              className={`w-full h-screen flex justify-center items-center ${roboto_mono.className}`}
            >
              {children}
            </body>
        </html>
      </AsideProvider>
      
    </AuthProvider>
        
  );
}

