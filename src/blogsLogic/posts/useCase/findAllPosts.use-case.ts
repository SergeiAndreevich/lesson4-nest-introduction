import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {PostsQueryRepository} from "../postsQuery.reposiroty";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";


export class FindAllPostsCommand{
    constructor(
        public query: PaginationQueryDto,
        public userId?: string,
    ){}
}

@CommandHandler(FindAllPostsCommand)
export class FindAllPostsUseCase implements ICommandHandler<FindAllPostsCommand>{
    constructor(
        private readonly postsQueryRepo: PostsQueryRepository,
    ) {}
    async execute(command: FindAllPostsCommand){
        const pagination = paginationHelper(command.query);
        return this.postsQueryRepo.findAllPostsByQuery(pagination, command.userId);
    }
}