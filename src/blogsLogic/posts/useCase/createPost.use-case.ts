import {BadRequestException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePostDto} from "../dto/create-post.dto";
import {PostsRepository} from "../posts.repository";
import {Post} from "../shema/post.schema";
import {BlogsQueryRepository} from "../../blogs/blogsQuery.repository";


export class CreateNewPostCommand{
    constructor(
        public createPostDto: CreatePostDto
    ){}
}

@CommandHandler(CreateNewPostCommand)
export class CreateNewPostUseCase implements ICommandHandler<CreateNewPostCommand>{
    constructor(
        private readonly postsRepo: PostsRepository,
        private readonly blogsQueryRepo: BlogsQueryRepository,
    ) {}
    async execute(command: CreateNewPostCommand){
        const blog = await this.blogsQueryRepo.findBlogByIdOrFail(command.createPostDto.blogId);
        const post = Post.createNewPostForBlog(command.createPostDto, blog)
        const createdPostId:string = await this.postsRepo.createPost(post);
        if(!createdPostId){
            throw new BadRequestException({message: 'Post has not been created', field: 'post'});
        }
        return createdPostId
    }
}