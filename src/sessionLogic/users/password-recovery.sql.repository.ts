import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool, PoolClient} from "pg";
import {TypeEmailConfirmation, TypePasswordRecovery} from "../../types/user.types";
import {InjectRepository} from "@nestjs/typeorm";
import {EmailConfirmation} from "../auth/Entity/emailConfirmation.entity";
import {EntityManager, Repository} from "typeorm";
import {PasswordRecovery} from "../auth/Entity/passwordRecovery.entity";


@Injectable()
export class PasswordRecoverySQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        @InjectRepository(PasswordRecovery) private readonly passwordRecoveryRepo: Repository<PasswordRecovery>,
    ) {}
    async createPasswordRecoveryFields(dto:TypePasswordRecovery, client?: PoolClient):Promise<TypePasswordRecovery>{
        const db = client ?? this.pool;
        const result = await db.query(`
        INSERT INTO password_recoveries (user_id, recovery_code, expires_at, is_confirmed)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [dto.userId, dto.recovery_code, dto.expires_at, dto.is_confirmed]);
        return result.rows[0]
    }
    async createPasswordRecoveryFieldsORM(dto:TypePasswordRecovery, manager?: EntityManager):Promise<PasswordRecovery>{
        const repository = manager
            ? manager.getRepository(PasswordRecovery)
            : this.passwordRecoveryRepo;
        const passwordRecovery = repository.create({
            user_id: dto.userId,
            recovery_code: dto.recovery_code,
            expires_at: dto.expires_at,
            is_confirmed: dto.is_confirmed,
        });

        return repository.save(passwordRecovery);
    }

    async findUserIdByCode(recoveryCode: string):Promise<string | null>{
        const result = await this.pool.query(`
        SELECT user_id FROM password_recoveries WHERE recovery_code = $1 AND is_confirmed = FALSE
        `, [recoveryCode]);
        return result.rows[0] ?? null
    }
    async findUserIdByCodeORM(recoveryCode: string):Promise<string | null>{
        const result = await this.passwordRecoveryRepo.findOne({where: {recovery_code: recoveryCode, is_confirmed: false}});
        if(result){
            return result.user_id
        }
        return null
    }

    async updateRecoveryCode(userId: string, recoveryCode: string): Promise<boolean>{
        const result = await this.pool.query(`
        UPDATE password_recoveries
        SET recovery_code = $1, is_confirmed = FALSE
        WHERE user_id = $2
        `, [recoveryCode, userId]);
        return result.rowCount === 1
    }
    async updateRecoveryCodeORM(userId: string, recoveryCode: string): Promise<boolean>{
        const result = await this.passwordRecoveryRepo.update(
            {user_id: userId}, {recovery_code: recoveryCode, is_confirmed: false},
        );
        return result.affected === 1;
    }
    async confirmPassword(userId: string, client?: PoolClient): Promise<boolean> {
        const result = await this.pool.query(`
        UPDATE password_recoveries
        SET  is_confirmed = TRUE
        WHERE user_id = $1
        `, [userId]);
        return result.rowCount === 1
    }
    async confirmPasswordORM(userId: string, manager?: EntityManager): Promise<boolean> {
        const repository = manager
            ? manager.getRepository(PasswordRecovery)
            : this.passwordRecoveryRepo;
        const result = await repository.update(
            {user_id: userId},{is_confirmed: true},
        )
        return result.affected === 1;
    }
}



