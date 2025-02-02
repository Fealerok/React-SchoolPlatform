"use client"
import React, {useContext, useEffect, useState } from 'react'
import logo from "../../../../public/logo.png";
import Image from 'next/image';
import Aside from '@/app/_components/Aside/Aside';
import { useRouter } from 'next/navigation';

import { AsideContext } from '@/app/_context/asideContext';
import { AuthContext } from '@/app/_context/authContext';
import checkAuth from '@/app/_utils/checkAuth/checkAuth';
import { getTokens } from '@/app/_utils/localStorage/localStorage';


const MainLayout = ({
    children
} : {
    children: React.ReactNode
}) => {

    const {asideType, setAsideType} = useContext(AsideContext);
    const {user, setUser} = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        setAsideType("ClassList");
    }, [])

  return (
    <div className='flex flex-col w-full h-full'>
        <header className='h-20 border-b-[3px] border-border-blocks'>
            <div className="w-80 flex justify-center items-center">
                <Image src={logo} alt=''/>
            </div>
            
        </header>
        <div className='flex h-[calc(100%-80px)] w-full relative'>
            <Aside type={asideType} />
            {children}
        </div>
    </div>
  )
}

export default MainLayout