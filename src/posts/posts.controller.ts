import {Controller, Get, Post, Body, Param, Delete, Query, Put, Inject, HttpCode} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {PaginationQueryDto} from "../dto/pagination-query.dto";

@Controller('posts')
export class PostsController {
  constructor(@Inject(PostsService) private readonly postsService: PostsService) {}

  @Post()
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(createPostDto);
  }

  @Get()
  findAllPostsByQuery(@Query()dto:PaginationQueryDto) {
    return this.postsService.findAllPostsByQuery(dto);
  }

  @Get(':id')
  findPostById(@Param('id') id: string) {
    return this.postsService.findPostById(id);
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
