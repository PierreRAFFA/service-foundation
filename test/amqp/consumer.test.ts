import consume from '../../src/modules/amqp/consumer';
import { Message } from "amqplib";
import { IRoutingKeys } from "../../src/interfaces";

//////////////////////////////////////////////////////////////////////
const defaultMessage: Message = {
  fields:
    {
      consumerTag: 'amq.ctag-ZGxy4DnOlBZeHinHiCpQKA',
      deliveryTag: 1,
      redelivered: false,
      exchange: 'pierre.test',
      routingKey: ''
    },
  properties:
    {
      contentType: undefined,
      contentEncoding: undefined,
      headers: {},
      deliveryMode: 1,
      priority: undefined,
      correlationId: undefined,
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: undefined,
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined
    },
  content: new Buffer('{}')
};

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////  TESTS
const process1 = jest.fn();
const process2 = jest.fn();
const process3 = jest.fn();

const routingKeys: IRoutingKeys = {
  'event.test1': process1,
  'event.test2': process2,
  'event.test3': process3,
};

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////  TESTS
describe('On Receiving a message with a known routingKey', () => {
  it("it should consume the message", () => {

    const message: Message = {
      fields: {...defaultMessage.fields , routingKey: 'event.test1'},
      properties: defaultMessage.properties,
      content: defaultMessage.content,
    };

    return consume(message, routingKeys)
      .then(() => {
        expect(process1).toHaveBeenCalled();
        process1.mockClear();
      })
      .catch(e => {});
  });
});

describe('On Receiving a message with a UNKNOWN routingKey', () => {
  it("it should NOT consume the message and throws an error", async () => {

    const message: Message = {
      fields: {...defaultMessage.fields , routingKey: 'event.qwertyuiop'},
      properties: defaultMessage.properties,
      content: defaultMessage.content,
    };

    return expect(consume(message, routingKeys)).rejects.toThrow();
  });
});

describe('On Receiving a message with a known routingKey but a non-valid JSON', () => {
  it("it should NOT consume the message and throws an error", async () => {

    const message: Message = {
      fields: {...defaultMessage.fields , routingKey: 'event.test1'},
      properties: defaultMessage.properties,
      content: new Buffer('{"test":"opp" qwertyuiop}')
    };

    expect(consume(message, routingKeys)).rejects.toThrow();

    return expect(process1).not.toHaveBeenCalled();
  });
});


describe('On Receiving a message with a known routingKey specified in the json', () => {
  it("it should consume the message", async () => {

    const message: Message = {
      fields: {...defaultMessage.fields , routingKey: 'event.qwertyuiop'},
      properties: defaultMessage.properties,
      content: new Buffer('{"name":"event.test1"}')
    };

    return consume(message, routingKeys)
      .then(() => {
        expect(process1).toHaveBeenCalled();
        process1.mockClear();
      })
      .catch(e => {});
  });
});
