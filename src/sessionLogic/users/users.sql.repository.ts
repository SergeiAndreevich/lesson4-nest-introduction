import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool, PoolClient} from "pg";
import {TypeUser} from "../../types/user.types";


@Injectable()
export class UsersSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}

    //При записи данных в постгре может быть только два результата: успешно записалось и ошибка. Ошибки могут быть разные, но суть в том
    //что БД не вернет тебе null, только error
    //null может вернуться при SELECT, UPDATE, DELETE когда в WHERE такое условие, которое не выполняется (ну не найдено соответствие в БД с таким и всё)

    async createUser(user: TypeUser, client?: PoolClient):Promise<TypeUser> {
        const db = client ?? this.pool;
        const result = await db.query(`
        INSERT INTO users (id, login, email, password, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `, [user.id, user.login, user.email, user.password, user.createdAt]);

        return result.rows[0];
    }

    async setNewPassword(userId: string, newPassword: string, client?: PoolClient): Promise<boolean> {
        const result = await this.pool.query(`
        UPDATE users SET  password = $1
        WHERE user_id = $2
        `, [userId, newPassword]);
        return result.rowCount === 1
    }

    async removeUserById(id: string): Promise<boolean> {
        const result = await this.pool.query(`
        DELETE FROM users WHERE id = $1`, [id]);
        return result.rowCount === 1;
    }
    async removeAllUsersForTest(): Promise<void> {
        await this.pool.query(`
        TRUNCATE TABLE users CASCADE;
    `);
    }
}



