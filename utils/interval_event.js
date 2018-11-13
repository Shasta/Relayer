const EventEmitter = require('events');
var controller = require('../services/controller')

class IntervalEvent extends EventEmitter {

  constructor(ms, max_retries, forever) {
    super();
    this.index = 0;
    this.max_retries = max_retries - 1;
    this.interval = ms;
    this.forever = forever;
    this.handle = undefined;

    this.addListener('fire', this.action);

  }

  start() {
    if (!this.handle) {
      this.fireEvent()
    }
  }

  stop(forced) {
    if (this.handle) {
      clearTimeout(this.handle);
      this.handle = undefined;
    }
    if (forced) {
      console.log("Exit interval due error.")
      process.exit(2);
    }
    console.log("Finished interval")
    process.exit(0);
  }

  fireEvent() {
    this.emit('fire');
  }

  emitNextEvent() {
    if (this.handle) {
      clearTimeout(this.handle);
    }
    this.index += 1;
    this.handle = setTimeout(this.fireEvent.bind(this), this.interval);
  }

  async action() {

    await controller.startSchedule();
    this.emitNextEvent();

  }
}

module.exports = IntervalEvent;