const db = require('../db/connection')

exports.getUsers = () => {
    return db.query(`
        SELECT username, name, avatar_url
        FROM users
        `)
    .then(({ rows : users }) => {
        return users
    })
}