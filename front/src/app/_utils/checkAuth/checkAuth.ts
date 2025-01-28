const checkAuth = async (accessToken: string | null, refreshToken: string | null): Promise<{
    accessToken: string | undefined,
    refreshToken: string | undefined,
    isAuth: boolean,
    user?: {
        id: number,
        login: string, 
        role: string
    }
}>  => {
    //Делаем запрос на сервер с передачей токенов
    const response = await fetch("http://localhost:3010/check-auth",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken,
            refreshToken
        })
    });

    const responseJson = await response.json();
    //Возвращаем ответ сервера
    return {
        accessToken: responseJson.accessToken,
        refreshToken: responseJson.refreshToken,
        isAuth: responseJson.isAuth,
        user: responseJson.user
    }
}

export default checkAuth;