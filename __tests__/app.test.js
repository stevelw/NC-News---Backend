const request = require('supertest')
const app = require("../app");
const connection = require('../db/connection')
const seed = require('../db/seeds/seed');

const testData = require('../db/data/test-data');
const endpointsData = require('../endpoints.json');

beforeEach(() => seed(testData))

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
                expect(topics).toEqual(testData.topicData)
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
                    expect(articles).toHaveLength(testData.articleData.length)
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
                    expect(articles).toHaveLength(testData.articleData.length)
                })
        })
        it('Articles include a comment_count computed property', () => {
            const exampleArticleId = 2
            const expectedCommentCount = 0
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles }}) => {
                    expect(articles).toHaveLength(testData.articleData.length)
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
                    expect(articles).toHaveLength(testData.articleData.length)
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
    describe('POST - 201', () => {
        it('adds a comment to an article and returns the posted comment', () => {
            const exampleComment = {
                article_id: 1,
                username: "butter_bridge",
                body: "What a lovely article!"
            }
            return request(app).post('/api/articles/' + exampleComment.article_id + '/comments').send(exampleComment)
            .expect(201)
            .then(({ body: { comment } }) => {
                expect(comment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: 0,
                    created_at: expect.any(String),
                    author: exampleComment.username,
                    body: exampleComment.body,
                    article_id: exampleComment.article_id
                })
            })
        })
    })
    describe(`POST - 404`, () => {
        it(`article doesn't exist`, () => {
            const exampleComment = {
                invalidArticle_id: 999999999,
                username: "butter_bridge",
                body: "What a lovely article!"
            }
            return request(app).post('/api/articles/' + exampleComment.invalidArticle_id + '/comments').send(exampleComment)
            .expect(404)
            .then(({ body: { msg }}) => {
                expect(msg).toBe(`Article doesn't exist`)
            })
        })
        it(`username doesn't exist`, () => {
            const exampleComment = {
                article_id: 1,
                username: "not-a-user",
                body: "What a lovely article!"
            }
            return request(app).post('/api/articles/' + exampleComment.article_id + '/comments').send(exampleComment)
            .expect(404)
            .then(({ body: { msg }}) => {
                expect(msg).toBe('No such user')
            })
        })
    })
    describe(`POST - 400 - invalid inputs`, () => {
        it('rejects invalid article_id', () => {
            const exampleComment = {
                username: "butter_bridge",
                body: "What a lovely article!"
            }
            return Promise.all(
                [
                    request(app).post('/api/articles/' + 2147483648 + '/comments').send(exampleComment), // Max range for PSQL SERIAL is 1 to 2,147,483,647
                    request(app).post('/api/articles/' + 'not-an-int' + '/comments').send(exampleComment)
                ])
                .then(results => {
                    results.forEach(result => {
                        expect(result.status).toBe(400)
                        expect(result.body.msg).toBe('Invalid input')
                    })
                })
        })
        it('rejects missing username', () => {
            const exampleArticleId = 4
            const missingUsernameExampleComment = {
                body: "What a lovely article!"
            }
            return request(app).post('/api/articles/' + exampleArticleId + '/comments').send(missingUsernameExampleComment)
            .then(result => {
                expect(result.status).toBe(400)
                expect(result.body.msg).toBe('Missing inputs')
            })
        })
        it('rejects missing body', () => {
            const exampleArticleId = 4
            const missingBodyExampleComment = {
                username: "butter_bridge"
            }
            return request(app).post('/api/articles/' + exampleArticleId + '/comments').send(missingBodyExampleComment)
            .then(result => {
                expect(result.status).toBe(400)
                expect(result.body.msg).toBe('Missing inputs')
            })
        })
    })
})
