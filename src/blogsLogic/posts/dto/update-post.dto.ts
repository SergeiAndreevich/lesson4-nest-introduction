import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {}

// PickType с указанием всех полей - они остаются обязательными
// export class UpdatePostDto extends PickType(
//     CreatePostDto,
//     ['title', 'shortDescription', 'content', 'blogId'] as const
// ) {}