import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeEmailConfirmation, TypePasswordRecovery} from "../../types/user.types";


@Injectable()
export class PasswordRecoverySQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}
    async createPasswordRecoveryFields(dto:TypePasswordRecovery):Promise<TypePasswordRecovery | null>{
        const result = await this.pool.query(`
        INSERT INTO password_recoveries (userId, recovery_code, expires_at, is_confirmed)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [dto.userId, dto.recovery_code, dto.expires_at, dto.is_confirmed]);
        return result.rows[0] ?? null;
    }
}



