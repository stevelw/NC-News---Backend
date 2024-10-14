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