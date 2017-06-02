const bindings = [
// all-commands MUST be bound to all queues (except internal) for retries
  {
    exchange: 'all-commands',
    target: 'queue.externalAPIHandler',
    keys: [ 'queue.externalAPIHandler' ]
  },
  {
    exchange: 'all-commands',
    target: 'internal.scheduleQ',
    keys: [ 'internal.scheduleQ' ]
  },

// ***********************
// Event Bindings   (NO KEYS FOR BINDINGS TO FANOUT EXCHANGES)
// ***********************

  {
    exchange: 'exchange.exchangeUpdated',
    target: 'queue.exchangeRankingHandler'
  },
  {
    exchange: 'exchange.exchangeUpdated',
    target: 'queue.historicalExchangeHandler'
  },

// Internal Bindings
  {
    exchange: 'internal.auditExchange',
    target: 'internal.auditQ',
    keys: [ 'internal.auditQ' ]
  },
  {
    exchange: 'internal.scheduleExchange',
    target: 'internal.scheduleQ'
  },
  {
    exchange: 'internal.delayExchange',
    target: 'internal.delayQ'
  },
  {
    exchange: 'internal.deadLetterExchange',
    target: 'internal.deadLetter'
  }
]

module.exports = bindings
