import { AuthContext } from '@/app/_context/authContext';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { useRouter } from 'next/navigation'
import React, { SetStateAction, use, useContext, useEffect, useState } from 'react'


interface IProfile{
  isProfile: boolean,
  setIsProfile: React.Dispatch<SetStateAction<boolean>>
}

const Profile = ({
  isProfile,
  setIsProfile
} : IProfile) => {

  const [className, setClassName] = useState();
  const {user} = useContext(AuthContext);

  const router = useRouter();

  const quitSystemButtonHandle = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsProfile(false);
    location.reload();
    router.push("/auth");
  }

  const getUserClass = async () => {
    const response = await fetchWithAuth("/get-user-class", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idUser: user?.id
      })
    });

    if (!response){
      router.push("/auth");
      location.reload();
      return;
    }

    setClassName(response.userClass);
  }

  useEffect(() => {
    if (isProfile && user?.role == "Ученик") getUserClass()
  }, [isProfile]);

  return (
    <div className={`${isProfile ? "block" : "hidden"} bg-additional-bg border-[3px] flex flex-col justify-center border-border-blocks absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] min-w-[700px] z-[10]`}>
      <div className="w-full p-[30px] flex flex-col gap-[20px]">
        <p>ФИО: {user?.fullName}</p>
        <p>Роль: {user?.role}</p>
        <p className={`${user?.role == "Ученик" ? "block" : "hidden"}`}>Класс: {className}</p>
        <p>Логин: {user?.login}</p>
      </div>

      <div className="h-full flex flex-col items-end justify-end w-full gap-[15px] p-[30px]">
        <button 
        className={`w-full h-[40px] transition-colors duration-150 hover:bg-button-bg hover:text-white border-[2px] border-border-blocks rounded-[6px]`}
        onClick={() => setIsProfile(false)}>Закрыть</button>

        <button 
        className={`w-full h-[40px] transition-colors duration-150 hover:bg-button-bg hover:text-white border-[2px] border-border-blocks rounded-[6px]`}
        onClick={quitSystemButtonHandle}>Выход из системы</button>
      </div>
    </div>
  )
}

export default Profile