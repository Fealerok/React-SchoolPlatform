import { getTokens } from "../localStorage/localStorage"

interface IFetchOptions {
    method?: string; // Метод запроса (GET, POST и т.д.)
    headers?: Record<string, string>; // Заголовки запроса
    body?: BodyInit; // Тело запроса (например, JSON, FormData)
    // Другие свойства, которые могут быть в `options`
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const updateAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    const response = await fetch(`${baseUrl}/update-access`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refreshToken})
    });


    if (response.status == 403){
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return;
    }

    const {newAccessToken} = await response.json();
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
}



export const fetchWithAuth = async (url: string, options: IFetchOptions = {}) => {
    let accessToken = localStorage.getItem("accessToken");

    const headers = {
        ...options.headers,

        Authorization: `Bearer ${accessToken}`
    }

    const fetchOptions = {
        ...options,
        headers
    }

    
    try {
        let response = await fetch(`${baseUrl}${url}`, fetchOptions);

        if (response.status == 401){
            accessToken = await updateAccessToken();
    
            if (!accessToken) return;
            headers.Authorization = `Bearer ${accessToken}`;
            fetchOptions.headers = headers;
            response = await fetch(`${baseUrl}${url}`, fetchOptions);     
        }
    
    
        if (!response.ok) {
            return response.json();
        }
    
        return response.json();
    } catch (error) {
        console.log(`Ошибка выполнения запроса: ${error}`);
        
    }
   

}