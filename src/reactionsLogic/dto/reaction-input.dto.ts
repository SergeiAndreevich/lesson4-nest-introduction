import {IsEnum} from "class-validator";
import {ReactionType} from "../../types/reaction.types";

export class ReactionInputDto {
    @IsEnum((ReactionType), {
        message: 'likeStatus must be one of: Like, Dislike, None'
    })
    likeStatus: ReactionType;

}
