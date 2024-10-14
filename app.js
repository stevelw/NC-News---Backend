const express = require('express')
const app = express()
const { getTopics } = require('./controllers/topics.controller')
const { handleCustomErrors, handleServerErros, handlePsqlErrors} = require('./server-error-handling')
const { getEndpoints } = require('./controllers/api.controller')
const { getArticleWithId } = require('./controllers/articles.controller')

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticleWithId)

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
