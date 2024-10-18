const usersRouter = require("express").Router();
const { getUsers } = require('../controllers/users.controller');

usersRouter.get('/(:username)?', getUsers)

module.exports = usersRouter