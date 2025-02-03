"use client"
import React, {useContext, useEffect} from 'react'
import logo from "../../../../public/logo.png";
import Image from 'next/image';
import Aside from '@/app/_components/Aside/Aside';
import { useRouter } from 'next/navigation';

import { AsideContext } from '@/app/_context/asideContext';
import { AuthContext } from '@/app/_context/authContext';
import checkAuth from '@/app/_utils/checkAuth/checkAuth';
import { getTokens, setTokens } from '@/app/_utils/localStorage/localStorage';



const MainLayout = ({
    children
} : {
    children: React.ReactNode
}) => {

    const {asideType, setAsideType} = useContext(AsideContext);
    const {user, setUser} = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        const tokens = getTokens();
        const checkAuthResponse = checkAuth(tokens[0], tokens[1]);

        checkAuthResponse.then(async (resp) => {
            
            if (resp.user){
              
              await setUser(resp.user);
              console.log(resp.user)
              setTokens(resp.accessToken, resp.refreshToken);
              setAsideType("Главная");
            }
      
            else router.push("/auth");
          });
        
    }, [])

    

  return (
    <div className='flex flex-col w-full h-full'>
        <header className='h-20 border-b-[3px] border-border-blocks flex justify-between items-center'>
            <div className="w-80 flex justify-center items-center">
                <Image src={logo} alt=''/>
            </div>

            <button>
                <span>{user?.fullName}</span>
            </button>
            
        </header>
        <div className='flex h-[calc(100%-80px)] w-full relative'>
            <Aside type={asideType} />
            {children}
        </div>
    </div>
  )
}

export default MainLayout