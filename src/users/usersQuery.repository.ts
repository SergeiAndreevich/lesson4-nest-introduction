import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./schemas/user.schema";
import {Model} from "mongoose";
import {IPaginationAndSorting, TypePaginatorObject} from "../types/pagination.types";
import {mapCommentToView} from "../mappers/comment.mapper";
import {mapPostToView} from "../mappers/post.mapper";
import {mapUserToView} from "../mappers/user.mapper";
import {TypeUserToView} from "../types/user.types";

@Injectable()
export class UsersQueryRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {}

    async findUserById(id: string) {
        return this.userModel.findById(id).lean()
    }
    async findAllUsersByQuery(pagination:IPaginationAndSorting):Promise<TypePaginatorObject<TypeUserToView[]>> {
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
        const filter: any = {};
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: "i" };
        }
        if (searchLoginTerm) {
            filter.login = { $regex: searchLoginTerm, $options: "i" };
        }
        if (searchEmailTerm) {
            filter.email = { $regex: searchEmailTerm, $options: "i" };
        }
        const skip = (pageNumber - 1) * pageSize;
        const users = await this.userModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();
        const totalCount = await this.userModel.countDocuments(filter);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: users.map(user => mapUserToView(user))
        }
    }
}