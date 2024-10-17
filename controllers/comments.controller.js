const commentsModel = require("../models/comments.model")

exports.getCommentsForArticle = (req, res, next) => {
    return commentsModel.getCommentsForArticle(req.params.article_id)
    .then(comments => {
        res.status(200).send({ comments })
    })
    .catch(err => {
        next(err)
    })
}

exports.addNewComment = (req, res, next) => {
    const { params: { article_id }, body: { username, body: comment } } = req
    
    return commentsModel.addCommentToArticleForUser(comment, article_id, username)
    .then( comment => {
        res.status(201).send({ comment })
    })
    .catch(err => next(err))
}

exports.deleteComment = (req, res, next) => {
    return commentsModel.deleteCommentWithId(req.params.comment_id)
    .then( () => {
        res.status(204).send()
    })
    .catch( err => next(err))
}