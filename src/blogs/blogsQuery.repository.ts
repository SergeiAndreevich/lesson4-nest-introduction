import {IPaginationAndSorting, TypePaginatorObject} from "../types/pagination.types";
import {Blog} from "./entities/blog.entity";
import {Model} from "mongoose";
import {BlogDocument} from "./schemas/blog.schema";
import {InjectModel} from "@nestjs/mongoose";
import {mapBlogToView} from "../mappers/blog.mapper";
import {TypeBlogToView} from "../types/blog.types";
import {Injectable, Post} from "@nestjs/common";


@Injectable()
export class BlogsQueryRepository{
    constructor(
        @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>
    ) {}
    async findBlogById(id: string) {
        return this.blogModel.findById(id).lean();
    }
    async findAllBlogsByQuery(pagination: IPaginationAndSorting) : Promise<TypePaginatorObject<TypeBlogToView[]>>{
        const filter: any = {};
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: "i" };
        }
        if (searchLoginTerm) {
            filter.login = { $regex: searchLoginTerm, $options: "i" };
        }
        if (searchEmailTerm) {
            filter.email = { $regex: searchEmailTerm, $options: "i" };
        }

        const totalCount = await this.blogModel.countDocuments(filter);

        const blogs = await this.blogModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: blogs.map(blog => mapBlogToView(blog))
        };
    }

}