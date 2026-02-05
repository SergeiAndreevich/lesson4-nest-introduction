import {IPaginationAndSorting, TypePaginatorObject} from "../types/pagination.types";
import {Blog} from "./entities/blog.entity";
import {Model} from "mongoose";
import {BlogDocument} from "./schemas/blog.schema";
import {InjectModel} from "@nestjs/mongoose";
import {mapBlogToView} from "../mappers/blog.mapper";
import {TypeBlogToView} from "../types/blog.types";
import {PostDocument} from "../posts/schemas/post.schema";
import {Post} from "@nestjs/common";
import {mapPostToView} from "../mappers/post.mapper";
import {TypePostView} from "../types/post.types";

export class BlogsQueryRepository{
    constructor(
        @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>
    ) {}
    async findBlogById(id: string) {
        return this.blogModel.findById(id).lean();
    }
    async findAllBlogsByQuery(pagination: IPaginationAndSorting) : Promise<TypePaginatorObject<TypeBlogToView[]>>{
        const filter: any = {};

        if (pagination.searchNameTerm) {
            filter.name = { $regex: pagination.searchNameTerm, $options: "i" };
        }
        if (pagination.searchLoginTerm) {
            filter.login = { $regex: pagination.searchLoginTerm, $options: "i" };
        }
        if (pagination.searchEmailTerm) {
            filter.email = { $regex: pagination.searchEmailTerm, $options: "i" };
        }

        const totalCount = await this.blogModel.countDocuments(filter);

        const blogs = await this.blogModel
            .find(filter)
            .sort({ [pagination.sortBy]: pagination.sortDirection })
            .skip((pagination.pageNumber - 1) * pagination.pageSize)
            .limit(pagination.pageSize)
            .lean();

        return {
            pagesCount: Math.ceil(totalCount / pagination.pageSize),
            page: pagination.pageNumber,
            pageSize: pagination.pageSize,
            totalCount,
            items: blogs.map(blog => mapBlogToView(blog))
        };
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

        const posts = await this.postModel.find(filter)
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
        };
    }
}