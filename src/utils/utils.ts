import {replace} from 'lodash';

/**
 * Return an url by hiding any username and password
 * Ex: amqp://guest:guest@0.0.0.0:5672 returns amqp://*****:*****@0.0.0.0:5672
 *
 * @param url
 */
export function hideUrlCrendentials(url: string): string {
    return replace(url, /([a-z]+:\/\/)\w*:?\w*(@[.\w]+)/, '$1*****:*****$2');
}
