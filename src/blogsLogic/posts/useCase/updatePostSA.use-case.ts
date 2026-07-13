import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PostsSQLRepository} from "../postsSQL.repository";
import {BadRequestException} from "@nestjs/common";
import {UpdatePostDto} from "../dto/update-post.dto";
import {BlogsSQLRepository} from "../../blogs/blogsSA.repository";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";

export class UpdatePostSACommand{
    constructor(
       public id: string,
       public dto: UpdatePostDto
    ) {}
}

@CommandHandler(UpdatePostSACommand)
export class UpdatePostSAUseCase implements ICommandHandler<UpdatePostSACommand>{
    constructor(
        private readonly postsSQLRepo: PostsSQLRepository,
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
    ) {}
    async execute(command: UpdatePostSACommand){
       const blog = await this.blogsSQLQueryRepo.findBlogById(command.dto.blogId);
       if(!blog){
           throw new BadRequestException({message:'Blog was not found' , field: 'blogId'});
       }
        const updated = await this.postsSQLRepo.updatePostSAById(command.id, command.dto, blog.name);
        if (!updated) {
            throw new BadRequestException({message:'Post was not found or updated' , field: 'postId'});
        }
        return
    }
}