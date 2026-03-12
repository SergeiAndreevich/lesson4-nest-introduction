import {TypeBlogToView} from "../types/blog.types";
import {BlogDocument} from "../blogsLogic/blogs/schema/blog.schema";

export function mapBlogToView (blog: BlogDocument):TypeBlogToView{
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership
    }
}