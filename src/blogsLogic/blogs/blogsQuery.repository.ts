import {IPaginationAndSorting, TypePaginatorObject} from "../../types/pagination.types";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {mapBlogToView} from "../../mappers/blog.mapper";
import {TypeBlogToView} from "../../types/blog.types";
import {Injectable, NotFoundException, Post} from "@nestjs/common";
import {Blog, BlogDocument} from "./schema/blog.schema";



@Injectable()
export class BlogsQueryRepository{
    constructor(
        @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>
    ) {}
    async findBlogByIdOrFail(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException({ message: 'BlogId must be ObjectId', field: 'blogId' });
        }
        const blog = await this.blogModel.findById(id).lean();
         if(!blog){
             throw new NotFoundException({message: 'Blog not found', field: 'blogId'});
         }
         return mapBlogToView(blog);
    }

    async findAllBlogsByQuery(pagination:IPaginationAndSorting) : Promise<TypePaginatorObject<TypeBlogToView[]>>{
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
        const filter: any = {};
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: "i" };
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