import {BadRequestException, NotFoundException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePostDto} from "../dto/create-post.dto";
import {PostsRepository} from "../no-sql/posts.repository";
import {Post} from "../shema/post.schema";
import {BlogsQueryRepository} from "../../blogs/no-sql/blogsQuery.repository";
import {PostsSQLRepository} from "../postsSQL.repository";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";
import {createPost, TypePost} from "../../../types/post.types";
import {CreatePostForBlogDto} from "../../blogs/dto/create-post-for-blog.dto";
import {mapPostSA} from "../../../mappers/post.mapper";


export class CreatePostSACommand{
    constructor(
        public createPostDto: CreatePostDto
    ){}
}

@CommandHandler(CreatePostSACommand)
export class CreatePostSAUseCase implements ICommandHandler<CreatePostSACommand>{
    constructor(
        private readonly postsSQLRepo: PostsSQLRepository,
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
    ) {}
    async execute(command: CreatePostSACommand){
        const blog = await this.blogsSQLQueryRepo.findBlogById(command.createPostDto.blogId);
        if(!blog){
            throw new NotFoundException({message: 'Blog was not found', field: 'blogId'});
        }
        const createPostForBlogDto:CreatePostForBlogDto = {
            title: command.createPostDto.title,
            shortDescription: command.createPostDto.shortDescription,
            content: command.createPostDto.content
        }
        const post:TypePost = createPost(createPostForBlogDto, blog.id, blog.name);
        const createdPost = await this.postsSQLRepo.createPostSA(post);
        if(!createdPost){
            throw new BadRequestException({message: 'Post has not been created', field: 'post'});
        }
        return mapPostSA(createdPost)
    }
}