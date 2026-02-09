import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema({ _id: false })
export class AccountData {
    @Prop({ required: true })
    login: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    email: string;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);