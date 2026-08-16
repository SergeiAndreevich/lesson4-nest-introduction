import {Inject, Injectable} from "@nestjs/common";
import {TypeSessionToFront} from "../../types/session.types";
import {mapORMSessionToFront, mapSessionToFront} from "../../mappers/session.mapper";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {InjectRepository} from "@nestjs/typeorm";
import {Session} from "./Entity/session.entity";
import {Repository} from "typeorm";

@Injectable()
export class SecurityDevicesQueryRepository{
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        @InjectRepository(Session) private readonly securityDeviceRepo:  Repository<Session>
    ) {}

    async findAllSessions(userId: string): Promise<TypeSessionToFront[]>{
        // const sessions = await this.sessionModel.find({
        //     userId: userId
        // });

        //это был запрос на RAW-SQL
        const result = await this.pool.query(`
        SELECT * FROM sessions WHERE user_id = $1
        `, [userId]);
        return result.rows.map(session => mapSessionToFront(session));

    }
    async findAllSessionsORM(userId: string): Promise<TypeSessionToFront[]>{
        const result = await this.securityDeviceRepo.find({where: {user: {id: userId}}});
        return result.map(session => mapORMSessionToFront(session))
    }
}