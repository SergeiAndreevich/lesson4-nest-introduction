import {Controller, Get, Post, Body, Param, Delete, Put, Query, HttpCode, UseGuards} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import {CreatePostForBlogDto} from "../dto/create-post-for-blog.dto";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "./blogsQuery.repository";
import {CreateNewBlogCommand} from "../useCase/createNewBlog.use-case";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {CreatePostForBlogCommand} from "../../posts/useCase/createPostForBlog.use-case";
import {PostsQueryRepository} from "../../posts/no-sql/postsQuery.reposiroty";
import {TypeBlogToView} from "../../../types/blog.types";
import {TypePostView} from "../../../types/post.types";
import {FindPostsForBlogCommand} from "../../posts/useCase/findPostsForBlog.use-case";
import {TypePaginatorObject} from "../../../types/pagination.types";
import {FindAllBlogsCommand} from "../useCase/findAllBlogs.use-case";
import {BasicGuard} from "../../../../setup/guard/basic.guard";
import {OptionalBearerGuard} from "../../../../setup/guard/optionalBearer.guard";
import {UserId} from "../../../customDecorators/userId.decorator";
import {FindBlogSAQuery} from "../useCase/findBlogSA.use-case";
import {FindAllBlogsSAQuery} from "../useCase/findAllBlogsSA.use-case";
import {FindPostsForBlogSAQuery} from "../../posts/useCase/findPostsForBlogSA.use-case";

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService,
              private readonly blogsQueryRepo: BlogsQueryRepository,
              private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createBlog(@Body() createBlogDto: CreateBlogDto): Promise<TypeBlogToView> {
    const createdBlogId:string = await this.commandBus.execute(new CreateNewBlogCommand(createBlogDto));
    return this.blogsQueryRepo.findBlogByIdOrFail(createdBlogId)
  }

  @Post(':blogId/posts')
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createPostForBlog(@Param('blogId') blogId:string, @Body() dto:CreatePostForBlogDto): Promise<TypePostView>{
    return await this.commandBus.execute(new CreatePostForBlogCommand(blogId,dto));
  }

  // HW_18
  @Get()
  async findAll(@Query() query: PaginationQueryDto):Promise<TypePaginatorObject<TypeBlogToView[]>> {
    // return this.commandBus.execute(new FindAllBlogsCommand(query))
    return await this.queryBus.execute(new FindAllBlogsSAQuery(query))
  }

  // HW_18
  @Get(':id')
  async findBlog(@Param('id') id: string):Promise<TypeBlogToView> {
    //return this.blogsQueryRepo.findBlogByIdOrFail(id);
    return await this.queryBus.execute(new FindBlogSAQuery(id))
  }

  // HW_18
  //Вот здесь нужен optionalBearer, тк получаем посты и возможно на каком-то есть наша реакция
  @Get(':blogId/posts')
  @UseGuards(OptionalBearerGuard)
  findPostsForBlog(@Param('blogId') blogId: string, @Query() query: PaginationQueryDto, @UserId() userId?:string):Promise<TypePaginatorObject<TypePostView[]>>{
    // return this.commandBus.execute(new FindPostsForBlogCommand(blogId,query, userId));
    return this.queryBus.execute(new FindPostsForBlogSAQuery(blogId,query, userId));
  }

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  updateBlogById(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.updateBlogById(id, updateBlogDto);
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  removeBlog(@Param('id') id: string) {
    return this.blogsService.removeBlogById(id);
  }

}
