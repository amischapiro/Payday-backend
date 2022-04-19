const express = require('express')
const router = express.Router({ mergeParams: true })
const { getActivities, addActivity, removeActivity } = require('./activity.controller')

router.route('/')
    .get(getActivities)
    .post(addActivity)

router.route('/:id')
    .delete(removeActivity)


module.exports = router