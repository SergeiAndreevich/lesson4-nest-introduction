import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Session, SessionDocument} from "./schema/session.schema";

@Injectable()
export class SecurityDevicesRepository{
    constructor(
        @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>
    ) {}

    async createSession(session:Session){
        const createdSession = await this.sessionModel.create(session);
        return createdSession
    }

    async findSessionByDeviceId(deviceId:string){
        const session= await this.sessionModel.findOne({deviceId: deviceId});
        return session;
    }

    async updateSession(userId: string, deviceId:string, lastActivity:Date, expiresAt:Date) {
        const result = await this.sessionModel.updateOne(
            { userId: userId, deviceId: deviceId },
            {
                $set: {
                    lastActivity: lastActivity,
                    expiresAt: expiresAt,
                    revoked: false
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }

    async closeSession(userId: string, deviceId: string){
        const result = await this.sessionModel.deleteOne({ userId: userId, deviceId: deviceId });
        return result.deletedCount === 1
    }

    async closeAllSessionsBesidesThisOne(userId:string, deviceId:string){
        const result = await this.sessionModel.deleteMany({ userId: userId}, {$ne:{deviceId: deviceId}});
        return
    }
}