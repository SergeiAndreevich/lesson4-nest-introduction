import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./schemas/user.schema";
import {Model} from "mongoose";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {}

    async createUser(dto:CreateUserDto) {
        const createdUser : UserDocument = await this.userModel.create({
            ...dto
        })
        return createdUser
    }

    async removeUserById(id:string) {
        const result = await this.userModel.deleteOne({ _id: id });
        return result.deletedCount === 1
    }
}