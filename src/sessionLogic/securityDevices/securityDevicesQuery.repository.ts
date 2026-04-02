import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Session, SessionDocument} from "./schema/session.schema";
import {Model} from "mongoose";
import {TypeSessionToFront} from "../../types/session.types";
import {mapSessionToFront} from "../../mappers/session.mapper";

@Injectable()
export class SecurityDevicesQueryRepository{
    constructor(
        @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>
    ) {}

    async findAllSessions(userId: string): Promise<TypeSessionToFront[]>{
        const sessions = await this.sessionModel.find({userId: userId});
        return sessions.map(session => mapSessionToFront(session));
    }


}