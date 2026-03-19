import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {IPaginationAndSorting} from "../../types/pagination.types";
import {mapCommentToView} from "../../mappers/comment.mapper";
import {Comment, CommentDocument} from "./schema/comment.schema";

@Injectable()
export class CommentsQueryRepository{
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>
    ) {}
    async findCommentByIdOrFail(id: string) {
        const comment = await this.commentModel.findById(id).lean();
        if(!comment){
            throw new NotFoundException({message: 'Comment not found', field: 'commentId'});
        }
        return mapCommentToView(comment);
    }
    async findCommentsForPost(postId:string, pagination: IPaginationAndSorting) {
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
        const filter: any = {postId: postId};
        // Массив OR-условий для поиска
        const orFilters :any = [];
        if (searchNameTerm) {
            orFilters.push = {name: { $regex: searchNameTerm, $options: "i" }};
        }
        if (searchLoginTerm) {
            orFilters.push = {login: { $regex: searchLoginTerm, $options: "i" }};
        }
        if (searchEmailTerm) {
            orFilters.push = {email: { $regex: searchEmailTerm, $options: "i" }};
        }
        // Если есть хотя бы один searchTerm → добавляем $or
        if (orFilters.length > 0) {
            filter.$or = orFilters;
        }

        const skip = (pageNumber - 1) * pageSize;
        const comments = await this.commentModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();
        const totalCount = await this.commentModel.countDocuments(filter);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: comments.map(comment => mapCommentToView(comment))
        }
    }
}