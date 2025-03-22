import React, { SetStateAction, useContext, useEffect, useState } from 'react'
import Input from '@/app/_ui/Input/Input'
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/app/_context/authContext';

interface ITicketToSupport{
    isTicketToSupport: boolean,
    setIsTicketToSupport: React.Dispatch<SetStateAction<boolean>>
}

const TicketToSupport = ({
    isTicketToSupport,
    setIsTicketToSupport
} : ITicketToSupport) => {

  const router = useRouter();
  const {user} = useContext(AuthContext);

  const [nameRequest, setNameRequest] = useState<string>("");
  const [textRequest, setTextRequest] = useState<string>("");

  const onCloseClick = () => {
    setNameRequest("");
    setTextRequest("");
    setIsTicketToSupport(false)
  }

  const onTextRequestChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextRequest(event.currentTarget.value);
  }


  const sendRequest = async () => {

    if (!nameRequest || nameRequest == ""){
      alert("Для отправки, введите тему обращения");
      return;
    }

    const response = await fetchWithAuth("/send-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nameRequest,
        textRequest,
        idUser: user?.id
      })
    });

    if (!response){
      router.push("/auth");
      setNameRequest("");
      setTextRequest("");
      location.reload();
      return;
    }

    alert("Обращение в техподдержку отправлено");
    setIsTicketToSupport(false);
  }


  return (
    <div className={`${isTicketToSupport ? "block" : "hidden"} p-[20px] bg-additional-bg border-[3px] flex flex-col items-center justify-between  border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] w-[700px] h-[500px] z-[10]`}>
      <p className='text-2xl'>Обращение в техподдержку</p>

      <div className="flex flex-col w-full gap-[20px]">
        <Input 
        inputPlaceholder='Тема обращения'
        setInputValue={setNameRequest}
        type="Текст"
        isLabel={false}
        ></Input>

        <textarea 
        onChange={(event) => onTextRequestChange(event)}
        placeholder='Текст обращения' 
        rows={5}
        className='resize-none p-[10px] border-2 outline-0 text-xl pl-[10px] border-#DCDBDF rounded-[15px]'></textarea>

      </div>

      <div className="small_buttons w-full flex justify-center gap-[60px]">
        <button 
        onClick={sendRequest}
        className='w-1/3 h-[35px]'>Отправить</button>
        <button 
        onClick={onCloseClick}
        className='w-1/3 h-[35px]'>Закрыть</button>
      </div>
    </div>
  )
}

export default TicketToSupport