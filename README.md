# Northcoders News - Backend

**An example backend for a social news site.**

A _'production'_ version is hosted at [nc-news-gjzo.onrender.com](https://nc-news-gjzo.onrender.com/api). When this example server is not in use it is spun down, so it may take up to a minute for the first request to respond.

I built this as a portfolio project while on the _[Northcoders](https://northcoders.com) JavaScript full-stack course_. A seeded database was provided _(commit 9d279)_, after which all code is my own.

- The runtime environment is **Node.js**
- Testing uses the **Jest** and **Supertest** frameworks
- Server functions use **Express**
- Database functions use **PostgreSQL**

A list of endpoints is available from [/api](https://nc-news-gjzo.onrender.com/api)

## How to run and test locally

Requires [PostgreSQL](https://www.postgresql.org/download/) _v14.12+_ and [Node.js](https://nodejs.org/en/download/package-manager) _v22.3.0+_

1. Clone the repo from [github.com/stevelw/be-nc-news](https://github.com/stevelw/be-nc-news)

    `git clone https://github.com/stevelw/be-nc-news`

2. Setup the environment

    Create three _.env_ files in the root directory (only `.env.test` is needed to run the tests):
    
    1. `.env.test` with `PGDATABASE=[YOUR-TEST-DATABASE-NAME]`
    2. `.env.development` with `PGDATABASE=[YOUR-DEVELOPMENT-DATABASE-NAME]`
    3. `.env.production` with `DATABASE_URL=[YOUR-SERVER-URL]`

3. Install the development dependencies

    `npm install -d`

4. Setup the database

    `npm run setup-dbs`

    There is no need to seed the test database manually.

5. Run tests

    `npm test` or simply `npm t`

If you also wish to run the development environment locally, do the following:

1. Seed the development database

    `npm run seed`
    
2. Launch the local server

    `node listen.js`

    The default port is **9090**
