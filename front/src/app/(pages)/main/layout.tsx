"use client"
import React, {useContext, useEffect, useState } from 'react'
import logo from "../../../../public/logo.png";
import Image from 'next/image';
import Aside from '@/app/_components/Aside/Aside';

import { AsideContext } from '@/app/_context/asideContext';


const MainLayout = ({
    children
} : {
    children: React.ReactNode
}) => {

    const {asideType, setAsideType} = useContext(AsideContext);

    useEffect(() => {
        setAsideType("main");
    }, []);

  return (
    <div className='flex flex-col w-full h-full'>
        <header className='h-20 border-b-[3px] border-border-blocks'>
            <div className="w-80 flex justify-center items-center">
                <Image src={logo} alt=''/>
            </div>
            
        </header>
        <div className='flex h-full w-full'>
            <Aside type={asideType} />
            {children}
        </div>
    </div>
  )
}

export default MainLayout