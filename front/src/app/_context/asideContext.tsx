"use client"

import React, { createContext, SetStateAction, useState } from "react";

interface IAsideContext{
    asideType: string,
    setAsideType: React.Dispatch<SetStateAction<string>>
}

const AsideContext = createContext<IAsideContext>({
    asideType: "",
    setAsideType: () => {}
});

const AsideProvider = ({
    children
} : {
    children: React.ReactNode
}) => {
    const [asideType, setAsideType] = useState<string>("");

    return(
        <AsideContext.Provider value={{asideType, setAsideType}}>
            {children}
        </AsideContext.Provider>
    )
}

export {
    AsideContext,
    AsideProvider
}