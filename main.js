function Scope() {
  this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn,
    valueEq: !!valueEq
  };
  this.$$watchers.push(watcher);
};

Scope.prototype.$$digestOnce = function() {
  var self  = this;
  var dirty;
  _.forEach(this.$$watchers, function(watch) {
    var newValue = watch.watchFn(self);
    var oldValue = watch.last;
    if (!self.$$areEqual(newValue, oldValue, watch.valueEq)) {
      watch.listenerFn(newValue, oldValue, self);
      dirty = true;
    }
    watch.last = (watch.valueEq ? _.cloneDeep(newValue) : newValue);
  });
  return dirty;
};

Scope.prototype.$digest = function() {
  var dirty;
  do {
    dirty = this.$$digestOnce();
  } while (dirty);
};

Scope.prototype.$eval = function(expr, locals) {
  return expr(this, locals);
};

Scope.prototype.$apply = function(expr) {
  try {
    return this.$eval(expr);
  } finally {
    this.$digest();
  }
};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
  if (valueEq) {
    return _.isEqual(newValue, oldValue);
  } else {
    return newValue === oldValue;
  }
};

var scope = new Scope();
scope.counter = 0;

scope.$watch(
  function(scope) {
    return scope.firstName;
  },
  function(newValue, oldValue, scope) {
    scope.counter++;
  }
);

scope.firstName = 'Joe';
scope.$digest();
console.log(scope.counter);

scope.firstName = 'Jane';
scope.$digest();
console.log(scope.counter);

