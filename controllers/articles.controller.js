const articlesModel = require("../models/articles.model")

exports.getArticleWithId = (req, res, next) => {
    const articleId = req.params.article_id
    return articlesModel.getArticleWithId(articleId)
    .then( article => {
        res.status(200).send({ article })

    })
    .catch( err => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    return articlesModel.getArticles()
    .then( articles => {
        res.status(200).send({ articles })
    })
    .catch( err => {
        next(err)
    })
}
}