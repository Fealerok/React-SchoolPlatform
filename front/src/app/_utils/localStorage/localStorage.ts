const getTokens = (): (string | null)[] => {
    let accessToken: string | null = "";
    let refreshToken: string | null = "";

    accessToken = localStorage.getItem("accessToken");
    refreshToken = localStorage.getItem("refreshToken");

    const tokens = [accessToken, refreshToken];
    return tokens;
}

const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
}

export {
    getTokens,
    setTokens
}