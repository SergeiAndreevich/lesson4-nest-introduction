import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema({ _id: false })
export class RecoveryFields {
    @Prop({ type: String })
    code: string;

    @Prop({ type: Boolean, default: false })
    isConfirmed: boolean;

    @Prop({ type: Date, default: new Date() })
    expiresAt: Date;
}

export const RecoveryFieldsSchema = SchemaFactory.createForClass(RecoveryFields);