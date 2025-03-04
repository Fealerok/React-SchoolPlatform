"use client"
import React, { useContext, useEffect, useState } from 'react'
import "./Schedule.css"
import { ScheduleContext } from '@/app/_context/scheduleContext';
import AddNewLesson from './AddNewLesson/AddNewLesson';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';

const Schedule = () => {
    const [isAddNewLesson, setIsAddNewLesson] = useState(false);
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

    const {dates, scheduleClassName} = useContext(ScheduleContext);
    const router = useRouter();

    const times = [
        "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00",
        "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00"
    ]

    const daysOfWeek = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

    const cellClickHandle = (timeIndex: number, dayIndex: number) => {
        if (dates.length != 0) setIsAddNewLesson(true);
        else return;

        setSelectedTime(times[timeIndex]);

        const dayOfWeek = daysOfWeek[dates[dayIndex].getDay()];
        const dayOfMonth = dates[dayIndex].getDate();
        const result = `${dayOfMonth} ${dayOfWeek}`;
        setSelectedDateString(result);
        setSelectedDate(dates[dayIndex]);
    }

    useEffect(() => {
        updateSchedule()
    }, [isAddNewLesson]);

    const updateSchedule = async () => {

        const response = await fetchWithAuth("/get-lessons", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dates,
                scheduleClassName
            })
        });

        if (!response) router.push("/auth");
        else{
            setLessons(response.lessons);
        }

    }

    useEffect(() => {
        updateSchedule();
    }, [scheduleClassName]);

    useEffect(() => {

        updateSchedule();
    }, [dates]);

    return (
        <div className={`w-full h-full`}>
            <AddNewLesson 
            isAddNewLesson={isAddNewLesson}
            setIsAddNewLesson={setIsAddNewLesson}
            selectedTime={selectedTime}
            selectedDateString={selectedDateString}
            selectedDate={selectedDate}></AddNewLesson>

            <table className={`${isAddNewLesson ? "pointer-events-none" : ""} w-full h-full table-fixed`}>
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
                                    <td  key={`${timeIndex}-${dateIndex}`} onClick={() => cellClickHandle(timeIndex, dateIndex)}>
                                        {lessonsForCell.map(lesson => (
                                            <div className={`bg-blue-500 flex items-center justify-center text-black rounded-[10px] w-[calc(100%-10px)] h-[calc(100%-10px)] m-auto `} key={lesson.id}>{lesson.name}</div>
                                        ))}
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