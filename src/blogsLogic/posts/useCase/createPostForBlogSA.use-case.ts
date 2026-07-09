import {BadRequestException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePostForBlogDto} from "../../blogs/dto/create-post-for-blog.dto";
import {Post} from "../shema/post.schema";
import {PostsRepository} from "../posts.repository";
import {BlogsQueryRepository} from "../../blogs/no-sql/blogsQuery.repository";
import {PostsQueryRepository} from "../postsQuery.reposiroty";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";


export class CreatePostForBlogSACommand{
    constructor(
        public blogId: string,
        public createPostForBlogDto: CreatePostForBlogDto
    ){}
}

@CommandHandler(CreatePostForBlogSACommand)
export class CreatePostForBlogSAUseCase implements ICommandHandler<CreatePostForBlogSACommand>{
    constructor(
        private readonly postsRepo: PostsRepository,
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
        private readonly postsQueryRepo: PostsQueryRepository,
    ) {}
    async execute(command: CreatePostForBlogSACommand){
        const blog = await this.blogsSQLQueryRepo.findBlogById(command.blogId);
        //далее логику надо думать исходя из таблицы posts и я думаю надо её связать с блогами
        const post = Post.createNewPostForBlog(command.createPostForBlogDto, blog)
        const createdPostId = await this.postsRepo.createPost(post);
        if(!createdPostId){
            throw new BadRequestException({message: 'Post has not been created', field: 'post'});
        }
        return this.postsQueryRepo.findPostByIdOrFail(createdPostId)
    }
}