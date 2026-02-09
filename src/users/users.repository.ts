import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./schemas/user.schema";
import {Model, Types} from "mongoose";
import {CreateUserDto} from "./dto/create-user.dto";

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

        return result.matchedCount === 1 && result.modifiedCount === 1;    }

    async removeUserById(id:string) {
        const result = await this.userModel.deleteOne({ _id: id });
        return result.deletedCount === 1
    }
}