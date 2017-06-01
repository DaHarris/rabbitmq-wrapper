#RabbotRapper

**Plugin setup**

Install:
```javascript
'npm install git+ssh://git@github.com:SojournDestinations/afini-rabbitmq-plugin.git'
```

1.  Include plugin in entry file
2.  Subscribe to a queue (if necessary)
  * rabbotRapper.setQ_Subscription('name_of_queue')
3.  If subscribed to a queue, register handlers for each message type
  * rabbotRapper.setHandler('message type', handler function)
4.  Finish plugin setup
  * rabbotRapper.setupClient('service name', rabbitConfig)
  * setupClient() *MUST* be called last

Example rabbitConfig object:
```javascript
  {
    'user': 'test_user',
    'pass': 'password',
    'host': [ 'rabbitMQ.server' ],
    'port': 5672,
    'vhost': '%2f',
    'replyQueue': false,
    'level1_retries': 3,
    'level2_retries': 3
  }
```

**Publishing Messages**

rabbotRapper.event_or_command_name(params)
  * all publish functions end with Event or Command
  * RabbotRapper handles all promises generated from rabbot

Afini Events & Commands:
```javascript
newMembership_Event(newMembership)
  // message type: event.membership-account.membershipCreated
  // properties: membershipID, name, email
newAccount_Event(newAccount)
  // message type: event.membership-account.accountCreated
  // properties: accountID, nickname, email
tempUserCreated_Event(newUser)
  // message type: event.user.tempUserCreated
  // properties: userID, password, email
codeCreated_Event(code, userID)
  // message type: event.user.codeCreated
  // properties: code, userID
```

**Setting Handlers**

Handlers are responsible for processing a specific message type
  * must be set before calling setupClient()

Message types are named in 3 parts:
  * type of message (event or command)
  * name of the service publishing the message
  * name of the event
  * example: 'event.membership-account.membershipCreated'

Example:
```javascript
rabbotRapper.setHandler('message type', handlerFunction)
```

**Message Disposal**

Each handler must dispose of its own messages
  * disposeMsg() automatically acks(), nacks(), or rejects() the message
  * if no error is passed in or if it's equal to null, message is acked()
  * if an error is passed in, retries are attempted
  * passing in an error with a property of 'deadLetter = true' skips retries

Example:
```javascript
rabbotRapper.disposeMsg(message, error)
```
