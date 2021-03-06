/* Team-Sport */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var request = require('request');
var Promise = require("bluebird");
var config = require('./config');
var hat = require('hat');
var crypto = require('crypto');

var User = mongoose.model("User", new Schema(config.schemas.user));
var Event = mongoose.model('Event', new Schema(config.schemas.event));

Promise.promisify(request);

mongoose.connect(config.database);

//Login
exports.login = function(username, password) {
  return User.findOne({
    name: username
  }).then(function(user) {
    if (user === null)
      throw "Benutzer existiert nicht!"
    else if (user.password != hash(password))
      throw "Falsches Passwort!"

    return user;
  });
};

//Registrieren
exports.register = function(name, email, password) {
  return User.findOne({
    name: name
  }).then(function(user) {
    if (user !== null)
      throw "Benutzer existiert bereits!";
    else {
      var newuser = new User({
        name: name,
        password: hash(password),
        email: email
      });

      return newuser.save();
    }
  });
};

exports.findEvents = function() {
  return Event.find();
}

//object is the event - user is a User instance
exports.addEvent = function(object, user) {
  var x = parseFloat(object.x);
  var y = parseFloat(object.y);

  var event = new Event({
    coordinates: [y, x],
    name: object.name,
    type: object.type,
    description: object.description,
    start: new Date(object.start),
    timespan: object.timespan,
    people: [user._id] // Make user
  });

  return new Promise((resolve) => event.save((error) => {
		if(error) throw error;

		resolve();
	}));
}

//id = event id
exports.enterEvent = function(id, user) { // adds your ID to the event people
  return Event.find({
      id
    })
    .then(function(event) {
      event.people.push(user.id);
      return event.save();
    });
}

//Google Geocoding
exports.getCoordinates = function(location) {
  return request.getAsync('https://maps.googleapis.com/maps/api/geocode/json?key=${config.maps}&components=locality:Köln&address=${location}')
    .then((response, _body) => {
      var body = JSON.parse(_body);

      if (body.status === 'ZERO_RESULTS' || body.status === 'OVER_QUERY_LIMIT')
        throw 'No results.'

      if (body.status !== 'OK')
        throw body.error_message;

      return body.results[0].geometry.location;
    });
}

var getStreet = exports.getStreet = function(latitude, longitude) {
  return request.getAsync("https://maps.googleapis.com/maps/api/geocode/json?key=${config.maps}&address=${location}")
    .then((response, _body) => {
      var body = JSON.parse(_body);

      if (body.status === 'ZERO_RESULTS' || body.status === 'OVER_QUERY_LIMIT')
        throw 'No results.';

      if (body.status !== 'OK')
        throw body.error_message;

      return body.results[0].formatted_address;
    });
}

//Util
var hash = function(pwd){
  return crypto.createHash('sha256').update(pwd).digest('base64');
}
