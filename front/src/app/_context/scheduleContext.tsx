import { createContext, SetStateAction, useState } from "react";

interface IScheduleContext {
    dates: Array<Date>,
    setDates: React.Dispatch<SetStateAction<Array<Date>>>
}

const ScheduleContext = createContext<IScheduleContext>({
    dates: [],
    setDates: () => {}
})

const ScheduleProvider = ({
    children
} : {
    children: React.ReactNode
}) => {
    const [dates, setDates] = useState<Array<Date>>([]);

    return <ScheduleContext.Provider value={{dates, setDates}}>
        {children}
    </ScheduleContext.Provider>
}

export {
    ScheduleContext,
    ScheduleProvider
}