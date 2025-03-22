"use client"

import React, { createContext, SetStateAction, useState } from "react";

interface IAsideContext{
    asideType: string,
    setAsideType: React.Dispatch<SetStateAction<string>>,
    isOpened: boolean,
    setIsOpened: React.Dispatch<SetStateAction<boolean>>
}

const AsideContext = createContext<IAsideContext>({
    asideType: "",
    setAsideType: () => {},
    isOpened: true,
    setIsOpened: () => {}
});

const AsideProvider = ({
    children
} : {
    children: React.ReactNode
}) => {
    const [asideType, setAsideType] = useState<string>("");
    const [isOpened, setIsOpened] = useState<boolean>(true);

    return(
        <AsideContext.Provider value={{asideType, setAsideType, isOpened, setIsOpened}}>
            {children}
        </AsideContext.Provider>
    )
}

export {
    AsideContext,
    AsideProvider
}