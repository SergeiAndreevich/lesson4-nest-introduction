import {BadRequestException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePostForBlogDto} from "../../blogs/dto/create-post-for-blog.dto";
import {Post} from "../shema/post.schema";
import {PostsRepository} from "../posts.repository";
import {BlogsQueryRepository} from "../../blogs/blogsQuery.repository";


export class CreatePostForBlogCommand{
    constructor(
        public blogId: string,
        public createPostForBlogDto: CreatePostForBlogDto
    ){}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase implements ICommandHandler<CreatePostForBlogCommand>{
    constructor(
        private readonly postsRepo: PostsRepository,
        private readonly blogsQueryRepo: BlogsQueryRepository
    ) {}
    async execute(command: CreatePostForBlogCommand){
        const blog = await this.blogsQueryRepo.findBlogByIdOrFail(command.blogId);
        const post = Post.createNewPostForBlog(command.createPostForBlogDto, blog)
        const createdPostId = await this.postsRepo.createPost(post);
        if(!createdPostId){
            throw new BadRequestException({message: 'Post has not been created', field: 'post'});
        }
        return createdPostId
    }
}