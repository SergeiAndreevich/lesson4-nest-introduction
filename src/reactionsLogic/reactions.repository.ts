import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {Reaction, ReactionDocument} from "./schema/reaction.schema";
import { ReactionType} from "../types/reaction.types";


@Injectable()
export class ReactionsRepository {
    constructor(
        @InjectModel(Reaction.name) private readonly reactionModel: Model<ReactionDocument>
    ) {}
    async createReaction(reaction:Reaction):Promise<string>{
        const createdReaction:ReactionDocument = await this.reactionModel.create(reaction)
        return createdReaction._id.toString()
    }

    async updateReactionByIdOrFail(id:string, dto: ReactionType):Promise<void>{
        const result = await this.reactionModel.updateOne({ _id: id },
                {
                    $set: {
                        status: dto,
                        createdAt: new Date(),
                    },
                },
        );
            if(result.matchedCount === 1 && result.modifiedCount === 1){
                return
            }
            throw new BadRequestException("The reaction was not updated");
    }

    async removeReactionByIdOrFail(id:string):Promise<void>{
        const result = await this.reactionModel.deleteOne({ _id: id });
        if(result.deletedCount !== 1){
            throw new BadRequestException("The reaction was not deleted!");
        }
        return
    }

    // async updatePostById(id: string, dto: UpdatePostDto) {
    //     const result = await this.postModel.updateOne(
    //         { _id: id },
    //         {
    //             $set: {
    //                 title: dto.title,
    //                 shortDescription: dto.shortDescription,
    //                 content: dto.content,
    //                 blogId: dto.blogId,
    //             },
    //         },
    //     );
    //
    //     return result.matchedCount === 1 && result.modifiedCount === 1;
    // }
    // async removePostById(id: string){
    //     const result = await this.postModel.deleteOne({ _id: id });
    //     return result.deletedCount === 1;
    // }
}