import {InjectModel} from "@nestjs/mongoose";
import {Injectable, NotFoundException} from "@nestjs/common";
import {Model} from "mongoose";
import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";
import {TypePostView} from "../../types/post.types";
import {mapPostToView} from "../../mappers/post.mapper";
import {Post, PostDocument} from "./shema/post.schema";

@Injectable()
export class PostsQueryRepository{
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    ) {}

    async findPostByIdOrFail(id: string) {
        const post = await this.postModel.findById(id).lean();
        if(!post){
            throw new NotFoundException("Post not found");
        }
        return mapPostToView(post);
        //нужно как-то организовать динамическую выдачу лайков
    }
    async findAllPostsByQuery(pagination:IPaginationAndSorting): Promise<TypePaginatorObject<TypePostView[]>> {
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
        const filter: any = {};
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: "i" };
        }
        if (searchLoginTerm) {
            filter.login = { $regex: searchLoginTerm, $options: "i" };
        }
        if (searchEmailTerm) {
            filter.email = { $regex: searchEmailTerm, $options: "i" };
        }
        const skip = (pageNumber - 1) * pageSize;
        const posts = await this.postModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();
        const totalCount = await this.postModel.countDocuments(filter);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: posts.map(post => mapPostToView(post))
        }
    }
    async findPostsForBlog(blogId: string, pagination: IPaginationAndSorting):Promise<TypePaginatorObject<TypePostView[]>> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm,
            searchLoginTerm,
            searchEmailTerm
        } = pagination;
        const skip = (pageNumber - 1) * pageSize;
        // Общие условия
        const filter: any = {
            blogId: blogId,
        };

        // Массив OR-условий для поиска
        const orFilters :any = [];

        if (searchNameTerm) {
            orFilters.push({ name: { $regex: searchNameTerm, $options: "i" } });
        }
        if (searchLoginTerm) {
            orFilters.push({ login: { $regex: searchLoginTerm, $options: "i" } });
        }
        if (searchEmailTerm) {
            orFilters.push({ email: { $regex: searchEmailTerm, $options: "i" } });
        }

        // Если есть хотя бы один searchTerm → добавляем $or
        if (orFilters.length > 0) {
            filter.$or = orFilters;
        }

        const posts = await this.postModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();
        const totalCount = await this.postModel.countDocuments(filter);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: posts.map(post => mapPostToView(post))
        }
    }

}