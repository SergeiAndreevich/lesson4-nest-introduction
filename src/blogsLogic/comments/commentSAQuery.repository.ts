import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {mapCommentSAToFront, mapCommentToFront} from "../../mappers/comment.mapper";
import {Comment, CommentDocument} from "./schema/comment.schema";
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {paginationHelper} from "../../helpers/paginationQuery.helper";
import {EntitiesForReaction, ReactionType} from "../../types/reaction.types";
import {ReactionsQueryRepository} from "../../reactionsLogic/reactionsQuery.repository";
import {TypeComment, TypeCommentFrontView} from "../../types/comment.types";
import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";
import {TypePost, TypePostView} from "../../types/post.types";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {ReactionsSQLQueryRepository} from "../../reactionsLogic/reactionsSQLQuery.repository";
import {mapPostSAToFront} from "../../mappers/post.mapper";

@Injectable()
export class CommentsSQLQueryRepository{
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        private readonly reactionsSQLQueryRepo: ReactionsSQLQueryRepository
    ) {}
    async findCommentById(id: string):Promise<TypeComment&{login:string} | null> {
        const result = await this.pool.query<TypeComment & { login: string }>(`
        SELECT c.*, u.login FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
        `, [id]);
        return result.rows[0] ?? null


    }
    async findCommentsForPostSA(postId:string, query: IPaginationAndSorting, userId?:string):Promise<TypePaginatorObject<TypeCommentFrontView[]>> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm,
            searchLoginTerm,
            searchEmailTerm,
        } = query;

        // =========================
        // 1. WHERE часть
        // =========================
        const whereParts: string[] = [];
        const values: any[] = [];
        values.unshift(postId);
        let i = 2;

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
                ? `WHERE c.post_id = $1 AND ${whereParts.join(' OR ')}`
                : `WHERE c.post_id = $1`;

        // =========================
        // 2. SORT
        // =========================
        const sortMap: Record<string, string> = {
            name: 'c.name COLLATE "C"',
            login: 'c.login COLLATE "C"',
            email: 'c.email COLLATE "C"',
            createdAt: 'c.created_at',
            blogName: 'blog_name COLLATE "C"'

        };

        const sortField = sortMap[sortBy] ?? 'c.created_at';
        const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';

        // =========================
        // 3. PAGINATION
        // =========================
        const offset = (pageNumber - 1) * pageSize;

        // =========================
        // 4. QUERY USERS
        // =========================
        //надо через join добавить получение userLogin из таблицы юзеров. Ну и расширить тип TypeComment & userLogin
        const commentsResult = await this.pool.query<TypeComment & { login: string }>(`
        SELECT c.*, u.login FROM comments c
        JOIN users u ON c.user_id = u.id
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
        FROM comments c
        ${whereSQL}
        `,
            values,
        );

        const totalCount = Number(countResult.rows[0].count);

        // =========================
        // 6. RETURN PAGINATOR
        // =========================
        const items = await Promise.all(
            commentsResult.rows.map(async (comment) => {
                const [myStatus, newestLikes] = await Promise.all([
                    userId
                        ? this.reactionsSQLQueryRepo.getMyStatus(
                            EntitiesForReaction.comment,
                            comment.id,
                            userId,
                        )
                        : Promise.resolve(ReactionType.none),

                    this.reactionsSQLQueryRepo.getNewestLikes(
                        comment.id,
                        EntitiesForReaction.comment,
                    ),
                ]);

                return mapCommentSAToFront(
                    comment,
                    myStatus,
                );
            }),
        );
        // const items = commentsResult.rows.map(row => {
        //     return {
        //         id: row.id,
        //         content: row.content,
        //         createdAt: row.created_at.toISOString(),
        //         commentatorInfo: {
        //             userId: row.user_id,
        //             userLogin: row.login,
        //         },
        //         likesInfo: {
        //             likesCount: row.likes_count,
        //             dislikesCount: row.dislikes_count,
        //             myStatus: ReactionType.none,
        //             newestLikes: [],
        //         }
        //     }
        // });

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items,
        };
    }

}
