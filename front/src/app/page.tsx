"use client"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthContext } from "./_context/authContext";

export default function Home() {

  const router: AppRouterInstance = useRouter();

  const {user} = useContext(AuthContext);
  useEffect(() => {

    console.log(user);
    if (user){
      alert(user.login);
    }

    else{
      router.push('/auth');
    }
  }, []);

  return (
    <div className="">
      
    </div>
  );
}
