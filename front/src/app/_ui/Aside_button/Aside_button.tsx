import React from 'react'

const AsideButton = ({
    buttonText
} : {
    buttonText: string
}) => {
  return (
    <button className=' transition-colors duration-150 border-2 border-border-blocks hover:bg-button-bg hover:text-white mr-5 ml-5 rounded-[6px] h-10 text-left pl-[15px] text-2xl'>{buttonText}</button>
  )
}

export default AsideButton