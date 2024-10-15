const db = require('../db/connection')
const format = require('pg-format')
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

exports.addCommentToArticleForUser = (comment, article_id, username) => {
    if (!username || !comment) return Promise.reject({ status: 400, msg: 'Missing inputs' })
    const formattedQuery = format(`
        INSERT INTO comments
            (body, article_id, author)
        VALUES
            %L
        RETURNING comment_id, votes, created_at, author, body, article_id
        `, [[comment, article_id, username]])
        return db.query(formattedQuery)
        .then(({ rows }) => {
        return rows[0]
    })
}