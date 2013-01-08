function propagate(source, dest) {
  var oldEmit =  source.emit;

  source.emit = function() {
    dest.emit.apply(dest, arguments);
    oldEmit.apply(source, arguments);
  }

  function end() {
    source.emit = oldEmit;
  }

  return {
    end: end
  };
};

module.exports = propagate;