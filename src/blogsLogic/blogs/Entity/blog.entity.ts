import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {Post} from "../../posts/Entity/post.entity";

@Entity('blogs')
export class Blog {
    @PrimaryColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        unique: true,
    })
    name: string;

    @Column({
        type: 'varchar',
        unique: true,
    })
    description: string;

    @Column({
        type: 'varchar',
        unique: true,
    })
    website_url: string;

    @Column({
        type: 'date', default: Date.now
    })
    created_at: Date;

    @Column({
        type: 'boolean',
        unique: true,
    })
    is_membership: boolean;

    @OneToMany(() => Post, post => post.blog)
    posts: Post[];

}