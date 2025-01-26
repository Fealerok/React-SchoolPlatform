"use client"
import React, { useEffect, useState } from 'react'


interface IInput{
    inputPlaceholder: string,
    setInputValue: (inputValue: string) => void //Тип для функции, которая принимает inputValue и возвращает void,
    type: string
}

const Input = ({
    inputPlaceholder,
    setInputValue,
    type
} : IInput) => {

    const [isHasValue, setIsHasValue] = useState(false);

    const changeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsHasValue(!!e.target.value);
        setInputValue(e.target.value);
    }

    useEffect(() => {
        console.log(isHasValue);
    }, [isHasValue]);

  return (
    <div className='relative h-[50px] w-full'>
        <input 
        className='absolute h-full w-full border-2 outline-0 text-xl pl-[10px] border-#DCDBDF rounded-[15px] peer' 
        type={type == "Текст" ? "text" : "password"}
        placeholder=''
        onChange={changeHandle}
        />
        <label className={`transition-all duration-200  absolute top-[50%] translate-y-[-50%] pointer-events-none text-2xl pl-[10px] ${isHasValue ? 'text-[22px]' : 'text-2xl'} ${isHasValue && `-translate-y-[60px]`}`}>{inputPlaceholder}</label>
    </div>
  )
}

export default Input