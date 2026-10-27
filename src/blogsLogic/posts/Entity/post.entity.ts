import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import {Blog} from "../../blogs/Entity/blog.entity";
import {Prop} from "@nestjs/mongoose";
import {timestamp} from "rxjs";

@Entity('posts')
export class Post {
    @PrimaryColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        unique: true,
    })
    title: string;

    @Column({
        type: 'varchar',
        unique: true,
    })
    short_description: string;

    @Column({
        type: 'varchar',
        unique: true,
    })
    content: string;

    @Prop({  type: 'varchar', required: true })
    blog_id: string;

    @Prop({  type: 'varchar', required: true })
    blog_name: string;

    @Prop({ type: 'timestamp', default: Date.now })
    created_at: Date;

    @Column({ type: 'integer', default: 0 })
    likes_count: number;

    @Column({ type: 'integer', default: 0 })
    dislikes_count: number;

    @ManyToOne(() => Blog, blog => blog.posts)
    @JoinColumn({ name: 'blog_id' })
    blog: Blog;

}