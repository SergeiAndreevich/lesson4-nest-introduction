import {CommandHandler, ICommandHandler, IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {CommentsQueryRepository} from "../../comments/commentQuery.repository";
import {PostsRepository} from "../no-sql/posts.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {PostsSQLQueryRepository} from "../postsSQLQuery.reposiroty";


export class FindAllPostSAQuery{
    constructor(
        public query: PaginationQueryDto,
        public userId?: string
    ){}
}

@QueryHandler(FindAllPostSAQuery)
export class FindAllPostSAUseCase implements IQueryHandler<FindAllPostSAQuery>{
    constructor(
        private readonly postsSQLQueryRepo: PostsSQLQueryRepository,
    ) {}
    async execute(query: FindAllPostSAQuery){
        const pagination = paginationHelper(query.query);
        return await this.postsSQLQueryRepo.findPostsSAByQuery(pagination, query.userId)
    }
}