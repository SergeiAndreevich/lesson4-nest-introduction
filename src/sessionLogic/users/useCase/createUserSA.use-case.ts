import {BadRequestException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateUserDto} from "../dto/create-user.dto";
import {CreateAuthDto} from "../../auth/dto/create-auth.dto";
import {UsersSQLRepository} from "../users.sql.repository";
import {UsersQuerySqlRepository} from "../usersQuery.sql.repository";
import {createUserSQL, TypeUser} from "../../../types/user.types";
import {mapUserToView} from "../../../mappers/user.mapper";


export class CreateUserSACommand{
    constructor(
        public dto: CreateUserDto | CreateAuthDto
    ){}
}

@CommandHandler(CreateUserSACommand)
export class CreateUserSAUseCase implements ICommandHandler<CreateUserSACommand>{
    constructor(
        private readonly usersSQLRepo: UsersSQLRepository,
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository
    ) {}
    async execute(command: CreateUserSACommand){
        //проверка на существование логина и почты
        const userByLogin = await this.usersSQLQueryRepo.findUserByLoginORM(command.dto.login);
        if(userByLogin){
            throw new BadRequestException({message: 'User already exists', field: 'login'});
        }
        const userByEmail = await this.usersSQLQueryRepo.findUserByEmailORM(command.dto.email);
        if(userByEmail){
            throw new BadRequestException({message: 'User already exists', field: 'email'});
        }
        //создание экземпляра юзера
        const userData:TypeUser = createUserSQL(command.dto.login, command.dto.email, command.dto.password);
        //запись в БД, возвращает созданного юзера
        const createdUser = await this.usersSQLRepo.createUserORM(userData);
        //мапим юзера для фронта
        return mapUserToView(createdUser)
    }
}