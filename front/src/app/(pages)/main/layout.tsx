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



const MainLayout = ({
    children
} : {
    children: React.ReactNode
}) => {

    const {asideType, setAsideType} = useContext(AsideContext);
    const {user, setUser} = useContext(AuthContext);

    const [isProfile, setIsProfile] = useState(false);

    const router = useRouter();

    useEffect(() => {
        startFunction();
    }, [])

    const onProfileButtonClick = () => {
        setIsProfile(true);
    }

    const startFunction = async () => {
        console.log(123);
        const response = await fetchWithAuth("/check-auth", {
            method: "POST"
        });
        console.log(response);
        console.log(323);
        if (!response?.user){
            router.push("/auth");
        }

        else{
            console.log();
            await setUser(response.user);
            console.log(response.user);
            setAsideType("Главная");
        }
    }

    

  return (
    <div className='flex flex-col w-full h-full relative z-1'>

    <Profile 
    isProfile={isProfile}
    setIsProfile={setIsProfile} />

        <header className='h-20 border-b-[3px] border-border-blocks flex justify-between items-center'>
            <div className="w-80 flex justify-center items-center">
                <Image src={logo} alt=''/>
            </div>

            <button 
            onClick={onProfileButtonClick}
            className='flex items-center gap-[10px] mr-[30px]'>
                <span>{user?.fullName}</span>
                <div className="h-[30px] w-[30px] bg-green-400 rounded-full"></div>
            </button>
            
        </header>
        <div className={`${isProfile ? "pointer-events-none" : ""} flex h-[calc(100%-80px)] w-full relative`}>
            <Aside type={asideType} />
            {children}
        </div>
    </div>
  )
}

export default MainLayout