import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./schemas/user.schema";
import {Model} from "mongoose";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async createUser(dto:CreateUserDto) {
        try{
            const createdUser = await this.userModel.create({
                ...dto,
                createdAt: new Date(),

            })
            return createdUser
        }
        catch (e) {
            console.error('CreateUser error:', e.message, e.stack);
            throw e;
        }

    }

    async removeUserById(id:string) {
        const result = await this.userModel.deleteOne({ _id: id });
        return result.deletedCount === 1
    }
}