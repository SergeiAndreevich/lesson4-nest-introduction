import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PostsSQLRepository} from "../postsSQL.repository";
import {BadRequestException} from "@nestjs/common";

export class RemovePostSACommand{
    constructor(
       public id: string
    ) {}
}

@CommandHandler(RemovePostSACommand)
export class RemovePostSAUseCase implements ICommandHandler<RemovePostSACommand>{
    constructor(
        private readonly postsSQLRepo: PostsSQLRepository
    ) {}
    async execute(command: RemovePostSACommand){
        const deleted = await this.postsSQLRepo.removePostSAById(command.id);
        if (!deleted) {
            throw new BadRequestException({message:'Post was not found or deleted' , field: 'postId'});
        }
        return
    }
}