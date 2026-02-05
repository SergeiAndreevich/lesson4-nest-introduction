import {BadRequestException, Inject, Injectable, NotFoundException, Param, Query} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {PostsRepository} from "./posts.repository";
import {PostsQueryRepository} from "./postsQuery.reposiroty";
import {PaginationQueryDto} from "../dto/pagination-query.dto";
import {paginationHelper} from "../helpers/paginationQuery.helper";
import {mapNewPostToView, mapPostToView} from "../mappers/post.mapper";
import {CommentsService} from "../comments/comments.service";
import {BlogsQueryRepository} from "../blogs/blogsQuery.repository";

@Injectable()
export class PostsService {
  constructor(@Inject(PostsRepository) private readonly postsRepo: PostsRepository,
              @Inject(PostsQueryRepository) private readonly postsQueryRepo: PostsQueryRepository,
              @Inject(BlogsQueryRepository) private readonly blogsQueryRepo: BlogsQueryRepository,
              @Inject(CommentsService) private readonly commentsService: CommentsService
  ) {}
  async createPost(dto: CreatePostDto) {
    await this.blogsQueryRepo.findBlogById(dto.blogId);
    const createdPost = await this.postsRepo.createPost(dto);
    return mapNewPostToView(createdPost);
  }

  async findAllPostsByQuery(query: PaginationQueryDto) {
    const pagination = paginationHelper(query);
    return await this.postsQueryRepo.findAllPostsByQuery(pagination);
  }
  async findPostById(id: string) {
    const post = await this.postsQueryRepo.findPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return mapPostToView(post)
  }
  async findPostsForBlog(blogId: string, query: PaginationQueryDto) {
    const pagination = paginationHelper(query);
    return await this.postsQueryRepo.findPostsForBlog(blogId, pagination);
  }
  async findCommentsForPost(postId: string, query: PaginationQueryDto) {
    await this.findPostById(postId);
    return this.commentsService.findCommentsForPost(postId, query);
  }

  async updatePostById(id: string, dto: UpdatePostDto) {
    await this.findPostById(id);
    const updated = await this.postsRepo.updatePostById(id, dto);
    if (!updated) {
      // если matchedCount = 0 или modifiedCount = 0
      throw new BadRequestException('Post was not updated');
    }

    return {message: 'Post updated successfully'}
  }

  async removePostById(id: string) {
    await this.findPostById(id);
    const deleted = await this.postsRepo.removePostById(id);
    if (!deleted) {
      //if deletedCount = 0
      throw new BadRequestException('Post was not deleted');
    }
    return {message: 'Post deleted successfully'}
  }
}
