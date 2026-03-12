import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "./blogsLogic/blogs/types-and-schemas/blog.schema";
import {Model} from "mongoose";
import {Post,PostDocument} from "./blogsLogic/posts/types-and-schemas/post.schema";
import {Comment, CommentDocument} from "./blogsLogic/comments/types-and-schemas/comment.schema";
import {User, UserDocument} from "./sessionLogic/users/types-and-schemas/user.schema";

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