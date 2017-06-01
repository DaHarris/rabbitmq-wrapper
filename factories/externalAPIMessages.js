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

module.exports = {
  updateTickerCmd: updateTickerCmd
}
