import {BadRequestException, Inject, Injectable, NotFoundException, Param, Query} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {PostsRepository} from "./posts.repository";
import {PostsQueryRepository} from "./postsQuery.reposiroty";
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {paginationHelper} from "../../helpers/paginationQuery.helper";
import {mapNewPostToView, mapPostToView} from "../../mappers/post.mapper";
import {CommentsService} from "../comments/comments.service";
import {BlogsQueryRepository} from "../blogs/blogsQuery.repository";
import {CommentsQueryRepository} from "../comments/commentQuery.repository";

@Injectable()
export class PostsService {
  constructor(private readonly postsRepo: PostsRepository,
              private readonly postsQueryRepo: PostsQueryRepository,
  ) {}

  async updatePostById(id: string, dto: UpdatePostDto) {
    await this.postsQueryRepo.findPostByIdOrFail(id);
    const updated = await this.postsRepo.updatePostById(id, dto);
    if (!updated) {
      // если matchedCount = 0 или modifiedCount = 0
      throw new BadRequestException('Post was not updated');
    }
    return
  }

  async removePostById(id: string) {
    await this.postsQueryRepo.findPostByIdOrFail(id);
    const deleted = await this.postsRepo.removePostById(id);
    if (!deleted) {
      //if deletedCount = 0
      throw new BadRequestException('Post was not deleted');
    }
    return
  }

  async removeAllPostsForTest(){
    return await this.postsRepo.removeAllPostsForTest()
  }
}
