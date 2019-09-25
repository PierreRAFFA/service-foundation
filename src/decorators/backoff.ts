/*******************************************
 * Decorators can only be used on classes
 *
 *******************************************/
import { backoff as backoffGeneric, IBackoffOptions } from "../utils/backoff";

/**
 * Returns the decorated method for applying a backoff (for class methods)
 *
 * @param options
 */
export function backoff(options: IBackoffOptions = undefined): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
        const originalFunction = descriptor.value;

        const decoratedFunction = async function(...args: any[]): Promise<any> {
            return await backoffGeneric(originalFunction, options, this, ...args);
        };

        descriptor.value = decoratedFunction;
        return descriptor;
    };
}
