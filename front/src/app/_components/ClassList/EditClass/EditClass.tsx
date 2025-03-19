import React, { useState } from 'react'
import Input from '@/app/_ui/Input/Input'
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';


interface IEditClass{
    isEditClass: boolean,
    setIsEditClass: (data: boolean) => void,
    setClassName: (data: string | undefined) => void,
    selectedClassId: number | undefined | null

}

const EditClass = ({isEditClass, setIsEditClass, setClassName, selectedClassId} : IEditClass) => {
    
    const [updatedClassName, setUpdatedClassName] = useState<string>();

    const saveClassName = async () => {

        const response = await fetchWithAuth("/update-classname", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                updatedClassName,
                selectedClassId
            })
        });

        setClassName(updatedClassName);
        setIsEditClass(false);
    }
  return (
    <div className={`${isEditClass ? "block" : 'hidden'} flex flex-col items-center border-[3px] border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] right-0 bottom-0 w-[30%] h-[40%] bg-additional-bg`}>
         <span className='mt-[35px] text-xl'>Введите новый номер и название класса:</span>

        <div className="w-[80%] mt-[15px]">
            <Input 
            inputPlaceholder={"Название"} 
            setInputValue={setUpdatedClassName} 
            isLabel={false} type='Текст' />
        </div>

        <div className={` flex justify-between w-[70%] h-full small_buttons translate-y-[60%]`}>
            <button 
            className='pl-[15px] h-[30px] pr-[15px]' 
            onClick={saveClassName}>Сохранить</button>

            <button 
            className='pl-[15px] h-[30px] pr-[15px]' 
            onClick={() => setIsEditClass(false)}>Отменить</button>
        </div>
    </div>
  )
}

export default EditClass