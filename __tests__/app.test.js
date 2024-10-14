const request = require('supertest')
const app = require("../app");
const connection = require('../db/connection')

const { topicData } = require('../db/data/test-data');
const endpointsData = require('../endpoints.json')

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

describe('/api', () => {
    it('GET - 200 - Returns api documentation JSON', () => {
        return request(app).get('/api')
            .expect(200)
            .then(({ body: { endpoints } }) => {
                expect(endpoints).toEqual(endpointsData)
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

describe('/api/articles/:article_id', () => {
    it('GET - 200 - Returns the article with ID provided', () => {
        return request(app).get('/api/articles/' + 1)
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toEqual({
                    author: "butter_bridge",
                    title: "Living in the shadow of a great man",
                    article_id: 1,
                    body: "I find this existence challenging",
                    topic: "mitch",
                    created_at: "2020-07-09T20:11:00.000Z", // converted from 1594329060000; seed JSON uses epoch
                    votes: 100,
                    article_img_url:
      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                })
            })
    })
    it('GET - 404 - ID not found', () => {
        return request(app).get('/api/articles/' + 999999999)
            .expect(404)
            .then(({ body: { msg }}) => {
                expect(msg).toBe('Article not found')
            })
    })
    it('GET - 400 - ID not a +ve integer in range', () => {
        return Promise.all(
            [
                request(app).get('/api/articles/' + 2147483648), // Max range for PSQL SERIAL is 1 to 2,147,483,647
                request(app).get('/api/articles/' + 'not-an-int')
            ])
            .then(results => {
                results.forEach(result => {
                    expect(result.status).toBe(400)
                    expect(result.body.msg).toBe('Invalid input')
                })
            })
    })
})
