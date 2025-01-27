import React from 'react'

const AuthPageLayout = ({
    children
} : {
    children: React.ReactNode
}) => {
  return (
    <div className='min-w-[640px] h-[600px] border-[3px] rounded-[30px] bg-additional-bg border-border-blocks flex flex-col items-center' >
        <h2 className='text-[40px] mt-[60px]'>Вход</h2>
        {children}
    </div>
  )
}

export default AuthPageLayout