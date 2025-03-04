import { createContext, SetStateAction, useState } from "react";

interface IScheduleContext {
    dates: Array<Date>,
    setDates: React.Dispatch<SetStateAction<Array<Date>>>,
    scheduleClassName: string | undefined,
    setScheduleClassName: React.Dispatch<SetStateAction<string | undefined>>
}

const ScheduleContext = createContext<IScheduleContext>({
    dates: [],
    setDates: () => {},
    scheduleClassName: "" ,
    setScheduleClassName: () => {}
})

const ScheduleProvider = ({
    children
} : {
    children: React.ReactNode
}) => {
    const [dates, setDates] = useState<Array<Date>>([]);
    const [scheduleClassName, setScheduleClassName] = useState<string | undefined>();

    return <ScheduleContext.Provider value={{dates, setDates, scheduleClassName, setScheduleClassName}}>
        {children}
    </ScheduleContext.Provider>
}

export {
    ScheduleContext,
    ScheduleProvider
}