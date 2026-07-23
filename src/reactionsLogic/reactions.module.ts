import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ReactionsRepository} from "./reactions.repository";
import {ReactionsQueryRepository} from "./reactionsQuery.repository";
import {Reaction, ReactionSchema} from "./schema/reaction.schema";
import {DatabaseModule} from "../../setup/database/database.module";
import {ReactionsSQLRepository} from "./reactionsSQL.repository";
import {ReactionsSQLQueryRepository} from "./reactionsSQLQuery.repository";

@Module({
    imports: [MongooseModule.forFeature([{name: Reaction.name, schema: ReactionSchema}]), DatabaseModule],
    providers: [ReactionsRepository, ReactionsQueryRepository, ReactionsSQLRepository, ReactionsSQLQueryRepository],
    exports: [ReactionsRepository, ReactionsQueryRepository, ReactionsSQLRepository, ReactionsSQLQueryRepository],
})
export class ReactionsModule {}
