const RabbotRapper = require('./rabbotRapper')
const rabbitClient = require('rabbot')
module.exports = new RabbotRapper(rabbitClient)
