"use client"
import React, { useContext, useEffect, useState } from 'react'
import "./Schedule.css"
import { ScheduleContext } from '@/app/_context/scheduleContext';
import AddNewLesson from './AddNewLesson/AddNewLesson';

const Schedule = () => {
    const [isAddNewLesson, setIsAddNewLesson] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string>();
    const [selectedDate, setSelectedDate] = useState<Date>();
    const {dates} = useContext(ScheduleContext);

    const times = [
        "9:00", "10:00", "11:00",
        "12:00", "13:00", "14:00",
        "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00"
    ]

    const cellClickHandle = (timeIndex: number, dayIndex: number) => {
        if (dates.length != 0) setIsAddNewLesson(true);
        console.log(times[timeIndex], dates[dayIndex]);
        setSelectedTime(times[timeIndex]);
        setSelectedDate(dates[dayIndex]);
        console.log(isAddNewLesson);
    }

    useEffect(() => {
        console.log(dates[0])
    }, []);

    return (
        <div className={`w-full h-full`}>
            <AddNewLesson 
            isAddNewLesson={isAddNewLesson}
            setIsAddNewLesson={setIsAddNewLesson}
            selectedTime={selectedTime}
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

                    {times.map((time, index) => (
                        <tr key={index}>
                            <td>{time}</td>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <td key={i} onClick={() => cellClickHandle(index, i)}></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )
}

export default Schedule