"use client"
import React, { useEffect, useRef, useState } from 'react'

interface IInput {
    inputPlaceholder: string,
    setInputValue: (inputValue: string) => void, // Тип для функции, которая принимает inputValue и возвращает void,
    type: string,
    isLabel: boolean,
    initialText?: string,
    isAnimation?: boolean
}

const Input = ({
    inputPlaceholder,
    setInputValue,
    type,
    isLabel,
    initialText,
    isAnimation
}: IInput) => {

    const [isHasValue, setIsHasValue] = useState(false);
    const [value, setValue] = useState(initialText || ""); // Добавляем состояние для значения input
    const inputRef = useRef(null);

    // Обновляем состояние при изменении initialText
    useEffect(() => {
        setValue(initialText || "");
    }, [initialText]);

    const changeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setIsHasValue(!!newValue);
        setValue(newValue); // Обновляем внутреннее состояние
        setInputValue(newValue); // Передаем новое значение в родительский компонент
    }

    if ((inputPlaceholder || inputPlaceholder != "") && !isLabel){
        return (
            <div className='relative h-[50px] w-full'>
                <input
                    className='absolute h-full w-full border-2 outline-0 text-xl pl-[10px] border-#DCDBDF rounded-[15px] peer'
                    type={type == "Текст" ? "text" : "password"}
                    placeholder={inputPlaceholder}
                    onChange={changeHandle}
                    ref={inputRef}
                    value={value} // Используем внутреннее состояние для значения
                />
    
                {isLabel ? <label className={`transition-all duration-200  absolute top-[50%] translate-y-[-50%] pointer-events-none text-2xl pl-[10px] ${isHasValue  ? 'text-[22px]' : 'text-2xl'} ${isHasValue  && `!-translate-y-[60px]`}`}>{inputPlaceholder}</label> : null}
            </div>
        )
    }

    else{ 
        return (
            <div className='relative h-[50px] w-full'>
                <input
                    className='absolute h-full w-full border-2 outline-0 text-xl pl-[10px] border-#DCDBDF rounded-[15px] peer'
                    type={type == "Текст" ? "text" : "password"}
                    
                    onChange={changeHandle}
                    ref={inputRef}
                    value={value} // Используем внутреннее состояние для значения
                />
    
                {isLabel ? <label className={`transition-all duration-200  absolute top-[50%] translate-y-[-50%] pointer-events-none text-2xl pl-[10px] ${!isAnimation ? `!-translate-y-[60px]` : ""} ${isHasValue && `!-translate-y-[60px]`}`}>{inputPlaceholder}</label> : null}
            </div>
        )
    }

   
}

export default Input