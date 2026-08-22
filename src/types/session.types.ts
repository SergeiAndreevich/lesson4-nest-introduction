import {Prop} from "@nestjs/mongoose";
import {User} from "../sessionLogic/auth/Entity/user.entity";
import {Session} from "../sessionLogic/securityDevices/Entity/session.entity";

export type TypeSessionToFront ={
    ip: string,

    //deviceName
    title:	string,

    //lastActivity
    lastActiveDate:	string,

    deviceId: string,
}


export type JwtPayload = {
    userId: string;
    userLogin: string;
    deviceId: string;
    iat: number;
    exp: number;
    sessionVersion: number;
}

export type TypeSession = {
    id: string;
    user_id: string;
    device_id: string;
    ip: string;
    device_name: string;
    last_activity: Date;
    expires_at: Date;
    version: number;
}
export function createSession( id:string, userId: string, deviceId: string, ip: string, deviceName: string,
                              lastActivity: Date, expiresAt: Date, version: number){
    return{
        id: id,
        user_id: userId,
        device_id: deviceId,
        ip: ip,
        device_name: deviceName,
        last_activity: lastActivity,
        expires_at: expiresAt,
        version: version
    }
}
export function createSessionORM( id:string, deviceId: string, ip: string, deviceName: string,
                               lastActivity: Date, expiresAt: Date, version: number, user: User): Session{
    return{
        id: id,
        device_id: deviceId,
        ip: ip,
        device_name: deviceName,
        last_activity: lastActivity,
        expires_at: expiresAt,
        version: version,
        user: user
    }
}