import { IsString, Length, IsUrl } from 'class-validator';

export class UpdateBlogDto {
    @IsString()
    @Length(1, 50)
    name: string;

    @IsString()
    @Length(1, 500)
    description: string;

    @IsUrl()
    websiteUrl: string;
}
