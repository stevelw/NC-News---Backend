const db = require('../db/connection')
const format = require('pg-format')
const { topicExists } = require('./topics.model')
const { validImageURL } = require('../utils')

exports.getArticleWithId = (articleId) => {
    return db.query(`
        SELECT articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id
        `, [articleId])
        .then(({ rowCount, rows }) => {
            if (!rowCount) return Promise.reject({ status: 404, msg: 'Article not found' })
            return rows[0]
        })
}

exports.getArticles = (topic, sortBy = 'created_at', order = 'desc') => {
    const allowedSortBys = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count']
    const allowedOrders = ['ASC', 'DESC']
    sortBy = sortBy.toLowerCase()
    order = order.toUpperCase()
    if (!allowedSortBys.includes(sortBy) || !allowedOrders.includes(order)) {
        return Promise.reject({ status: 400, msg: 'Invalid input' })
    }

    const queryVals = []
    let queryStr = `
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT as comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    `

    if (topic) {
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

exports.adjustVotesForArticleBy = (articleId, adjustment) => {
    return db.query(`
        UPDATE articles
        SET votes = votes + $2
        WHERE article_id = $1
        RETURNING author, title, article_id, body, topic, created_at, votes, article_img_url
        `, [articleId, adjustment])
        .then((results) => {
            if (!results.rowCount) return Promise.reject({ status: 404, msg: 'Article not found' })
            return results.rows[0]
        })
}

exports.create = (article) => {
    const { author, title, body, topic } = article
    var { article_img_url } = article

    if (article_img_url && !validImageURL(article_img_url)) return Promise.reject({ status: 400, msg: 'Invalid image URL' })
    article_img_url = article_img_url ?? 'https://commons.wikimedia.org/wiki/File:Blue_Tiles_-_Free_For_Commercial_Use_-_FFCU_(26777905945).jpg'

    const query = {
        text: `
        WITH inserted_article as (
            INSERT INTO articles
                (author, title, body, topic, article_img_url)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING *
        ) SELECT inserted_article.author, title, inserted_article.body, topic, article_img_url, inserted_article.article_id, inserted_article.votes, inserted_article.created_at, COUNT(comment_id)::INT AS comment_count
        FROM inserted_article
        LEFT JOIN comments ON inserted_article.article_id = comments.article_id
        GROUP BY inserted_article.article_id, inserted_article.author, title, inserted_article.body, topic, article_img_url, inserted_article.votes, inserted_article.created_at
        `,
        values: [author, title, body, topic, article_img_url]
    }
    return db.query(query)
        .then(({ rows }) => {
            return rows[0]
        })
}