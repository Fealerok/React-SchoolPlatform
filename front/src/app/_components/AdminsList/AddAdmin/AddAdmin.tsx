import React, { SetStateAction, useState } from 'react'
import Input from '@/app/_ui/Input/Input'
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';


interface IAddAdmin{
    isAddAdmin: boolean,
    setIsAddAdmin: React.Dispatch<SetStateAction<boolean>>
}

const AddAdmin = ({
    isAddAdmin,
    setIsAddAdmin
}: IAddAdmin) => {

    const router = useRouter();

    const [surname, setSurname] = useState<string>();
    const [name, setName] = useState<string>();
    const [patronymic, setPatronymic] = useState<string>();

    const addAdminHandle = async () => {
        if (!surname || !name){
            alert("Не все поля заполнены для добавления.")
            return;
        }

        const response = await fetchWithAuth("/add-new-admin", {
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

        alert(response.message);

        
        setIsAddAdmin(false);
    }

  return (
    <div className={`${isAddAdmin ? 'block' : 'hidden'} flex flex-col items-center border-[3px] border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] right-0 bottom-0 w-[700px] h-[500px] bg-additional-bg z-30`}>
        <span className='mt-[35px] text-xl'>Введите ФИО Администратора:</span>

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
            onClick={addAdminHandle}>Добавить</button>

            <button 
            className='pl-[15px] h-[30px] pr-[15px]' 
            onClick={() => setIsAddAdmin(false)}>Отменить</button>
        </div>

    </div>
  )
}

export default AddAdmin