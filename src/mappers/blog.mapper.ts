import {TypeBlog, TypeBlogToView} from "../types/blog.types";
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

export function mapBlogToViewSA(blog: TypeBlog):TypeBlogToView{
    return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.website_url,
        createdAt: blog.created_at.toISOString(),
        isMembership: blog.is_membership
    }
}