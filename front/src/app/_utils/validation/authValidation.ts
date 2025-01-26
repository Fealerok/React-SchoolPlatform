const isValid = (login: string, password: string): (string | boolean)[] => {
    let isValidData = false;
    let message = "";

    if (isEmpty(login) || isEmpty(password)){
        message = "Введены пустые данные";
        return [message, isValidData];
    }
    else{
        if (password.length < 8) {
            message = "Длина пароля должна быть не меньше 8 символов";
            return [message, isValidData];
        }
        else if (!login.includes('@') || !login.includes('.')){
            message = "В логине должны присутствовать символы @ и .";
            return [message, isValidData];
        }
        else{
            isValidData = true;
            return [message, isValidData]
        }
    }
}

const isEmpty = (data: string): boolean => {

    switch (data){
        case "":
        case null:
        case undefined:
            return true;

    }

    return false;
}

export default isValid;