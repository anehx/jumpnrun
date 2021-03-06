# Jump n' Run
[![Build Status](https://api.travis-ci.org/anehx/jumpnrun.svg)](https://travis-ci.org/anehx/jumpnrun)
[![Code Climate](https://codeclimate.com/repos/5533d4706956801c8c000b6b/badges/8f8412012c97786facd8/gpa.svg)](https://codeclimate.com/repos/5533d4706956801c8c000b6b/feed)
[![Dependency Status](https://david-dm.org/anehx/jumpnrun.svg)](https://david-dm.org/anehx/jumpnrun)
[![devDependency Status](https://david-dm.org/anehx/jumpnrun/dev-status.svg)](https://david-dm.org/anehx/jumpnrun#info=devDependencies)

A nodejs jump n' run styled game written in ES6 style

# Installation

## Requirements
* nodejs or iojs
* npm
* bower

## Docker
To run the game in a docker container, you need to install docker and docker-compose. Then run:
```shell
$ npm install
$ bower install
$ docker-compose up
```
Then navigate to http://localhost:8080 in your browser to play.

## Local
To run it on your local machine, you need to install the requirements, then change the following
line in `backend/common/config.js`:
```javascript
...
    server: {
        ...
        url: 'http://localhost:3000'
        ...
    }
...
```
After this, run:
```shell
$ npm install
$ bower install
$ npm run server
```

# Test
Run `npm test` to test (docker must be shutdown).
