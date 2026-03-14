import {Controller, Get, Post, Body, Param, Delete, Query, Put, Inject, HttpCode} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {CommandBus} from "@nestjs/cqrs";
import {CreateNewPostCommand} from "./useCase/createPost.use-case";
import {PostsQueryRepository} from "./postsQuery.reposiroty";
import {TypePostView} from "../../types/post.types";

@Controller('posts')
export class PostsController {
  constructor(@Inject(PostsService) private readonly postsService: PostsService,
              private readonly commandBus: CommandBus,
              private readonly postsQueryRepo: PostsQueryRepository) {}

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto):Promise<TypePostView> {
    const postId = await this.commandBus.execute(new CreateNewPostCommand(createPostDto));
    return this.postsQueryRepo.findPostByIdOrFail(postId);
  }

  @Get()
  findAllPostsByQuery(@Query()dto:PaginationQueryDto) {
    return this.postsService.findAllPostsByQuery(dto);
  }

  @Get(':id')
  findPostById(@Param('id') id: string):Promise<TypePostView> {
    return this.postsQueryRepo.findPostByIdOrFail(id)
  }

  @Get(':postId/comments')
  findCommentsForPost(@Param('postId') id: string, @Query() dto: PaginationQueryDto) {
    return this.postsService.findCommentsForPost(id, dto);
  }

  @Put(':id')
  @HttpCode(204)
  updatePostById(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePostById(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(204)
  removePostById(@Param('id') id: string) {
    return this.postsService.removePostById(id);
  }
}
