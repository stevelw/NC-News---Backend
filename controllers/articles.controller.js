const articlesModel = require("../models/articles.model")

exports.getArticleWithId = (req, res, next) => {
    const { article_id: articleId } = req.params
    return articlesModel.getArticleWithId(articleId)
    .then( article => {
        res.status(200).send({ article })

    })
    .catch( err => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by: sortBy, order } = req.query

    return articlesModel.getArticles(topic, sortBy, order)
    .then( articles => {
        res.status(200).send({ articles })
    })
    .catch( err => {
        next(err)
    })
}

exports.patchArticle = ( req, res, next ) => {
    const { params: { article_id: articleId }, body: { inc_votes: voteAdjustment } } = req

    return articlesModel.adjustVotesForArticleBy( articleId, voteAdjustment)
    .then( updatedArticle => {
        res.status(200).send({ updatedArticle })
    })
    .catch( err => {
        next(err)
    })
}