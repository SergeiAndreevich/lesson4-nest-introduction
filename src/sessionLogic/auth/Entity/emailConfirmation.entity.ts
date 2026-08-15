import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {User} from "./user.entity";

@Entity('email_confirmations')
export class EmailConfirmation {
    @PrimaryColumn({ name: 'user_id' })
    user_id: string;

    @Column()
    confirmation_code: string;

    @Column()
    expires_at: Date;

    @Column()
    is_confirmed: boolean;

    @OneToOne(() => User, u => u.emailConfirmation)
    @JoinColumn({ name: 'user_id' })
    user: User;
}