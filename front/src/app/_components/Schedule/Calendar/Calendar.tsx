import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import arrow from "../../../../../public/calendar_arrow.png";
import 'tailwindcss/tailwind.css';
import { ScheduleContext } from '@/app/_context/scheduleContext';

const daysOfWeek: string[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const months: string[] = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1; // Корректируем индекс для понедельника
};

const Calendar: React.FC = () => {
  const {dates, setDates} = useContext(ScheduleContext);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const today = new Date();

  const handleWeekClick = (weekIndex: number): void => {
    const startDay = weekIndex * 7 - firstDayOfMonth + 1;
    const endDay = Math.min(startDay + 6, daysInMonth);
    const dates: Date[] = [];
    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Исключаем выходные
        dates.push(date);
      }
    }
    setSelectedDates(dates);
    setSelectedWeek(weekIndex);
    setDates(dates);

  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const weekIndex = Math.floor((day + firstDayOfMonth - 1) / 7);
      const isSelected = selectedWeek === weekIndex;
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      days.push(
        <div
          key={day}
          className={`hover:cursor-pointer h-8 flex items-center justify-center border ${isSelected ? 'bg-blue-200' : ''} ${isToday ? 'bg-green-200' : ''}`}
          onClick={() => handleWeekClick(weekIndex)}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const handlePrevMonth = (): void => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = (): void => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };


  return (
    <div className="w-[280px] h-[280px] p-2">
      <div className="flex justify-between mb-2">
        <button onClick={handlePrevMonth} className="text-xs">
          <Image src={arrow} alt='' className='rotate-[180deg] w-3' />
        </button>
        <div className="text-base">{`${months[month]} ${year}`}</div>
        <button onClick={handleNextMonth} className="text-xs">
          <Image src={arrow} alt='' className='w-3' />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="h-8 flex items-center justify-center text-xs font-bold">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
