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

    const {asideType, isOpened, setIsOpened} = useContext(AsideContext);
    const {setScheduleClassName} = useContext(ScheduleContext);
    const [classes, setClasses] = useState<Array<{id: number, name: string}>>([])
    const [selectedClass, setSelectedClass] = useState("Расписание классы");

    const router = useRouter();
    const selectRef = useRef<HTMLSelectElement>(null);
    const getClasses = async () => {
    
           const response = await fetchWithAuth("/get-classes", {method: "POST"});
           
            
           if (!response) router.push("/auth");
           else{
            setClasses(response.classes);
           }
    }

    const getClassUser = async () => {
        const response = await fetchWithAuth("/get-class-user", {
            method: "POST",
            headers:  {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idUser: user?.id
            })
        });

        if (!response) {
            router.push("/auth");
            location.reload();
            return;
        }

        setSelectedClass(response.className);
        setScheduleClassName(response.className);
    }

    useEffect(() => {
        if (user?.role != "Ученик") getClasses();
        else getClassUser();
    }, [asideType]);

    useEffect(() => {
        if (user?.role != "Ученик") getClasses();
        else getClassUser();
    }, [user]);

    const changeScheduleClassName = () => {
        if (selectRef.current){
            const value = selectRef.current.value;

            console.log(value);
            setScheduleClassName(value);
            setSelectedClass(value);
        }
    }

    if (user?.role == "Администратор" || user?.role == "Техподдержка"){
        return (
            <>
                <div className={`aside_main_buttons flex flex-col w-full gap-8 mt-[45px] ${!isOpened && "!hidden"}`} >
                    <AsideButton buttonText='Главная'/> 
                    

                    {asideType == "Главная" || asideType == "Расписание классы" ? (
                        <select
                            ref={selectRef}
                            onChange={changeScheduleClassName}
                            className='bg-transparent aside_element transition-colors duration-150 border-2 border-border-blocks mr-5 ml-5 rounded-[6px] h-10 text-left pl-[10px] outline-none text-2xl'
                            value={selectedClass}
                            
                        >
                            <option disabled>{selectedClass}</option>
                            {classes.map(classItem => (
                                <option key={classItem.id} value={classItem.name}>{classItem.name}</option>
                            ))}
                        </select>
                    ) : null}

                    <AsideButton buttonText='Списки классы' />
                    <AsideButton buttonText='Учителя' /> 
                    {user?.role == "Техподдержка" ? <AsideButton buttonText='Администраторы' /> : null}
                    
                </div>
                    
                <div className={`${asideType == "Расписание классы" || asideType == "Главная" ? "block" : "hidden"} ${!isOpened && "!hidden"} w-[280px] h-[300px] rounded-6 border-[3px] border-border-blocks mt-auto mb-auto`}>
                    <Calendar />
                </div>
            </>
        )
    }

    else if (user?.role == "Учитель"){
        return (
            <>
                <div className={`aside_main_buttons flex flex-col w-full gap-8 mt-[45px] ${!isOpened && "!hidden"}`}>
                    <AsideButton buttonText='Главная'/> 

                </div>
                    
                <div className={`${asideType == "Главная" ? "block" : "hidden"} ${!isOpened && "!hidden"} w-[280px] h-[300px] rounded-6 border-[3px] border-border-blocks mt-auto mb-auto`}>
                    <Calendar />
                </div>
            </>
        )
    }

    else if (user?.role == "Ученик"){
        return (
            <>
                <div className={`aside_main_buttons flex flex-col w-full gap-8 mt-[45px] ${!isOpened && "!hidden"}`}>
                    <AsideButton buttonText='Главная'/> 

                    {asideType == "Главная" ? (
                        <select
                            ref={selectRef}
                            onChange={changeScheduleClassName}
                            className='hidden transition-colors duration-150 border-2 border-border-blocks mr-5 ml-5 rounded-[6px] h-10 text-left pl-[15px] outline-none text-2xl'
                            value={selectedClass}
                            disabled
                            
                        >
                            <option disabled>{selectedClass}</option>
                            
                        </select>
                    ) : null}
                </div>
                    
                <div className={`${asideType == "Главная" ? "block" : "hidden"} ${!isOpened && "!hidden"} w-[280px] h-[300px] rounded-6 border-[3px] border-border-blocks mt-auto mb-auto`}>
                    <Calendar />
                </div>
            </>
        )
    }
}

export default AsideContent