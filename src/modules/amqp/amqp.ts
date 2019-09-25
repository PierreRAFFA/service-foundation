/**
 * From the Scaffold
 * Do not modify this file except if if you know what you are doing
 */

import { Channel, Connection, Replies, connect } from "amqplib";
import { Backoff } from "backoff";
import AssertQueue = Replies.AssertQueue;
import AssertExchange = Replies.AssertExchange;
import consume from './consumer';
import { Message } from "amqplib/properties";
import logger from "../../utils/logger";
import { healthcheckComponent } from "../../app/appHealth";
import { createBackOff } from "../../app/appUtils";
import { IAmqpConfig, IMessageConsumer, IRoutingKeys, IComponent } from "../../interfaces";
import { hideUrlCrendentials } from "../../utils/utils";
import { HealthStatus } from "../../constants";
import { MessageConsumerError } from "../../errors/messageConsumerError";
const chalk = require('chalk');

export class Amqp implements IComponent {

    /**
     * Service name. Used for the healthcheck
     *
     * @type {string}
     * @private
     */
    private _name: string = 'rabbitmq';

    private _config: IAmqpConfig;
    private _connection: Connection;
    private _channel: Channel;

    /**
     * Amqp health status. Used for the healthcheck
     *
     * @type {HealthStatus.Pass}
     * @private
     */
    private _status: HealthStatus = HealthStatus.Pass;

    /**
     * Amqp error message. Used for the healthcheck
     */
    private _errorMessage: string;

    /**
     * Backoff to try the reconnection to rabbitmq. After few attempts, status will be HealthStatus.Fail
     */
    private _backoff: Backoff;

    /**
     * Specifies the routingkey list
     */
    private _routingKeys: IRoutingKeys = {};
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    constructor() {
    }

    ////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  INIT
    /**
     * Registers the config before starting the connection
     * @param {IAmqpConfig} config
     * @returns {any}
     */
    public config(config: IAmqpConfig): Amqp {
        chalk.enabled = true;
        this._config = config;
        return this;
    }

    /**
     * Registers a routing key
     *
     * @param routingKey
     * @param callback
     */
    public registerRoutingKey(routingKey: string, callback: IMessageConsumer): Amqp {
        this._routingKeys[routingKey] = callback;
        return this;
    }

    /**
     * Starts the connection and configures the exchanges and queues following the config
     * @returns {Promise<Amqp>}
     */
    public async start(): Promise<Amqp> {
        chalk.enabled = true;

        // Force healthcheck this service if enabled
        healthcheckComponent(this);

        if (this._config) {
            logger.info(chalk.green('========================================================='));
            logger.info(chalk.green('exchangeHost:             ', hideUrlCrendentials(this._config.exchangeHost)));
            logger.info(chalk.green('exchangeName:             ', this._config.exchangeName));
            logger.info(chalk.green('queueName:                ', this._config.queueName));
            logger.info(chalk.green('deadLetterExchangeName:   ', this._config.deadLetterExchangeName));
            logger.info(chalk.green('deadLetterQueueName:      ', this._config.deadLetterQueueName));
            logger.info(chalk.green('========================================================='));

            if (this._routingKeys && Object.keys(this._routingKeys).length > 0) {

                //setup backoff
                this.setUpBackoff();

                //connect to rabbit
                try {
                    await this._connect(this._config.exchangeHost);
                    await this._configureDeadLetterExchange(this._config.deadLetterExchangeName, this._config.deadLetterQueueName);
                    await this._configureExchange(this._config.exchangeName, this._config.queueName, this._config.deadLetterExchangeName);
                    await this._listenQueue(this._config.queueName);
                    return this;
                } catch (e) {
                    this._status = HealthStatus.Warn;
                    this._errorMessage = e.message;

                    logger.info(chalk.bgRed('AMQP: Connection Error'));
                    logger.info(chalk.bgRed(e.message));

                    this._backoff.backoff();
                }
            } else {
                logger.error('You should first define the routing keys');
            }
        } else {
            logger.error('You should first set the config before starting the connection to rabbit');
        }

        return this;
    }

