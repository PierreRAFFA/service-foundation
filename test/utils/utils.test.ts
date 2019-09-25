import { hideUrlCrendentials } from "../../src/utils/utils";

describe('Utils', () => {
    it("it should hide any credentials from the url", () => {
        expect(hideUrlCrendentials('amqp://guest:guest@0.0.0.0:5672')).toBe('amqp://*****:*****@0.0.0.0:5672')
    });
    it("it should hide any credentials from the url", () => {
        expect(hideUrlCrendentials('amqp://login:pass@wolverine.rmq.cloudamqp.com/user'))
            .toBe('amqp://*****:*****@wolverine.rmq.cloudamqp.com/user')
    });

    it("it should return the same url if no credentials have been found", () => {
        expect(hideUrlCrendentials('amqp://0.0.0.0:5672')).toBe('amqp://0.0.0.0:5672')
    });

    it("it should return the same url if no credentials have been found", () => {
        expect(hideUrlCrendentials('amqp://0.0.0.0:5672')).toBe('amqp://0.0.0.0:5672')
    });

    it("it should return an empty string if the url is undefined", () => {
        expect(hideUrlCrendentials(undefined)).toBe('')
    });
});
