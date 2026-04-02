import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

@Schema()
export class Session {
    @Prop({required: true})
    userId: string;

    @Prop({required: true})
    deviceId: string;

    @Prop({required: true})
    ip: string;

    @Prop({required: true})
    deviceName: string;

    @Prop({required: true})
    lastActivity: Date;

    @Prop({required: true})
    expiresAt: Date;

    @Prop({required: true})
    revoked: boolean;

    static createSession(userId: string, deviceId: string,ip:string, deviceName:string, expiresAt: Date ): Session {
        return {
            userId: userId,
            deviceId: deviceId,
            ip: ip,
            deviceName: deviceName,
            lastActivity: new Date(),
            expiresAt: expiresAt,
            revoked: false
        } as Session
    }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export type SessionDocument = HydratedDocument<Session>;

