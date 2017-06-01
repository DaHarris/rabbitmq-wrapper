const auditMsg = (msg, err) => {
  let auditError

  if (err === null || err === undefined) {
    auditError = null
  } else {
    auditError = err.toString()
  }

  return {
    type: 'command.audit.createAudit',
    payload: {
      auditedMessage: msg,
      error: auditError
    }
  }
}

const retryDeadLetterCmd = (msgBody, type) => {
  return {
    exchange: 'all-commands',
    type: type,
    payload: msgBody
  }
}

module.exports = {
  auditMsg: auditMsg,
  retryDeadLetterCmd: retryDeadLetterCmd
}
