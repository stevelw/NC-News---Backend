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
            .then(({ body: { msg } }) => {
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

describe('/api/articles', () => {
    describe('GET - 200', () => {
        it('Returns an array of articles', () => {
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
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
                .then(({ body: { articles } }) => {
                    expect(articles).toHaveLength(testData.articleData.length)
                })
        })
        it('Articles include a comment_count computed property', () => {
            const exampleArticleId = 2
            const expectedCommentCount = 0
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toHaveLength(testData.articleData.length)
                    articles.forEach(article => {
                        if (article.article_id === exampleArticleId) expect(article.comment_count).toBe(expectedCommentCount)
                        expect(article).toMatchObject({
                            comment_count: expect.any(Number)
                        })
                    })
                })
        })
        describe('articles sorted by', () => {
            it('date in descending order by default', () => {
                return request(app).get('/api/articles')
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy('created_at', { descending: true })
                    })
            })
            it('provided sort_by query', () => {
                return request(app).get('/api/articles').query({ sort_by: 'votes' })
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy('votes', { descending: true })
                    })
            })
            it('provided order query', () => {
                return Promise.all([
                    request(app).get('/api/articles').query({ order: 'desc' }).expect(200),
                    request(app).get('/api/articles').query({ order: 'asc' }).expect(200)
                ])
                    .then(results => {
                        expect(results[0].body.articles).toBeSortedBy('created_at', { descending: true })
                        expect(results[1].body.articles).toBeSortedBy('created_at', { descending: false })
                    })
            })
        })
        it('does not return a body property for the articles', () => {
            return request(app).get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toHaveLength(testData.articleData.length)
                    articles.forEach(article => {
                        expect(article).not.toHaveProperty('body')
                    })
                })
        })
        describe('topic query', () => {
            it('uses a provided topic query to filter output', () => {
                return request(app).get('/api/articles').query({ topic: 'cats' })
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toHaveLength(1)
                        articles.forEach(({ topic }) => {
                            expect(topic).toBe('cats')
                        })
                    })
            })
            it('returns an empty list if the topic exists but no articles match', () => {
                return request(app).get('/api/articles').query({ topic: 'paper' })
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toHaveLength(0)
                    })
            })
            it(`returns an empty list if the topic isn't found`, () => {
                return request(app).get('/api/articles').query({ topic: 'not-a-valid-topic' })
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toHaveLength(0)
                    })
            })

        })
    })
    describe('GET - 400', () => {
        it('Rejects invalid sort_by queries', () => {
            return Promise.all(
                [
                    request(app).get('/api/articles').query({ sort_by: 'not-a-valid-column' }).expect(400),
                    request(app).get('/api/articles').query({ sort_by: 5 }).expect(400)
                ])
                .then(results => {
                    results.forEach(result => {
                        expect(result.body.msg).toBe('Invalid input')
                    })
                })
        })
        it('Rejects invalid order queries', () => {
            return Promise.all(
                [
                    request(app).get('/api/articles').query({ order: 'not-a-valid-order' }).expect(400),
                    request(app).get('/api/articles').query({ order: 5 }).expect(400)
                ])
                .then(results => {
                    results.forEach(result => {
                        expect(result.body.msg).toBe('Invalid input')
                    })
                })
        })
    })
})

