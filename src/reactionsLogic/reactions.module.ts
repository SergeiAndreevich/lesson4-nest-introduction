import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ReactionsRepository} from "./reactions.repository";
import {ReactionsQueryRepository} from "./reactionsQuery.repository";
import {Reaction, ReactionSchema} from "./schema/reaction.schema";

@Module({
    imports: [MongooseModule.forFeature([{name: Reaction.name, schema: ReactionSchema}])],
    providers: [ReactionsRepository, ReactionsQueryRepository],
    exports: [ReactionsRepository, ReactionsQueryRepository],
})
export class ReactionsModule {}
