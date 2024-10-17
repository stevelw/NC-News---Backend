const endpoints = require('../server/endpoints.json')

exports.getEndpoints = (req, res, next) => {
    res.status(200).send({ endpoints })
}