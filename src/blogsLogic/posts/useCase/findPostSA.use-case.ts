import {CommandHandler, ICommandHandler, IQueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {CommentsQueryRepository} from "../../comments/commentQuery.repository";
import {PostsRepository} from "../no-sql/posts.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {PostsSQLQueryRepository} from "../postsSQLQuery.reposiroty";


export class FindPostSAQuery{
    constructor(
        public id: string,
        public userId?: string
    ){}
}

@CommandHandler(FindPostSAQuery)
export class FindPostSAUseCase implements IQueryHandler<FindPostSAQuery>{
    constructor(
        private readonly postsSQLQueryRepo: PostsSQLQueryRepository,
    ) {}
    async execute(query: FindPostSAQuery){
        return await this.postsSQLQueryRepo.findPostById(query.id, query.userId)
    }
}