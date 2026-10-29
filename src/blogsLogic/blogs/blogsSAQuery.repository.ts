import {Inject, Injectable, NotFoundException, Post} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeUserToView} from "../../types/user.types";
import {TypeBlog, TypeBlogSQL, TypeBlogToView} from "../../types/blog.types";
import {mapBlogToView, mapBlogToViewSA} from "../../mappers/blog.mapper";
import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";
import {InjectRepository} from "@nestjs/typeorm";
import {Blog} from "./Entity/blog.entity";
import {Repository} from "typeorm";



@Injectable()
export class BlogsSQLQueryRepository{
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        @InjectRepository(Blog) private readonly blogRepo: Repository<Blog>,
    ) {}
    async findBlogById(id: string):Promise<TypeBlog | null> {
        const result = await this.pool.query(`
        SELECT * FROM blogs WHERE id = $1
        `,[id]);
        return result.rows[0] ?? null
    }
    async findBlogByIdORM(id: string):Promise<TypeBlogSQL | null> {
        return this.blogRepo.findOne({where: {id: id}})
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
            name: 'name COLLATE "C"',
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
    async findBlogsByQueryORM(pagination:IPaginationAndSorting):Promise<TypePaginatorObject<TypeBlogToView[]>>{
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm,
            searchLoginTerm,
            searchEmailTerm,
        } = pagination;
        // 1. Создаём QueryBuilder для Entity Blog
        const queryBuilder = this.blogRepo.createQueryBuilder('blog');
        // 2. Поиск по названию
        if (searchNameTerm) {
            queryBuilder.where('blog.name ILIKE :searchNameTerm', {
                searchNameTerm: `%${searchNameTerm}%`,
            });
        }
        // 3. Белый список полей для сортировки
        const sortMap: Record<string, string> = {
            id: 'blog.id',
            name: 'blog.name',
            description: 'blog.description',
            websiteUrl: 'blog.website_url',
            createdAt: 'blog.created_at',
            isMembership: 'blog.is_membership',
        };
        const sortField = sortMap[sortBy] ?? 'blog.created_at';
        const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';
        queryBuilder.orderBy(sortField, direction);

        // 4. Пагинация и получение общего количества
        queryBuilder
            .skip((pageNumber - 1) * pageSize)
            .take(pageSize);
        const [blogs, totalCount] = await queryBuilder.getManyAndCount();
        // 5. Формируем ответ
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: blogs.map(blog => mapBlogToViewSA(blog)),
        }
    }
}