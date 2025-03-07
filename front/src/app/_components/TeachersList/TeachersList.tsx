import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { DevBundlerService } from 'next/dist/server/lib/dev-bundler-service';
import { useRouter } from 'next/navigation';
import AddTeacher from './AddTeacher/AddTeacher';
import Input from '@/app/_ui/Input/Input';
import React, { useEffect, useState } from 'react'
import isValid from '@/app/_utils/validation/authValidation';

const TeachersList = () => {

    const router = useRouter();

    const [isAddTeacher, setIsAddTeacher] = useState(false);

    const [teachers, setTeachers] = useState<Array<{
        id: number,
        login: string,
        full_name: string
    }>>();

    const [selectedTeacher, setSelectedTeacher] = useState<{
        id: number,
        login: string,
        full_name: string
    } | undefined>();

    const [surname, setSurname] = useState<string>();
    const [name, setName] = useState<string>();
    const [patronymic, setPatronymic] = useState<string>();

    const [loginTeacher, setLoginTeacher] = useState<string>();
    const [passwordTeacher, setPasswordTeacher] = useState<string>();

    const [activeTeacherId, setActiveTeacherId] = useState<null | number>(null);

    const getTeachers = async () => {
        const response = await fetchWithAuth("/get-teachers", {
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

        setTeachers(response.teachers);
    }

    const setActiveTeacherIdHandle = (teacherId: number) => {

        if (activeTeacherId == teacherId) {
            setActiveTeacherId(null);
        }
        else{
            setActiveTeacherId(teacherId);
            const selectedTeacherFiltered = teachers?.filter(teacher => teacher.id == teacherId)[0];

            setSelectedTeacher(selectedTeacherFiltered);

            setSurname(selectedTeacherFiltered?.full_name.split(" ")[0]);
            setName(selectedTeacherFiltered?.full_name.split(" ")[1]);
            setPatronymic(selectedTeacherFiltered?.full_name.split(" ")[2]);
        }
        
    }

    const deleteTeacherHandle = async () => {

        if (!activeTeacherId) {
            alert("Для удаления, необходимо выбрать учителя.");
            return;
        }

        const response = await fetchWithAuth("/delete-teacher", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idTeacher: activeTeacherId
            })
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return;
        }

        setActiveTeacherId(null);
        getTeachers();
    }

    const saveTeacherHandle = async () => {
        if ((loginTeacher != "" && loginTeacher) && passwordTeacher == "" && !passwordTeacher){
            alert("Для сохранения, необходимо ввести пароль");
            return;
        }
        if ((passwordTeacher != "" && passwordTeacher) && loginTeacher == "" && !loginTeacher){
            alert("Для сохранения, необходимо ввести логин");
            return;
        }

        if (!((!loginTeacher || loginTeacher == "") && (!passwordTeacher || passwordTeacher == ""))){
            const valid = isValid(loginTeacher as string, passwordTeacher as string);

            if (!valid[1]) {
                alert(valid[0]);
                return;
            }
        }
        

        const response = await fetchWithAuth("/update-teacher", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idTeacher: activeTeacherId,
                fullName: `${surname} ${name} ${patronymic}`,
                login: loginTeacher,
                password: passwordTeacher 
            })
        });

        if (!response){
            router.push("/auth");
            location.reload();
            return;
        }

        getTeachers();
    }


    useEffect(() => {
        getTeachers();
    }, [isAddTeacher]);

    useEffect(() => {
        console.log(activeTeacherId);
    }, [activeTeacherId]);

    useEffect(() => {
        console.log(surname)
    }, [surname]);


  return (
    <div className='flex justify-between w-full'>
        <AddTeacher 
        setIsAddTeacher={setIsAddTeacher}
        isAddTeacher={isAddTeacher}/>

        <div className={`${isAddTeacher ? "pointer-events-none" : ""} flex flex-col justify-between items-center w-full border-r-[3px] border-border-blocks`}>
            <div className="mt-[45px] h-[75%] w-full flex flex-col small_buttons overflow-auto">

                {teachers?.map(teacher => (
                    <button
                    onClick={() => setActiveTeacherIdHandle(teacher.id)}
                    className={`mb-[32px] flex-shrink-0 h-[50px] flex items-center pl-[15px] text-xl justify-start ml-5 mr-5 ${activeTeacherId == teacher.id ? `active-button` : ``}`}
                    key={teacher.id}
                    >{teacher.full_name}</button>
                ))}
                
                    
            </div>

            <div className={`flex flex-col gap-[20px] w-[90%]`}>
                <div className="flex w-full justify-between buttons mb-5">
                    <button onClick={() => setIsAddTeacher(true)}>Добавить</button>
                    <button onClick={deleteTeacherHandle}>Удалить</button>
                </div>
            </div>  

            
        </div>
        <div className={`${activeTeacherId ? "block" : "hidden"} ${isAddTeacher ? "pointer-events-none" : ""} flex h-full flex-col w-full items-center justify-between`}>
            <div className={`${activeTeacherId ? 'block' : 'hidden'} pl-[15px] pr-[15px] h-[75%] w-full flex flex-col forms gap-8 mt-[45px]`}>
                  <form className='flex items-center justify-between'>
                      <span>Фамилия: </span>
                      <Input initialText={selectedTeacher?.full_name.split(" ")[0]} type={"Текст"} setInputValue={setSurname} inputPlaceholder='Фамилия' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Имя: </span>
                      <Input initialText={selectedTeacher?.full_name.split(" ")[1]} type={"Текст"} setInputValue={setName} inputPlaceholder='Имя' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Отчество: </span>
                      <Input initialText={selectedTeacher?.full_name.split(" ")[2]} type={"Текст"} setInputValue={setPatronymic} inputPlaceholder='Отчество' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Логин: </span>
                      <Input initialText={selectedTeacher?.login} type={"Текст"} setInputValue={setLoginTeacher} inputPlaceholder='Логин' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Пароль: </span>
                      <Input initialText={""} type={"Текст"} setInputValue={setPasswordTeacher} inputPlaceholder='Пароль' isLabel={false} />
                  </form>
            </div>

            <div className={`flex flex-col gap-[20px] w-[90%] ${activeTeacherId ? `block` : `hidden`}`}>
                <div className="flex w-full justify-between buttons mb-5">
                    <button onClick={saveTeacherHandle}>Сохранить</button>
                    <button onClick={() => {setActiveTeacherId(null)}}>Отменить</button>
                </div>
            </div>  
             
        </div>
    </div>
  )


}

export default TeachersList;