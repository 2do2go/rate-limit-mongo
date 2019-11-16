# Rate Limit Mongo

MongoDB store for the [express-rate-limit](https://github.com/nfriedly/express-rate-limit) middleware.

[![Npm version](https://img.shields.io/npm/v/rate-limit-mongo.svg)](https://www.npmjs.org/package/rate-limit-mongo)
[![Build Status](https://travis-ci.org/2do2go/rate-limit-mongo.svg?branch=master)](https://travis-ci.org/2do2go/rate-limit-mongo)
[![Coverage Status](https://coveralls.io/repos/github/2do2go/rate-limit-mongo/badge.svg?branch=master)](https://coveralls.io/github/2do2go/rate-limit-mongo?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/npm/rate-limit-mongo/badge.svg)](https://snyk.io/test/npm/rate-limit-mongo)


## Install

```sh
$ npm install --save rate-limit-mongo
```

## Usage

```js
var RateLimit = require('express-rate-limit');
var MongoStore = require('rate-limit-mongo');

var limiter = new RateLimit({
  store: new MongoStore({
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
Defaults to `60 * 1000`. Note that current implementation uses on mongodb ttl indexes - background task that removes expired documents runs every 60 seconds. As a result, documents may remain in a collection during the period between the expiration of the document and the running of the background task. See [mongodb ttl indexes doc](https://docs.mongodb.com/v3.6/core/index-ttl/#timing-of-the-delete-operation) for more information.

* **resetExpireDateOnChange**: boolean -- indicates whether expireDate should be reseted when changed or not.
Defaults to `false`.

* **errorHandler**: function -- function that will be called if error happened
during incr, decrement or resetKey methods. Defaults to `_.noop`


## Methods

`MongoStore` class provides public methods (`incr`, `decrement`, `resetKey`)
required by [express-rate-limit](https://github.com/nfriedly/express-rate-limit).

In addition following methods provided:

* `getClient(callback)` - if `collection` was not passed to the constructor then
that method will pass (as second argument) initiated instace of
[MongoClient](http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html)
to the `callback`, otherwise `null` will be passed. Thus this method provides
control over connection initiated by the library to the end user. This method
is promisified (when `util.promisify` is presented (node.js >= 8)).
