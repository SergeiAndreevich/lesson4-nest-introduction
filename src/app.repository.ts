import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "./blogs/schemas/blog.schema";
import {Model} from "mongoose";
import {Post,PostDocument} from "./posts/schemas/post.schema";
import {Comment, CommentDocument} from "./comments/schemas/comment.schema";
import {User, UserDocument} from "./users/schemas/user.schema";

@Injectable()
export class AppRepository{
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}
    async removeAll(){
        await this.blogModel.deleteMany({});
        await this.postModel.deleteMany({});
        await this.commentModel.deleteMany({});
        await this.userModel.deleteMany({});
        return
    }
}