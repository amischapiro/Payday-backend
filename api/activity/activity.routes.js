const express = require('express')
const router = express.Router({ mergeParams: true })
const { getActivities, addActivity, removeActivitiesByBoard } = require('./activity.controller')

router.route('/')
    .get(getActivities)
    .post(addActivity)
    .delete(removeActivitiesByBoard)


module.exports = router