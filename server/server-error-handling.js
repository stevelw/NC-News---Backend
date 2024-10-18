exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status){
        res.status(err.status).send({ msg: err.msg })
    } else {
        next(err)
    }
}

exports.handlePsqlErrors = (err, req, res, next) => {
    switch (err.code) {
        case '22003': // numeric_value_out_of_range
        case '22P02': // invalid_text_representation
            res.status(400).send({ msg: 'Invalid input'})
            break;
        case '23503': // foreign_key_violation
            if (err.detail.includes('article_id')) {
                res.status(404).send({ msg: `Article doesn't exist` })
            } else if (err.detail.includes('author')) {
                res.status(400).send({ msg: 'No such user' })
            } else {
                res.status(404).send({ msg: `foreign_key_violation` })
            }
            break;
        case '23502': // not_null_violation
            res.status(400).send({ msg : 'Invalid request' })
            break;
        default:
            next(err)
            break;
    }
}

exports.handleServerErros = (err, req, res, next) => {
    console.log(err,"< unhandled error")
    res.status(500).send({ msg: "unknown server error" })
}