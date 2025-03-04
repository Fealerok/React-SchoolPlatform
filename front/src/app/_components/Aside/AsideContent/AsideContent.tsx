import React, { useContext, useEffect, useRef, useState } from 'react'

import AsideButton from '@/app/_ui/Aside_button/Aside_button'
import { AuthContext } from '@/app/_context/authContext';
import Calendar from '../../Schedule/Calendar/Calendar';
import { AsideContext } from '@/app/_context/asideContext';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';
import { ScheduleContext } from '@/app/_context/scheduleContext';

const AsideContent = ({
    type
} : {
    type: string
}) => {

    const {user, setUser} = useContext(AuthContext);

    const {asideType} = useContext(AsideContext);
    const {setScheduleClassName} = useContext(ScheduleContext);
    const [classes, setClasses] = useState<Array<{id: number, name: string}>>([])

    const router = useRouter();
    const selectRef = useRef<HTMLSelectElement>(null);
    const getClasses = async () => {
    
           const response = await fetchWithAuth("/get-classes", {method: "POST"});
           
            
           if (!response) router.push("/auth");
           else{
            setClasses(response.classes);
           }
        }

    useEffect(() => {
        getClasses();
    }, [asideType]);

    const changeScheduleClassName = () => {
        if (selectRef.current){
            const value = selectRef.current.value;
            setScheduleClassName(value);
        }
    }

    if (user?.role == "Администратор" || user?.role == "Техподдержка"){
        return (
            <>
                <div className="flex flex-col w-full gap-8 mt-[45px]">
                    <AsideButton buttonText='Главная'/> 
                    <AsideButton buttonText='Расписание классы'/> 
                    <AsideButton buttonText='Списки классы'/> 
                    <AsideButton buttonText='Учителя'/> 

                    {asideType == "Главная" || asideType == "Расписание классы" ? (
                        <select ref={selectRef} onChange={changeScheduleClassName} className=' transition-colors duration-150 border-2 border-border-blocks mr-5 ml-5 rounded-[6px] h-10 text-left pl-[15px] outline-none text-2xl'>
                            <option disabled>Выбор класса</option>
                            {classes.map(classItem => (
                                <option key={classItem.id} value={classItem.name}>{classItem.name}</option>
                            ))}
                        </select>
                    ) : null}
                    
                </div>
                    
                <div className={`${asideType == "Расписание классы" || asideType == "Главная" ? "block" : "hidden"} w-[280px] h-[300px] rounded-6 border-[3px] border-border-blocks mt-auto mb-auto`}>
                    <Calendar />
                </div>
            </>
        )
    }

    else if (user?.role == "Учитель"){
        return (
            <>
                <div className="flex flex-col w-full gap-8 mt-[45px]">
                    <AsideButton buttonText='Главная'/> 
                </div>
                    
                <div className={`${asideType == "Главная" ? "block" : "hidden"} w-[280px] h-[300px] rounded-6 border-[3px] border-border-blocks mt-auto mb-auto`}>
                    <Calendar />
                </div>
            </>
        )
    }
}

export default AsideContent