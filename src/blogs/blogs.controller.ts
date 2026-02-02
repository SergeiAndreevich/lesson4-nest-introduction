import {Controller, Get, Post, Body, Patch, Param, Delete, Put, Query} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {CreatePostForBlogDto} from "./dto/create-post-for-blog.dto";
import {BlogsQueryRepository} from "./blogsQuery.repository";

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService,
              private readonly blogsQueryRepo: BlogsQueryRepository) {}

  @Post()
  createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @Post(':blogId/posts')
  createPostForBlog(@Param('blogId') blogId:string, @Body() dto:CreatePostForBlogDto){
    return this.blogsService.createPostForBlog(blogId, dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.blogsQueryRepo.findAll(query);
  }

  @Get(':id')
  findBlog(@Param('id') id: string) {
    return this.blogsQueryRepo.findBlogById(id);
  }

  @Get(':blogId/posts')
  findPostsForBlog(@Param('blogId') blogId: string, @Query() query: PaginationQueryDto){
    return this.blogsQueryRepo.findPostsForBlog(blogId, query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.updateBlogById(id, updateBlogDto);
  }

  @Delete(':id')
  removeBlog(@Param('id') id: string) {
    return this.blogsService.removeBlogById(id);
  }
}
