"use client"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthContext } from "./_context/authContext";
import checkAuth from "./_utils/checkAuth/checkAuth";
import { getTokens, setTokens } from "./_utils/localStorage/localStorage";

export default function Home() {

  const router: AppRouterInstance = useRouter();

  const {user, setUser} = useContext(AuthContext);
  useEffect(() => {
    setTokensAndUser();

  }, []);

  const setTokensAndUser = () => {
    const tokens = getTokens();
    const checkResponse = checkAuth(tokens[0], tokens[1]);

    checkResponse.then(async (resp) => {
      console.log(resp);
      if (resp.user){
        await setUser(resp.user);
        setTokens(resp.accessToken, resp.refreshToken);
        router.push("/main");
      }

      else {
        router.push("/auth");
        setTokens(undefined, undefined);
      }
    });
  }

  return (
    <div className="h-full">
      
    </div>
  );
}
