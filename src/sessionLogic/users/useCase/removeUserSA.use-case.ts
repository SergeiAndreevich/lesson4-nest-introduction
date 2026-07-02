import {BadRequestException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateUserDto} from "../dto/create-user.dto";
import {CreateAuthDto} from "../../auth/dto/create-auth.dto";
import {UsersSQLRepository} from "../users.sql.repository";
import {UsersQuerySqlRepository} from "../usersQuery.sql.repository";



export class RemoveUserSACommand{
    constructor(
        public id: string
    ){}
}

@CommandHandler(RemoveUserSACommand)
export class RemoveUserSAUseCase implements ICommandHandler<RemoveUserSACommand>{
    constructor(
        private readonly usersSQLRepo: UsersSQLRepository,
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository
    ) {}
    async execute(command: RemoveUserSACommand){
        const user = await this.usersSQLQueryRepo.findUserById(command.id);
        if(!user){
            throw new NotFoundException({message: 'User not found', field: 'userId'});
        }
        const deleted = await this.usersSQLRepo.removeUserById(command.id);
        if (!deleted) {
            //if deletedCount = 0
            throw new BadRequestException({message: 'User was not deleted', field: 'userId'});
        }
        return
    }
}