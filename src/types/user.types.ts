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

export type TypeEmailConfirmation = {
    userId: string;
    confirmation_code: string;
    expires_at: Date;
    is_confirmed: boolean;
}
export function createEmailConfirmation(userId: string): TypeEmailConfirmation {
    return{
        userId: userId,
        confirmation_code: uuidv4(),
        expires_at: new Date(Date.now() + 1000 * 60 * 5),
        is_confirmed: false
    }
}

export type TypePasswordRecovery = {
    userId: string;
    recovery_code: string;
    expires_at: Date;
    is_confirmed: boolean;
}
export function createPasswordRecovery(userId: string): TypePasswordRecovery {
    return{
        userId: userId,
        recovery_code: uuidv4(),
        expires_at: new Date(Date.now() + 1000 * 60 * 5),
        is_confirmed: true
    }
}