const exchanges = [
  {
    name: 'all-commands',
    type: 'direct',
    autoDelete: false,
    persistent: true
  },

// Internal Exchanges
  {
    name: 'internal.delayExchange',
    type: 'fanout',
    autoDelete: false,
    persistent: true
  },
  {
    name: 'internal.deadLetterExchange',
    type: 'fanout',
    autoDelete: false,
    persistent: true
  },
  {
    name: 'internal.auditExchange',
    type: 'direct',
    autoDelete: false,
    persistent: true
  },
  {
    name: 'internal.scheduleExchange',
    type: 'fanout',
    autoDelete: false,
    persistent: true
  }
]

module.exports = exchanges
