import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {CommentsRepository} from "./comments.repository";
import {CommentsQueryRepository} from "./commentQuery.repository";
import {mapCommentToView} from "../mappers/comment.mapper";
import {PaginationQueryDto} from "../dto/pagination-query.dto";
import {paginationHelper} from "../helpers/paginationQuery.helper";

@Injectable()
export class CommentsService {
  constructor(
      @Inject(CommentsRepository) private readonly commentsRepository: CommentsRepository,
      @Inject(CommentsQueryRepository) private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async findCommentById(id: string) {
    const comment = await this.commentsQueryRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return mapCommentToView(comment)
  }
  async findCommentsForPost(postId: string, query: PaginationQueryDto) {
    const pagination = paginationHelper(query);
    return await this.commentsQueryRepository.findCommentsForPost(postId, pagination);
  }
}
