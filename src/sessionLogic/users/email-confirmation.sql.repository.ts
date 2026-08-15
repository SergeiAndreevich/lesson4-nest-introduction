import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool, PoolClient} from "pg";
import {TypeEmailConfirmation} from "../../types/user.types";
import {InjectRepository} from "@nestjs/typeorm";
import {EntityManager, Repository} from "typeorm";
import {EmailConfirmation} from "../auth/Entity/emailConfirmation.entity";


@Injectable()
export class EmailConfirmationSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        @InjectRepository(EmailConfirmation) private readonly emailConfirmationRepo: Repository<EmailConfirmation>,

    ) {}

    async createFirstEmailConfirmation(dto:TypeEmailConfirmation, client?: PoolClient):Promise<TypeEmailConfirmation>{
        const db = client ?? this.pool;
        const result = await db.query(`
        INSERT INTO email_confirmations (user_id, confirmation_code, expires_at, is_confirmed)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [dto.userId, dto.confirmation_code, dto.expires_at, dto.is_confirmed]);
        return result.rows[0]
    }
    async createFirstEmailConfirmationORM(dto:TypeEmailConfirmation, manager?: EntityManager):Promise<EmailConfirmation>{
        const repository = manager
            ? manager.getRepository(EmailConfirmation)
            : this.emailConfirmationRepo;
        const confirmation = repository.create({
            user_id: dto.userId,
            confirmation_code: dto.confirmation_code,
            expires_at: dto.expires_at,
            is_confirmed: dto.is_confirmed,
        });

        return repository.save(confirmation);
    }
    async confirmEmail(userId: string){
        const result = await this.pool.query(`
        UPDATE email_confirmations
        SET is_confirmed = true
        WHERE user_id = $1
        `, [userId]);

        return result.rowCount === 1;
    }
    async confirmEmailORM(userId: string){
        const result = await this.emailConfirmationRepo.update(
            {user_id: userId},{is_confirmed: true}
        )
        return result.affected === 1;
    }
    async setNewEmailConfirmationCode(userId: string, newCode: string):Promise<boolean>{
        const result = await this.pool.query(`
        UPDATE email_confirmations
        SET confirmation_code = $1
        WHERE user_id = $2
        `, [newCode, userId]);
        return result.rowCount === 1
    }
    async setNewEmailConfirmationCodeORM(userId: string, newCode: string):Promise<boolean>{
        const result = await this.emailConfirmationRepo.update(
            {user_id: userId},{confirmation_code: newCode}
        );
        return result.affected === 1
    }

    async findUserById(userId: string){
        const result = await this.pool.query(`
        SELECT * FROM email_confirmations
        WHERE user_id = $1
        `, [userId]);
        return result.rows[0] ??  null
    }
    async findUserByIdORM(userId: string){
        return this.emailConfirmationRepo.findOne({where: {user_id: userId}})
    }
    async findUserByEmailCode(code: string){
        const result = await this.pool.query(`
        SELECT * FROM email_confirmations WHERE confirmation_code = $1
        `,[code]);
        return result.rows[0] ??  null
    }
    async findUserByEmailCodeORM(code: string){
        return this.emailConfirmationRepo.findOne({where: {confirmation_code: code}})
    }
}



