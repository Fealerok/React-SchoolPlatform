import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { DevBundlerService } from 'next/dist/server/lib/dev-bundler-service';
import { useRouter } from 'next/navigation';
import Input from '@/app/_ui/Input/Input';
import React, { useContext, useEffect, useState } from 'react'
import isValid from '@/app/_utils/validation/authValidation';
import { AsideContext } from '@/app/_context/asideContext';
import AddAdmin from './AddAdmin/AddAdmin';

const AdminsList = () => {
    const {setIsOpened, isOpened} = useContext(AsideContext);
    const router = useRouter();

    const [isAddAdmin, setIsAddAdmin] = useState(false);

    const [admins, setAdmins] = useState<Array<{
        id: number,
        login: string,
        full_name: string
    }>>();

    const [selectedAdmin, setSelectedAdmin] = useState<{
        id: number,
        login: string,
        full_name: string
    } | undefined>();

    const [surname, setSurname] = useState<string>();
    const [name, setName] = useState<string>();
    const [patronymic, setPatronymic] = useState<string>();

    const [loginAdmin, setLoginAdmin] = useState<string>();
    const [passwordAdmin, setPasswordAdmin] = useState<string>();

    const [activeAdminId, setActiveAdminId] = useState<null | number>(null);

    const getAdmins = async () => {
        const response = await fetchWithAuth("/get-admins", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return;
        }

        setAdmins(response.admins);
    }

    const setActiveAdminIdHandle = (adminId: number) => {

        if (activeAdminId == adminId) {
            setActiveAdminId(null);
        }
        else{
            setActiveAdminId(adminId);
            const selectedAdminFiltered = admins?.filter(admin => admin.id == adminId)[0];

            setSelectedAdmin(selectedAdminFiltered);

            setSurname(selectedAdminFiltered?.full_name.split(" ")[0]);
            setName(selectedAdminFiltered?.full_name.split(" ")[1]);
            setPatronymic(selectedAdminFiltered?.full_name.split(" ")[2]);
        }
        
    }

    const deleteAdminHandle = async () => {

        if (!activeAdminId) {
            alert("Для удаления, необходимо выбрать Администратора.");
            return;
        }

        const response = await fetchWithAuth("/delete-admin", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idAdmin: activeAdminId
            })
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return;
        }

        setActiveAdminId(null);
        getAdmins();
        alert(response.message);
    }

    const saveAdminHandle = async () => {
        if ((loginAdmin != "" && loginAdmin) && passwordAdmin == "" && !passwordAdmin){
            alert("Для сохранения, необходимо ввести пароль");
            return;
        }
        if ((passwordAdmin != "" && passwordAdmin) && loginAdmin == "" && !loginAdmin){
            alert("Для сохранения, необходимо ввести логин");
            return;
        }

        if (!((!loginAdmin || loginAdmin == "") && (!passwordAdmin || passwordAdmin == ""))){
            const valid = isValid(loginAdmin as string, passwordAdmin as string);

            if (!valid[1]) {
                alert(valid[0]);
                return;
            }
        }
        

        const response = await fetchWithAuth("/update-admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idAdmin: activeAdminId,
                fullName: `${surname} ${name} ${patronymic}`,
                login: loginAdmin,
                password: passwordAdmin
            })
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return;
        }
        alert(response.message);
        getAdmins();
    }


    useEffect(() => {
        getAdmins();
    }, [isAddAdmin]);



  return (
    <div className='flex justify-between w-full teacher_list' onClick={() => {
      if (window.innerWidth < 1367){
        setIsOpened(false);
    }
    }}>
    <AddAdmin 
      setIsAddAdmin={setIsAddAdmin}
      isAddAdmin={isAddAdmin}
    />
  
    {/* Список учителей */}
    <div className={`${isAddAdmin || (isOpened && window.innerWidth < 1366) ? "pointer-events-none" : ""} flex flex-col justify-between items-center w-[50%] border-r-[3px] border-border-blocks`}>
      <div className="mt-[45px] overflow-y-scroll h-[80%] w-full flex flex-col small_buttons">
        {admins?.length !== 0 ? admins?.map(admin => (
          <button
            onClick={() => setActiveAdminIdHandle(admin.id)}
            className={`mb-[32px] min-w-0 overflow-hidden flex-shrink-0 h-[50px] flex items-center pl-[15px] text-xl justify-start ml-5 mr-5 truncate ${activeAdminId == admin.id ? `active-button` : ``}`}
            key={admin.id}
          >
            {admin.full_name}
          </button>
        )) : <span className='text-center'>Список пуст!</span>}
      </div>
  
      <div className={`flex flex-col gap-[20px] w-[90%]`}>
        <div className="flex w-full justify-between buttons mb-5">
          <button onClick={() => setIsAddAdmin(true)}>Добавить</button>
          <button onClick={deleteAdminHandle}>Удалить</button>
        </div>
      </div>  
    </div>
  
    {/* Блок с вводом данных */}
    <div className={`${activeAdminId ? "block" : "hidden"} ${isAddAdmin || (isOpened && window.innerWidth < 1366) ? "pointer-events-none" : ""} flex h-full flex-col w-[70%] items-center justify-between`}>
      <div className={`${activeAdminId ? 'block' : 'hidden'} pl-[15px] pr-[15px] w-full flex flex-col forms gap-8 mt-[45px] h-[80%] overflow-y-scroll`}>
        <form className='flex items-center justify-between'>
          <span>Фамилия: </span>
          <Input initialText={selectedAdmin?.full_name.split(" ")[0]} type={"Текст"} setInputValue={setSurname} inputPlaceholder='Фамилия' isLabel={false} />
        </form>
  
        <form className='flex items-center justify-between'>
          <span>Имя: </span>
          <Input initialText={selectedAdmin?.full_name.split(" ")[1]} type={"Текст"} setInputValue={setName} inputPlaceholder='Имя' isLabel={false} />
        </form>
  
        <form className='flex items-center justify-between'>
          <span>Отчество: </span>
          <Input initialText={selectedAdmin?.full_name.split(" ")[2]} type={"Текст"} setInputValue={setPatronymic} inputPlaceholder='Отчество' isLabel={false} />
        </form>
  
        <form className='flex items-center justify-between'>
          <span>Логин: </span>
          <Input initialText={selectedAdmin?.login} type={"Текст"} setInputValue={setLoginAdmin} inputPlaceholder='Логин' isLabel={false} />
        </form>
  
        <form className='flex items-center justify-between'>
          <span>Пароль: </span>
          <Input initialText={""} type={"Текст"} setInputValue={setPasswordAdmin} inputPlaceholder='Пароль' isLabel={false} />
        </form>
      </div>
  
      <div className={`flex flex-col gap-[20px] w-[90%] ${activeAdminId ? `block` : `hidden`}`}>
        <div className="flex w-full justify-between buttons mb-5">
          <button onClick={saveAdminHandle}>Сохранить</button>
          <button onClick={() => {setActiveAdminId(null)}}>Отменить</button>
        </div>
      </div>  
    </div>
  </div>
  )
}

export default AdminsList