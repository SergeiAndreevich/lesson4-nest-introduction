import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([])],
    providers: [],
    exports: [],
})
export class ReactionsModule {}

// @Module({
//     imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, { name: Blog.name, schema: BlogSchema } // для проверки blogId
//     ]),
//         CommentsModule],
//     controllers: [PostsController],
//     providers: [PostsService, PostsRepository, PostsQueryRepository, BlogsQueryRepository],
//     exports: [PostsService,PostsRepository,PostsQueryRepository],
// })
// export class PostsModule {}