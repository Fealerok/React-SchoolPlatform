"use client"

import React, { useEffect, useState } from 'react'
import Input from '@/app/_ui/Input/Input'

interface IAddClass{
    isAddClass: boolean, 
    setIsAddClass: (data: boolean) => void,
    setNewClass: (data: string | undefined) => void,
}



const AddClass = ({isAddClass, setIsAddClass, setNewClass} : IAddClass) => {

    const [nameClass, setNameClass] = useState<string | undefined>("");

    const addNewClass = async () => {
        const response = await fetch("http://localhost:3010/add-new-class", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nameClass
            })
        });

        console.log(response)
    }

    const addButtonHandle = () => {

        if (nameClass?.trim() != ""){
            setNewClass(nameClass);
            addNewClass();
            setIsAddClass(false);
        }
        else setIsAddClass(false);
    }

  return (
    <div className={`${isAddClass ? "block" : "hidden"} flex flex-col items-center border-[3px] border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] right-0 bottom-0 w-[30%] h-[40%] bg-additional-bg`}>
        <span className='mt-[35px] text-xl'>Введите номер и название класса:</span>

        <div className="w-[80%] mt-[15px]">
            <Input 
            inputPlaceholder={"Название"} 
            setInputValue={setNameClass} 
            isLabel={false} type='Текст' />
        </div>

        <div className={` flex justify-between w-[70%] h-full small_buttons translate-y-[60%]`}>
            <button 
            className='pl-[15px] h-[30px] pr-[15px]' 
            onClick={() => addButtonHandle()}>Сохранить</button>

            <button 
            className='pl-[15px] h-[30px] pr-[15px]' 
            onClick={() => setIsAddClass(false)}>Отменить</button>
        </div>

    </div>
  )
}

export default AddClass