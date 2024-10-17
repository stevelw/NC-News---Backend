const db = require('../db/connection')
const format = require('pg-format')

exports.getArticleWithId = (articleId) => {
    return db.query(`
        SELECT articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id
        LIMIT 1
        `, [articleId])
        .then((results) => {
            if (!results.rowCount) return Promise.reject({ status: 404, msg: 'Article not found'})
            return results.rows[0]
        })
}

exports.getArticles = (topic, sortBy = 'created_at', order = 'desc') => {
    const allowedSortBys = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count']
    const allowedOrders = ['ASC', 'DESC']
    sortBy = sortBy.toLowerCase()
    order = order.toUpperCase()
    if (!allowedSortBys.includes(sortBy) || !allowedOrders.includes(order)) {
        return Promise.reject({ status: 400, msg: 'Invalid input'})
    }

    const queryVals = []
    let queryStr = `
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT as comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    `
    
    if ( topic ) {
        queryVals.push(topic)
        queryStr += `
        WHERE topic = $${queryVals.length}
        `
    }
    
    queryStr += format(`
        GROUP BY articles.article_id
        ORDER BY %I %s
        `, sortBy, order)

    return db.query(queryStr, queryVals)
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