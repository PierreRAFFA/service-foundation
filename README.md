# Node Core

Modular Node Service which creates an app containing all minimal functionalities 

## Technical Overview
- NodeJS  
- Typescript  
- AMQPLib  
- Express
- Bugsnag  
- Loggly


## Environment variables

- **NODE_ENV** (ex: production)

## Configuration

There are 3 configurations:
 
#### Global App
```typescript
interface IAppConfig {
    version: string;
    numBackoffs: number;
    logLevel: number;
    bugsnagKey?: string;
    logglyEnable: boolean;
    logglyToken?: string;
    logglySubdomain?: string;
    logglyTags?: string;
}
```

#### Http
```typescript
interface IHttpConfig {
    port: number;
    authKey?: string;
}
```

#### Amqp
```typescript
interface IAmqpConfig {
    exchangeHost: string;
    exchangeName: string;
    queueName: string;
    deadLetterExchangeName: string;
    deadLetterQueueName: string;
}
```

## Samples

#### Instantiate the app
```typescript
import { App } from "service-foundation";
const app: App = new App();
```

#### Configure the app
```typescript
import { App } from "service-foundation";

const app: App = new App();
app.config({
    version: '1.0.0',
    logLevel: 5,
    numBackoffs: 3,
    logglyEnable: false,
    logglySubdomain: 'subdomain',
    logglyToken:'yourKey',
    logglyTags: ['node1', 'node2'],
    bugsnagKey: 'yourKey'
});
```
> To trigger an error, simply use logger.error(message)
> It will log the error into Bugsnag with the appropriate app version

#### Run and configure the http server
```typescript
import { App } from "service-foundation";
import { Server } from "service-foundation/build/http/server";

const app: App = new App();
const server: Server = app.http;
await server
    .config({
        port: 3000,
        authKey: 'fghuiofd78',
    })
    .start();
```

#### Create http routes
```typescript
import { App } from "service-foundation";
import { Server } from "service-foundation/build/http/server";

const app: App = new App();
const server: Server = app.http;
server.router.get('/hello', (req: Request, res: Response) => {
    res.status(200).send('Hello');
});
await server
    .config({
        port: 3000,
        authKey: 'fghuiofd78',
    })
    .start();
```


#### Run and configure AMQP
```typescript
import { App } from "service-foundation";
import { Amqp, IAmqpConfig } from "service-foundation/build/amqp/amqp";

const config: IAmqpConfig = {
    exchangeHost: 'someData',
    exchangeName: 'someData',
    queueName: 'someData',
    deadLetterExchangeName: 'someData',
    deadLetterQueueName: 'someData',
};

const app: App = new App();
const amqp: Amqp = await app.amqp
        .config(config)
        .registerRoutingKey('event.key1', handler)
        .start();

function handler(data: any) {
    console.log('test');
}
```

#### Health check a component
To able to register a component, this component has to implement IComponent.  
Basically, this component should expose some methods and properties needed to populate the output of GET /healthcheck

```typescript
interface IComponent {
    name: string;
    status: HealthStatus;
    errorMessage: string;
}
```

```typescript
import { App } from "service-foundation";

const app: App = new App();
app
    .healthcheckComponent(redis)
    .healthcheckComponent(mysql);
```

#### Register an external microservice to access to the data layer

```typescript
import { App } from "service-foundation";
import * as dal from "service-foundation/build/dal";
import { IUser } from "service-foundation/build/interfaces";

const app: App = new App();
app
    .registerMicroservice({
        name: "ms-users-db",
        url: "ms_url",
        authKey: 'ms_key',
    })
    
const user: IUser = await dal.getUser(1234);
    
```

#### Call the external microservice

Once the external microservice configured, your microservice is able to call it

```typescript
import * as dal from "service-foundation/build/dal";
import { IUser } from "service-foundation/build/interfaces";

async function getUser() {
    const user: IUser = await dal.getUser(1234);
}
```

#### Make different calls to the microservices in parallel

```typescript
const results: Array<any> = await dal.parallel(
    dal.getUser(3),
    dal.getCoupons(3),
);
const user: IUser = results[0] as IUser;
const coupon: ICoupon = head(results[1]) as ICoupon;
```

## Backoff  
#### by composition  
```typescript
import { execAsBackoff } from "./utils/backoff";
server.router.get('/backoff', async (req: Request, res: Response, next: Function) => {
    try {
        const results: any = await execAsBackoff(doRequest, {numRetries: 2});
        res.status(200).json(results);
    }catch (e) {
        console.log(e);
        next(e);
    }
});

async function doRequest(): Promise<any> {
    const n = Math.random();
    if (n > 0.8) {
        return {param1: 'ok'};
    }else{
        throw new Error('oups Request2 Failed');
    }
}
```

#### by decorator   
```typescript
import { backoff } from "./decorators/backoff";

class Salesforce {
    private _prop: string = 'ok';
    
    @backoff({numRetries: 2})
    public async doRequest(param: string, param2: string) {
        const n = Math.random();
        if (n > 0.8) {
            return {param1: 'ok'};
        }else{
            throw new Error('oups Request Failed');
        }
    }
}
server.router.get('/backoff', async (req: Request, res: Response, next: Function) => {
    logger.silly('backoff');
    try {
        const s: Salesforce = new Salesforce();
        const results: any = await s.doRequest('myParam', 'myParam2');
        res.status(200).json(results);
    }catch (e) {
        console.log(e);
        next(e);
    }
});
```

## Middlewares
This package provides some middlewares:
- **authorizeSecret** - Checks Headers auth-key - Enabled by default if the http config has a authKey
- **authorizeUser** - Gets the user info from the header, then store it into req ( Will be deprecated to finally use authorizeJWT instead)
- **authorizeJWT** - Decrypts the JWT to get the user, then store it into req (@Todo)

> These middlewares can be imported and used into the microservices.
> Do not hesitate to add more if you think it may be used by other microservices.

## Force build the app with (useful during an implementation of the core)
```bash
$ npm run watch
```

## Healthcheck

The healthcheck is available on GET /healthcheck  
The response will be:

#### Response
```json
{
  "status": "string", //Can be "pass" | "warn" | "fail"
  "version": "string", //package.json version
  "memory": "string", //in MB
  "details": { //list of the components
    "component1": { //Can be "rabbitmq", "mongodb"
      "status": "string", //Can be "pass" | "warn" | "fail"
      "message": "string", // Optional Error message
    },
  },
  "microservices": { //list of the ms
      "service1": "configured" //Can be "configured" | "configuredWithoutAuthkey" | "urlMissing"
  }
}
```

#### Status and Response Status

**Status Pass**:  
Specifies that every components passed.  
The status code is **200**  

**Status Warn**:  
Specifies that one or more components are trying to be reconnected.  
The status code is **200**

**Status Fail**:  
Specifies that one or more components have reached the max number of attempts for the reconnection.  
The status code is **500**


## Setup to use the core in dev-mode through a ms 

#### 1. Import the library in dev mode

Create a symlink to node-core into the global node packages  
Import node-core in the ms  
In the ms, overwrite node-core to use the one installed globally  

```bash
$ git clone ...
$ cd node-core
$ nvm deactivate
$ npm link
```
> if nvm is enabled it will link node-core to the global node packages in `~/.nvm/versions` and prevent to work in devs-docker