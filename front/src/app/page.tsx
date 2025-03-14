"use client"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthContext } from "./_context/authContext";
import { fetchWithAuth } from "./_utils/fetchWithAuth/fetchWithAuth";
import { AsideContext } from "./_context/asideContext";

export default function Home() {

  const router: AppRouterInstance = useRouter();

  const {user, setUser} = useContext(AuthContext);
  const {asideType, setAsideType} = useContext(AsideContext);
 useEffect(() => {
         startFunction();
 
     }, [])
 
     const startFunction = async () => {
        console.log(1);
         const response = await fetchWithAuth("/check-auth", {
             method: "POST"
         });

         
         if (!response?.user){
             router.push("/auth");
             console.log(2);
         }
         
         else{
            console.log(3);
             await setUser(response.user);
             console.log(response.user);
             setAsideType("Главная");
             router.push("/main");
         }
     }

  return (
    <div className="h-full">
      123
    </div>
  );
}
