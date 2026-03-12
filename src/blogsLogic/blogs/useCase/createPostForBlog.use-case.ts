import {BadRequestException} from "@nestjs/common";
import {CreateBlogDto} from "../dto/create-blog.dto";
import {BlogsRepository} from "../blogs.repository";
import {Blog} from "../schema/blog.schema";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePostForBlogDto} from "../dto/create-post-for-blog.dto";
import {Post} from "../../posts/shema/post.schema";
import {TypeBlogToView} from "../../../types/blog.types";
import {PostsRepository} from "../../posts/posts.repository";


export class CreatePostForBlogCommand{
    constructor(
        public blog: TypeBlogToView,
        public createPostForBlogDto: CreatePostForBlogDto
    ){}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase implements ICommandHandler<CreatePostForBlogCommand>{
    constructor(
        private readonly postsRepo: PostsRepository,
    ) {}
    async execute(command: CreatePostForBlogCommand){
        const post = Post.createNewPostForBlog(command.blog,command.createPostForBlogDto)
        const createdBlog = await this.(post);
        if(!createdBlog){
            throw new BadRequestException({message: 'Blog has not been created', field: 'blog'});
        }
        return
    }
}