const commentsModel = require("../models/comments.model")

exports.getCommentsForArticle = (req, res, next) => {
    const { article_id: articleId } = req.params
    return commentsModel.getCommentsForArticle(articleId)
    .then(comments => {
        res.status(200).send({ comments })
    })
    .catch(err => {
        next(err)
    })
}

exports.addNewComment = (req, res, next) => {
    const { params: { article_id: articleId }, body: { username, body: comment } } = req
    
    return commentsModel.addCommentToArticleForUser(comment, articleId, username)
    .then( comment => {
        res.status(201).send({ comment })
    })
    .catch(err => next(err))
}

exports.deleteComment = (req, res, next) => {
    const { comment_id: commentId } = req.params
    
    return commentsModel.deleteCommentWithId(commentId)
    .then( () => {
        res.status(204).send()
    })
    .catch( err => next(err))
}