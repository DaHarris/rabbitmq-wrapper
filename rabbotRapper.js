const uuid = require('node-uuid')
const MessageFactory = require('./factories/combinedFactories')

const RabbotRapper = class RabbotRapper {
  constructor (rabbitClient) {
    this.rabbot = rabbitClient
    this.serviceName = ''
    this.subscribedQ = ''
    this.server = require('os').hostname()
    this.topology = require('./masterTopology')
  }

  setupClient (serviceName, serviceConfig) {
    this.serviceName = serviceName
    this.topology.connection = serviceConfig
    return this.rabbot.configure(this.topology).then(() => {
      console.log('successful connection to RabbitMQ: ' + serviceConfig.server)
    }).catch((err) => {
      console.log('error connecting to RabbitMQ')
      setTimeout(() => { throw err }) // <-- Kills service
    })
  }

  setQ_Subscription (queueName) {
    try {
      this.topology.queues.map((q) => {
        if (q.name === queueName) {
          console.log('Subscribed to queue: ' + queueName)
          q.subscribe = true
        }
      })
      this.subscribedQ = queueName
    } catch (err) {
      throw err // <-- Kills service
    }
  }

  setHandler (messageType, handlerFunction) {
    try {
      console.log('Setting handler for message type ' + messageType)
      this.rabbot.handle(messageType, handlerFunction)
      console.log('Handler setup successful')
    } catch (err) {
      throw err // <-- Kills service
    }
  }

  disposeMsg (msg, error) {
    let corrID = msg.properties.correlationId
    let level1_count = msg.properties.headers.level1_retryCount
    let level2_count = msg.properties.headers.level2_retryCount
    let level1_limit = this.topology.connection.level1_retries
    let level2_limit = this.topology.connection.level2_retries
    function out_of_retries () { return (level1_count >= level1_limit) && (level2_count >= level2_limit) }

    this.createAuditMsg(msg, corrID, error) // <-- Creates audit message every disposal

    if (error) {
      if (error.deadLetter === true || out_of_retries()) {
        console.log(error)
        console.log('messageID: ' + msg.properties.messageId + ' - dead lettered')
        msg.reject()
      } else {
        console.log(error)
        console.log('messageID: ' + msg.properties.messageId + ' - failed processing, retry #' + (level1_count + level2_count))

        this.republish_withRetries(msg).catch((err) => {
          console.log(err)
          console.log('messageID: ' + msg.properties.messageId + ' - failed republish, nacked')
          msg.nack()
        }).done(() => {
          console.log('messageID: ' + msg.properties.messageId + ' - successful republish, acked')
          msg.ack()
        })
      }
    } else {
      console.log('messageID: ' + msg.properties.messageId + ' - processed and acked')
      msg.ack()
    }
  }

  republish_withRetries (msg) {
    let level1_count = msg.properties.headers.level1_retryCount
    let level2_count = msg.properties.headers.level2_retryCount
    let level1_limit = this.topology.connection.level1_retries
    let level2_limit = this.topology.connection.level2_retries
    function continue_level2_retries () { return (level1_count >= level1_limit) && (level2_count <= level2_limit) }

    // Re-publishes return promises handled by disposeMsg
    if (level1_count < level1_limit) {
      // MUST publish to all-commands and MUST have routingKey
      return this.rabbot.publish('all-commands', {
        type: msg.type,
        body: msg.body,
        routingKey: this.subscribedQ,
        messageId: uuid.v4(),   // <-- unique every publish
        correlationId: msg.properties.correlationId,
        headers: { level1_retryCount: ++level1_count, level2_retryCount: level2_count }
      })
    } else if (continue_level2_retries()) {
      return this.rabbot.publish('internal.delayExchange', {
        type: msg.type,
        body: msg.body,
        routingKey: this.subscribedQ,
        messageId: uuid.v4(),   // <-- unique every publish
        correlationId: msg.properties.correlationId,
        expiresAfter: (level2_count + 1) * 120000, // <-- LEVEL 2 delay
        headers: { level1_retryCount: level1_count, level2_retryCount: ++level2_count }
      })
    } else {
    // Automatically dead letter any message not caught in retry loop
      console.log('Error republishing messageID: ' + msg.properties.messageId + ' - dead lettered')
      msg.reject()
    }
  }

  rapperPublish (msg, key, corrID) {
    // Allows secondary publishes to pass along corrID from 'parent' message if necessary
    let correlationId = corrID || uuid.v4()

    msg.payload.server = this.server
    msg.payload.app = this.serviceName

    return this.rabbot.publish(msg.exchange, {
      type: msg.type,
      routingKey: key,
      messageId: uuid.v4(),   // <-- unique every publish
      correlationId: correlationId,
      body: msg.payload,
      headers: {
        level1_retryCount: 0,
        level2_retryCount: 0,
        object: msg.object || null,
        eventType: msg.eventType || null
      }
    })
  }

  auditPublish (msg, corrID) {
    return this.rabbot.publish('internal.auditExchange', {
      type: msg.type,
      routingKey: 'internal.auditQ',
      messageId: uuid.v4(),
      correlationId: corrID,
      body: msg.payload,
      headers: { level1_retryCount: 0, level2_retryCount: 0 }
    })
  }

  schedulePublish (msg, key, delay, corrID) {
    return this.rabbot.publish('internal.scheduleExchange', {
      type: msg.type,
      routingKey: key,
      messageId: uuid.v4(),
      correlationId: corrID,
      expiresAfter: delay,
      body: msg.payload,
      headers: { level1_retryCount: 0, level2_retryCount: 0 }
    })
  }

// *************************************
// Events
// *************************************
  // corrID parameter is always optional
  // key is always undefined for events

// Membership Events
  updateTicker_Command (exchange, updateVersion, delay, corrID, callback) {
    let message = MessageFactory.updateTickerCmd(exchange, updateVersion)
    this.schedulePublish(message, 'queue.externalAPIHandler', delay, corrID).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

  retryDeadLetter_Command (msgBody, type, key, corrID, callback) {
    // Must pass in original CorrID to complete corresponding saga in audit service
    // Key points to the queue that needs to reprocess dead letter
    let message = MessageFactory.retryDeadLetterCmd(msgBody, type)
    this.rapperPublish(message, key, corrID).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

// Internal Commands
  createAuditMsg (msg, corrID, err) {
    // 'msg' & 'corrID' belong to the original message that is being audited
    let message = MessageFactory.auditMsg(msg, err)
    this.auditPublish(message, corrID).then(() => {
      console.log('audit message published - messageID: ' + msg.properties.messageId)
    }).catch((err) => {
      console.log(err)
      console.log('audit message failed to publish - messageID: ' + msg.properties.messageId)
    })
  }
}

module.exports = RabbotRapper
