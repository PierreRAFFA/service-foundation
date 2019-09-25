import { Message } from "amqplib/properties";
import logger from "../../utils/logger";
import { IRoutingKeys } from "../../interfaces";
import { MessageConsumerError } from "../../errors/messageConsumerError";

const chalk = require('chalk');

/**
 * Consumes the message if possible and send the decoded json to the callback
 * @param msg
 * @param routingKeys
 */
export default async function consume(msg: Message | null, routingKeys: IRoutingKeys): Promise<any> {
    logger.info(chalk.yellow('Message received'));

    //check if json is valid
    let json;
    try {
        json = JSON.parse(msg.content.toString());
    } catch (e) {
        return Promise.reject(new Error(`Error: Trying to parse '${msg.content.toString()}'`));
    }

    //for the sake of the legacy microservice, there are two ways to get the routingKey
    const routingKeyFromPayload: string = json.name;  //  old way by getting 'name'
    const routingKey: string = msg.fields.routingKey; // new way by getting the routingKey

    //define method to call
    let routingKeyFound: string;
    if (routingKeys[routingKeyFromPayload] && typeof routingKeys[routingKeyFromPayload] === 'function') {
        routingKeyFound = routingKeyFromPayload;

    } else if (routingKeys[routingKey] && typeof routingKeys[routingKey] === 'function') {
        routingKeyFound = routingKey;
    }

    logger.info(`Routing Key: ${routingKeyFound}`);

    if (routingKeyFound) {
        //execute the route
        try {
            return await routingKeys[routingKeyFound](json);
        } catch (e) {
            throw e;
        }
    } else {
        throw new MessageConsumerError(`No action found for this message. routingKeyFromPayload: ${routingKeyFromPayload} and routingKey: ${routingKey}`);
    }
}
