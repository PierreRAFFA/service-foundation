//set the key to get an existing bugsnagClient
import { appConfig } from "../../src/app/appConfig";
import { configureBugsnag, getBugsnagClient } from "../../src/components/bugsnag";
appConfig.bugsnagKey = 'key';
appConfig.version = '1.0.0';
configureBugsnag(appConfig.bugsnagKey, appConfig.version);

// Mock Bugsnag
jest.spyOn(getBugsnagClient(), 'notify').mockImplementation(() => {});

// Mock createBackOff
import * as appUtils from "../../src/app/appUtils";

const mockedBackOff: Backoff = appUtils.createBackOff();
jest.spyOn(appUtils, 'createBackOff').mockImplementation(() => {
    return mockedBackOff;
});

//Mock consumer.consume
import { getConsumerResult } from "../fixtures/fixture";
import * as consumer from "../../src/modules/amqp/consumer";

jest.spyOn(consumer, 'default').mockImplementation(() => {
    return getConsumerResult();
});

// imports
import { IAmqpConfig } from "../../src/interfaces";
import * as amqplib from "amqplib";
import { Message } from "amqplib";
import { Backoff } from "backoff";
import { Amqp } from "../../src/modules/amqp/amqp";
import SpyInstance = jest.SpyInstance;
import Mock = jest.Mock;
import { HealthStatus } from "../../src/constants";


//////////////////////////////////////////////////////////////////////
const config: IAmqpConfig = {
    exchangeHost: 'amqp://127.0.0.1',
    exchangeName: 'exchange-test',
    queueName: 'queue-test',
    deadLetterExchangeName: 'deadletter-exchange-test',
    deadLetterQueueName: 'deadletter-queue-test',
};

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////  MOCKS
// Mock the channel methods
const channel: any = {
    consumeCallback: Function,
    assertExchange: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    }),
    assertQueue: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    }),
    bindQueue: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    }),
    prefetch: () => {
        return {};
    },
    consume: jest.fn().mockImplementation((queueName: string, callback: Function) => {
        channel.consumeCallback = callback.bind(amqp);
    }),
    on: jest.fn().mockImplementation(function () {
        return undefined;
    }),
    ack: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    }),
    publish: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    }),
    reject: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    }),
    sendToQueue: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
    }),

};

//Mock the connection methods
const connection = {
    callbacks: {},
    createChannel: jest.fn().mockImplementation(function () {
        return Promise.resolve(channel);
    }),
    on: jest.fn().mockImplementation(function (event: string, callback: Function) {
        this.callbacks[event] = callback;
    }),
    emit: jest.fn().mockImplementation(function (event: string) {
        this.callbacks[event] && this.callbacks[event].call(amqp, new Error('My Message'));
    }),
};

//Mock the amqplib.connect
jest.spyOn(amqplib, 'connect').mockImplementation((): any => {
    return Promise.resolve(connection);
});


const amqp: Amqp = new Amqp();
// //////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////  TESTS
describe('On init', () => {

    beforeEach(() => {
        amqp.registerRoutingKey('event.test1', jest.fn);
        return amqp.config(config).start();
    });

    it("it should return the service name as rabbitmq", () => {
        return expect(amqp.name).toBe('rabbitmq');
    });

    it("it should connect via aqmp", () => {
        expect.assertions(1);

        const spy = jest.spyOn(amqplib, 'connect');

        return expect(spy).toHaveBeenCalled();
    });

    it("it should be create a channel", () => {
        return expect(connection.createChannel).toHaveBeenCalled();
    });

    it("it should configure the deadletter exchange", () => {
        expect(channel.assertExchange).toHaveBeenCalledWith(config.deadLetterExchangeName, 'topic', {
            durable: true,
            autoDelete: false
        });
        return expect(channel.assertQueue).toHaveBeenCalledWith(config.deadLetterQueueName);
    });

    it("it should configure the main exchange", () => {
        expect(channel.assertExchange).toHaveBeenLastCalledWith(config.exchangeName, 'topic');
        return expect(channel.assertQueue).toHaveBeenLastCalledWith(config.queueName, {
            arguments: {
                'x-dead-letter-exchange': config.deadLetterExchangeName
            }
        });
    });

    it("it should bind queue to the exchange", () => {
        return expect(channel.bindQueue).toHaveBeenCalled();
    });

    it("it should be ready to consume some messages", () => {
        return expect(channel.consume).toHaveBeenCalled();
    });
});

describe('When init with some routing keys', () => {
    it(" it should bind the queues", async () => {
        channel.bindQueue.mockReset();

        amqp.registerRoutingKey('event.test1', jest.fn);
        await amqp.config(config).start();

        expect(channel.bindQueue.mock.calls).toEqual([[undefined, config.deadLetterExchangeName, '#'], [undefined, config.exchangeName, 'event.test1']]);
    });
});

