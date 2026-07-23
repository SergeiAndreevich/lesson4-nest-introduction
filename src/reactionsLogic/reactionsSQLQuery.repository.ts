import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {Reaction, ReactionDocument} from "./schema/reaction.schema";
import {EntitiesForReaction, ReactionType, TypeLikeDetails, TypeReaction} from "../types/reaction.types";
import {PG_CONNECTION} from "../../setup/database/database.constants";
import {Pool} from "pg";


@Injectable()
export class ReactionsSQLQueryRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}

    async findReactionById_EntityType_UserId(entityId:string, entityType:EntitiesForReaction, userId:string):Promise<TypeReaction>{
        const result = await this.pool.query<TypeReaction>(`
        SELECT * FROM reactions
        WHERE entity_id = $1 AND entity_type = $2 AND user_id = $3
        `, [entityId, entityType, userId]);
        return result.rows[0] ?? null
    }

    async getMyStatus(entityType: EntitiesForReaction, entityId: string, userId:string):Promise<ReactionType>{
        const result = await this.pool.query(`
        SELECT status FROM reactions
        WHERE entity_id = $1 AND entity_type = $2 AND user_id = $3
         `, [entityId, entityType, userId]);

        // если реакции нет → значит None
        return result.rows[0]?.status ?? ReactionType.none
    }

    async getNewestLikes(entityId: string, entityType: EntitiesForReaction): Promise<TypeLikeDetails[]> {
        const result = await this.pool.query<{
            added_at: Date;
            user_id: string;
            login: string;
        }>(`
        SELECT r.added_at, r.user_id, u.login
        FROM reactions r
        JOIN users u ON r.user_id = u.id
        WHERE r.entity_id = $1 AND r.entity_type = $2 AND r.status = 'Like'
        ORDER BY r.added_at DESC
        LIMIT 3
        `, [entityId, entityType]);

        return result.rows.map(row => ({
            addedAt: row.added_at.toISOString(),
            userId: row.user_id,
            login: row.login,
        }));
    }
}