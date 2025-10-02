// (Observer Pattern)
const EventEmitter = require("events");

class EventBusClass extends EventEmitter {}
const EventBus = new EventBusClass();

module.exports = EventBus;
