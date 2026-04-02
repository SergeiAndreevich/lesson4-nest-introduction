// import {UnauthorizedException} from "@nestjs/common";
// import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
// import {JwtService} from "@nestjs/jwt";
//
//
// export class CreateSessionCommand{
//     constructor(
//         public refreshToken: string
//     ){}
// }
//
// @CommandHandler(CreateSessionCommand)
// export class CreateSessionUseCase implements ICommandHandler<CreateSessionCommand>{
//     constructor(
//         private readonly jwtService: JwtService,
//     ) {}
//     async execute(command: CreateSessionCommand){
//         const userId = req.userId;
//         if(userId === undefined || userId === null || userId.length === 0) {
//             res.sendStatus(httpStatus.Unauthorized)
//             return
//         }
//         const sessionsList = await this.sessionsService.findAllSessions(userId);
//         res.status(httpStatus.Ok).send(sessionsList)
//     }
// }