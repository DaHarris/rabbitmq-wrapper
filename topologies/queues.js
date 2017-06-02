const queues = [
// Subscribe must be FALSE, calling service toggles appropriate subscriptions to TRUE
  {
    name: 'queue.externalAPIHandler',
    autoDelete: false,
    subscribe: false,
    limit: 500
  },

// Historical Queues
  {
    name: 'queue.historicalExchangeHandler',
    autoDelete: false,
    subscribe: false,
    limit: 500
  },

// Exchange Ranking Queues
  {
    name: 'queue.exchangeRankingHandler',
    autoDelete: false,
    subscribe: false,
    limit: 500
  },

// Internal Queues
  {
    name: 'internal.delayQ',
    autoDelete: false,
    subscribe: false,
    limit: 500
  },
  {
    name: 'internal.deadLetter',
    autoDelete: false,
    subscribe: false,
    limit: 500
  },
  {
    name: 'internal.auditQ',
    autoDelete: false,
    subscribe: false,
    limit: 500
  },
  {
    name: 'internal.scheduleQ',
    autoDelete: false,
    subscribe: false,
    limit: 500
  }
]

module.exports = queues
