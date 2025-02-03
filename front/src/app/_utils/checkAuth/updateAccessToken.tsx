const updateAccessToken = async (refreshToken: string) => {
    
    
    const response = await fetch("http://localhost:3010/update-access", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            refreshToken
        })
    });

    if (refreshToken == "null" || !refreshToken){
        return await "Отсутствует Refresh"
    }
    
    if (response.status == 403){
        
        return (await response.json()).message
    }
    else return (await response.json()).newAccessToken
}

export default updateAccessToken;