const db = require('../db/connection')
const { getArticleWithId } = require('./articles.model')

exports.getCommentsForArticle = ( articleId ) => {
    return db.query(`
        SELECT comment_id, votes, created_at, author, body, article_id
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at
        `, [articleId])
    .then(({ rows: comments }) => {
        if (!comments.length) {
            return Promise.all([
                getArticleWithId(articleId),
                comments
            ])
            .then(([,comments]) => {
                return comments
            })
        } else {
            return comments
        }
    })
}