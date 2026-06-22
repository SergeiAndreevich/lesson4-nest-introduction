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
        const session= await this.sessionModel.findOne({deviceId: deviceId}).lean<Session>();
        return session
    }
    async findSessionByDeviceIdAndUserId(deviceId:string, userId: string){
        const session= await this.sessionModel.findOne({deviceId: deviceId, userId: userId}).lean<Session>();
        return session
    }

    async findSessionForRefresh(userId: string, deviceId:string){
        const session= await this.sessionModel.findOne({userId: userId,deviceId: deviceId}).lean<Session>();
        return session;
    }
    async findFrontSessionByDeviceId(deviceId:string){
        console.log(
            await this.sessionModel.find().lean()
        );
        const session= await this.sessionModel.findOne({deviceId: deviceId}).lean<Session>();
        return session;
    }
    async findSession(userId: string, deviceId:string, sessionVersion: number){
        const session= await this.sessionModel.findOne({userId: userId,deviceId: deviceId, version: sessionVersion}).lean<Session>();
        return session;
    }
    async findSessionForLogout(userId: string, deviceId:string){
        const session= await this.sessionModel.findOne({userId: userId,deviceId: deviceId}).lean<Session>();
        return session;
    }

    async updateSession(deviceId:string, userId: string, lastActivity:Date, expiresAt:Date, sessionVersion: number) {
        const result = await this.sessionModel.updateOne(
            { userId: userId, deviceId: deviceId },
            {
                $set: {
                    lastActivity: lastActivity,
                    expiresAt: expiresAt,
                    version: sessionVersion
                },
            },
        );

        return result.acknowledged && result.matchedCount === 1;
    }
    async updateRevokedSession(userId: string, deviceId: string, lastActivity:Date, sessionVersion: number) {
        const result = await this.sessionModel.updateOne(
            { userId: userId, deviceId: deviceId, version: sessionVersion},
            {
                $set: {
                    lastActivity: lastActivity,
                    revoked: true
                },
            },
        );
        return result.acknowledged && result.matchedCount === 1;
    }


    async closeSession(userId: string, deviceId: string){
        const result = await this.sessionModel.deleteOne({userId: userId, deviceId: deviceId });
        //return result.deletedCount === 1
        return
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