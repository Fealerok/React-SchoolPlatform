"use client"

import React, {useContext} from 'react'
import Schedule from '@/app/_components/Schedule/Schedule'

import { AsideContext } from '@/app/_context/asideContext'

const page = () => {

  const {asideType, setAsideType} = useContext(AsideContext);

  if (asideType == "main"){
    return (<Schedule />)
  }
  else{
    return (<>gfgf</>)
  }
  
}

export default page