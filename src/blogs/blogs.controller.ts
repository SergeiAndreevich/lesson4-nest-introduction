import {Controller, Get, Post, Body, Param, Delete, Put, Query, HttpCode} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {CreatePostForBlogDto} from "./dto/create-post-for-blog.dto";
import {PaginationQueryDto} from "../dto/pagination-query.dto";

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService,
  ) {}

  @Post()
  createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(createBlogDto);
  }

  @Post(':blogId/posts')
  createPostForBlog(@Param('blogId') blogId:string, @Body() dto:CreatePostForBlogDto){
    return this.blogsService.createPostForBlog(blogId, dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.blogsService.findAllBlogsByQuery(query);
  }

  @Get(':id')
  findBlog(@Param('id') id: string) {
    return this.blogsService.findBlogById(id);
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
