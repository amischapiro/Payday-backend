const express = require('express')
const { login, signup, logout, getGoogleId } = require('./auth.controller')

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.get('/googleid', getGoogleId)

module.exports = router