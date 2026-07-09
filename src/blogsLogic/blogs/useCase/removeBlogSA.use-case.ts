import {BadRequestException, Body} from "@nestjs/common";
import {CreateBlogDto} from "../dto/create-blog.dto";
import {BlogsRepository} from "../no-sql/blogs.repository";
import {Blog} from "../schema/blog.schema";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {createBlog, TypeBlog} from "../../../types/blog.types";
import {mapBlogToViewSA} from "../../../mappers/blog.mapper";
import {BlogsSQLRepository} from "../blogsSA.repository";
import {UpdateBlogDto} from "../dto/update-blog.dto";


export class RemoveBlogSACommand{
    constructor(
        public id: string,
    ){}
}

@CommandHandler(RemoveBlogSACommand)
export class RemoveBlogSAUseCase implements ICommandHandler<RemoveBlogSACommand>{
    constructor(
        private readonly blogsSQLRepo: BlogsSQLRepository,
    ) {}
    async execute(command: RemoveBlogSACommand){
        const deleted = await this.blogsSQLRepo.removeBlogById(command.id);
        if (!deleted) {
            throw new BadRequestException({message:'Blog was not found or deleted' , field: 'blogId'});
        }
        return
    }
}


