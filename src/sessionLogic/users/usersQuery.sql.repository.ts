import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeUser} from "../../types/user.types";


@Injectable()
export class UsersQuerySqlRepository{
    constructor(
        @Inject(PG_CONNECTION) private readonly pool:Pool
    ) {}

    async findUserByLogin(login:string): Promise<TypeUser | null> {
        const result = await this.pool.query<TypeUser>(
            `SELECT * FROM users WHERE login = $1`,
            [login],
        );
        return result.rows[0] ??  null
    }
    async findUserByEmail(email: string) {
        const result = await this.pool.query<TypeUser>(
            `SELECT * FROM users WHERE email = $1`,
            [email],
        );
        return result.rows[0] ??  null
    }
}