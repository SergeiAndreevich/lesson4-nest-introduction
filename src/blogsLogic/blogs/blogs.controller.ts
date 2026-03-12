import {Controller, Get, Post, Body, Param, Delete, Put, Query, HttpCode} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {CreatePostForBlogDto} from "./dto/create-post-for-blog.dto";
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "./blogsQuery.repository";
import {CreateNewBlogCommand} from "./useCase/createNewBlog.use-case";
import {CommandBus} from "@nestjs/cqrs";
import {CreatePostForBlogCommand} from "./useCase/createPostForBlog.use-case";
import {PostsQueryRepository} from "../posts/postsQuery.reposiroty";

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService,
              private readonly blogsQueryRepo: BlogsQueryRepository,
              private readonly postsQueryRepo: PostsQueryRepository,
              private readonly commandBus: CommandBus
  ) {}

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    const createdBlogId = await this.commandBus.execute(new CreateNewBlogCommand(createBlogDto));
    return this.blogsQueryRepo.findBlogByIdOrFail(createdBlogId)
  }

  @Post(':blogId/posts')
  async createPostForBlog(@Param('blogId') blogId:string, @Body() dto:CreatePostForBlogDto){
    const blog = await this.blogsQueryRepo.findBlogByIdOrFail(blogId);
    const createdPostId = await this.commandBus.execute(new CreatePostForBlogCommand(blog,dto));
    return this.postsQueryRepo.findPostByIdOrFail(createdPostId)
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.blogsService.findAllBlogsByQuery(query);
  }

  @Get(':id')
  findBlog(@Param('id') id: string) {
    return this.blogsQueryRepo.findBlogByIdOrFail(id);
  }

  @Get(':blogId/posts')
  findPostsForBlog(@Param('blogId') blogId: string, @Query() query: PaginationQueryDto){
    return this.blogsService.findPostsForBlog(blogId, query);
  }

  @Put(':id')
  @HttpCode(204)
  updateBlogById(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.updateBlogById(id, updateBlogDto);
  }

  @Delete(':id')
  @HttpCode(204)
  removeBlog(@Param('id') id: string) {
    return this.blogsService.removeBlogById(id);
  }

}
