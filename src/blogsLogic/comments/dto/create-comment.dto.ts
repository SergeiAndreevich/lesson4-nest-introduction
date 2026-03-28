import {IsString, Length} from "class-validator";
import {Trim} from "../../../customDecorators/trim.decorator";

export class CreateCommentDto {
    @IsString()
    @Trim()
    @Length(20,300)
    content:string;
}
