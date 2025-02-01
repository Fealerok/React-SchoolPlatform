import React, { useContext, useEffect } from 'react'

import AsideButton from '@/app/_ui/Aside_button/Aside_button'
import { AuthContext } from '@/app/_context/authContext';
import { getTokens } from '@/app/_utils/localStorage/localStorage';
import checkAuth from '@/app/_utils/checkAuth/checkAuth';

const AsideContent = ({
    type
} : {
    type: string
}) => {

    const {user, setUser} = useContext(AuthContext);

    useEffect(() => {
        const checkAuthResult = checkAuth(getTokens()[0], getTokens()[1]).then((res) => setUser(res.user));
    }, [])

    if (user?.role == "Администратор" || user?.role == "Техподдержка"){
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