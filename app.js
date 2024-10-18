const express = require('express')
const app = express()
const { handleCustomErrors, handleServerErros, handlePsqlErrors } = require('./server/server-error-handling')
const getEndpoints = require('./controllers/api.controller')
const apiRouter = require("./server/api-router");

app.use(express.json())

app.use("/api", apiRouter);

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
