const usersModel = require("../models/users.model")

exports.getUsers = ( req, res, next ) => {
    return usersModel.getUsers()
    .then( users => {
        res.status(200).send({ users })
    })
    .catch( err => next(err))
}