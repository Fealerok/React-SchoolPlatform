"use client"
import React, { useContext, useEffect, useState } from 'react'
import Input from '../../_ui/Input/Input'
import Link from 'next/link'

import isValid from '../../_utils/validation/authValidation'
import { AuthContext } from '../../_context/authContext'
import { setTokens } from '@/app/_utils/localStorage/localStorage'

interface IInputValue{
  type: string,
  value: string
}

const AuthPage = () => {

  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const {user, setUser} = useContext(AuthContext);

  const loginButtonClick = async (): Promise<void> => {
    const isValidResult: (string | boolean)[] = isValid(login, password);

    //Если не прошла валидация, то показываем сообщение с ошибкой
    if (!isValidResult[1]){
      alert(isValidResult[0]);
    }
    else{
      const response = await fetch("http://localhost:3010/auth", {
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password
        })
      });

      //Если успешная аутентификация, выводим данные
      if (response.ok){
        const responseData = await response.json();

        //Записываем авторизированного юзера в контекст
        setUser(responseData.user);

        //Записываем токены в local storage
        setTokens(responseData.accessToken, responseData.refreshToken);
      }

      //Если неуспешная аутентификация, то выводим сообщение ошибки
      else(response.json().then(resp => alert(resp.errorMessage)));
    }
    
  }

  return (
    <div className='w-full h-full flex flex-col pl-10 pr-10 mt-[80px] gap-[60px]'>
      <Input 
        inputPlaceholder='Логин' 
        setInputValue={setLogin} 
        type="Текст" 
      />

      <Input 
        inputPlaceholder='Пароль' 
        setInputValue={(setPassword)} 
        type="Пароль" 
      />

      <button 
        onClick={() => loginButtonClick()}
        className='h-[50px] w-[260px] bg-dark-blue text-white text-2xl rounded-[15px] border-#6C72B9 border-2 ml-auto mr-auto'
      >Войти
      </button>

      <div className="flex justify-between text-base">
        <Link href={"/auth/recovery"} className='text-black' >Восстановить пароль</Link>
        <button>Техподдержка</button>
      </div>
    </div>
  )
}

export default AuthPage