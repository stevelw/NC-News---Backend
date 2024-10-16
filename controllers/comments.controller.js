const commentsModel = require("../models/comments.model")

exports.getCommentsForArticle = (req, res, next) => {
    const articleId = req.params.article_id
    return commentsModel.getCommentsForArticle(articleId)
    .then(comments => {
        res.status(200).send({ comments })
    })
    .catch(err => {
        next(err)
    })
}

exports.addNewComment = (req, res, next) => {
    const articleId = req.params.article_id
    const username = req.body.username
    const comment = req.body.body
    return commentsModel.addCommentToArticleForUser(comment, articleId, username)
    .then( comment => {
        res.status(201).send({ comment })
    })
    .catch(err => next(err))
}

exports.deleteComment = (req, res, next) => {
    const commentId = req.params.comment_id
    
    return commentsModel.deleteCommentWithId(commentId)
    .then( () => {
        res.status(204).send()
    })
    .catch( err => next(err))
}