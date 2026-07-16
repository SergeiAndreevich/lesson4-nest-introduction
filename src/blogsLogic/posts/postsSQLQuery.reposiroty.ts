import {InjectModel} from "@nestjs/mongoose";
import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {Model} from "mongoose";
import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";
import {TypePost, TypePostView} from "../../types/post.types";
import {mapPostSAToFront, mapPostToFront} from "../../mappers/post.mapper";
import {Post, PostDocument} from "./shema/post.schema";
import {ReactionsQueryRepository} from "../../reactionsLogic/reactionsQuery.repository";
import {EntitiesForReaction, ReactionType, TypeLikeDetails} from "../../types/reaction.types";
import {Types} from 'mongoose';
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeBlog, TypeBlogToView} from "../../types/blog.types";
import {mapBlogToViewSA} from "../../mappers/blog.mapper";

@Injectable()
export class PostsSQLQueryRepository{
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        private readonly reactionsQueryRepo: ReactionsQueryRepository
    ) {}

    async findPostById(id: string, userId?: string):Promise<TypePostView> {
        const result = await this.pool.query(`
        SELECT * FROM posts
        WHERE id = $1
        `, [id]);
        const post = result.rows[0] ?? null;
        if(!post){
            throw new NotFoundException({message:'Post not found' , field: 'postId'});
        }

        const newestLikes = await this.reactionsQueryRepo.getNewestLikes(id, EntitiesForReaction.post);

        return {
            id: post.id,
            title: post.title,
            shortDescription: post.short_description,
            content: post.content,
            blogId: post.blog_id,
            blogName: post.blog_name,
            createdAt: post.created_at.toISOString(),
            extendedLikesInfo: {
                likesCount: post.likes_count,
                dislikesCount: post.dislikes_count,
                myStatus: userId ? await this.reactionsQueryRepo.getMyStatus(EntitiesForReaction.post, id, userId) : ReactionType.none,
                newestLikes
            }
        };
    }
    async findPostsSAByQuery(pagination:IPaginationAndSorting, userId?: string): Promise<TypePaginatorObject<TypePostView[]>> {
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
        const postsResult = await this.pool.query<TypePost>(
            `
        SELECT * FROM posts
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
        FROM posts
        ${whereSQL}
        `,
            values,
        );

        const totalCount = Number(countResult.rows[0].count);

        // =========================
        // 6. RETURN PAGINATOR
        // =========================
        // 🔥 ВОТ ТУТ МАГИЯ (но понятная) [для небольшого проекта ок, но в дальнейшем лучше оптимизировать]
        //const items: TypePostView[] = [];
        // postsResult.rows.map(post => {
        //     const myStatus:ReactionType = userId ? await this.reactionsQueryRepo.getMyStatus(EntitiesForReaction.post, post.id,userId) :  ReactionType.none;
        //     const newestLikes:TypeLikeDetails[] = await this.reactionsQueryRepo.getNewestLikes(post.id, EntitiesForReaction.post);
        //     items.push(mapPostSAToFront(post,myStatus,newestLikes));
        // })

        const items = await Promise.all(
            postsResult.rows.map(async (post) => {
                const [myStatus, newestLikes] = await Promise.all([
                    userId
                        ? this.reactionsQueryRepo.getMyStatus(
                            EntitiesForReaction.post,
                            post.id,
                            userId,
                        )
                        : Promise.resolve(ReactionType.none),

                    this.reactionsQueryRepo.getNewestLikes(
                        post.id,
                        EntitiesForReaction.post,
                    ),
                ]);

                return mapPostSAToFront(
                    post,
                    myStatus,
                    newestLikes,
                );
            }),
        );

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items,
        };
    }
    async findPostsForBlogSA(blogId: string, pagination: IPaginationAndSorting, userId?:string):Promise<TypePaginatorObject<TypePostView[]>> {
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
                ? `WHERE blog_id = ${blogId} AND ${whereParts.join(' OR ')}`
                : `WHERE blog_id = ${blogId}`;

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
        const postsResult = await this.pool.query<TypePost>(`
        SELECT * FROM posts
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
        FROM posts
        ${whereSQL}
        `,
            values,
        );

        const totalCount = Number(countResult.rows[0].count);

        // =========================
        // 6. RETURN PAGINATOR
        // =========================
        const items = await Promise.all(
            postsResult.rows.map(async (post) => {
                const [myStatus, newestLikes] = await Promise.all([
                    userId
                        ? this.reactionsQueryRepo.getMyStatus(
                            EntitiesForReaction.post,
                            post.id,
                            userId,
                        )
                        : Promise.resolve(ReactionType.none),

                    this.reactionsQueryRepo.getNewestLikes(
                        post.id,
                        EntitiesForReaction.post,
                    ),
                ]);

                return mapPostSAToFront(
                    post,
                    myStatus,
                    newestLikes,
                );
            }),
        );

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items,
        };
    }

}