"use client"
import React, {useContext} from 'react'
import Schedule from '@/app/_components/Schedule/Schedule'

import { AsideContext } from '@/app/_context/asideContext'
import ClassesList from '@/app/_components/ClassList/ClassList'
import TeachersList from '@/app/_components/TeachersList/TeachersList'
import TicketList from '@/app/_components/TicketsList/TicketList'

const page = () => {

  const {asideType, setAsideType} = useContext(AsideContext);

  if (asideType == "Списки классы"){
    return (<ClassesList />)
  }

  else if (asideType == "Главная"){
    return(<Schedule /> )
  }

  else if (asideType == "Расписание классы"){
    return (<Schedule />)
  }

  else if (asideType == "Учителя"){
    return (<TeachersList />)
  }

  else if (asideType == "Список обращений"){
    return (<TicketList />)
  }
  
}

export default page