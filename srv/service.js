const cds = require('@sap/cds');
const solace = require('solclientjs');

solace.SolclientFactory.init();

module.exports = cds.service.impl(function () {

    this.on('publishMessage', async (req) => {

        const session = solace.SolclientFactory.createSession({
            url: 'wss://mr-connection-nbmvhq1i3k0.messaging.solace.cloud:443',
            vpnName: 'dev-broker',
            userName: 'solace-cloud-client',
            password: '7kv4i3udv70q81oos8g2kr0eme'
        });

        return new Promise((resolve, reject) => {

            session.on(solace.SessionEventCode.UP_NOTICE, () => {

                console.log('Connected to Solace.');

                const message = solace.SolclientFactory.createMessage();

                message.setDestination(
                    solace.SolclientFactory.createTopicDestination(
                        'pubsub-topic'
                    )
                );

                message.setBinaryAttachment(
                    JSON.stringify(req.data)
                );

                message.setDeliveryMode(
                    solace.MessageDeliveryModeType.DIRECT
                );

                session.send(message);

                console.log('Message published.');

                session.disconnect();

                resolve("Message sent successfully");
            });

            session.on(
                solace.SessionEventCode.CONNECT_FAILED_ERROR,
                (event) => {
                    reject(event.infoStr);
                }
            );

            session.connect();
        });
    });
});

