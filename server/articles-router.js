const articlesRouter = require("express").Router();
const {
  getArticleWithId,
  getArticles,
  patchArticle,
  createArticle,
  deleteArticle,
} = require("../controllers/articles.controller");
const { getCommentsForArticle, addNewComment } = require('../controllers/comments.controller')

articlesRouter.get('/', getArticles)
articlesRouter.post('/', createArticle)

articlesRouter.route('/:article_id')
    .get(getArticleWithId)
    .patch(patchArticle)
    .delete(deleteArticle);

articlesRouter.route('/:article_id/comments')
    .get(getCommentsForArticle)
    .post(addNewComment)

module.exports = articlesRouter