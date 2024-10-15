const request = require('supertest')
const app = require("../app");
const connection = require('../db/connection')

const { topicData, articleData, commentData } = require('../db/data/test-data');
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
                expect(article).toMatchObject({
                    author: expect.any(String),
                    title: expect.any(String),
                    article_id: expect.any(Number),
                    body: expect.any(String),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String)
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

describe('api/articles', () => {
    describe('GET - 200', () => {
        it('Returns an array of articles', () => {
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles }}) => {
                    expect(articles).toHaveLength(articleData.length)
                    articles.forEach(article => {
                        expect(article).toMatchObject({
                            author: expect.any(String),
                            title: expect.any(String),
                            article_id: expect.any(Number),
                            topic: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            article_img_url: expect.any(String),
                        })
                    })
                })
        })
        it('All articles are returned', () => {
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles }}) => {
                    expect(articles).toHaveLength(articleData.length)
                })
        })
        it('Articles include a comment_count computed property', () => {
            const exampleArticleId = 2
            const expectedCommentCount = 0
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles }}) => {
                    expect(articles).toHaveLength(articleData.length)
                    articles.forEach(article => {
                        if ( article.article_id === exampleArticleId ) expect( article.comment_count ).toBe(expectedCommentCount)
                        expect(article).toMatchObject({
                            comment_count: expect.any(Number)
                        })
                    })
                })
        })
        it('Articles are sorted by date in descending order', () => {
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles }}) => {
                    expect(articles).toBeSortedBy('created_at', { descending: true})
                })
        })
        it('does not return a body property for the articles', () => {
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles }}) => {
                    expect(articles).toHaveLength(articleData.length)
                    articles.forEach(article => {
                        expect(article).not.toHaveProperty('body')
                    })
                })
        })
    })
})

describe('api/articles/:article_id/comments', () => {
    describe('GET - 200', () => {
        it('returns all comments for an article, with expected properties', () => {
            const exampleArticleId = 1
            const expectedNumberOfComments = 11
            return request(app).get('/api/articles/' + exampleArticleId + '/comments')
                .expect(200)
                .then(({ body: { comments }}) => {
                    expect(comments).toHaveLength(expectedNumberOfComments)
                    comments.forEach( comment => {
                        expect(comment).toMatchObject({
                            comment_id: expect.any(Number),
                            votes: expect.any(Number),
                            created_at: expect.any(String),
                            author: expect.any(String),
                            body: expect.any(String),
                            article_id: exampleArticleId
                        })
                    })
                })
        })
        it('sorts comments by descending created_at', () => {
            const exampleArticleId = 1
            const expectedNumberOfComments = 11
            return request(app).get('/api/articles/'+ exampleArticleId + '/comments')
                .expect(200)
                .then(({ body: { comments }}) => {
                    expect(comments).toBeSortedBy("created_at")
                })
        })
    })
    it(`GET - 404 - article doesn't exist`, () => {
        return request(app).get('/api/articles/' + 999999999 + '/comments')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Article not found')
        })
    })
    it('GET - 400 - ID not a +ve integer in range', () => {
        return Promise.all(
            [
                request(app).get('/api/articles/' + 2147483648 + '/comments'), // Max range for PSQL SERIAL is 1 to 2,147,483,647
                request(app).get('/api/articles/' + 'not-an-int' + '/comments')
            ])
            .then(results => {
                results.forEach(result => {
                    expect(result.status).toBe(400)
                    expect(result.body.msg).toBe('Invalid input')
                })
            })
    })
})