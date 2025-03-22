import React, { useContext, useEffect, useState } from 'react'
import AsideButton from '@/app/_ui/Aside_button/Aside_button'
import AsideContent from './AsideContent/AsideContent'
import menu_img from "../../../../public/menu.png";
import Image from 'next/image';
import { AsideContext } from '@/app/_context/asideContext';

const Aside = ({
    type
} : {
    type: string
}) => {

  const {isOpened, setIsOpened} = useContext(AsideContext);

  useEffect(() => {
    console.log(123);
  }, [isOpened]);

  return (
    <aside className={`h-full w-[330px] border-r-[3px] border-border-blocks bg-additional-bg flex flex-col shrink-0 aside ${isOpened ? "aside_opened items-center" : "aside_hidden flex items-end"}`}>
        
        {!isOpened ? 
        <button 
        onClick={() => setIsOpened(true)}
        className='w-[50px] h-[50px] m-[20px]'>
          <Image src={menu_img} alt=""></Image>
        </button> : null}
        
        <AsideContent type={type} />
        
    </aside>
  )
}

export default Aside