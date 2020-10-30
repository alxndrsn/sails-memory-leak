const includeAll = require('include-all');

Object
  .keys(includeAll)
  .forEach(fnName => {
    const originalFn = includeAll[fnName];

    if(originalFn.monkeymonkeymonkey) {
      // This should really really never happen, but just in case...
      return;
    }

    includeAll[fnName] = (opts, ...args) => {
      // Useful for debugging:
      //console.log(`includeAll.${fnName}()`, args.length, opts);

      const force =
        // Useful for debugging effects of clearing request.cache after specific
        // calls to includeAll.someFunction():
        opts.dirname.endsWith('/config') ||
        //opts.dirname.endsWith('/development') ||
        //opts.dirname.endsWith('/hooks') ||
        //opts.dirname.endsWith('/node_modules') ||
        //opts.dirname.endsWith('/models') ||
        //opts.dirname.endsWith('/policies') ||
        //opts.dirname.endsWith('/responses') ||
        //opts.dirname.endsWith('/services') ||
        //opts.dirname.endsWith('/views') ||
        false;

      // There doesn't seem to be any use of `this` in include-all, so we can
      // get away without worrying about `originalFn.apply/bind/call(this, ...)
      originalFn({ ...opts, force }, ...args);
    };

    includeAll[fnName].monkeymonkeymonkey = true;
  });
