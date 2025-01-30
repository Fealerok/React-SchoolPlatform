"use client"

import React, { useEffect, useRef, useState } from 'react'
import Input from '@/app/_ui/Input/Input';
import AddClass from './AddClass/AddClass';
import "./AddingNewStudent.css";

interface IStudents{
    id: number,
    studentData: {
        surname: string,
        name: string,
        patronymic: string,
        login: string,
        password: string
    },
    class: string

}


const AddingNewStudent = () => {

    const [classes, setClasses] = useState<Array<{id: number, name: string}>>([])
    const [students, setStudents] = useState<Array<IStudents>>([]);
    const [activeButtonId, setActiveButtonId] = useState<number | null>();
    const [newClass, setNewClass] = useState<string | undefined>();

    const [isAddClass, setIsAddClass] = useState(false);

    const getClasses = async () => {
       const response = await fetch("http://localhost:3010/get-classes", {
            method: "GET",
            headers:{
                "Content-Type":"applicaiton/json",
            }
       });

       if (response.ok){
        const classesJson = await response.json();
        setClasses(classesJson.classes);
        
       }

    }

    const deleteClass = async () => {
        if (!activeButtonId) {
            alert("Для удаления необходимо выбрать класс");
            return;
        }

        const response = await fetch("http://localhost:3010/delete-class", {
            method: "DELETE",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                selectedClassId: activeButtonId
            })
        });

        getClasses();
        setActiveButtonId(null);
    }

    

    const getStudentsInClass = async () => {

        
        
    }

    const setActiveButton = (buttonId: number) => {
        setActiveButtonId(buttonId);
        console.log(buttonId);

    }

    const addClassButtonHandle = () => {
        setIsAddClass(true);
    }

    useEffect(() => {
        getClasses();
    }, [newClass]);

    useEffect(() => {
        getClasses();
    }, []);

  return (
    <div className='flex justify-between w-full h-full'>

        <AddClass setNewClass={setNewClass} isAddClass={isAddClass} setIsAddClass={setIsAddClass}></AddClass>

        {/* Список класов */}
        <div className={`${isAddClass ? "pointer-events-none" : ""} flex h-full border-r-[3px] border-border-blocks justify-between items-center flex-col min-w-[380px]`}> 
            <div className="mt-[45px] h-[75%] w-full flex flex-col small_buttons overflow-auto">
                {classes.length !== 0 ? classes.map((classData) => {
                    return (
                        <button 
                        onClick={() => setActiveButton(classData.id)} 
                        className={`mb-[32px] flex-shrink-0 h-10 flex items-center pl-[15px] text-xl justify-start ml-5 mr-5 ${activeButtonId === classData.id ? `active-button` : ``}`} 
                        key={classData.id}>{classData.name} класс</button>
                    )
                }) : (<span className='text-center'>Список пуст!</span>)}
            </div>

            <div className="flex flex-col gap-[20px] w-[90%]">
                <div className="flex w-full justify-between buttons">
                    <button onClick={addClassButtonHandle}>Добавить</button>
                    <button onClick={deleteClass}>Удалить</button>
                </div>
                <div className="flex w-full justify-between buttons">
                    <button>Редактировать</button>
                    <button>Сохранить</button>
                </div>
            </div>
        </div> 

        {/* Список учеников */}
        <div className="flex w-full h-full border-r-[3px] border-border-blocks flex-col">
                
        </div>

        {/* Редактирование ученика */}
        <div className="flex h-full flex-col w-full">
            
        </div>
    </div>
  )
}

export default AddingNewStudent