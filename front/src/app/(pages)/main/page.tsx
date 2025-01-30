"use client"

import React, {useContext} from 'react'
import Schedule from '@/app/_components/Schedule/Schedule'
import AddingNewStudent from '@/app/_components/AddingNewStudent/AddingNewStudent'

import { AsideContext } from '@/app/_context/asideContext'

const page = () => {

  const {asideType, setAsideType} = useContext(AsideContext);

  if (asideType == "main"){
    return (<AddingNewStudent />)
  }
  else{
    return (<></>)
  }
  
}

export default page