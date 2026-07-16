import {BadRequestException, NotFoundException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePostForBlogDto} from "../../blogs/dto/create-post-for-blog.dto";
import {Post} from "../shema/post.schema";
import {PostsRepository} from "../no-sql/posts.repository";
import {BlogsQueryRepository} from "../../blogs/no-sql/blogsQuery.repository";
import {PostsQueryRepository} from "../no-sql/postsQuery.reposiroty";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";
import {createPost} from "../../../types/post.types";
import {PostsSQLRepository} from "../postsSQL.repository";
import {mapPostSA, mapPostToFront} from "../../../mappers/post.mapper";
import {PostsSQLQueryRepository} from "../postsSQLQuery.reposiroty";


export class CreatePostForBlogSACommand{
    constructor(
        public blogId: string,
        public createPostForBlogDto: CreatePostForBlogDto
    ){}
}

@CommandHandler(CreatePostForBlogSACommand)
export class CreatePostForBlogSAUseCase implements ICommandHandler<CreatePostForBlogSACommand>{
    constructor(
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
        private readonly postsSQLRepo: PostsSQLRepository,
        private readonly postsSQLQueryRepo: PostsSQLQueryRepository
    ) {}
    async execute(command: CreatePostForBlogSACommand){
        const blog = await this.blogsSQLQueryRepo.findBlogById(command.blogId);
        if(!blog){
            throw new NotFoundException({message: 'Blog not found', field: 'blogId'});
        }
        //не забывай про связку с лайками
        const post = createPost(command.createPostForBlogDto, blog.id, blog.name)
        const createdPost = await this.postsSQLRepo.createPostSA(post);
        return await this.postsSQLQueryRepo.findPostById(createdPost.id)
    }
}