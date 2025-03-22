"use client"

import React, { useEffect, useReducer, useState } from 'react'
import Input from '@/app/_ui/Input/Input'
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth'
import { useRouter } from 'next/navigation'


interface IAddStudent{
    isAddStudent: boolean, 
    setIsAddStudent: (data: boolean) => void,
    setNewStudent: (data: string | undefined) => void,
    selectedClassId: number | null | undefined
}

const AddStudent = ({
    setNewStudent,
    isAddStudent,
    setIsAddStudent,
    selectedClassId
} : IAddStudent) => {

    const [name, setName] = useState<string>();
    const [surname, setSurname] = useState<string>();
    const [patronymic, setPatronymic] = useState<string | undefined>();
    const router = useRouter();

    const addStudentHandle = async () => {
        if (!name || !surname){
            alert("Некоторые поля не введены, необходимые для добавления нового ученика.");
            return;
        }

        const response = await fetchWithAuth("/add-student-in-class", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                surname,
                name, 
                patronymic,
                selectedClassId
            })
        });

        if (!response){
            router.push("/auth");
            location.reload();
        }

        else{
            setIsAddStudent(false);
            alert(response.message);
            setNewStudent(`${surname} ${name} ${patronymic}`);
        }
    }

  return (
     <div className={`${isAddStudent ? 'block' : 'hidden'} flex flex-col items-center border-[3px] border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] right-0 bottom-0 w-[700px] h-[500px] bg-additional-bg`}>
        <span className='mt-[35px] text-xl'>Введите ФИО ученика:</span>

        <div className="w-[80%] mt-[50px] flex flex-col gap-[50px]">
            <Input 
            inputPlaceholder={"Фамилия"} 
            setInputValue={setSurname} 
            isLabel={true} type='Текст' />

            <Input 
            inputPlaceholder={"Имя"} 
            setInputValue={setName} 
            isLabel={true} type='Текст' />

            <Input 
            inputPlaceholder={"Отчество"} 
            setInputValue={setPatronymic} 
            isLabel={true} type='Текст' />
        </div>

        <div className="flex justify-between w-[70%] h-full small_buttons translate-y-[60%]">
            <button 
            className='pl-[15px] h-[30px] pr-[15px] w-[40%]' 
            onClick={addStudentHandle}>Сохранить</button>

            <button 
            className='pl-[15px] h-[30px] pr-[15px] w-[40%]' 
            onClick={() => setIsAddStudent(false)}>Отменить</button>
        </div>

    </div>
  )
}

export default AddStudent