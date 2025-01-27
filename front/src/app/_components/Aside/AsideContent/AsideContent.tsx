import React from 'react'

import AsideButton from '@/app/_ui/Aside_button/Aside_button'

const AsideContent = ({
    type
} : {
    type: string
}) => {

    if (type == "main"){
        return (
            <>
                <div className="flex flex-col w-full gap-8 mt-[45px]">
                    <AsideButton buttonText='Главная'/> 
                    <AsideButton buttonText='Расписание классы'/> 
                    <AsideButton buttonText='Списки классы'/> 
                    <AsideButton buttonText='Учителя'/> 
                </div>
                    
                <div className="w-[280px] h-[280px] border border-black mt-auto mb-auto"></div>
            </>
        )
    }

    else{
        return ( 
            <>
            
            </>
        )
    }
}

export default AsideContent