exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status){
        res.status(err.status).send({ msg: err.msg })
    } else {
        next(err)
    }
}

exports.handlePsqlErrors = (err, req, res, next) => {
    if (err.code = '22003') { // numeric_value_out_of_range
        res.status(400).send({ msg: 'Invalid input'})
    } else {
        next(err)
    }
}

exports.handleServerErros = (err, req, res, next) => {
    console.log(err,"< unhandled error")
    res.status(500).send({ msg: "unknown server error" })
}