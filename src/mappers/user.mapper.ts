import {UserDocument} from "../users/schemas/user.schema";
import {TypeUserToView} from "../types/user.types";

export function mapUserToView(dto):TypeUserToView{
    return {
        id: dto._id.toString(),
        login: dto.login,
        email: dto.email,
        createdAt: dto.createdAt.toISOString()
    }
}