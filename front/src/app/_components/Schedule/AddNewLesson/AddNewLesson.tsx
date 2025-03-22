"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import Input from '@/app/_ui/Input/Input'
import { AuthContext } from '@/app/_context/authContext'
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth'
import { useRouter } from 'next/navigation'
import { ScheduleContext } from '@/app/_context/scheduleContext'
import CustomSelect from '@/app/_ui/CustomSelect/CustomSelect'

interface IAddNewLesson{
  isAddNewLesson: boolean,
  setIsAddNewLesson: (data: boolean) => void,
  selectedTime: string | undefined,
  selectedDateString: string | undefined,
  selectedDate: Date | undefined
}

const AddNewLesson = ({
  isAddNewLesson,
  setIsAddNewLesson,
  selectedTime,
  selectedDateString,
  selectedDate
} : IAddNewLesson) => {

  const [lessonName, setLessonName] = useState<string>();
  const [className, setClassName] = useState<string>();
  const {user} = useContext(AuthContext);
  const {scheduleClassName} = useContext(ScheduleContext);
  const [teachers, setTeachers] = useState([]);

  const selectRef = useRef<HTMLSelectElement>(null);
  
  const [selectValue, setSelectValue] = useState("Список учителей");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>();

  const router = useRouter();

  const addNewLesson = async () => {
    if (lessonName?.trim() == "" || className?.trim() == "" || selectValue == "Список учителей"){
      alert("Не введёно название урока, не выбран учитель или не выбран класс.");
      return
    }
    
    console.log(scheduleClassName);
    const resp = await checkAvailabilityClass();
    if (await checkAvailabilityClass() == false){
      alert("Введенного класса не существует.");
      return;
    }

    
    const response = await fetchWithAuth("/add-new-lesson", {
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        newLessonName: lessonName,
        selectedTime: selectedTime,
        selectedDate: selectedDate,
        idUser: user?.id,
        className: scheduleClassName,
        teacherId: selectedTeacherId
      })
    });

    if (!response) router.push("/auth");
    else{
        setIsAddNewLesson(false);
    }

  }

  const checkAvailabilityClass = async () => {
    const response = await fetchWithAuth("/check-availability-class", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        className: scheduleClassName
      })
    });

    if (!response) router.push("/auth");
    else{
      //if (response.status == 500) return false;
         if (response.message == "Успешно") return true;
        else return false;
    }


  }


  const getTeachers = async () => {
    const response = await fetchWithAuth("/get-teachers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response) router.push("/auth");
    else{
      setTeachers(response.teachers);
      
    }


  }

  const changeLessonTeacher = (value: {id: number, full_name: string}) => {
    setSelectValue(value.full_name);
    setSelectedTeacherId(value.id);
  }

  useEffect(() => {
    getTeachers();
  }, [isAddNewLesson])


  return (
    <div className={`${isAddNewLesson ? "block" : "hidden"} text-2xl pr-[25px] pl-[25px] flex flex-col absolute w-[700px] border-[3px] border-border-blocks bg-additional-bg top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]`}>
      <span className='mt-[25px]'>Выбранная дата: {`${selectedDateString}`} </span>
      <span className='mt-[25px]'>Время: {selectedTime}-{`${selectedTime?.split(":")[0]}:${Number(selectedTime?.split(":")[1])+40}`}  </span>

      <form className='mt-[25px]'>
        <span>Введите название урока:</span>
        <Input 
        inputPlaceholder='Название урока' 
        setInputValue={setLessonName} 
        type={"Текст"}
        isLabel={false}></Input>
      </form>

      <span className='mt-[25px]'>Выберите учителя:</span>
      <CustomSelect options={teachers} onChange={changeLessonTeacher} value={selectValue}></CustomSelect>

    

      <div className="small_buttons w-full flex justify-between mt-[100px] mb-[30px]">
        <button className='pl-[15px] pr-[15px]'
        onClick={addNewLesson}>Создать</button>
        <button className='pl-[15px] pr-[15px]' onClick={() => setIsAddNewLesson(false)}>Отменить</button>
      </div>
    </div>
  )
}

export default AddNewLesson