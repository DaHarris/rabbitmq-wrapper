const exchanges = require('./topologies/exchanges')
const queues = require('./topologies/queues')
const bindings = require('./topologies/bindings')

const topology = {
  connection: {},
  exchanges: exchanges,
  queues: queues,
  bindings: bindings
}

module.exports = topology
