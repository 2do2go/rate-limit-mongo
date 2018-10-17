# Rate Limit Mongo

Mongo client for the [express-rate-limit](https://github.com/nfriedly/express-rate-limit) middleware.

[![Npm version](https://img.shields.io/npm/v/rate-limit-mongo.svg)](https://www.npmjs.org/package/rate-limit-mongo)
[![Build Status](https://travis-ci.org/2do2go/rate-limit-mongo.svg?branch=master)](https://travis-ci.org/2do2go/rate-limit-mongo)

## Install

```sh
$ npm install --save rate-limit-mongo
```

## Usage

```js
var RateLimit = require('express-rate-limit');
var MongoStore = require('rate-limit-mongo');

var limiter = new RateLimit({
  store: new RedisStore({
    // see Configuration
  }),
  max: 100,
  windowMs: 15 * 60 * 1000
});

//  apply to all requests
app.use(limiter);
```

## Configuration

* **uri**: string -- uri for connecting to mongodb, `mongodb://127.0.0.1:27017/test_db` for example.
Required if collection hasn't been set.

* **collectionName**: string -- name of collection for storing records. Defaults to `expressRateRecords`

* **user**: string -- username for authentication in mongodb

* **password**: string -- password for authentication in mongodb

* **authSource**: string -- db name against which authenticate use. If not set db name from uri will be taken.

* **collection**: object -- mongodb collection instance. Required if uri hasn't been set.

* **expireTimeMs**: integer -- time period, in milliseconds, after which record will be reseted (deleted).
Defaults to `60 * 1000`.

* **resetExpireDateOnChange**: boolean -- indicates whether expireDate should be reseted when changed or not.
Defaults to `false`.

* **errorHandler**: function -- function that will be called if error happened
during incr, decrement or resetKey methods. Defaults to `_.noop`
