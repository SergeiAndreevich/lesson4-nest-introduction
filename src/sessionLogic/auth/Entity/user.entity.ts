import {Column, Entity, OneToMany, OneToOne, PrimaryColumn} from "typeorm";
import {EmailConfirmation} from "./emailConfirmation.entity";
import {PasswordRecovery} from "./passwordRecovery.entity";
import {Session} from "../../securityDevices/Entity/session.entity";

@Entity('users')
export class User {
    @PrimaryColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 10,
        unique: true,
    })
    login: string;

    @Column({
        type: 'varchar',
        length: 255,
        unique: true,

    })
    email: string;

    @Column({
        type: 'varchar',
        length: 20,
    })
    password: string;

    @Column({
        type: 'timestamp',
    })
    created_at: Date;

    @OneToOne(() => EmailConfirmation, e => e.user)
    emailConfirmation: EmailConfirmation;

    @OneToOne(() => PasswordRecovery,p => p.user)
    passwordRecovery: PasswordRecovery;

    @OneToMany(() => Session, session => session.user)
    sessions: Session[];
}