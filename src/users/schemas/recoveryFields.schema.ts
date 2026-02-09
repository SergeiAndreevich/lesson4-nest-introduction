import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema({ _id: false })
export class RecoveryFields {
    @Prop()
    code: string | null;

    @Prop({ default: false })
    isRevoked: boolean;

    @Prop()
    expiresAt: Date | null;
}

export const RecoveryFieldsSchema = SchemaFactory.createForClass(RecoveryFields);