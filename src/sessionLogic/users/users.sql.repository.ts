import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";


@Injectable()
export class UsersSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}

    async testConnection() {

        const result = await this.pool.query(`
        SELECT NOW();
    `);

        console.log(result.rows);

    }
}