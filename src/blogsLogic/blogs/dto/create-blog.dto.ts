import { IsString, Length, IsUrl } from 'class-validator';
import {Trim} from "../../../customDecorators/trim.decorator";

export class CreateBlogDto {
    @IsString()
    @Trim()
    @Length(1, 15)
    name: string;

    @IsString()
    @Trim()
    @Length(1, 500)
    description: string;

    @IsUrl()
    @Trim()
    @Length(8, 100)
    websiteUrl: string;
}