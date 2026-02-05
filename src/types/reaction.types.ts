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
    addedAt:Date,
    userId:string,
    login: string
}

export type TypeReaction = {
    entityId: string,
    entityType:EntitiesForReaction,
    userId:string,
    status: ReactionType,
    addedAt:Date
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