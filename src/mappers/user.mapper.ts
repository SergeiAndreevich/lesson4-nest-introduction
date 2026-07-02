import {TypeUserToView} from "../types/user.types";

export function mapUserToView(dto:any):TypeUserToView{
    return {
        id: dto.id,
        login: dto.login,
        email: dto.email,
        createdAt: dto.created_at
    }
}