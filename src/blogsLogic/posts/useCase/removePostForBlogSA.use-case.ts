import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PostsSQLRepository} from "../postsSQL.repository";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";
import {PostsSQLQueryRepository} from "../postsSQLQuery.reposiroty";

export class RemovePostForBlogSACommand{
    constructor(
       public blogId: string,
       public postId: string
    ) {}
}

@CommandHandler(RemovePostForBlogSACommand)
export class RemovePostForBlogSAUseCase implements ICommandHandler<RemovePostForBlogSACommand>{
    constructor(
        private readonly postsSQLRepo: PostsSQLRepository,
        private readonly  postsSQLQueryRepository: PostsSQLQueryRepository,
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository
    ) {}
    async execute(command: RemovePostForBlogSACommand){
        const blog = await this.blogsSQLQueryRepo.findBlogById(command.blogId);
        if(!blog){
            throw new NotFoundException({message:'Blog was not found' , field: 'blogId'});
        }
        const post = await this.postsSQLQueryRepository.findPostById(command.postId);
        if (!post) {
            throw new NotFoundException({message:'Post was not found' , field: 'postId'});
        }
        const deleted = await this.postsSQLRepo.removePostSAById(command.postId);
        if (!deleted) {
            throw new BadRequestException({message:'Post was not deleted' , field: 'postId'});
        }
        return
    }
}