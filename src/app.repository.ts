import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Blog, BlogDocument} from "./blogsLogic/blogs/schema/blog.schema";
import {Post, PostDocument} from "./blogsLogic/posts/shema/post.schema";
import {Comment, CommentDocument} from "./blogsLogic/comments/schema/comment.schema";
import {User, UserDocument} from "./sessionLogic/users/schema/user.schema";

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