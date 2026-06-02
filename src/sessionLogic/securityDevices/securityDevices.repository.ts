import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Session, SessionDocument} from "./schema/session.schema";
import {factory} from "ts-jest/dist/transformers/hoist-jest";

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

    async findSessionForRefresh(userId: string, deviceId:string){
        const session= await this.sessionModel.findOne({userId: userId,deviceId: deviceId, revoked: false}).lean();
        return session;
    }
    async findFrontSessionByDeviceId(deviceId:string){
        const session= await this.sessionModel.findOne({deviceId: deviceId}).lean<Session>();
        return session;
    }

    async updateSession(deviceId:string, lastActivity:Date, expiresAt:Date) {
        const result = await this.sessionModel.updateOne(
            { deviceId: deviceId },
            {
                $set: {
                    lastActivity: lastActivity,
                    expiresAt: expiresAt,
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }

    async closeSession(deviceId: string){
        console.log('DELETE session deviceId:', deviceId);
        const result = await this.sessionModel.deleteOne({deviceId: deviceId });
        console.log('DELETE result:', result);

        return result.deletedCount === 1
    }

    async closeAllSessionsBesidesThisOne(userId:string, deviceId:string){
        const result = await this.sessionModel.deleteMany({
            userId: userId,
            deviceId: { $ne: deviceId }
        });
        return
    }
    async removeSession(sessionId:string){
        const result = await this.sessionModel.deleteOne({_id:sessionId});
        return result.deletedCount === 1
    }
}