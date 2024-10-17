const articlesRouter = require("express").Router();

const { getArticleWithId, getArticles, patchArticle } = require('../controllers/articles.controller')
const { getCommentsForArticle, addNewComment } = require('../controllers/comments.controller')

articlesRouter.get('/', getArticles)

articlesRouter.get('/:article_id', getArticleWithId)
articlesRouter.patch('/:article_id', patchArticle)

articlesRouter.get('/:article_id/comments', getCommentsForArticle)
articlesRouter.post('/:article_id/comments', addNewComment)

module.exports = articlesRouter