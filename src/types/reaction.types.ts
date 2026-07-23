export type TypeExtendedLikesInfo = {
    likesCount: number,
    dislikesCount: number,
    myStatus: ReactionType,
    newestLikes: TypeLikeDetails[]
}
export enum ReactionType  {
    like='Like',
    dislike='Dislike',
    none='None'
}
export type TypeLikeDetails = {
    addedAt:string,
    userId:string,
    login: string
}

export type TypeReaction = {
    entity_id: string,
    entity_type:EntitiesForReaction,
    user_id:string,
    status: ReactionType,
    added_at:Date
}
export function createReaction(entityId: string, entityType:EntitiesForReaction, userId: string, status: ReactionType):TypeReaction{
    return {
        entity_id: entityId,
        entity_type: entityType,
        user_id: userId,
        status: status,
        added_at: new Date()
    }
}
export type TypeReactionForView = {

}

export enum EntitiesForReaction {
    blog = 'blog',
    post = 'post',
    comment = 'comment',
}

export type TypeLikesInfoView = {
    likesCount: number,
    dislikesCount:  number,
    myStatus: ReactionType
}
export type TypeReactionInput ={
    likeStatus: ReactionType
}