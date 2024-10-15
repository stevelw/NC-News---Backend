const articlesModel = require("../models/articles.model")

exports.getArticleWithId = async (req, res, next) => {
    const articleId = req.params.article_id
    try {
        const article = await articlesModel.getArticleWithId(articleId)
        res.status(200).send({ article })
    } catch (err) {
        next(err)
    }
}

exports.getArticles = async (req, res, next) => {
    try {
        const articles = await articlesModel.getArticles()
        res.status(200).send({ articles })
    } catch (err) {
        next(err)
    }
}