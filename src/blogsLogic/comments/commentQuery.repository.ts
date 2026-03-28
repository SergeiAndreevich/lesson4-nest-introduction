import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {mapCommentToFront} from "../../mappers/comment.mapper";
import {Comment, CommentDocument} from "./schema/comment.schema";
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {paginationHelper} from "../../helpers/paginationQuery.helper";
import {EntitiesForReaction, ReactionType} from "../../types/reaction.types";
import {ReactionsQueryRepository} from "../../reactionsLogic/reactionsQuery.repository";
import {TypeCommentFrontView} from "../../types/comment.types";

@Injectable()
export class CommentsQueryRepository{
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
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
    async findCommentsForPost(postId:string, query: PaginationQueryDto, userId?:string) {
        const pagination = paginationHelper(query);
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
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
}