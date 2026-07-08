import {CreateBlogDto} from "../blogsLogic/blogs/dto/create-blog.dto";
import {v4 as uuidv4} from "uuid";


export type TypeBlogToView = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean
}

export type TypeBlog = {
    id: string,
    name: string,
    description: string,
    website_url: string,
    created_at: Date,
    is_membership: boolean
}

export function createBlog(dto:CreateBlogDto) {
    return {
        id: uuidv4(),
        name: dto.name,
        description: dto.description,
        website_url: dto.websiteUrl,
        created_at: new Date(),
        is_membership: false
    }
}