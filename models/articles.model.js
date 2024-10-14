const db = require('../db/connection')

exports.getArticleWithId = (articleId) => {
    return db.query(`
        SELECT author, title, article_id, body, topic, created_at, votes, article_img_url
        FROM articles
        WHERE article_id = $1
        LIMIT 1
        `, [articleId])
        .then((results) => {
            if (!results.rowCount) return Promise.reject({ status: 404, msg: 'Article not found'})
            return results.rows[0]
        })
}