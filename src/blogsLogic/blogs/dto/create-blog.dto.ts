import { IsString, Length, IsUrl } from 'class-validator';

export class CreateBlogDto {
    @IsString()
    @Length(1, 15)
    name: string;

    @IsString()
    @Length(1, 500)
    description: string;

    @IsUrl()
    @Length(8, 100)
    websiteUrl: string;
}