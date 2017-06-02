const updateTickerCmd = (exchange, updateVersion) => {
  return {
    exchange: 'all-commands',
    type: 'command.externalAPI.updateTicker',
    payload: {
      exchange: exchange,
      updateVersion: updateVersion
    }
  }
}

const exchangeUpdatedEvent = (exchange, tickers, timeStamp) => {
  return {
    exchange: 'exchange.exchangeUpdated',
    type: 'event.externalAPI.exchangeUpdated',
    payload: {
      exchange: exchange,
      tickers: tickers,
      timeStamp: timeStamp
    }
  }
}

module.exports = {
  updateTickerCmd,
  exchangeUpdatedEvent
}
