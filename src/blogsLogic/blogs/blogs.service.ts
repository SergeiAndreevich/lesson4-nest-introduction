import {BadRequestException, Injectable} from '@nestjs/common';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {BlogsRepository} from "./blogs.repository";
import {BlogsQueryRepository} from "./blogsQuery.repository";

@Injectable()
export class BlogsService {
  constructor(
      private readonly blogsRepo: BlogsRepository,
      private readonly blogsQueryRepo: BlogsQueryRepository,
  ) {}
  async updateBlogById(id: string, dto: UpdateBlogDto) {
    await this.blogsQueryRepo.findBlogByIdOrFail(id);
    const updated = await this.blogsRepo.updateBlogById(id, dto);
    if (!updated) {
      // если matchedCount = 0 или modifiedCount = 0
      throw new BadRequestException('Blog was not updated');
    }
    return
  }

  async removeBlogById(id: string) {
    await this.blogsQueryRepo.findBlogByIdOrFail(id);
    const deleted = await this.blogsRepo.removeBlogById(id);
    if (!deleted) {
      //if deletedCount = 0
      throw new BadRequestException('Blog was not deleted');
    }
    return
  }
  async removeAllBlogsForTest(){
    return this.blogsRepo.removeAllBlogsForTest()
  }
}
