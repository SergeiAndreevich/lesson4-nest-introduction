import {InjectModel} from "@nestjs/mongoose";
import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {Model} from "mongoose";
import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";
import {TypePostView} from "../../types/post.types";
import {mapPostToFront} from "../../mappers/post.mapper";
import {Post, PostDocument} from "./shema/post.schema";
import {ReactionsQueryRepository} from "../../reactionsLogic/reactionsQuery.repository";
import {EntitiesForReaction, ReactionType, TypeLikeDetails} from "../../types/reaction.types";
import {Types} from 'mongoose';
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";

@Injectable()
export class PostsSQLQueryRepository{
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        private readonly reactionsQueryRepo: ReactionsQueryRepository
    ) {}

    async findPostById(id: string, userId?: string):Promise<TypePostView> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException({ message: 'PostId must be ObjectId', field: 'postId' });
        }
        const post = await this.postModel.findById(id).lean();
        if(!post){
            throw new NotFoundException({message:'Post not found' , field: 'postId'});
        }

        const newestLikes = await this.reactionsQueryRepo.getNewestLikes(id, EntitiesForReaction.post);

        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo: {
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount,
                myStatus: userId ? await this.reactionsQueryRepo.getMyStatus(EntitiesForReaction.post, id, userId) : ReactionType.none,
                newestLikes
            }
        };
    }
    async findAllPostsSAByQuery(pagination:IPaginationAndSorting, userId?: string): Promise<TypePaginatorObject<TypePostView[]>> {
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
        const filter: any = {};
        const skip = (pageNumber - 1) * pageSize;
        const posts = await this.postModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();
        const totalCount = await this.postModel.countDocuments(filter);

        // 🔥 ВОТ ТУТ МАГИЯ (но понятная) [для небольшого проекта ок, но в дальнейшем лучше оптимизировать]
        const items: TypePostView[] = [];
        for (const post of posts) {
            const myStatus:ReactionType = userId ? await this.reactionsQueryRepo.getMyStatus(EntitiesForReaction.post, post._id.toString(),userId) :  ReactionType.none;
            const newestLikes:TypeLikeDetails[] = await this.reactionsQueryRepo.getNewestLikes(post._id.toString(), EntitiesForReaction.post);
            items.push(mapPostToFront(post,myStatus,newestLikes));
        }
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items
        }
    }
    async findPostsForBlogSA(blogId: string, pagination: IPaginationAndSorting, userId?:string):Promise<TypePaginatorObject<TypePostView[]>> {
        const {
            pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, searchLoginTerm, searchEmailTerm
        } = pagination;
        const skip = (pageNumber - 1) * pageSize;
        // Общие условия
        const filter: any = {
            blogId: blogId,
        };

        const posts = await this.postModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();

        // 🔥 ВОТ ТУТ МАГИЯ (но понятная) [для небольшого проекта ок, но в дальнейшем лучше оптимизировать]
        const items: TypePostView[] = [];
        for (const post of posts) {
            const myStatus:ReactionType = userId ? await this.reactionsQueryRepo.getMyStatus(EntitiesForReaction.post, post._id.toString(),userId) :  ReactionType.none;
            const newestLikes:TypeLikeDetails[] = await this.reactionsQueryRepo.getNewestLikes(post._id.toString(), EntitiesForReaction.post);
            items.push(mapPostToFront(post,myStatus,newestLikes));
        }

        const totalCount = await this.postModel.countDocuments(filter);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items
        }
    }

}