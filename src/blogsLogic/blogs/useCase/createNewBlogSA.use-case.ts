import {BadRequestException} from "@nestjs/common";
import {CreateBlogDto} from "../dto/create-blog.dto";
import {BlogsRepository} from "../no-sql/blogs.repository";
import {Blog} from "../schema/blog.schema";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {createBlog, TypeBlog} from "../../../types/blog.types";
import {mapBlogToViewSA} from "../../../mappers/blog.mapper";
import {BlogsSQLRepository} from "../blogsSA.repository";


export class CreateBlogSACommand{
    constructor(
        public createBlogDto: CreateBlogDto
    ){}
}

@CommandHandler(CreateBlogSACommand)
export class CreateBlogSAUseCase implements ICommandHandler<CreateBlogSACommand>{
    constructor(
        private readonly blogsSQLRepo: BlogsSQLRepository,
    ) {}
    async execute(command: CreateBlogSACommand){
        const blog:TypeBlog = createBlog(command.createBlogDto)
        const createdBlog = await this.blogsSQLRepo.createBlog(blog);
        return mapBlogToViewSA(createdBlog)
    }
}