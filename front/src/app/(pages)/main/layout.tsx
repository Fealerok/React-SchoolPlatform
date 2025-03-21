"use client"
import React, {useContext, useEffect, useState} from 'react'
import logo from "../../../../public/logo.png";
import Image from 'next/image';
import Aside from '@/app/_components/Aside/Aside';
import { useRouter } from 'next/navigation';

import { AsideContext } from '@/app/_context/asideContext';
import { AuthContext } from '@/app/_context/authContext';
import checkAuth from '@/app/_utils/checkAuth/checkAuth';
import { getTokens, setTokens } from '@/app/_utils/localStorage/localStorage';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import Profile from '@/app/_components/Profile/Profile';
import TicketToSupport from '@/app/_components/TicketToSupport/TicketToSupport';



const MainLayout = ({
    children
} : {
    children: React.ReactNode
}) => {

    const {asideType, setAsideType} = useContext(AsideContext);
    const {user, setUser} = useContext(AuthContext);

    const [isProfile, setIsProfile] = useState(false);
    const [isTicketToSupport, setIsTicketToSupport] = useState(false);

    const router = useRouter();

    useEffect(() => {
        startFunction();
    }, [])

    const onProfileButtonClick = () => {
        setIsTicketToSupport(false);
        setIsProfile(true);
    }

    const onTicketToSupportClick = () => {
        setIsProfile(false);
        setIsTicketToSupport(true);
    }

    const startFunction = async () => {
        const response = await fetchWithAuth("/check-auth", {
            method: "POST"
        });
        if (!response?.user){
            router.push("/auth");
        }

        else{
            console.log();
            await setUser(response.user);
            setAsideType("Главная");
        }
    }

    

  return (
    <div className='flex flex-col w-full h-full relative z-1'>

    <Profile 
    isProfile={isProfile}
    setIsProfile={setIsProfile} />

    <TicketToSupport 
    isTicketToSupport={isTicketToSupport}
    setIsTicketToSupport={setIsTicketToSupport}/>

        <header className='h-20 border-b-[3px] border-border-blocks flex justify-between items-center'>
              <div className="flex items-center">
                  <div className="xl:w-80 w-56 flex justify-center items-center">
                      <Image className='w-[60%]' src={logo} alt='' />
                  </div>

                  <div className="flex small_buttons gap-[20px] text-[12px] xl:text-[18px]">
                      <button 
                      className='h-[40px] pl-[10px] pr-[10px]'
                      onClick={onTicketToSupportClick}>Обратиться в техподдержку</button>

                      <button
                          className={`${user?.role == "Техподдержка" ? "block" : "hidden"} h-[40px] pl-[10px] pr-[10px]`}
                          onClick={() => setAsideType("Список обращений")}>Список обращений</button>
                  </div>
              </div>

            <button 
            onClick={onProfileButtonClick}
            className='flex items-center gap-[10px] mr-[30px]'>
                <span>{user?.fullName}</span>
                <div className="h-[30px] w-[30px] bg-green-400 rounded-full"></div>
            </button>
            
        </header>
        <div className={`${isProfile || isTicketToSupport ? "pointer-events-none" : ""} flex h-[calc(100%-80px)] w-full relative justify-end`}>
            <Aside type={asideType} />
            {children}
        </div>
    </div>
  )
}

export default MainLayout