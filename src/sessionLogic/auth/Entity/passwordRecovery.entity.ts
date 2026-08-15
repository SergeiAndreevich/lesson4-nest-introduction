import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {User} from "./user.entity";

@Entity('password_recoveries')
export class PasswordRecovery {
    @PrimaryColumn({ name: 'user_id', type: 'uuid' })
    user_id: string;

    @Column({type: 'varchar', length: 255})
    recovery_code: string;

    @Column({type: 'timestamp'})
    expires_at: Date;

    @Column()
    is_confirmed: boolean;

    @OneToOne(() => User, u => u.passwordRecovery)
    @JoinColumn({ name: 'user_id' })
    user: User;
}