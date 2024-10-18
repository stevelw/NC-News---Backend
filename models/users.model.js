const db = require('../db/connection')

exports.getUsers = ( username ) => {
    const query = {
        text: `
            SELECT username, name, avatar_url
            FROM users
            `,
        values: []
    }
    
    if ( username ) {
        query.text += `
        WHERE username = $1
        `
        query.values.push(username)
    }
    
    return db.query(query)
    .then( results => {
        if ( username ) {
            if ( !results.rowCount ) return Promise.reject({ status: 404, msg: 'User not found' })
            return results.rows[0]
        } else {
            return results.rows
        }
    })
}