"use client"

import React, {useContext} from 'react'
import Schedule from '@/app/_components/Schedule/Schedule'

import { AsideContext } from '@/app/_context/asideContext'
import ClassesList from '@/app/_components/AddingNewStudent/ClassList'

const page = () => {

  const {asideType, setAsideType} = useContext(AsideContext);

  if (asideType == "ClassList"){
    return (<ClassesList />)
  }
  else{
    return (<></>)
  }
  
}

export default page