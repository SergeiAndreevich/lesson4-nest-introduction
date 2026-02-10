import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "./schemas/user.schema";
import {Model} from "mongoose";
import {IPaginationAndSorting, TypePaginatorObject} from "../types/pagination.types";
import {mapUserToView} from "../mappers/user.mapper";
import {TypeUserToView} from "../types/user.types";
import {CodeInputDto} from "../auth/dto/code-input.dto";

@Injectable()
export class UsersQueryRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {}

    async findUserById(id: string) {
        return this.userModel.findById(id).lean()
    }

    async findUserByEmail(email: string) {
        return this.userModel.findOne({'accountData.email': email }).lean()
    }

    async findUserByLoginOrEmail(loginOrEmail: string, emailOrLogin: string, ) {
        return this.userModel.findOne({
            $or: [
                { 'accountData.login': loginOrEmail },
                { 'accountData.email': emailOrLogin },]
        }).lean()
    }

    async findUserByEmailCode(confirmationCode: string){
        return this.userModel.findOne(
            {'emailConfirmation.code': confirmationCode }
        ).lean();
    }

    async findAllUsersByQuery(pagination:IPaginationAndSorting):Promise<TypePaginatorObject<TypeUserToView[]>> {
        const {pageNumber, pageSize, sortBy, sortDirection,
            searchNameTerm, searchLoginTerm, searchEmailTerm} = pagination;
        const filter: any = {};

        // Массив OR-условий для поиска
        const orFilters :any = [];

        if (searchNameTerm) {
            orFilters.push({ name: { $regex: searchNameTerm, $options: "i" } });
        }
        if (searchLoginTerm) {
            orFilters.push({ login: { $regex: searchLoginTerm, $options: "i" } });
        }
        if (searchEmailTerm) {
            orFilters.push({ email: { $regex: searchEmailTerm, $options: "i" } });
        }

        // Если есть хотя бы один searchTerm → добавляем $or
        if (orFilters.length > 0) {
            filter.$or = orFilters;
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