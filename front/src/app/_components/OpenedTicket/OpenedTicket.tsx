import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation';
import React, { SetStateAction } from 'react';

interface IOpenedTicket {
    isOpenedTicket: boolean,
    setIsOpenedTicket: React.Dispatch<SetStateAction<boolean>>,
    ticket: {
        id: number,
        full_name: string,
        name_request: string,
        text_request: string
    } | undefined
}

const OpenedTicket = ({
    isOpenedTicket,
    setIsOpenedTicket,
    ticket
}: IOpenedTicket) => {

    const router = useRouter();

    const deleteTicket = async () => {
        const response = await fetchWithAuth("/delete-ticket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idTicket: ticket?.id
            })
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return
        }

        console.log(555);

        setIsOpenedTicket(false);
    }

    return (
        <div className={`${isOpenedTicket ? "block" : "hidden"} absolute flex flex-col justify-between p-[30px] items-center border-[3px] border-border-blocks top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] right-0 bottom-0 w-[30%] bg-additional-bg`}>
            <div className="flex flex-col items-center text-2xl text-center gap-[20px] w-full">
                <p>ФИО отправителя: {ticket?.full_name}</p>

                <div className="w-full max-h-[40px] overflow-y-auto break-words"> {/* Фиксированная высота, перенос текста и скролл */}
                    <p>Тема обращения: {ticket?.name_request}</p>
                </div>

                <div className="w-full max-h-[200px] overflow-y-auto break-words"> {/* Фиксированная высота, перенос текста и скролл */}
                    <p>Текст обращения: {ticket?.text_request}</p>
                </div>
            </div>

            <div className="flex small_buttons gap-[30px]">
                <button 
                onClick={deleteTicket}
                className='pl-[20px] pr-[20px] pt-[10px] pb-[10px]'>Удалить обращение</button>
                <button 
                onClick={() => setIsOpenedTicket(false)}
                className='pl-[20px] pr-[20px] pt-[10px] pb-[10px]'>Закрыть обращение</button>
            </div>
        </div>
    )
}

export default OpenedTicket;