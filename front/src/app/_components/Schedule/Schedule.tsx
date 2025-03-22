"use client"
import React, { useContext, useEffect, useState } from 'react'
import "./Schedule.css"
import { ScheduleContext } from '@/app/_context/scheduleContext';
import AddNewLesson from './AddNewLesson/AddNewLesson';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';
import LessonInformation from './LessonInformation/LessonInformation';
import { AsideContext } from '@/app/_context/asideContext';
import { AuthContext } from '@/app/_context/authContext';

const Schedule = () => {
    const {asideType, setIsOpened, isOpened} = useContext(AsideContext);
    
    const [lessonStatusState, setLessonStatusState] = useState<string | null>();
    const [isAddNewLesson, setIsAddNewLesson] = useState(false);
    const [isLessonInformation, setIsLessonInformation] = useState(false);

    const [selectedLessonId, setSelectedLessonId] = useState<null | number>(null);
    const [selectedTime, setSelectedTime] = useState<string>();
    const [selectedDateString, setSelectedDateString] = useState<string>();
    const [selectedDate, setSelectedDate] = useState<Date>();

    const [lessons, setLessons] = useState<Array<{
        id: number, 
        name: string,
        lesson_date: Date,
        lesson_start_time: string,
        id_class: number
    }>>([]);

    const {user} = useContext(AuthContext);

    const {dates, scheduleClassName, setDates} = useContext(ScheduleContext);
    const router = useRouter();

    const times = [
        "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00",
        "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00"
    ]

    const daysOfWeek = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

    const cellClickHandle = (event: React.MouseEvent<HTMLTableCellElement>, timeIndex: number, dayIndex: number) => {

        if (user?.role == "Администратор" || user?.role == "Техподдержка"){
            const tdChildren = event.currentTarget.children;


            if (dates.length != 0 && tdChildren.length == 0 && scheduleClassName) setIsAddNewLesson(true);
            else {
                if (tdChildren.length == 0){
                    alert("Для создания урока, необходимо выбрать класс и неделю в левом меню.");
                }
                return;
            }
    
            setSelectedTime(times[timeIndex]);
    
            const dayOfWeek = daysOfWeek[dates[dayIndex].getDay()];
            const dayOfMonth = dates[dayIndex].getDate();
            const result = `${dayOfMonth} ${dayOfWeek}`;
            setSelectedDateString(result);
            setSelectedDate(dates[dayIndex]);
        }
        
    }

    const divLessonCliCkHandle = (event: React.MouseEvent<HTMLElement>) => {
        const lessonId = Number(event.currentTarget.getAttribute("data-key"));
        const lessonStatus = event.currentTarget.getAttribute("lesson-status");
        setLessonStatusState(lessonStatus);
        setIsLessonInformation(true);
        setSelectedLessonId(lessonId);
        
    }

    useEffect(() => {
        updateSchedule()
    }, [isAddNewLesson]);

    useEffect(() => {
        setDates([]);
        setSelectedDate(undefined);
    }, [asideType])

    const updateSchedule = async () => {
        if (user?.role == "Учитель"){
            const userId = user?.id;
            const response = await fetchWithAuth("/get-lessons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    dates,
                    userId
                })
            });
    
            if (!response) router.push("/auth");
            else{
                setLessons(response.lessons);
            }
        }

        else{
            const response = await fetchWithAuth("/get-lessons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    dates,
                    scheduleClassName,
                })
            });
    
            if (!response) router.push("/auth");
            else{
                setLessons(response.lessons);
            }
        }
        

    }
    
    useEffect(() => {
        updateSchedule();
    }, [isLessonInformation, dates, scheduleClassName ]);

    useEffect(() => {
        updateSchedule();
    }, [isLessonInformation]);

    const getLessonStatus = (lessonDate: Date, lessonTime: string) => {
        const now = new Date(); // Текущее время
    
        // Создаем объект Date для времени начала урока
        const lessonStartDateTime = new Date(lessonDate);
        const [hours, minutes] = lessonTime.split(':').map(Number);
        lessonStartDateTime.setHours(hours, minutes, 0, 0); // Устанавливаем время начала урока
    
        // Рассчитываем время окончания урока (40 минут после начала)
        const lessonEndDateTime = new Date(lessonStartDateTime);
        lessonEndDateTime.setMinutes(lessonEndDateTime.getMinutes() + 40);
    
        // Определяем статус урока
        if (now < lessonStartDateTime) {
            return 'не начался'; // Урок еще не начался
        } else if (now >= lessonStartDateTime && now <= lessonEndDateTime) {
            return 'в процессе'; // Урок идет прямо сейчас
        } else {
            return 'закончен'; // Урок уже прошел
        }
    };

    return (
        <div className={`w-full h-full schedule`} onClick={() => {
            if (window.innerWidth < 1367){
                setIsOpened(false);
            }
        }}>
            <AddNewLesson 
            isAddNewLesson={isAddNewLesson}
            setIsAddNewLesson={setIsAddNewLesson}
            selectedTime={selectedTime}
            selectedDateString={selectedDateString}
            selectedDate={selectedDate}></AddNewLesson>

            <LessonInformation 
            isLessonInformation={isLessonInformation}
            setIsLessonInformation={setIsLessonInformation}
            selectedLessonId={selectedLessonId}
            lessonStatus={lessonStatusState}
             ></LessonInformation>

            <table className={`${isAddNewLesson || isLessonInformation || (isOpened && window.innerWidth < 1367) ? "pointer-events-none" : ""} w-full h-full table-fixed`}>
                <tbody>
                    <tr>
                        <th className='w-[100px]'></th>
                        <th>{String(dates[0]).split(" ")[2]} Понедельник</th>
                        <th>{String(dates[1]).split(" ")[2]} Вторник</th>
                        <th>{String(dates[2]).split(" ")[2]} Среда</th>
                        <th>{String(dates[3]).split(" ")[2]} Четверг</th>
                        <th>{String(dates[4]).split(" ")[2]} Пятница</th>
                    </tr>

                    {times.map((time, timeIndex) => (
                        <tr key={timeIndex}>
                            <td>{time}</td>
                            {Array.from({ length: 5 }).map((_, dateIndex) => {
                                const lessonsArray = Array.isArray(lessons) ? lessons : [];

                                // Находим уроки для текущей даты и времени
                                const lessonsForCell = lessonsArray.filter(lesson => {
                                    const dateStringFromDates = new Date(dates[dateIndex]).toString();
                                    const dateLessonString = new Date(lesson.lesson_date).toString();

                                    const timeFromTimes = times[timeIndex];
                                    const timeFromLesson = lesson.lesson_start_time.slice(0, -3); // Убираем секунды

                                    return (
                                        dateStringFromDates === dateLessonString &&
                                        timeFromTimes === timeFromLesson
                                    );
                                });

                                return (
                                    <td  key={`${timeIndex}-${dateIndex}`} onClick={(event) => cellClickHandle(event, timeIndex, dateIndex)}>
                                        {lessonsForCell.map(lesson => {

                                            const lessonStatus = getLessonStatus(lesson.lesson_date, lesson.lesson_start_time);
                                            return(
                                                <div className={`${lessonStatus != "закончен" ? "bg-blue-600 text-white" : "bg-blue-200"} flex items-center justify-center text-black rounded-[10px] max-w-[calc(100%-10px)] overflow-hidden h-[calc(100%-10px)] m-auto `} 
                                                key={lesson.id}
                                                onClick={(event) => divLessonCliCkHandle(event)}
                                                data-key={lesson.id}
                                                lesson-status={lessonStatus}>{lesson.name}</div>
                                            )
                                            
                                        })}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )
}

export default Schedule