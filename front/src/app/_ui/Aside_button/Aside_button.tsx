import { AsideContext } from '@/app/_context/asideContext';
import { ScheduleContext } from '@/app/_context/scheduleContext';
import React, { useContext } from 'react'

const AsideButton = ({
    buttonText
} : {
    buttonText: string
}) => {

  const {setAsideType} = useContext(AsideContext);
  const {setDates} = useContext(ScheduleContext);

  return (
    <button onClick={() => {
      setAsideType(buttonText);
      setDates([]);
    }} className=' transition-colors duration-150 border-2 border-border-blocks hover:bg-button-bg hover:text-white mr-5 ml-5 rounded-[6px] h-10 text-left pl-[15px] text-2xl'>{buttonText}</button>
  )
}

export default AsideButton