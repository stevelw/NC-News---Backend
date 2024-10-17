const articlesRouter = require("express").Router();

const { getArticleWithId, getArticles, patchArticle } = require('../controllers/articles.controller')
const { getCommentsForArticle, addNewComment } = require('../controllers/comments.controller')

articlesRouter.get('/', getArticles)

articlesRouter.route('/:article_id')
    .get(getArticleWithId)
    .patch(patchArticle)

articlesRouter.route('/:article_id/comments')
    .get(getCommentsForArticle)
    .post(addNewComment)

module.exports = articlesRouter