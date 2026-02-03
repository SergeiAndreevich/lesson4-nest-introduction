import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {BlogsRepository} from "./blogs.repository";

@Injectable()
export class BlogsService {
  constructor(
      private readonly blogsRepo: BlogsRepository,
  ) {}

  async createBlog(dto:CreateBlogDto){
   const createdBlog = await this.blogsRepo.createBlog(dto);
   return createdBlog;
  }

  async updateBlogById(id: string, dto: UpdateBlogDto) {
    const blog = await this.blogsRepo.findBlogById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const updated = await this.blogsRepo.updateBlogById(id, dto);
    if (!updated) {
      // если matchedCount = 0 или modifiedCount = 0
      throw new BadRequestException('Blog was not updated');
    }

    return { message: 'Blog updated successfully' };
  }

  async removeBlogById(id: string) {
    const isDeleted = await this.blogsRepo.removeBlogById(id);
    if (!isDeleted) {
      throw new NotFoundException('Blog not found');
    }
    return;
  }
}
