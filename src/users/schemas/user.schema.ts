import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {AccountData, AccountDataSchema} from "./accountData.schema";
import {RecoveryFields, RecoveryFieldsSchema} from "./recoveryFields.schema";
import {CreateUserDto} from "../dto/create-user.dto";
import {add} from "date-fns";


@Schema({timestamps: true})
export class User {
    createdAt: Date;
    @Prop({ type: AccountDataSchema, required: true })
    accountData: AccountData;

    @Prop({ type: RecoveryFieldsSchema, default: {} })
    passwordRecovery: RecoveryFields;

    @Prop({ type: RecoveryFieldsSchema, default: {} })
    emailConfirmation: RecoveryFields;

    static createNewUser(dto: CreateUserDto): User {
        return {
            createdAt: new Date(),
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
                code: null,
                isConfirmed: false,
                expiresAt: add(new Date(),{hours: 1}),
            },
        };
    }
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;

