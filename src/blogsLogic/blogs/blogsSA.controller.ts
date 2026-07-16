import {Controller, Get, Post, Body, Param, Delete, Put, Query, HttpCode, UseGuards} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {CreatePostForBlogDto} from "./dto/create-post-for-blog.dto";
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {TypeBlogToView} from "../../types/blog.types";
import {TypePostView} from "../../types/post.types";
import {TypePaginatorObject} from "../../types/pagination.types";
import {BasicGuard} from "../../../setup/guard/basic.guard";
import {OptionalBearerGuard} from "../../../setup/guard/optionalBearer.guard";
import {UserId} from "../../customDecorators/userId.decorator";
import {CreateBlogSACommand} from "./useCase/createNewBlogSA.use-case";
import {CreatePostForBlogSACommand} from "../posts/useCase/createPostForBlogSA.use-case";
import {FindAllBlogsSAQuery} from "./useCase/findAllBlogsSA.use-case";
import {FindBlogSAQuery} from "./useCase/findBlogSA.use-case";
import {UpdateBlogSACommand} from "./useCase/updateBlogSA.use-case";
import {RemoveBlogSACommand} from "./useCase/removeBlogSA.use-case";
import { FindPostsForBlogSAQuery} from "../posts/useCase/findPostsForBlogSA.use-case";

@Controller('sa/blogs')
export class BlogsSAController {
  constructor(private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus
  ) {}

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createBlog(@Body() createBlogDto: CreateBlogDto): Promise<TypeBlogToView> {
    return await this.commandBus.execute(new CreateBlogSACommand(createBlogDto))
  }

  @Post(':blogId/posts')
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createPostForBlog(@Param('blogId') blogId:string, @Body() dto:CreatePostForBlogDto): Promise<TypePostView>{
    return await this.commandBus.execute(new CreatePostForBlogSACommand(blogId,dto));
  }

  @Get()
  @UseGuards(BasicGuard)
  async findAll(@Query() query: PaginationQueryDto):Promise<TypePaginatorObject<TypeBlogToView[]>> {
    return await this.queryBus.execute(new FindAllBlogsSAQuery(query))
  }

  @Get(':id')
  async findBlog(@Param('id') id: string):Promise<TypeBlogToView> {
    return await this.queryBus.execute(new FindBlogSAQuery(id))
  }

  //Вот здесь нужен optionalBearer, тк получаем посты и возможно на каком-то есть наша реакция
  @Get(':blogId/posts')
  //@UseGuards(OptionalBearerGuard)
  @UseGuards(BasicGuard)
  findPostsForBlog(@Param('blogId') blogId: string, @Query() query: PaginationQueryDto, @UserId() userId?:string):Promise<TypePaginatorObject<TypePostView[]>>{
    return this.queryBus.execute(new FindPostsForBlogSAQuery(blogId,query, userId));
  }

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updateBlogById(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return await this.commandBus.execute(new UpdateBlogSACommand(id, updateBlogDto))
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async removeBlog(@Param('id') id: string) {
    return await this.commandBus.execute(new RemoveBlogSACommand(id))
  }

}
