export default interface IAuth{
    isAuth: boolean,
    message: string,
    user?: {
        id: number,
        login: string,
        role: string,
        fullName: string
    }
}