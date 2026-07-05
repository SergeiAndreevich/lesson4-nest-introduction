import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool, PoolClient} from "pg";
import {TypeEmailConfirmation, TypePasswordRecovery} from "../../types/user.types";


@Injectable()
export class PasswordRecoverySQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}
    async createPasswordRecoveryFields(dto:TypePasswordRecovery, client?: PoolClient):Promise<TypePasswordRecovery>{
        const db = client ?? this.pool;
        const result = await db.query(`
        INSERT INTO password_recoveries (user_id, recovery_code, expires_at, is_confirmed)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [dto.userId, dto.recovery_code, dto.expires_at, dto.is_confirmed]);
        return result.rows[0]
    }

    async findUserIdByCode(recoveryCode: string):Promise<string | null>{
        const result = await this.pool.query(`
        SELECT user_id FROM password_recoveries WHERE recovery_code = $1 AND is_confirmed = FALSE
        `, [recoveryCode]);
        return result.rows[0] ?? null
    }

    async updateRecoveryCode(userId: string, recoveryCode: string): Promise<boolean>{
        const result = await this.pool.query(`
        UPDATE password_recoveries
        SET recovery_code = $1, created_at = NOW(), is_confirmed = FALSE
        WHERE user_id = $2
        `, [recoveryCode, userId]);
        return result.rowCount === 1
    }
    async confirmPassword(userId: string, client?: PoolClient): Promise<boolean> {
        const result = await this.pool.query(`
        UPDATE password_recoveries
        SET  created_at = NOW(), is_confirmed = TRUE
        WHERE user_id = $1
        `, [userId]);
        return result.rowCount === 1

    }
}



