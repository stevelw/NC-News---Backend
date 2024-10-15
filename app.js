const express = require('express')
const app = express()
const { getTopics } = require('./controllers/topics.controller')
const { handleCustomErrors, handleServerErros, handlePsqlErrors} = require('./server-error-handling')
const { getEndpoints } = require('./controllers/api.controller')
const { getArticleWithId, getArticles } = require('./controllers/articles.controller')
const { getCommentsForArticle } = require('./controllers/comments.controller')

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticleWithId)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsForArticle)

app.all('*', (req, res, next) => {
    const err = new Error(`Invalid endpoint`)
    err.status = 404
    err.msg = 'Invalid endpoint. Check /api for a list of all available endpoints.'
    next(err)
})

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErros)

module.exports = app