describe('/api/articles/:article_id', () => {
    describe('GET - 200', () => {
        it('Returns the article with ID provided', () => {
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
        it('includes a comment count', () => {
            return request(app).get('/api/articles/' + 9)
                .expect(200)
                .then(({ body: { article } }) => {
                    expect(article).toMatchObject({
                        comment_count: 2
                    })
                })
        })
    })
    it('GET - 404 - ID not found', () => {
        return request(app).get('/api/articles/' + 999999999)
            .expect(404)
            .then(({ body: { msg } }) => {
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
    describe('PATCH - 200 - increases or decrease the vote property by .inc_votes and return the updated article', () => {
        it('increases', () => {
            const exampleArticleId = 4
            const increaseBy = 5
            var initialVotesValue
            return request(app).get('/api/articles/' + exampleArticleId)
                .then(({ body: { article: { votes } } }) => {
                    initialVotesValue = votes
                    const exampleBody = {
                        inc_votes: increaseBy
                    }
                    return request(app).patch('/api/articles/' + exampleArticleId).send(exampleBody)
                        .expect(200)
                })
                .then(({ body: { updatedArticle } }) => {
                    expect(updatedArticle).toMatchObject({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: exampleArticleId,
                        body: expect.any(String),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: initialVotesValue + increaseBy,
                        article_img_url: expect.any(String)
                    })
                })
        })
        it('decreases', () => {
            const exampleArticleId = 4
            const decreaseBy = 5
            var initialVotesValue
            return request(app).get('/api/articles/' + exampleArticleId)
                .then(({ body: { article: { votes } } }) => {
                    initialVotesValue = votes
                    const exampleBody = {
                        inc_votes: 0 - decreaseBy
                    }
                    return request(app).patch('/api/articles/' + exampleArticleId).send(exampleBody)
                        .expect(200)
                })
                .then(({ body: { updatedArticle } }) => {
                    expect(updatedArticle).toMatchObject({
                        article_id: exampleArticleId,
                        votes: initialVotesValue - decreaseBy
                    })
                })
        })
    })
    it('PATCH - 404 - article not found', () => {
        const exampleBody = {
            inc_votes: 5
        }
        return request(app).patch('/api/articles/' + 999999999).send(exampleBody)
            .expect(404)
            .then(({ body: { msg } }) => {
                expect(msg).toBe('Article not found')
            })
    })
    describe('PATCH 400', () => {
        it('Article ID is invalid', () => {
            const exampleBody = {
                inc_votes: 5
            }
            return Promise.all(
                [
                    request(app).patch('/api/articles/' + 2147483648).send(exampleBody), // Max range for PSQL SERIAL is 1 to 2,147,483,647
                    request(app).patch('/api/articles/' + 'not-an-int').send(exampleBody)
                ])
                .then(results => {
                    results.forEach(result => {
                        expect(result.status).toBe(400)
                        expect(result.body.msg).toBe('Invalid input')
                    })
                })
        })
        it('Body is missing', () => {
            const exampleArticleId = 4
            return request(app).patch('/api/articles/' + exampleArticleId)
                .then(result => {
                    expect(result.status).toBe(400)
                    expect(result.body.msg).toBe('Invalid request')
                })
        })
        it('.inc_votes is invalid', () => {
            const exampleArticleId = 4
            const invalidInc_votesExampleBody = {
                inc_votes: "Vote for me!"
            }
            return request(app).patch('/api/articles/' + exampleArticleId).send(invalidInc_votesExampleBody)
                .then(result => {
                    expect(result.status).toBe(400)
                    expect(result.body.msg).toBe('Invalid input')
                })
        })
    })
})

describe('/api/articles/:article_id/comments', () => {
    describe('GET - 200', () => {
        it('returns all comments for an article, with expected properties', () => {
            const exampleArticleId = 1
            const expectedNumberOfComments = 11
            return request(app).get('/api/articles/' + exampleArticleId + '/comments')
                .expect(200)
                .then(({ body: { comments } }) => {
                    expect(comments).toHaveLength(expectedNumberOfComments)
                    comments.forEach(comment => {
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
            return request(app).get('/api/articles/' + exampleArticleId + '/comments')
                .expect(200)
                .then(({ body: { comments } }) => {
                    expect(comments).toBeSortedBy("created_at")
                })
        })
    })
    it(`GET - 404 - article doesn't exist`, () => {
        return request(app).get('/api/articles/' + 999999999 + '/comments')
            .expect(404)
            .then(({ body: { msg } }) => {
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
                .then(({ body: { msg } }) => {
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
                .then(({ body: { msg } }) => {
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
                    expect(result.body.msg).toBe('Invalid request')
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
                    expect(result.body.msg).toBe('Invalid request')
                })
        })
    })
})

describe('/api/comments/:comment_id', () => {
    it('DELETE - 204 - deletes a comment by comment_id', () => {
        var startingNumberOfComments

        const exampleCommentId = 1
        const articleIdForComment = 9

        return request(app).get('/api/articles/' + articleIdForComment + '/comments')
            .then(({ body: { comments } }) => {
                startingNumberOfComments = comments.length
                return request(app).delete('/api/comments/' + exampleCommentId)
                    .expect(204)
            })
            .then(() => {
                return request(app).get('/api/articles/' + articleIdForComment + '/comments')
            })
            .then(({ body: { comments } }) => {
                expect(comments).toHaveLength(startingNumberOfComments - 1)
            })
    })
    it('DELETE - 404 - ID not found', () => {
        return request(app).delete('/api/comments/' + 999999999)
            .expect(404)
            .then(({ body: { msg } }) => {
                expect(msg).toBe('No such comment')
            })
    })
    it('DELETE - 400 - ID not valid', () => {
        return Promise.all(
            [
                request(app).delete('/api/comments/' + 2147483648), // Max range for PSQL SERIAL is 1 to 2,147,483,647
                request(app).delete('/api/comments/' + 'not-an-int')
            ])
            .then(results => {
                results.forEach(result => {
                    expect(result.status).toBe(400)
                    expect(result.body.msg).toBe('Invalid input')
                })
            })
    })
})

describe('/api/users', () => {
    it('GET - 200 - serves a list of all users', () => {
        return request(app).get('/api/users')
            .expect(200)
            .then(({ body: { users } }) => {
                expect(users).toHaveLength(testData.userData.length)
                users.forEach(user => {
                    expect(user).toMatchObject({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    })
                })
            })
    })
    describe('/api/users:username', () => {
        it('GET - 200 - Returns the user with username', () => {
            return request(app).get('/api/users/icellusedkars')
                .expect(200)
                .then(({ body: { user } }) => {
                    expect(user).toMatchObject({
                        username: 'icellusedkars',
                        avatar_url: 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4',
                        name: 'sam'
                    })
                })
        })
        it('GET - 404 - username not found', () => {
            return request(app).get('/api/users/notAValidUsername')
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe('User not found')
                })
        })
    })
})