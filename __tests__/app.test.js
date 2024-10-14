const request = require('supertest')
const app = require("../app");
const { topicData } = require('../db/data/test-data');
const connection = require('../db/connection')

afterAll(() => connection.end())

describe(`Endpoint doesn't exist`, () => {
    it('GET - 404', () => {
        return request(app).get('/api/not-an-endpoint')
            .expect(404)
            .then(({ body : { msg }}) => {
                expect(msg).toBe('Invalid endpoint. Check /api for a list of all available endpoints.')
            })
    })
})

describe('/api/topics', () => {
    it('GET - 200 - Returns all topics', () => {
        return request(app).get('/api/topics')
            .expect(200)
            .then(({ body: { topics } }) => {
                expect(topics).toEqual(topicData)
            })
    })
})