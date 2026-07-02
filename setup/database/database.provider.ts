import {Pool} from "pg";
import {PG_CONNECTION} from "./database.constants";

export const DatabaseProvider = {
    provide: PG_CONNECTION,

    useFactory: async () => {

        const pool = new Pool({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'serega0032',
            database: 'postgres',
        });

        await pool.connect();

        return pool;
    },
};