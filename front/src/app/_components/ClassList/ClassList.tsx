"use client"

import React, { useEffect, useState } from 'react'
import Input from '@/app/_ui/Input/Input';
import AddClass from './AddClass/AddClass';
import "./ClassList.css";
import AddStudent from './AddStudent/AddStudent';
import { getTokens, setTokens } from '@/app/_utils/localStorage/localStorage';
import EditClass from './EditClass/EditClass';
import { useRouter } from 'next/navigation';
import updateAccessToken from '@/app/_utils/checkAuth/updateAccessToken';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth/fetchWithAuth';
import { log } from 'console';

interface IStudents{
    id: number,
    login: string,
    full_name: string,
    classname: string
}


const ClassesList = () => {

    const [classes, setClasses] = useState<Array<{id: number, name: string}>>([])
    const [students, setStudents] = useState<Array<IStudents>>([]);
    const [activeClassButtonId, setActiveClassButtonId] = useState<number | null>();
    const [activeStudentButtonId, setActiveStudentButtonId] = useState<number | null>();
    const [newClass, setNewClass] = useState<string | undefined>();
    const [newStudent, setNewStudent] = useState<string | undefined>();
    const [updatedClassName, setClassName] = useState<string | undefined>();

    const [isAddClass, setIsAddClass] = useState(false);
    const [isAddStudent, setIsAddStudent] = useState(false);
    const [isEditClass, setIsEditClass] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<IStudents>();

    const [classReg, setClassReg] = useState<string>();
    const [surnameReg, setSurnameReg] = useState<string>();
    const [nameReg, setNameReg] = useState<string>();
    const [patronymicReg, setPatronymicReg] = useState<string>();
    const [loginReg, setLoginReg] = useState<string>();
    const [passwordReg, setPasswordReg] = useState<string>();
    const router = useRouter();

    const getClasses = async () => {

       const response = await fetchWithAuth("/get-classes", {method: "POST"});
        
       if (!response) router.push("/auth");
       else{
        setClasses(response.classes);
       }
    }

    const deleteClass = async () => {
        if (!activeClassButtonId) {
            alert("Для удаления необходимо выбрать класс");
            return;
        }

        const response = await fetchWithAuth("/delete-class", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                selectedClassId: activeClassButtonId
            })
        });

        if (!response) router.push("/auth");
        else{
            getClasses();
            setActiveClassButtonId(null);
            setStudents([]);
        }

        
    }

    const deleteStudent = async () => {
        if (!activeStudentButtonId){
            alert("Для удаления необходимо выбрать ученика.");
            return;
        }

        const response = await fetchWithAuth("/delete-student", {
            method: "DELETE",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                selectedStudentId: activeStudentButtonId
            })

        });

        if (!response) router.push("/auth");
        else{
            setActiveStudentButtonId(null);
            getStudentsInClass(activeClassButtonId);
        }
        
        
    }

    

    const getStudentsInClass = async (buttonId: number | null | undefined) => {
        
        
        const response = await fetchWithAuth("/get-students-in-class", {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                selectedClassId: buttonId
            })
        });

        if (!response) router.push("/auth");
        else{
            const students = response;

            setStudents(students);
        }

        
    }

    const setActiveClassButton = (buttonId: number) => {
        
        if (activeClassButtonId == buttonId){
            setActiveClassButtonId(null)
            getStudentsInClass(null);
            setActiveStudentButtonId(null);
        } 
        else {
            setActiveClassButtonId(buttonId);
            getStudentsInClass(buttonId);
            setActiveStudentButtonId(null);
        }
    }

    const setActiveStudentButton = (buttonId: number) => {
        
        setPasswordReg("");
        if (activeStudentButtonId == buttonId) setActiveStudentButtonId(null)
        else {
            setActiveStudentButtonId(buttonId);
            setSelectedStudent(students.filter(student => student.id == buttonId)[0]);
        }

    }

    const saveChangesStudent = async () => {
        const updatedStudent = {
            id: activeStudentButtonId,
            surname: surnameReg,
            name: nameReg,
            patronymic: patronymicReg,
            className: classReg,
            login: loginReg,
            password: passwordReg
        }

        

        const response = await fetchWithAuth("/update-student", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                updatedStudent
            })
        });

        if (!response) router.push("/auth");
        else{
            getStudentsInClass(activeClassButtonId);
        }

    }

    const editClass = () => {
        if (!activeClassButtonId) alert("Для редактирования названия необходимо выбрать класс");
        
        else{
            setIsEditClass(true);
        }
    }

    useEffect(() => {
        if (selectedStudent) {
            // Разделяем full_name на фамилию, имя и отчество
            const [surname, name, patronymic] = selectedStudent.full_name.split(" ");
    
            // Обновляем состояния
            setClassReg(selectedStudent.classname || "");
            setSurnameReg(surname || "");
            setNameReg(name || "");
            setPatronymicReg(patronymic || "");
            setLoginReg(selectedStudent.login || "");
            setPasswordReg(""); // Сбрасываем пароль при переключении студента
        }
    }, [activeStudentButtonId]);



    useEffect(() => {
        if (classes?.length == 0){
            getClasses();
        }
    }, [newClass, isAddClass, updatedClassName]);

    useEffect(() => {
        getStudentsInClass(activeClassButtonId);
        
    }, [newStudent, isAddStudent]);

    useEffect(() => {
        getClasses();
    }, [isAddClass, isEditClass]);



  return (
      <div className='flex justify-between w-full h-full border classes_list'>
          <EditClass selectedClassId={activeClassButtonId} isEditClass={isEditClass} setIsEditClass={setIsEditClass} setClassName={setClassName}></EditClass>
          <AddClass setNewClass={setNewClass} isAddClass={isAddClass} setIsAddClass={setIsAddClass}></AddClass>
          <AddStudent selectedClassId={activeClassButtonId} setNewStudent={setNewStudent} isAddStudent={isAddStudent} setIsAddStudent={setIsAddStudent}></AddStudent>

          {/* Список классов */}
          <div className={`${isAddClass || isEditClass || isAddStudent ? "pointer-events-none" : ""} w-[30%] overflow-hidden flex h-full border-r-[3px] border-border-blocks justify-between items-center flex-col`}>
              <div className="mt-[45px] w-full flex flex-col small_buttons">
                  {classes?.length !== 0 ? classes?.map((classData) => {
                      return (
                          <button
                              onClick={() => setActiveClassButton(classData.id)}
                              className={`mb-[32px] min-w-0 overflow-hidden flex-shrink-0 h-10 flex items-center pl-[15px] justify-start text-xl ml-5 mr-5 truncate ${activeClassButtonId === classData.id ? `active-button` : ``}`}
                              key={classData.id}
                          >
                              {classData.name}
                          </button>
                      );
                  }) : (<span className='text-center'>Список пуст!</span>)}
              </div>

              <div className="flex flex-col gap-[20px] w-[90%] mb-5">
                  <div className="flex w-full justify-between buttons">
                      <button onClick={() => setIsAddClass(true)}>Добавить</button>
                      <button onClick={deleteClass}>Удалить</button>
                  </div>
                  <div className="flex w-full justify-center buttons">
                      <button className='flex-1' onClick={editClass}>Редактировать</button>
                  </div>
              </div>
          </div>

          {/* Список учеников */}
          <div className={`${isAddStudent || isEditClass ? 'pointer-events-none' : ""} w-[30%] flex h-full border-r-[3px] border-border-blocks flex-col small_buttons justify-between items-center`}>
              <div className="mt-[45px] h-[75%] w-full flex flex-col small_buttons overflow-auto">
                  {students?.length !== 0 ?
                      students?.map((student) => (
                          <button
                              className={`${activeStudentButtonId == student.id ? 'active-button' : ''} min-w-0 overflow-hidden mb-[32px] flex-shrink-0 h-10 flex items-center pl-[15px] text-xl justify-start ml-5 mr-5 truncate`}
                              key={student.id}
                              onClick={() => setActiveStudentButton(student.id)}
                          >
                              {student.full_name}
                          </button>
                      )) : (<span className='text-center'>Список пуст!</span>)}
              </div>

              <div className={`flex flex-col gap-[20px] w-[90%] ${activeClassButtonId ? `block` : `hidden`}`}>
                  <div className="flex w-full justify-between buttons mb-5">
                      <button onClick={() => setIsAddStudent(true)}>Добавить</button>
                      <button onClick={deleteStudent}>Удалить</button>
                  </div>
              </div>
          </div>

          {/* Редактирование ученика */}
          <div className={`${activeStudentButtonId ? 'block' : 'hidden'} w-[40%] flex h-full flex-col items-center justify-between`}>
              <div className={`${activeStudentButtonId ? 'block' : 'hidden'} pl-[15px] pr-[15px] h-[75%] w-full flex flex-col forms gap-8 mt-[45px]`}>
                  <form className='flex items-center justify-between'>
                      <span>Класс: </span>
                      <Input initialText={selectedStudent?.classname} type={"Текст"} setInputValue={setClassReg} inputPlaceholder='Класс' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Фамилия: </span>
                      <Input initialText={selectedStudent?.full_name.split(" ")[0]} type={"Текст"} setInputValue={setSurnameReg} inputPlaceholder='Фамилия' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Имя: </span>
                      <Input initialText={selectedStudent?.full_name.split(" ")[1]} type={"Текст"} setInputValue={setNameReg} inputPlaceholder='Имя' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Отчество: </span>
                      <Input initialText={selectedStudent?.full_name.split(" ")[2]} type={"Текст"} setInputValue={setPatronymicReg} inputPlaceholder='Отчество' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Логин: </span>
                      <Input initialText={selectedStudent?.login} type={"Текст"} setInputValue={setLoginReg} inputPlaceholder='Логин' isLabel={false} />
                  </form>

                  <form className='flex items-center justify-between'>
                      <span>Пароль: </span>
                      <Input type={"Текст"} initialText={passwordReg} setInputValue={setPasswordReg} inputPlaceholder='Пароль' isLabel={false} />
                  </form>
              </div>

              <div className={`flex flex-col gap-[20px] w-[90%] ${activeClassButtonId ? `block` : `hidden`}`}>
                  <div className="flex w-full justify-between buttons mb-5">
                      <button onClick={saveChangesStudent}>Сохранить</button>
                      <button onClick={() => { setActiveStudentButtonId(null) }}>Отменить</button>
                  </div>
              </div>
          </div>
      </div>
  )
}

export default ClassesList