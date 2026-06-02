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


    static createSession(userId: string, deviceId: string,ip:string, deviceName:string, lastActivity: Date, expiresAt: Date ): Session {
        return {
            userId: userId,
            deviceId: deviceId,
            ip: ip,
            deviceName: deviceName,
            lastActivity: lastActivity,
            expiresAt: expiresAt,
        } as Session
    }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export type SessionDocument = HydratedDocument<Session>;

