const express = require('express')
const app = express()
const { getTopics } = require('./controllers/topics.controller')
const { handleCustomErrors, handleServerErros} = require('./server-error-handling')

app.get('/api/topics', getTopics)

app.all('*', (req, res, next) => {
    const err = new Error(`Invalid endpoint`)
    err.status = 404
    err.msg = 'Invalid endpoint. Check /api for a list of all available endpoints.'
    next(err)
})

app.use(handleCustomErrors)

app.use(handleServerErros)

module.exports = app
