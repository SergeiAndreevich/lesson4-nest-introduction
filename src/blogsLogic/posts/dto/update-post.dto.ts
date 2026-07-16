import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {}

// PickType с указанием всех полей - они остаются обязательными
// export class UpdatePostDto extends PickType(
//     CreatePostDto,
//     ['title', 'shortDescription', 'content', 'blogId'] as const
// ) {}

import {IsString, Length} from "class-validator";
import {Trim} from "../../../customDecorators/trim.decorator";

export class UpdatePostForBlogDto {
    @IsString()
    @Trim()
    @Length(1,30)
    title: string;

    @IsString()
    @Trim()
    @Length(1,100)
    shortDescription: string;

    @IsString()
    @Trim()
    @Length(1,1000)
    content: string;
}
