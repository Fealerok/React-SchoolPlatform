const getTokens = (): (string | null)[] => {
    let accessToken;
    let refreshToken;

    accessToken = localStorage.getItem("accessToken");
    refreshToken = localStorage.getItem("refreshToken");

    const tokens = [accessToken, refreshToken];
    return tokens;
}

const setTokens = (accessToken: string | undefined, refreshToken: string | undefined) => {

    localStorage.setItem("accessToken", accessToken == undefined ? "undefined" : accessToken );
    localStorage.setItem("refreshToken", refreshToken == undefined ? "undefined" : refreshToken);
}

export {
    getTokens,
    setTokens
}