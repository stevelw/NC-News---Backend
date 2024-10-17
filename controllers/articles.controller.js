const articlesModel = require("../models/articles.model")

exports.getArticleWithId = (req, res, next) => {
    return articlesModel.getArticleWithId(req.params.article_id)
    .then( article => {
        res.status(200).send({ article })

    })
    .catch( err => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query

    return articlesModel.getArticles(topic, sort_by, order)
    .then( articles => {
        res.status(200).send({ articles })
    })
    .catch( err => {
        next(err)
    })
}

exports.patchArticle = ( req, res, next ) => {
    const { params: { article_id }, body: { inc_votes } } = req

    return articlesModel.adjustVotesForArticleBy( article_id, inc_votes)
    .then( updatedArticle => {
        res.status(200).send({ updatedArticle })
    })
    .catch( err => {
        next(err)
    })
}