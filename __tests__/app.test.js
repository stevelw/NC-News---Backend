const request = require('supertest')
const app = require("../app");
const { topicData } = require('../db/data/test-data');
const connection = require('../db/connection')

afterAll(() => connection.end())

describe('/api/topics', () => {
    it('GET - 200 - Returns all topics', () => {
        return request(app).get('/api/topics')
            .expect(200)
            .then(({ body: { topics } }) => {
                expect(topics).toEqual(topicData)
            })
    })
})