import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeUser, TypeUserToView} from "../../types/user.types";
import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";


@Injectable()
export class UsersQuerySqlRepository{
    constructor(
        @Inject(PG_CONNECTION) private readonly pool:Pool
    ) {}

    async findUserById(id:string):Promise<TypeUser | null> {
        const result = await this.pool.query<TypeUser>(
            `SELECT * FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0] ??  null
    }
    async findUserByLogin(login:string): Promise<TypeUser | null> {
        const result = await this.pool.query<TypeUser>(
            `SELECT * FROM users WHERE login = $1`,
            [login],
        );
        return result.rows[0] ??  null
    }
    async findUserByLoginOrEmail(loginOrEmail: string ) {
        const result = await this.pool.query<TypeUser>(
            `SELECT * FROM users WHERE login = $1 OR email = $2`,
            [loginOrEmail, loginOrEmail],
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
    async findAllUsersByQuery(
        pagination: IPaginationAndSorting
    ): Promise<TypePaginatorObject<TypeUserToView[]>> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm,
        } = pagination;

        // =========================
        // 1. WHERE часть
        // =========================
        const whereParts: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (searchLoginTerm) {
            whereParts.push(`login ILIKE $${i}`);
            values.push(`%${searchLoginTerm}%`);
            i++;
        }

        if (searchEmailTerm) {
            whereParts.push(`email ILIKE $${i}`);
            values.push(`%${searchEmailTerm}%`);
            i++;
        }

        const whereSQL =
            whereParts.length > 0
                ? `WHERE ${whereParts.join(' OR ')}`
                : '';

        // =========================
        // 2. SORT
        // =========================
        const sortMap: Record<string, string> = {
            login: 'login COLLATE "C"',
            email: 'email COLLATE "C"',
            createdAt: 'created_at',
        };

        const sortField = sortMap[sortBy] ?? 'created_at';
        const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';

        // =========================
        // 3. PAGINATION
        // =========================
        const offset = (pageNumber - 1) * pageSize;

        // =========================
        // 4. QUERY USERS
        // =========================
        const usersResult = await this.pool.query<TypeUserToView>(
            `
        SELECT
            id,
            login,
            email,
            created_at AS "createdAt"
        FROM users
        ${whereSQL}
        ORDER BY ${sortField} ${direction}
        LIMIT $${i}
        OFFSET $${i + 1}
        `,
            [...values, pageSize, offset],
        );

        // =========================
        // 5. COUNT (для pagesCount)
        // =========================
        const countResult = await this.pool.query<{ count: string }>(
            `
        SELECT COUNT(*)
        FROM users
        ${whereSQL}
        `,
            values,
        );

        const totalCount = Number(countResult.rows[0].count);

        // =========================
        // 6. RETURN PAGINATOR
        // =========================
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: usersResult.rows,
        };
    }
}