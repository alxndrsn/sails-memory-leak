// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
// > Note: This is not required in order to lift, but it is a convenient default.
require('./include-all-monkeypatch');

if(!global.gc) {
  console.error(`
  Please run with node's --expose-gc flag set.
`);
  process.exit(1);
}

process.chdir(__dirname);

const TRACE = false;
const INFO = true;
const trace = (...args) => TRACE && console.log(...args);
const info  = (...args) => INFO  && console.log(...args);

async function lift(sails) {
  trace('lift() :: ENTRY');

  return new Promise((resolve, reject) => {
    sails.lift({ log:{ noShip:true } }, err => {
      if(err) {
        trace('lift() :: FAILED', err);
        return reject(err);
      }

      trace('lift() :: SUCCEEDED');

      resolve();
    });
  });
}

async function lower(sails) {
  trace('lower() :: ENTRY');

  return new Promise((resolve, reject) => {
    sails.lower(err => {
      if(err) {
        trace('lower() :: FAILED', err);
        return reject(err);
      }

      trace('lower() :: SUCCEEDED');

      resolve();
    });
  });
}

let lastHeap;
let invocation = 0;

(async () => {
  trace('Starting...');
  try {
    const { Sails } = require('sails');
    while(true) {
      const sails = new Sails();
      await lift(sails);
      await lower(sails);
      gc();

      const used = process.memoryUsage().heapUsed;
      info((++invocation).toString().padStart(12, ' '),
          `| Process uses ${asMb(used).padStart(10, ' ')}\tchange: ${asMb(used - lastHeap)}`);
      lastHeap = used;
    }
  } catch(err) {
    console.error(err);
  }
})();

function asMb(mem) {
  if(isNaN(mem)) return '??? MB';
  mem = mem / 1024 / 1024;
  return `${Math.round(mem * 100) / 100} MB`;
}
