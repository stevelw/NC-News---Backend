const usersModel = require("../models/users.model")

exports.getUsers = ( req, res, next ) => {
    const { username } = req.params
    return usersModel.getUsers(username)
    .then( result => {
        const objProperty = ( username ) ? 'user' : 'users'
        res.status(200).send({ [objProperty]: result })
    })
    .catch( err => next(err))
}