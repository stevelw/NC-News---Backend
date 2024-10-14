exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status){
        res.status(err.status).send({ msg: err.msg })
    } else {
        next(err)
    }
}

exports.handleServerErros = (err, req, res, next) => {
    console.log(err,"< unhandled error")
    res.status(500).send({ msg: "unknown server error" })
}