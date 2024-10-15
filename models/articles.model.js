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

exports.getArticles = () => {
    return db.query(`
        SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(*) as comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC
        `)
        .then(({ rows: articles }) => {
            articles.forEach( article => {
                article.comment_count = Number(article.comment_count)
            })
            return articles
        })
}