import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {User} from "./schema/user.schema";
import {TypeUser} from "../../types/user.types";


@Injectable()
export class UsersSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}

    async createUser(user: TypeUser) {
        const result = await this.pool.query(`
        INSERT INTO users (id, login, email, password, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `, [user.id, user.login, user.email, user.password, user.createdAt]);

        return result.rows[0];
    }

    async removeUserById(id: string): Promise<boolean> {
        const result = await this.pool.query(`
        DELETE FROM users WHERE id = $1`, [id]);
        return result.rowCount === 1;
    }
    async removeAllUsersForTest(): Promise<void> {
        await this.pool.query(`
        TRUNCATE TABLE users;
    `);
    }
}



