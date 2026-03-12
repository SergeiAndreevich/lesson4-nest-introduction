import {IsString} from "class-validator";

export class CodeInputDto {
    @IsString()
    code: string;
}