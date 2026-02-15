import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema({ _id: false })
export class RecoveryFields {
    @Prop({ type: String, default: null })
    code: string | null;

    @Prop({ type: Boolean, default: false })
    isConfirmed: boolean;

    @Prop({ type: Date, default: null })
    expiresAt: Date | null;
}

export const RecoveryFieldsSchema = SchemaFactory.createForClass(RecoveryFields);