"use client"

import "./globals.css";
import { AuthProvider, AuthContext } from "./_context/authContext";
import { AsideContext, AsideProvider } from "./_context/asideContext";
import { getTokens } from "./_utils/localStorage/localStorage";
import checkAuth from "./_utils/checkAuth/checkAuth";
import { setTokens } from "./_utils/localStorage/localStorage";
import { useRouter } from "next/navigation";

import {Roboto_Mono} from "next/font/google";
import { useEffect, useContext } from "react";

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700']
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const router = useRouter();
  const {user, setUser} = useContext(AuthContext);
  useEffect(() => {

    const tokens = getTokens();
    const checkResponse = checkAuth(tokens[0], tokens[1]);
    checkResponse.then((resp) => {
      
      setTokens(resp.accessToken, resp.refreshToken);
      
      if (resp.user){
        console.log(resp.user);
        setUser(resp.user);
        setTokens(resp.accessToken, resp.refreshToken);
        router.push("/main");
      }

      else{
        router.push("/auth");
      }
    });

  }, []);


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

