import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {AccountData, AccountDataSchema} from "./accountData.schema";
import {RecoveryFields, RecoveryFieldsSchema} from "./recoveryFields.schema";
import {add} from "date-fns";
import {v4 as uuidv4} from "uuid";
import {CreateUserDto} from "../dto/create-user.dto";
import {CreateAuthDto} from "../../auth/dto/create-auth.dto";


@Schema({timestamps: true})
export class User {
    @Prop({ type: AccountDataSchema, required: true })
    accountData: AccountData;

    @Prop({ type: RecoveryFieldsSchema, default: {} })
    passwordRecovery: RecoveryFields;

    @Prop({ type: RecoveryFieldsSchema, default:{}})
    emailConfirmation: RecoveryFields;

    static createNewUser(dto: CreateUserDto | CreateAuthDto): User {
        return {
            accountData: {
                login: dto.login,
                email: dto.email,
                password: dto.password // лучше хэшировать в сервисе
            },
            passwordRecovery: {
                code: null,
                isConfirmed: false,
                expiresAt: new Date(),
            },
            emailConfirmation: {
                code: uuidv4(),
                isConfirmed: false,
                expiresAt: add(new Date(),{hours: 1}),
            },
        } as User
    }
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;

