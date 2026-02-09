import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {AccountData, AccountDataSchema} from "./accountData.schema";
import {RecoveryFields, RecoveryFieldsSchema} from "./recoveryFields.schema";


@Schema()
export class User {
    @Prop({ type: AccountDataSchema, required: true })
    accountData: AccountData;

    @Prop({ type: RecoveryFieldsSchema, default: {} })
    passwordRecovery: RecoveryFields;

    @Prop({ type: RecoveryFieldsSchema, default: {} })
    emailConfirmation: RecoveryFields;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;

