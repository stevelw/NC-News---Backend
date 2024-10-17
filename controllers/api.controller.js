const endpoints = require('../server/endpoints.json')

function getEndpoints ( req, res, next ) {
    res.status(200).send({ endpoints })
}

module.exports = getEndpoints