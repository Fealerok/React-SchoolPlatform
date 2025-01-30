import React from 'react'
import "./Schedule.css"

const Schedule = () => {
    const times = [
        "9:00", "10:00", "11:00",
        "12:00", "13:00", "14:00",
        "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00"
    ]

    return (
        <table className='w-full h-full table-fixed'>
        <tbody>
        <tr>
            <th className='w-[100px]'></th>
            <th>Понедельник</th>
            <th>Вторник</th>
            <th>Среда</th>
            <th>Четверг</th>
            <th>Пятница</th>
        </tr>
    
        {times.map((time, index) => (
            <tr key={index}>
                <td>{time}</td>
                {Array.from({length: 5}).map((_, i) => (
                    <td key={i} onClick={() => console.log(`${index} - ${i}`)}></td>
                ))}
            </tr>
        ))}
        </tbody>
    </table>
      )
}

export default Schedule