/* api.js - All API routes */

const database = require('./database');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Promise = require('bluebird');

const router = express.Router();

//Cookie Setup
const sessionCookie = 'currentSession';
const userCookie = 'currentUser';

//Body Parser Setup
const urlEncoded = bodyParser.urlencoded({
  extended: false
});

router.post('/login', urlEncoded, (request, response) => {
  database.login(request.body.name, request.body.password)
    .then((user) => response.cookie(userCookie, user).jsonp({
      success: true
    }))
    .catch((error) => response.jsonp({
      success: false,
      error: error
    }));
});

router.post('/signup', urlEncoded, (request, response) => {
  database.register(request.body.name, request.body.email, request.body.password)
    .then((user) => response.cookie(userCookie, user).jsonp({
      success: true
    }))
    .catch((error) => {
      console.warn(error);
      response.jsonp({
        success: false,
        error: error
      })
    });
});

router.use(cookieParser());

router.get('/find/events', (request, response) => {
  database.findEvents()
    .then((locations) => response.jsonp(locations))
    .catch((error) => {
      console.warn(error);
      response.jsonp({
        success: false,
        error: error
      })
    });
});

router.post('/add/event', urlEncoded, (request, response) => {
  console.log(request.cookies[userCookie]);
  database.addEvent(request.body, request.cookies[userCookie])
    .then(() => response.jsonp({
      success: true
    }))
    .catch((error) => {
      console.warn(error);
      response.jsonp({
        success: false,
        error: error
      })
    });
});

router.get('/get/street', (request, response) => {
  database.getStreet(request.query.street)
    .then((street) => response.send(street))
    .catch((error) => {
      console.warn(error);
      response.jsonp({
        success: false,
        error: error
      });
    });
});

router.post('/location/:id/enter', (request, response) => {
  Promise.try(function() {
      if (!request.cookies[userCookie])
        throw 'You aren\'t logged in.';

      return database.enterEvent(request.params.id, JSON.parse(request.cookies[userCookie]).id)
    }).then(() => response.jsonp({
      success: true
    }))
    .catch((error) => response.jsonp({
      success: false,
      error: error
    }));
});

router.get('/')

module.exports = router;
