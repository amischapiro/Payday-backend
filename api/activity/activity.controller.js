const logger = require('../../services/logger.service');
const activityService = require('./activity.service')
const colors = require('colors')

const getActivities = async (req, res) => {
    try {
        const { limit, skip, storyId } = req.query
        const { boardId } = req.params
        const activities = await activityService.query(skip, limit, boardId, storyId)
        res.status(200).json(activities)
    } catch (err) {
        logger.error('Failed to get activities', err)
        res.status(500).send({ err: 'Failed to get activities' })
    }
}


async function addActivity(req, res) {
    try {
        const { activity } = req.body
        const insertedId = await activityService.add(activity)
        res.status(201).json({ insertedId })
    } catch (err) {
        logger.error('Failed to add activity', err)
        res.status(500).send({ err: 'Failed to add activity' })
    }
}



async function removeActivity(req, res) {

}

module.exports = {
    getActivities,
    addActivity,
    removeActivity
}