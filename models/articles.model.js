const db = require('../db/connection')
const format = require('pg-format')

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

exports.getArticles = ( sortBy = 'created_at') => {
    const allowedSortBys = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count']
    sortBy = sortBy.toLowerCase()
    if (!allowedSortBys.includes(sortBy)) {
        return Promise.reject({ status: 400, msg: 'Invalid input'})
    }

    const formattedQuery = format(`
        SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT as comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY %I DESC
        `, sortBy)
    return db.query(formattedQuery)
        .then(({ rows: articles }) => {
            return articles
        })
}

exports.adjustVotesForArticleBy = ( articleId, adjustment ) => {
    return db.query(`
        UPDATE articles
        SET votes = votes + $2
        WHERE article_id = $1
        RETURNING author, title, article_id, body, topic, created_at, votes, article_img_url
        `, [ articleId, adjustment ])
        .then((results) => {
            if (!results.rowCount) return Promise.reject({ status: 404, msg: 'Article not found'})
            return results.rows[0]
        })
}