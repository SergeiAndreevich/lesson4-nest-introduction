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