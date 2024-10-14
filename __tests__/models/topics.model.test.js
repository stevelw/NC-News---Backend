const { getTopics } = require("../../models/topics.model");
const testData = require('../../db/data/test-data')
const seed = require('../../db/seeds/seed')
const db = require('../../db/connection')

beforeEach(() => {
    seed(testData).then(() => db.end())
})

describe('topics model', () => {
    describe('getTopics', () => {
        it('returns an array of all the topics', () => {
            getTopics().then((result) => {
                expect(result).toEqual([
                    {
                        description: 'The man, the Mitch, the legend',
                        slug: 'mitch'
                    },
                    {
                        description: 'Not dogs',
                        slug: 'cats'
                    },
                    {
                        description: 'what books are made of',
                        slug: 'paper'
                    }
                ])
            })
        })
    })
})