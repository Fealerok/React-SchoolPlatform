"use client"
import React, {useContext} from 'react'
import Schedule from '@/app/_components/Schedule/Schedule'

import { AsideContext } from '@/app/_context/asideContext'
import ClassesList from '@/app/_components/ClassList/ClassList'
import TeachersList from '@/app/_components/TeachersList/TeachersList'
import TicketList from '@/app/_components/TicketsList/TicketList'
import AdminsList from '@/app/_components/AdminsList/AdminsList'

const page = () => {

  const {asideType, setAsideType} = useContext(AsideContext);

  if (asideType == "Списки классы"){
    return (<ClassesList />)
  }

  else if (asideType == "Главная"){
    return(<Schedule /> )
  }

  else if (asideType == "Учителя"){
    return (<TeachersList />)
  }

  else if (asideType == "Список обращений"){
    return (<TicketList />)
  }

  else if (asideType == "Администраторы"){
    return (<AdminsList />)
  }
  
}

export default page