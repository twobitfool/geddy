/**
* A responder determines the best way to respond to a request
* @constructor
* @param {Object} controller - The controller that owns this Responder
*/
var errors = require('../../response/errors')
  , utils = require('utilities')
  , response = require('../../response')
  , Negotiator = require('./negotiator').Negotiator
  , Responder
  // Default strategies
  , respondWithStrategies = {
      html: require('./strategies/html')
      // Eventually these should be unique...
    , json: require('./strategies/api')
    , xml: require('./strategies/api')
    , js: require('./strategies/api')
    , txt: require('./strategies/api')
    };


Responder = function () {
};

Responder.prototype = new (function () {

  /**
  * Responds with a model or collection
  * @param {Object} content - The model, collection, or hash of values
  * @param {Object} [options] Options.
  *   @param {String|Object} [options.status] The desired flash message,
  *     can be a string or an errors hash
  *   @param {Boolean} [options.silent] Disables flash messages if set to true
  * @param {Function} [cb] - An optional callback where the first argument
  *   is the response buffer
  */
  this.respond = function (controller, content, opts) {
    opts = opts || {};

    var type
      , strategies = opts.strategies || respondWithStrategies;

    // Convenient aliases for stuff we need in the controller
    // Everything here needs to be in the controller shim
    // for testing purposes
    this.controller = controller;
    this.params = controller.params;
    this.flash = controller.flash;
    this.headers = controller.request.headers;

    // Determine the type of model from the content
    if (content) {
      if (Array.isArray(content)) {
        if (content.length) {
          type = content[0].type.toLowerCase()
        }
        else {
          // No way to determine from empty array
          type = null;
        }
      }
      else if (content.type) {
        type = content.type.toLowerCase()
      }
    }

    // If the user supplied a type use it
    if(opts.type) {
      type = opts.type;
    }

    // Supply this 'type' as an option so the strategies can use it
    opts.type = type;

    // Was the negotiated type a user-defined strategy?
    if(typeof strategies[opts.format] === 'function') {
      strategies[opts.format].call(this.controller, content, opts);
    }
    else {
      // The default action is just to output the content in the right format
      this.controller.respond(content, opts);
    }
  };

  /**
  * Lower level respond function that expects stuff like
  * content-negotiation to have been done by a strategy.
  * @param {Object} content - The model, collection, or hash of values
  * @param {Object} options - The required options hash
  *   @param {String} options.format - The negotiated format e.g. "json"
  *   @param {String} options.contentType - The negotiated content type
  *     e.g. "text/plain"
  */
  this.outputFormattedContent = function (content, opts) {
    this.controller.respond(content, opts);
  };
});


module.exports = Responder;