describe('On init,', () => {

    beforeEach(() => {
        return amqp.config(config).start();
    });

    describe('if the connection closes,', () => {
        it(" it should set the status to error", () => {
            connection.emit('close');
            expect(amqp.errorMessage).toBe('My Message');
            return expect(amqp.status).toBe(HealthStatus.Warn);
        });
    });

    describe('if the connection has an error,', () => {
        it(" it should set the status to error", () => {
            connection.emit('error');
            expect(amqp.errorMessage).toBe('My Message');
            return expect(amqp.status).toBe(HealthStatus.Warn);
        });
    });
});

describe('On receiving a message,', () => {

    beforeEach(() => {
        return amqp.config(config).start();
    });

    it("it should consume it and ack it", async () => {
        const message: Message = {
            content: new Buffer('{}'),
            fields: {
                deliveryTag: 1,
                redelivered: false,
                exchange: '',
                routingKey: '',
            },
            properties: {
                contentType: undefined,
                contentEncoding: undefined,
                headers: undefined,
                deliveryMode: undefined,
                priority: undefined,
                correlationId: undefined,
                replyTo: undefined,
                expiration: undefined,
                messageId: undefined,
                timestamp: undefined,
                type: undefined,
                userId: undefined,
                appId: undefined,
                clusterId: undefined,
            },
        };

        await channel.consumeCallback(message);

        expect(consumer.default).toHaveBeenCalledWith(message,  {"event.test1": jest.fn});
        expect(channel.ack).toHaveBeenCalledWith(message);
    });


    describe('if the message properties contains replyTo', () => {
        it("it should send back a response and ack it", async () => {
            const message: Message = {
                content: new Buffer('{}'),
                fields: {
                    deliveryTag: 1,
                    redelivered: false,
                    exchange: '',
                    routingKey: '',
                },
                properties: {
                    replyTo: 'qwerty',
                    correlationId: 3,
                    contentType: undefined,
                    contentEncoding: undefined,
                    headers: undefined,
                    deliveryMode: undefined,
                    priority: undefined,
                    expiration: undefined,
                    messageId: undefined,
                    timestamp: undefined,
                    type: undefined,
                    userId: undefined,
                    appId: undefined,
                    clusterId: undefined,
                },
            };

            await channel.consumeCallback(message);

            expect(channel.ack).toHaveBeenCalledWith(message);
            expect(channel.sendToQueue).toHaveBeenCalledWith(
                'qwerty',
                new Buffer(JSON.stringify(getConsumerResult())),
                {correlationId: 3}
            );
        });
    });

    describe('if consuming a message throws an exception', () => {
        it("it should reject the message", async () => {
            const message: Message = {
                content: new Buffer('{}'),
                fields: {
                    deliveryTag: 1,
                    redelivered: false,
                    exchange: '',
                    routingKey: '',
                },
                properties: {
                    replyTo: 'qwerty',
                    correlationId: 3,
                    contentType: undefined,
                    contentEncoding: undefined,
                    headers: undefined,
                    deliveryMode: undefined,
                    priority: undefined,
                    expiration: undefined,
                    messageId: undefined,
                    timestamp: undefined,
                    type: undefined,
                    userId: undefined,
                    appId: undefined,
                    clusterId: undefined,
                },
            };

            jest.spyOn(consumer, 'default').mockImplementation(() => {
                throw new Error('OMG');
            });

            await channel.consumeCallback(message);

            expect(channel.ack).toHaveBeenCalledWith(message);
            expect(channel.reject).toHaveBeenCalledWith(message, false);
        });
    });
});

describe('On publishing a message,', () => {
    it('it should publish the message via the channel', () => {

        const content: any = {
            data: true
        };
        amqp.publishMessage('routingKey1', content);

        expect(channel.publish).toHaveBeenCalledWith(
            "exchange-test",
            "routingKey1",
            new Buffer(JSON.stringify(content)),
            {contentType: 'application/json'},
        );
    });
});

describe('When a backoff is ready', () => {
    it('it should try to reconnect via amqp', async () => {

        await amqp.config(config).start();

        //create a spy and reset the number of calls to amqplib.connect
        const spy: SpyInstance = jest.spyOn(amqplib, 'connect');
        spy.mockClear();

        //emit the ready event
        mockedBackOff.emit('ready', 1, 500);

        expect(spy).toHaveBeenCalledTimes(1);
    });
});

describe('When a backoff is failing', () => {

    beforeEach(async () => {
        await amqp.config(config).start();

        //create a spy and reset the number of calls to amqplib.connect
        const spy: SpyInstance = jest.spyOn(amqplib, 'connect');
        spy.mockClear();

        jest.spyOn(getBugsnagClient(), 'notify').mockImplementation(() => {

        });

    });

    it('it should set the service as failed', async () => {

        //emit the ready event
        mockedBackOff.emit('fail', undefined);
        expect(amqp.status).toBe(HealthStatus.Fail);
    });
});

describe('When the initial connection fails', () => {
    it('it should start the backoff', async () => {

        jest.spyOn(amqplib, 'connect').mockImplementation(() => {
            throw new Error('could not connect');
        });

        //create a spy and reset the number of calls to amqplib.connect
        const spy = jest.spyOn(mockedBackOff, 'backoff').mockImplementation(() => {
        });

        await amqp.config(config).start();

        expect(spy).toHaveBeenCalled();

        mockedBackOff.reset();
    });
});
