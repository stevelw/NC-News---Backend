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