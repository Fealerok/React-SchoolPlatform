import React, { useEffect, useRef, useState } from 'react'
import Input from '@/app/_ui/Input/Input'
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth'
import { useRouter } from 'next/navigation'


interface ILessonInformation{
    isLessonInformation: boolean,
    setIsLessonInformation: (data: boolean) => void
    selectedLessonId: null | number
}

const LessonInformation = ({
    isLessonInformation,
    setIsLessonInformation,
    selectedLessonId
} : ILessonInformation) => {

    const [lessonInformation, setLessonInformation] = useState<{
        id: number,
        name: string,
        lesson_date: string,
        lesson_start_time: string,
        className: string
    }>();

    const [newLessonName, setNewLessonName] = useState<string | undefined>("");

    const [classesArray, setClasses] = useState<Array<{
        id: number, 
        name: string
    }>>([]);

    const times = [
        "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00",
        "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00"
    ]

    const [isEdit, setIsEdit] = useState(false);
    const [selectedClass, setSelectedClass] = useState("Класс");
    const [selectedTeacher, setSelectedTeacher] = useState("Учитель");
    const [selectedTime, setSelectedTime] = useState("09:00");

    const inputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    const onClassSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClass(event.currentTarget.value);
    }

    const onTeacherSelectChange = () => {

    }

    const onTimeSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTime(event.currentTarget.value);
    }

    const onEditCickHandle = async () => {

        if (isEdit) {
            saveChangesLesson();
            setIsLessonInformation(false);
        }

        else{
            setNewLessonName(lessonInformation?.name);
            getClasses();
        }
        setIsEdit(!isEdit);
        
    }

    const saveChangesLesson = async () => {

        if (selectedClass == "Класс"){
            alert("Для сохранения, выберите название класса");
            return;
        }
        
        const input = inputRef.current;

        const response = await fetchWithAuth("/update-lesson", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lessonInformation: {
                    lessonId: selectedLessonId,
                    name: input ? input.value : newLessonName,
                    time: selectedTime,
                    className: selectedClass
                }
            })
        });

        if (!response) {
            router.push("/auth");
            location.reload();
            return;
        }

        setIsEdit(false);
        

    }

    const getClasses = async () => {
        const response = await fetchWithAuth("/get-classes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response) {
            router.push("/auth");
            location.reload();
            return;
        }
        setClasses(response.classes)
    }

    const getLessonInformation = async () => {
        const response = await fetchWithAuth("/get-lesson-information", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idLesson: selectedLessonId
            })
        });

        if (!response) {
            router.push("/auth");
            location.reload();
        }
        else{
            console.log(response.lessonInformation);

            setLessonInformation(response.lessonInformation);
        }
    }

    useEffect(() => {
        console.log(isLessonInformation)
        //Если окно открыто, то получаем информацию урока по его Id
        getLessonInformation();
    }, [isLessonInformation]);


    useEffect(() => {
        console.log(newLessonName);
    }, [newLessonName]);

    if (lessonInformation){
        return (
            <div className={`${isLessonInformation ? "block" : "hidden"} border-[3px] flex justify-between border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] right-0 bottom-0 w-[50%] h-[50%] bg-additional-bg`}>
                <div className="w-1/2 flex flex-col p-[40px] gap-[20px]">
        
                    <div className="flex flex-col gap-[20px]">
        
                        {isEdit ? <div className='gap-[20px] flex flex-col '>
                            <form className='w-full flex justify-between items-center '>
                                <span className='min-w-[100px]'>Название:</span>
                                <input
                                ref={inputRef}
                                className='w-full border-[1px] border-border-blocks outline-none pl-[5px] pr-[5px] h-full'
                                value={newLessonName}
                                onChange={(event) => setNewLessonName(event.target.value)}></input>
                            </form>
        
                            <p className='min-w-[100px] '>Дата: {lessonInformation.lesson_date}</p>
        
                            <form className='w-full flex justify-between items-center'>
                                <span className='min-w-[100px]'>Время:</span>
                                <select 
                                onChange={(event) => onTimeSelectChange(event)} 
                                value={selectedTime} 
                                className='w-full border-[1px] border-border-blocks outline-none pl-[5px] h-full'>
                                    {times.map((time, i) => (
                                        <option key={i}>{time}</option>
                                    ))}
                                </select>
                            </form>
                        </div> :
                        <div className='w-full gap-[20px] flex flex-col'>
                            <p className=''>Название: {lessonInformation.name}</p>
                            <p className=''>Дата: {lessonInformation.lesson_date}</p>
                            <p className=''>Время: {lessonInformation.lesson_start_time}-{lessonInformation.lesson_start_time.split(":")[0]}:{Number(lessonInformation.lesson_start_time.split(":")[1])+40}</p>
                        </div>
                        }
        
                        
                    </div>
                    <div className="w-full flex justify-between gap-[40px]">
                          {isEdit ?
                              <select
                                  className='w-full'
                                  value={selectedClass}
                                  onChange={(event) => onClassSelectChange(event)}>
                                  <option disabled selected>Класс</option>

                                  {classesArray.map(classItem => (
                                    <option key={classItem.id}>{classItem.name}</option>
                                  ))}
                              </select> :
                              <p>Класс: {lessonInformation.className}</p>
                          }
        
                          {isEdit ?
                              <select
                                  className='w-full'
                                  value={selectedTeacher}
                                  onChange={() => onTeacherSelectChange()}>
                                  <option disabled selected>Учитель</option>
                              </select> :
                              <p>Учитель: </p>
                          }
                    </div>
                </div>
                <div className="w-1/2 flex flex-col items-end justify-between p-[40px]">
                    <div className="flex items-end flex-col  gap-[20px] w-full">
                          <button 
                          onClick={() => onEditCickHandle()}
                          className='w-[90%] transition-colors duration-150 hover:bg-button-bg hover:text-white border-[2px] border-border-blocks rounded-[6px] h-[40px]'>{isEdit ? "Сохранить" : "Редактировать"}</button>
                          <button className='w-[90%] transition-colors duration-150 hover:bg-button-bg hover:text-white border-[2px] border-border-blocks rounded-[6px] h-[40px]'>Удалить</button>
                          <button className='w-[90%] transition-colors duration-150 hover:bg-button-bg hover:text-white bg-button-bg border-[2px] border-border-blocks rounded-[6px] h-[40px] text-white'>Присоединиться</button>
                    </div>
                    
                    <button 
                    className='w-[90%] transition-colors duration-150 hover:bg-button-bg hover:text-white border-[2px] border-border-blocks rounded-[6px] h-[40px]'
                    onClick={() => {
                        setIsLessonInformation(false);
                        setIsEdit(false);
                    }}>Закрыть</button>
                </div>
                
        
                
            </div>
          )
    }
  
}

export default LessonInformation