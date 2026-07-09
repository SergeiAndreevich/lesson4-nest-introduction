import {Inject, Injectable, NotFoundException, Post} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeUserToView} from "../../types/user.types";
import {TypeBlog, TypeBlogToView} from "../../types/blog.types";
import {mapBlogToView, mapBlogToViewSA} from "../../mappers/blog.mapper";
import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";



@Injectable()
export class BlogsSQLQueryRepository{
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}
    async findBlogById(id: string) {
        const result = await this.pool.query(`
        SELECT * FROM blogs WHERE id = $1
        `,[id]);
        return result.rows[0] ?? null
    }

    async findBlogsByQuery(
        pagination: IPaginationAndSorting
    ): Promise<TypePaginatorObject<TypeBlogToView[]>> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm,
            searchLoginTerm,
            searchEmailTerm,
        } = pagination;

        // =========================
        // 1. WHERE часть
        // =========================
        const whereParts: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (searchNameTerm) {
            whereParts.push(`name ILIKE $${i}`);
            values.push(`%${searchNameTerm}%`);
            i++;
        }

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
        const blogsResult = await this.pool.query<TypeBlog>(
            `
        SELECT * FROM blogs
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
        FROM blogs
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
            items: blogsResult.rows.map(i=>mapBlogToViewSA(i)),
        };
    }
}