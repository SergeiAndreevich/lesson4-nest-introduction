import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PostsSQLRepository} from "../postsSQL.repository";
import {BadRequestException} from "@nestjs/common";
import {UpdatePostDto} from "../dto/update-post.dto";

export class UpdatePostSACommand{
    constructor(
       public id: string,
       public dto: UpdatePostDto
    ) {}
}

@CommandHandler(UpdatePostSACommand)
export class UpdatePostSAUseCase implements ICommandHandler<UpdatePostSACommand>{
    constructor(
        private readonly postsSQLRepo: PostsSQLRepository
    ) {}
    async execute(command: UpdatePostSACommand){
        const updated = await this.postsSQLRepo.updatePostSAById(command.id, command.dto);
        if (!updated) {
            throw new BadRequestException({message:'Post was not found or updated' , field: 'postId'});
        }
        return
    }
}