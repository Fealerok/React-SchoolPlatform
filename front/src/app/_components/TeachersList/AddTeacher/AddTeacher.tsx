import React, { SetStateAction, useState } from 'react'
import Input from '@/app/_ui/Input/Input'
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';


interface IAddTeacher{
    isAddTeacher: boolean,
    setIsAddTeacher: React.Dispatch<SetStateAction<boolean>>
}

const AddTeacher = ({
    isAddTeacher,
    setIsAddTeacher
}: IAddTeacher) => {

    const router = useRouter();

    const [surname, setSurname] = useState<string>();
    const [name, setName] = useState<string>();
    const [patronymic, setPatronymic] = useState<string>();

    const addTeacherHandle = async () => {
        if (!surname || !name){
            alert("Не все поля заполнены для добавления.")
            return;
        }

        const response = await fetchWithAuth("/add-new-teacher", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                surname,
                name,
                patronymic
            })
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return;
        }

        
        setIsAddTeacher(false);
    }

  return (
    <div className={`${isAddTeacher ? 'block' : 'hidden'} flex flex-col items-center border-[3px] border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] right-0 bottom-0 w-[30%] h-[60%] bg-additional-bg`}>
        <span className='mt-[35px] text-xl'>Введите ФИО учителя:</span>

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
            className='pl-[15px] h-[30px] pr-[15px]' 
            onClick={addTeacherHandle}>Добавить</button>

            <button 
            className='pl-[15px] h-[30px] pr-[15px]' 
            onClick={() => setIsAddTeacher(false)}>Отменить</button>
        </div>

    </div>
  )
}

export default AddTeacher