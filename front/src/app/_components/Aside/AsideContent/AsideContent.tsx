import React, { useContext, useEffect } from 'react'

import AsideButton from '@/app/_ui/Aside_button/Aside_button'
import { AuthContext } from '@/app/_context/authContext';
import Calendar from '../../Schedule/Calendar/Calendar';
import { AsideContext } from '@/app/_context/asideContext';

const AsideContent = ({
    type
} : {
    type: string
}) => {

    const {user, setUser} = useContext(AuthContext);

    const {asideType} = useContext(AsideContext);

    if (user?.role == "Администратор" || user?.role == "Техподдержка"){
        return (
            <>
                <div className="flex flex-col w-full gap-8 mt-[45px]">
                    <AsideButton buttonText='Главная'/> 
                    <AsideButton buttonText='Расписание классы'/> 
                    <AsideButton buttonText='Списки классы'/> 
                    <AsideButton buttonText='Учителя'/> 
                </div>
                    
                <div className={`${asideType == "Расписание классы" ? "block" : "hidden"} w-[280px] h-[300px] rounded-6 border-[3px] border-border-blocks mt-auto mb-auto`}>
                    <Calendar />
                </div>
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