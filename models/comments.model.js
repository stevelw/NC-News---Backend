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

exports.deleteCommentWithId = ( commentId ) => {
    return db.query(`
        DELETE
        FROM comments
        WHERE comment_id = $1
        RETURNING comment_id
        `, [commentId])
        .then( ({ rows : deletedComments }) => {
            if (deletedComments.length === 0) return Promise.reject({ status : 404, msg : 'No such comment' })
        })
}