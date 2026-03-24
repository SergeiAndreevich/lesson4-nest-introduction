import {Controller, Get, Post, Body, Param, Delete, Query, Put, Inject, HttpCode, UseGuards} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {CommandBus} from "@nestjs/cqrs";
import {CreateNewPostCommand} from "./useCase/createPost.use-case";
import {PostsQueryRepository} from "./postsQuery.reposiroty";
import {TypePostView} from "../../types/post.types";
import {FindAllPostsCommand} from "./useCase/findAllPosts.use-case";
import {TypePaginatorObject} from "../../types/pagination.types";
import {CreateCommentDto} from "../comments/dto/create-comment.dto";
import {CreateCommentForPostCommand} from "../comments/useCase/createCommentForPost.use-case";
import {CommentsQueryRepository} from "../comments/commentQuery.repository";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {UserId} from "../../customDecorators/userId.decorator";
import {UserLogin} from "../../customDecorators/userLogin.decorator";
import {ReactionInputDto} from "../../reactionsLogic/dto/reaction-input.dto";
import {ChangePostLikeStatusCommand} from "./useCase/changePostLikeStatus.use-case";
import {FindCommentsForPostCommand} from "../comments/useCase/findCommentsForPost.use-case";
import {BasicGuard} from "../../../setup/guard/basic.guard";

@Controller('posts')
export class PostsController {
  constructor(@Inject(PostsService) private readonly postsService: PostsService,
              private readonly commandBus: CommandBus,
              private readonly postsQueryRepo: PostsQueryRepository,
              private readonly commentsQueryRepo: CommentsQueryRepository,) {}

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createPost(@Body() createPostDto: CreatePostDto):Promise<TypePostView> {
    const postId = await this.commandBus.execute(new CreateNewPostCommand(createPostDto));
    return this.postsQueryRepo.findPostByIdOrFail(postId);
  }

  @Post(':postId/comments')
  @UseGuards(BearerGuard)
  @HttpCode(201)
  async createCommentForPost(@UserId()userId:string, @UserLogin()userLogin:string, @Param('postId') postId: string, @Body() dto: CreateCommentDto) {
    const createdCommentId = await this.commandBus.execute(new CreateCommentForPostCommand(userId, userLogin, postId, dto));
    return this.commentsQueryRepo.findCommentByIdOrFail(createdCommentId)
  }

  @Get()
  findAllPostsByQuery(@Query()dto:PaginationQueryDto):Promise<TypePaginatorObject<TypePostView[]>> {
    return this.commandBus.execute(new FindAllPostsCommand(dto))
  }

  @Get(':id')
  findPostById(@Param('id') id: string):Promise<TypePostView> {
    return this.postsQueryRepo.findPostByIdOrFail(id)
  }

  @Get(':postId/comments')
  findCommentsForPost(@Param('postId') id: string, @Query() dto: PaginationQueryDto) {
    return this.commandBus.execute(new FindCommentsForPostCommand(id, dto));

  }

  @Put(':postId/like-status')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async changePostLikeStatus(@UserId()userId:string, @UserLogin()userLogin:string, @Param('postId') postId: string, @Body() dto: ReactionInputDto){
    return this.commandBus.execute(new ChangePostLikeStatusCommand(userId, userLogin, postId, dto));
  }

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  updatePostById(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePostById(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  removePostById(@Param('id') id: string) {
    return this.postsService.removePostById(id);
  }
}