    ////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////// BACKOFF CONFIG
    private setUpBackoff() {
        if (!this._backoff) {
            this._backoff = createBackOff();

            // on backoff => disconnection happened here => start the timer
            this._backoff.on('backoff', (number, delay) => {
                logger.warn(`Trying to reconnect in ${delay}ms after ${number} attempts`);
            });

            // on ready => the timer is complete, time to reconnect
            this._backoff.on('ready', async (number, delay) => {
                await this.start();
            });

            //on fail => all attempts done
            this._backoff.prependListener('fail', () => {
                this._status = HealthStatus.Fail;
            });
        }
    }

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////// CONSUME MESSAGES
    /**
     * Publishes a message to a specific routingKey
     *
     * @param {object} content
     * @param {string} routingKey
     * @param {string} exchangeName
     * @returns {Promise<void>}
     */
    public async publishMessage(routingKey: string, content: object, exchangeName: string = this._config.exchangeName) {
        logger.info(`publishMessage on ${routingKey}`);

        try {
            const success: boolean = await this._channel.publish(
                exchangeName,
                routingKey,
                new Buffer(JSON.stringify(content)),
                {
                    contentType: 'application/json'
                }
            );

            logger.info('success:' + success);
        } catch (e) {
            logger.error(chalk.red('Message Not Published to the routingKey:'), routingKey);
            logger.error(chalk.red(content));
        }
    }

    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////// CONNECT
    /**
     * Connects via AMQP
     *
     * @param {string} url
     * @returns {Promise<Connection>}
     * @private
     */
    private async _connect(url: string): Promise<Connection> {

        this._connection = await connect(url);
        this._channel = await this._connection.createChannel();
        this._channel.prefetch(10);

        //set status to Open after connection complete
        this._status = HealthStatus.Pass;
        this._errorMessage = undefined;

        logger.info(chalk.bgGreen('AMQP: Connected'));

        //Error Management
        // In the case of a server-initiated shutdown or an error, the 'close' handler will be supplied with an error indicating the cause
        // Note that 'close' is called after 'error'
        this._connection.on('error', this._onError.bind(this));
        this._connection.on('close', this._onClose.bind(this));
        // this._channel.on('error', this._onError);
        // this._channel.on('close', this._onClose);

        return this._connection;
    }

    private _onError(error: Error): void {
        this._status = HealthStatus.Warn;
        this._errorMessage = error.message;
        logger.info(chalk.bgRed('AMQP: Connection Error'));
        logger.info(chalk.bgRed(error.message));
        this._backoff.reset();
        this._backoff.backoff();
    }

    private _onClose(error: Error): void {
        logger.info(chalk.bgRed('AMQP: Connection Closed'));
        if (!this._errorMessage && error.message) {
            this._status = HealthStatus.Warn;
            this._errorMessage = error.message;
            logger.info(chalk.bgRed(error.message));
        } else {
            this._status = HealthStatus.Warn;
        }
        this._backoff.reset();
        this._backoff.backoff();
    }

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////  CONFIGURE
    /**
     * Configures the main Exchange
     *
     * @returns {Promise<void>}
     * @private
     */
    private async _configureExchange(exchangeName: string, queueName: string, deadLetterExchangeName: string) {
        //create or get the main exchange
        const exchange: AssertExchange = await this._channel.assertExchange(exchangeName, 'topic');

        //create or get the queue
        const queue: AssertQueue = await this._channel.assertQueue(queueName, {
            arguments: {
                'x-dead-letter-exchange': deadLetterExchangeName
            }
        });


        //assert a routing path from an exchange to a queue
        for (const routingKey in this._routingKeys) {
            this._channel.bindQueue(queue.queue, exchangeName, routingKey);
        }
    }

    /**
     * Configures the dead Letter Exchange
     *
     * @returns {Promise<void>}
     * @private
     */
    private async _configureDeadLetterExchange(deadLetterExchangeName: string, deadLetterQueueName: string) {
        const exchange: AssertExchange = await this._channel.assertExchange(
            deadLetterExchangeName,
            'topic',
            {
                durable: true,
                autoDelete: false
            }
        );

        const queue: AssertQueue = await this._channel.assertQueue(deadLetterQueueName);
        this._channel.bindQueue(queue.queue, deadLetterExchangeName, '#');
    }

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////// CONSUME MESSAGES
    /**
     * Listen the queue
     *
     * @private
     */
    private _listenQueue(queueName: string) {
        this._channel.consume(queueName, async (msg: Message | null) => {
            try {
                const result: any = await consume(msg, this._routingKeys);

                //send response
                if (msg.properties.replyTo) {
                    this._channel.sendToQueue(msg.properties.replyTo,
                        new Buffer(JSON.stringify(result ? result : undefined)),
                        {correlationId: msg.properties.correlationId}
                    );
                }

                this._channel.ack(msg);
                logger.info(chalk.green('Message Consumed Successfully'));
            } catch (e) {
                //set the payload to Error
                (e as MessageConsumerError).payload = msg.content.toString();
                logger.error(e);
                this._channel.reject(msg, false);
            }
        });
    }

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////// GETTER
    public get name(): string {
        return this._name;
    }

    public get status(): HealthStatus {
        return this._status;
    }

    public get errorMessage() {
        return this._errorMessage;
    }
}

export let amqp: Amqp = new Amqp();
