import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import {User} from "../../auth/Entity/user.entity";

@Entity('sessions')
export class Session {
    @PrimaryColumn({type: 'uuid'})
    id: string;

    @Column({type: 'varchar', length: 255})
    device_id: string;

    @Column({type: 'varchar', length: 255})
    ip: string;

    @Column({type: 'varchar', length: 255})
    device_name: string;

    @Column({type: 'timestamp'})
    last_activity: Date;

    @Column({type: 'timestamp'})
    expires_at: Date;

    @Column()
    version: number;

    @ManyToOne(()=>User, u => u.sessions)
    @JoinColumn({ name: 'user_id' })
    user: User
}
