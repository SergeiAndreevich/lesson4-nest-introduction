import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PostsSQLRepository} from "../postsSQL.repository";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {UpdatePostDto, UpdatePostForBlogDto} from "../dto/update-post.dto";
import {BlogsSQLRepository} from "../../blogs/blogsSA.repository";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";
import {PostsSQLQueryRepository} from "../postsSQLQuery.reposiroty";

export class UpdatePostForBlogSACommand{
    constructor(
       public blogId: string,
       public postId: string,
       public dto: UpdatePostForBlogDto
    ) {}
}

@CommandHandler(UpdatePostForBlogSACommand)
export class UpdatePostForBlogSAUseCase implements ICommandHandler<UpdatePostForBlogSACommand>{
    constructor(
        private readonly postsSQLRepo: PostsSQLRepository,
        private readonly postsSQLQueryRepository: PostsSQLQueryRepository,
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
    ) {}
    async execute(command: UpdatePostForBlogSACommand){
       const blog = await this.blogsSQLQueryRepo.findBlogById(command.blogId);
       if(!blog){
           throw new NotFoundException({message:'Blog was not found' , field: 'blogId'});
       }
        const post = await this.postsSQLQueryRepository.findPostById(command.postId);
        if (!post) {
            throw new NotFoundException({message:'Post was not found' , field: 'postId'});
        }
        const updated = await this.postsSQLRepo.updatePostForBlogSAById(command.postId, command.blogId, command.dto, blog.name);
        if (!updated) {
            throw new BadRequestException({message:'Post was not found or updated' , field: 'postId'});
        }
        return
    }
}