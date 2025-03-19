import React, { useState } from 'react'
import AsideButton from '@/app/_ui/Aside_button/Aside_button'
import AsideContent from './AsideContent/AsideContent'
import menu_img from "../../../../public/menu.png";
import Image from 'next/image';

const Aside = ({
    type
} : {
    type: string
}) => {

  const [isOpened, setIsOpened] = useState(true);

  return (
    <aside className={`h-full w-[330px] border-r-[3px] border-border-blocks bg-additional-bg flex flex-col shrink-0 aside ${isOpened ? "aside_opened items-center" : "aside_hidden flex items-end"}`}>
        
        {!isOpened ? 
        <button 
        onClick={() => setIsOpened(true)}
        className='w-[50px] h-[50px] m-[20px]'>
          <Image src={menu_img} alt=""></Image>
        </button> : null}

        <button 
        onClick={() => setIsOpened(false)}
        className={`${isOpened ? "" : "hidden"} hide_aside_button w-[287px] transition-colors duration-150 border-2 border-border-blocks hover:bg-button-bg hover:text-white mt-[30px] mr-15 ml-15 rounded-[6px] h-10 text-left pl-[15px] text-2xl`}>Свернуть меню</button>
        
        {isOpened ? 
        <AsideContent type={type} /> :
        null}
        
    </aside>
  )
}

export default Aside