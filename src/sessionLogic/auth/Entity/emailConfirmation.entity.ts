import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {User} from "./user.entity";

@Entity('email_confirmations')
export class EmailConfirmation {
    @PrimaryColumn({ name: 'user_id', type: 'uuid' })
    user_id: string;

    @Column({type: 'varchar', length: 255})
    confirmation_code: string;

    @Column({type: 'timestamp'})
    expires_at: Date;

    @Column()
    is_confirmed: boolean;

    @OneToOne(() => User, u => u.emailConfirmation)
    @JoinColumn({ name: 'user_id' })
    user: User;
}