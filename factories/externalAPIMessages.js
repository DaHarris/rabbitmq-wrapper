const updateTickerCmd = (exchange) => {
  return {
    exchange: 'all-commands',
    type: 'command.externalAPI.updateTicker',
    payload: {
      exchange: exchange
    }
  }
}

module.exports = {
  updateTickerCmd: updateTickerCmd
}
