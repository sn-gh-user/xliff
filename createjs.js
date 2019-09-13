module.exports = (srcLng, trgLng, srcKeys, trgKeys, ns, cb) => {
  const js = {
    sourceLanguage: srcLng,
    targetLanguage: trgLng,
    resources: {}
  };

  if (ns && typeof ns === 'string') {
    js.resources[ns] = {};

    Object.keys(srcKeys).forEach((srcKey) => {

      let obj = {
        source: srcKeys[srcKey],
        target: trgKeys[srcKey]
      }

      if(srcKeys[srcKey].note) {
        obj.note = srcKeys[srcKey].note
      }

      js.resources[ns][srcKey] = obj;
    });

    if (cb) cb(null, js);
    return js;
  }


  if (ns) {
    cb = ns;
    ns = null;
  }

  Object.keys(srcKeys).forEach((ns) => {
    js.resources[ns] = {};

    Object.keys(srcKeys[ns]).forEach((srcKey) => {

      let obj = {
        source: srcKeys[ns][srcKey],
        target: trgKeys[ns][srcKey]
      }

      if(srcKeys[ns][srcKey].note) {
        obj.note = srcKeys[ns][srcKey].note
      }

      js.resources[ns][srcKey] = obj;
    });
  });

  if (cb) cb(null, js);
  return js;
};
