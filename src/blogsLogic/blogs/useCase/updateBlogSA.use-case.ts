import {BadRequestException, Body, NotFoundException} from "@nestjs/common";
import {CreateBlogDto} from "../dto/create-blog.dto";
import {BlogsRepository} from "../no-sql/blogs.repository";
import {Blog} from "../schema/blog.schema";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {createBlog, TypeBlog} from "../../../types/blog.types";
import {mapBlogToViewSA} from "../../../mappers/blog.mapper";
import {BlogsSQLRepository} from "../blogsSA.repository";
import {UpdateBlogDto} from "../dto/update-blog.dto";
import {BlogsSQLQueryRepository} from "../blogsSAQuery.repository";


export class UpdateBlogSACommand{
    constructor(
        public id: string,
        public dto: UpdateBlogDto
    ){}
}

@CommandHandler(UpdateBlogSACommand)
export class UpdateBlogSAUseCase implements ICommandHandler<UpdateBlogSACommand>{
    constructor(
        private readonly blogsSQLRepo: BlogsSQLRepository,
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository
    ) {}
    async execute(command: UpdateBlogSACommand){
        const blog = await this.blogsSQLQueryRepo.findBlogById(command.id);
        if(!blog){
            throw new NotFoundException({message:'Blog was not found' , field: 'blogId'});
        }
        const updated = await this.blogsSQLRepo.updateBlogById(command.id, command.dto);
        if (!updated) {
            throw new BadRequestException({message:'Blog was not updated' , field: 'blogId'});
        }
        return
    }
}


