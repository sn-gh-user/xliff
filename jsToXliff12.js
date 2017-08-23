const xml2js = require('xml2js');

function jsToXliff12(obj, opt, cb) {

  if (typeof opt === 'function') {
    cb = opt;
    opt = { headless: true, pretty: true, indent: ' ', newline: '\n' };
  }

  const builder = new xml2js.Builder({
    rootName: 'xliff',
    headless: opt.headless,
    pretty: opt.pretty,
    indent: opt.indent || ' ',
    newline: opt.newline || '\n'
  });

  const xmlJs = {
    $: {
      'rigi-project-url': Object.keys(obj.resources)[0],
      'rigi-version': '2',
      'rigiSignatureFormat': '2',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:rigi': 'rigi.io',
      'xsi:schemaLocation': 'urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd',
      xmlns: 'urn:oasis:names:tc:xliff:document:1.2',
      version: '1.2'
    },
    file: []
  };

  Object.keys(obj.resources).forEach((nsName) => {
    const ORIGINAL = nsName.split('/')[nsName.split('/').length - 1];
    const f = {
      $: {
        date: new Date().toISOString(),
        original: ORIGINAL,
        datatype: 'plaintext',
        'source-language': obj.sourceLanguage,
        'target-language': obj.targetLanguage,
        'rigi:projecturl': nsName
      },
      'body': {
        'trans-unit': []
      }
    };
    xmlJs.file.push(f);
    
    Object.keys(obj.resources[nsName]).forEach((k) => {
      if(obj.resources[nsName][k].source) {
        const u = {
          $: {
            id: k,
            'rigi:sig': k,
            resname: obj.resources[nsName][k].source.stringId
          },
          source: obj.resources[nsName][k].source.text,
          target: {
            $: {
              state: obj.resources[nsName][k].target.status
            },
            _: obj.resources[nsName][k].target.text
          }
        };
        if ('note' in obj.resources[nsName][k]) {
          u.note = obj.resources[nsName][k].note;
        }
        f.body['trans-unit'].push(u);
      }
    });
  });

  const xml = builder.buildObject(xmlJs);
  if (cb) cb(null, xml);
  return xml;
}

module.exports = jsToXliff12;
