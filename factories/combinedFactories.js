const externalAPIMessages = require('./externalAPIMessages')
const internalMessages = require('./internalMessages')

const MessageFactory = Object.assign(
  externalAPIMessages,
  internalMessages
)

module.exports = MessageFactory
