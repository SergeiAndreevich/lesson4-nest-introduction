import {CreateUserDto} from "../sessionLogic/users/dto/create-user.dto";
import {CreateAuthDto} from "../sessionLogic/auth/dto/create-auth.dto";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";

export type TypeUserToView = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
}

export type TypeUser = {
    id: string;
    login: string;
    email: string;
    password: string;
    createdAt: Date;
}

export function createUserSQL(login: string, email: string, password: string): TypeUser{
    return{
        id: uuidv4(),
        login: login,
        email: email,
        password: password,
        createdAt: new Date()
    }
}