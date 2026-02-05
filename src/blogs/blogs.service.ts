import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {BlogsRepository} from "./blogs.repository";
import {CreatePostForBlogDto} from "./dto/create-post-for-blog.dto";
import {BlogsQueryRepository} from "./blogsQuery.repository";
import {mapBlogToView} from "../mappers/blog.mapper";
import {paginationHelper} from "../helpers/paginationQuery.helper";
import {PaginationQueryDto} from "../dto/pagination-query.dto";
import {PostsService} from "../posts/posts.service";

@Injectable()
export class BlogsService {
  constructor(
      @Inject(BlogsRepository) private readonly blogsRepo: BlogsRepository,
      @Inject(BlogsQueryRepository) private readonly blogsQueryRepo: BlogsQueryRepository,
      @Inject(PostsService) private readonly postsService: PostsService,
  ) {}

  async createBlog(dto:CreateBlogDto){
   const createdBlog = await this.blogsRepo.createBlog(dto);
   return createdBlog;
  }
  async createPostForBlog(blogId:string, dto:CreatePostForBlogDto){
    const blog = await this.findBlogById(blogId);
    return await this.blogsRepo.createPostForBlog(blogId, blog.name, dto);
  }


  async findAllBlogsByQuery(query: PaginationQueryDto) {
    const pagination = paginationHelper(query);
    return await this.blogsQueryRepo.findAllBlogsByQuery(pagination);
  }
  async findBlogById(id:string){
    const blog = await this.blogsQueryRepo.findBlogById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return mapBlogToView(blog)
  }
  async findPostsForBlog(blogId: string, query: PaginationQueryDto) {
    await this.findBlogById(blogId);
    return await this.postsService.findPostsForBlog(blogId, query);
  }


  async updateBlogById(id: string, dto: UpdateBlogDto) {
    await this.findBlogById(id);
    const updated = await this.blogsRepo.updateBlogById(id, dto);
    if (!updated) {
      // если matchedCount = 0 или modifiedCount = 0
      throw new BadRequestException('Blog was not updated');
    }

    return {message: 'Blog updated successfully'};
  }

  async removeBlogById(id: string) {
    await this.findBlogById(id);
    const deleted = await this.blogsRepo.removeBlogById(id);
    if (!deleted) {
      //if deletedCount = 0
      throw new BadRequestException('Blog was not deleted');
    }
    return {message: 'Blog deleted successfully'};
  }
}
