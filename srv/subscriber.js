const solace = require('solclientjs');

solace.SolclientFactory.init();

const session = solace.SolclientFactory.createSession({
    url: 'wss://mr-connection-nbmvhq1i3k0.messaging.solace.cloud:443',
    vpnName: 'dev-broker',
    userName: 'solace-cloud-client',
    password: '7kv4i3udv70q81oos8g2kr0eme'
});

// Create queue name
const queueName = 'pubsub-1';

session.on(solace.SessionEventCode.UP_NOTICE, () => {
    console.log('Connected to Solace.');

    // Create queue destination
    const queue = solace.SolclientFactory.createDurableQueueDestination(queueName);

    // Create message consumer
    const consumer = session.createMessageConsumer({
        queueDescriptor: {
            name: queueName,
            type: solace.QueueType.QUEUE
        },
        acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT
    });

    // MESSAGE handler
    consumer.on(solace.MessageConsumerEventName.MESSAGE, (message) => {
        const payload = message.getBinaryAttachment();
        console.log('Received message:', payload);

        // Acknowledge message (important in queue mode)
        message.acknowledge();
    });

    consumer.on(solace.MessageConsumerEventName.UP, () => {
        console.log('Queue consumer is UP and ready.');
    });

    consumer.on(solace.MessageConsumerEventName.CONNECT_FAILED_ERROR, (err) => {
        console.log('Consumer connect failed:', err.infoStr);
    });

    // Connect consumer (THIS replaces subscribe)
    consumer.connect();

});

session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (event) => {
    console.log('Session connection failed:', event.infoStr);
});

session.connect();