const { getTopics: modelGetTopics } = require('../models/topics.model')

exports.getTopics = async (req, res, next) => {
    const topics = await modelGetTopics()
    res.status(200).send({ topics })
}