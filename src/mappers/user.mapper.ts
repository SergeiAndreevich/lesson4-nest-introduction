import {UserDocument} from "../users/schemas/user.schema";
import {TypeUserToView} from "../types/user.types";

export function mapUserToView(dto:any):TypeUserToView{
    return {
        id: dto._id.toString(),
        login: dto.accountData.login,
        email: dto.accountData.email,
        createdAt: dto.createdAt.toISOString()
    }
}