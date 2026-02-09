import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema({ _id: false })
export class RecoveryFields {
    @Prop()
    code: string | null;

    @Prop({ default: false })
    isConfirmed: boolean;

    @Prop()
    expiresAt: Date;
}

export const RecoveryFieldsSchema = SchemaFactory.createForClass(RecoveryFields);