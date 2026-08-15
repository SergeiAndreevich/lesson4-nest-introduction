import {Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Session as MongooseSession, SessionDocument} from "./schema/session.schema";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeSession} from "../../types/session.types";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Session} from "./Entity/session.entity";

@Injectable()
export class SecurityDevicesRepository{
    constructor(
        @InjectModel(MongooseSession.name) private readonly sessionModel: Model<SessionDocument>,
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    ) {}

    async createSession(session:TypeSession): Promise<TypeSession>{
        // const createdSession = await this.sessionModel.create(session);
        // return createdSession
        const result = await this.pool.query(`
        INSERT INTO sessions (id, user_id, device_id, ip, device_name, last_activity,expires_at,version)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `, [session.id, session.user_id, session.device_id, session.ip, session.device_name, session.last_activity, session.expires_at, session.version]);
        return result.rows[0]
    }
    async createSessionORM(session:TypeSession): Promise<Session>{
        const newSession = this.sessionRepo.create(session);
        return this.sessionRepo.save(newSession)
    }

    async findSessionByDeviceId(deviceId:string):Promise<TypeSession | null>{
        // const session= await this.sessionModel.findOne({deviceId: deviceId}).lean<Session>();
        // return session
        const result = await this.pool.query(`
        SELECT * FROM sessions WHERE device_id=$1
        `,[deviceId]);
        return result.rows[0] ?? null
    }
    async findSessionByDeviceIdAndUserId(deviceId:string, userId: string):Promise<TypeSession | null>{
        // const session= await this.sessionModel.findOne({deviceId: deviceId, userId: userId}).lean<Session>();
        // return session
        const result = await this.pool.query(`
        SELECT * FROM sessions WHERE device_id=$1 AND user_id=$2
        `, [deviceId, userId]);
        return result.rows[0] ?? null
    }

    async findSessionForRefresh(userId: string, deviceId:string): Promise<TypeSession | null>{
        // const session= await this.sessionModel.findOne({userId: userId,deviceId: deviceId}).lean<Session>();
        // return session;
        const result = await this.pool.query(`
        SELECT * from sessions WHERE user_id=$1 AND device_id=$2
        `, [userId, deviceId]);
        return result.rows[0] ?? null
    }
    async findSessionForRefreshORM(userId: string, deviceId:string): Promise<Session | null>{
        return this.sessionRepo.findOne({where: { user: {id:userId}, device_id: deviceId}})
    }

    async findSessionForLogout(userId: string, deviceId:string) : Promise<TypeSession | null>{
        // const session= await this.sessionModel.findOne({userId: userId,deviceId: deviceId}).lean<Session>();
        // return session;
        const result = await this.pool.query(`
        SELECT * from sessions WHERE user_id=$1 AND device_id=$2
        `, [userId, deviceId]);
        return result.rows[0] ?? null
    }
    async findSessionForLogoutORM(userId: string, deviceId:string) : Promise<Session | null>{
        return this.sessionRepo.findOne({where: { user: {id:userId}, device_id: deviceId}})
    }

    async closeSession(userId: string, deviceId: string){
        // const result = await this.sessionModel.deleteOne({userId: userId, deviceId: deviceId });
        // //return result.deletedCount === 1
        // return
        const result = await this.pool.query(`
        DELETE FROM sessions WHERE user_id = $1 AND device_id=$2`, [userId, deviceId]);
        return result.rowCount === 1;
    }
    async closeSessionORM(userId: string, deviceId: string): Promise<boolean> {
        const result = await this.sessionRepo.delete({
            user: {id: userId},
            device_id: deviceId,
        });

        return result.affected === 1;
    }

    async closeAllSessionsBesidesThisOne(userId:string, deviceId:string){
        // const result = await this.sessionModel.deleteMany({
        //     userId: userId,
        //     deviceId: { $ne: deviceId }
        // });
        // return
        const result = await this.pool.query(`
        DELETE FROM sessions
        WHERE user_id = $1 AND device_id <> $2
        `,[userId, deviceId]);
        return result.rowCount !== null
    }
    async removeSession(sessionId:string){
        const result = await this.sessionModel.deleteOne({_id:sessionId});
        return result.deletedCount === 1
    }
}