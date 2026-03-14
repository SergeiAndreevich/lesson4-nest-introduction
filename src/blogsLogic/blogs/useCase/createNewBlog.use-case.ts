import {BadRequestException} from "@nestjs/common";
import {CreateBlogDto} from "../dto/create-blog.dto";
import {BlogsRepository} from "../blogs.repository";
import {Blog} from "../schema/blog.schema";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";


export class CreateNewBlogCommand{
    constructor(
        public createBlogDto: CreateBlogDto
    ){}
}

@CommandHandler(CreateNewBlogCommand)
export class CreateNewBlogUseCase implements ICommandHandler<CreateNewBlogCommand>{
    constructor(
        private readonly blogsRepo: BlogsRepository,
    ) {}
    async execute(command: CreateNewBlogCommand){
        const blog = Blog.createNewBlog(command.createBlogDto)
        const createdBlogId:string = await this.blogsRepo.createBlog(blog);
        if(!createdBlogId){
            throw new BadRequestException({message: 'Blog has not been created', field: 'blog'});
        }
        return createdBlogId
    }
}