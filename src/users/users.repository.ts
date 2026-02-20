import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./schemas/user.schema";
import {Model, Types} from "mongoose";
import {CreateUserDto} from "./dto/create-user.dto";
import {add} from "date-fns";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async createUser(userData: User) {
        const createdUser = await this.userModel.create(userData)
        return createdUser
    }

    async confirmEmail(userId: string): Promise<boolean> {
        const result = await this.userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    "emailConfirmation.isConfirmed" : true
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }

    async updateEmailConfirmationCode(userId: string, newCode:string, expiresAt:Date) {
        const result = await this.userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    "emailConfirmation.code" : newCode,
                    "emailConfirmation.isConfirmed" : false,
                    "emailConfirmation.expiresAt" : expiresAt,
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }

    async recoveryPassword(email:string, recoveryCode: string) {
        const result = await this.userModel.updateOne(
            { "accountData.email": email },
            {
                $set: {
                    "passwordRecovery.code" : recoveryCode,
                    "passwordRecovery.isConfirmed" : false,
                    "passwordRecovery.expiresAt" : add(new Date(),{hours: 1,}),
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }

    async setNewPassword(newPassword: string, recoveryCode: string): Promise<boolean> {
        const result = await this.userModel.updateOne(
            { "passwordRecovery.code" : recoveryCode, },
            {
                $set: {
                    "accountData.password": newPassword,
                    "passwordRecovery.isConfirmed" : true,
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }

    async removeUserById(id:string) {
        const result = await this.userModel.deleteOne({ _id: id });
        return result.deletedCount === 1
    }
}