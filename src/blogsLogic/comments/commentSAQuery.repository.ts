import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {mapCommentToFront} from "../../mappers/comment.mapper";
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

@Injectable()
export class CommentsSQLQueryRepository{
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        private  readonly reactionsQueryRepo: ReactionsQueryRepository
    ) {}
    async findCommentByIdOrFail(id: string, userId?: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException({ message: 'CommentId must be ObjectId', field: 'commentId' });
        }
        const comment = await this.commentModel.findById(id).lean();
        if(!comment){
            throw new NotFoundException({message: 'Comment not found', field: 'commentId'});
        }
        const myStatus = userId ? await this.reactionsQueryRepo.getMyStatus(EntitiesForReaction.comment, id, userId) : ReactionType.none;
        return mapCommentToFront(comment, myStatus);
    }
    async findCommentsForPost(postId:string, query: IPaginationAndSorting, userId?:string) {
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = query;
        const filter: any = {postId: postId};
        const skip = (pageNumber - 1) * pageSize;
        const comments = await this.commentModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();
        const totalCount = await this.commentModel.countDocuments(filter);

        const items: TypeCommentFrontView[] = [];
        for (const comment of comments) {
            const myStatus:ReactionType = userId ? await this.reactionsQueryRepo.getMyStatus(EntitiesForReaction.comment, comment._id.toString(),userId) :  ReactionType.none;
            items.push(mapCommentToFront(comment,myStatus));
        }
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items
        }
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
        FROM comments
        ${whereSQL}
        `,
            values,
        );

        const totalCount = Number(countResult.rows[0].count);

        // =========================
        // 6. RETURN PAGINATOR
        // =========================
        const items = commentsResult.rows.map(row => {
            return {
                id: row.id,
                content: row.content,
                createdAt: row.created_at.toISOString(),
                commentatorInfo: {
                    userId: row.user_id,
                    userLogin: row.login,
                },
                likesInfo: {
                    likesCount: row.likes_count,
                    dislikesCount: row.dislikes_count,
                    myStatus: ReactionType.none,
                    newestLikes: [],
                }
            }
        });

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items,
        };
    }

}
