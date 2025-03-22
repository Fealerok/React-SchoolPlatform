import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import OpenedTicket from '../OpenedTicket/OpenedTicket';
import { AsideContext } from '@/app/_context/asideContext';

const TicketList = () => {

    const [isOpenedTicket, setIsOpenedTicket] = useState(false);

    const {isOpened} = useContext(AsideContext);

    const {asideType} = useContext(AsideContext);
    const [openedTicket, setOpenedTicket] = useState<{
        id: number,
        full_name: string,
        name_request: string,
        text_request: string
    }>();
    const router = useRouter();

    const [tickets, setTickets] = useState<Array<{
        id: number,
        full_name: string,
        name_request: string,
        text_request: string
    }>>();

    const getTickets = async () => {
        const response = await fetchWithAuth("/get-tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return
        }

        setTickets(response.tickets);
    }

    const openTicket = async (idTicket: number) => {
         const ticket = tickets?.filter(ticket => ticket.id == idTicket)[0];
        await setOpenedTicket(ticket);
        setIsOpenedTicket(true);
    }

    useEffect(() => {
       getTickets();
    }, [isOpenedTicket]);

    if (tickets?.length != 0){
        return (
            <div className='ticket_list'>
                <OpenedTicket
                    setIsOpenedTicket={setIsOpenedTicket}
                    isOpenedTicket={isOpenedTicket}
                    ticket={openedTicket} />

                <div className={`${isOpenedTicket || (isOpened && window.innerWidth < 1367) ? "pointer-events-none" : ""} small_buttons w-full h-full flex flex-col gap-[20px] p-[20px] overflow-auto`}>
       

                    {tickets?.map(ticket =>
                        <button
                            onClick={() => {
                                openTicket(ticket.id);
                            }}
                            className='text-2xl w-full min-h-[100px] flex flex-col-reverse items-center justify-center gap-[10px]'
                            key={ticket.id}>
                            <p>Отправитель: {ticket.full_name}</p>
                            <p>Тема обращения: {ticket.name_request}</p>
                        </button>)}
                </div>
            </div>

            
           
          )
    }

    else{
        return (
            <div className='small_buttons flex justify-center w-full pt-[20px]'>
                <span>Список запросов пуст</span>
            </div>
          )
    }

  
}

export default TicketList