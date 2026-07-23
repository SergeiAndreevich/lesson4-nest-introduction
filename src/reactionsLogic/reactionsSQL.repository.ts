import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {BadRequestException, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {Reaction, ReactionDocument} from "./schema/reaction.schema";
import {EntitiesForReaction, ReactionType, TypeReaction} from "../types/reaction.types";
import {PG_CONNECTION} from "../../setup/database/database.constants";
import {Pool} from "pg";


@Injectable()
export class ReactionsSQLRepository {
    constructor(
        @InjectModel(Reaction.name) private readonly reactionModel: Model<ReactionDocument>,
        @Inject(PG_CONNECTION) private readonly pool : Pool
    ) {}
   async createReaction(reaction: TypeReaction): Promise<TypeReaction> {
        const result = await this.pool.query(`
        INSERT INTO reactions (entity_id, entity_type, user_id, status, added_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
                [
                    reaction.entity_id,
                    reaction.entity_type,
                    reaction.user_id,
                    reaction.status,
                    reaction.added_at
                ],
            );
        return result.rows[0]
    }

    async findReactionById_EntityType_UserId_OrNull(entityId: string,entityType:EntitiesForReaction, userId:string):Promise<TypeReaction | null> {
        const result = await this.pool.query<TypeReaction>(`
            SELECT * FROM reactions
            WHERE entity_id = $1 AND entity_type = $2 AND user_id = $3
            `,[entityId, entityType, userId]);
        return result.rows[0] ?? null;
    }

    async updateReaction(entityId: string, entityType: EntitiesForReaction, userId: string, status: ReactionType):Promise<boolean>{
        const result = await this.pool.query(`
        UPDATE reactions
        SET status = $4, added_at = NOW()
        WHERE entity_id = $1 AND entity_type = $2 AND user_id = $3
        `, [entityId, entityType, userId, status]);
        return result.rowCount === 1

    }

    async removeReaction(entityId: string, entityType: EntitiesForReaction, userId: string):Promise<boolean>{
        const result = await this.pool.query(`
        DELETE FROM reactions
        WHERE entity_id = $1 AND entity_type = $2 AND user_id = $3
        `, [entityId, entityType, userId]);
        return result.rowCount === 1
    }


}