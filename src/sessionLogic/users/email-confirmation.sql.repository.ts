import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeEmailConfirmation} from "../../types/user.types";


@Injectable()
export class EmailConfirmationSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}

    async createFirstEmailConfirmation(dto:TypeEmailConfirmation):Promise<TypeEmailConfirmation | null>{
        const result = await this.pool.query(`
        INSERT INTO email_confirmations (userId, confirmation_code, expires_at, is_confirmed)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [dto.userId, dto.confirmation_code, dto.expires_at, dto.is_confirmed]);
        return result.rows[0] ?? null;
    }
    async confirmEmail(userId: string){
        const result = await this.pool.query(`
        UPDATE email_confirmations
        SET is_confirmed = true
        WHERE user_id = $1
        `, [userId]);

        return result.rowCount === 1;
    }

    async findUserByEmailCode(code: string){
        const result = await this.pool.query(`
        SELECT * FROM email_confirmations WHERE confirmation_code = $1
        `,[code]);
        return result.rows[0] ??  null
    }
}



