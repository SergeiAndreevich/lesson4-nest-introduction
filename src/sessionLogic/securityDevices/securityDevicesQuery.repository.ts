import {Inject, Injectable} from "@nestjs/common";
import {TypeSessionToFront} from "../../types/session.types";
import {mapSessionToFront} from "../../mappers/session.mapper";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";

@Injectable()
export class SecurityDevicesQueryRepository{
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}

    async findAllSessions(userId: string): Promise<TypeSessionToFront[]>{
        // const sessions = await this.sessionModel.find({
        //     userId: userId
        // });
        const result = await this.pool.query(`
        SELECT * FROM sessions WHERE user_id = $1
        `, [userId]);
        return result.rows.map(session => mapSessionToFront(session));
    }
}