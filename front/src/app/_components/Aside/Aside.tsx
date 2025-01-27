import React from 'react'
import AsideButton from '@/app/_ui/Aside_button/Aside_button'
import AsideContent from './AsideContent/AsideContent'

const Aside = ({
    type
} : {
    type: string
}) => {
  return (
    <aside className='h-full w-[330px] border-r-[3px] border-border-blocks bg-additional-bg flex flex-col items-center shrink-0'>
        <AsideContent type={type} />
    </aside>
  )
}

export default Aside