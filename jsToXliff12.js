const xml2js = require('xml2js');

function jsToXliff12(obj, sigFormat, rigiVersion, projectName, opt, cb) {

  if(typeof opt === 'function') {
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
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd',
      xmlns: 'urn:oasis:names:tc:xliff:document:1.2',
      version: '1.2',
      'xmlns:rigi': 'www.rigi.io',
      'rigi:projecturl': Object.keys(obj.resources)[0],
      'rigi:version': rigiVersion,
      'rigi:signatureformat': sigFormat,
    },
    file: []
  };

  Object.keys(obj.resources).forEach((nsName) => {
    const f = {
      $: {
        date: new Date().toISOString(),
        original: `Rigi.${projectName}`,
        datatype: 'plaintext',
        'source-language': obj.sourceLanguage,
        'target-language': obj.targetLanguage
      },
      'body': {
        'trans-unit': []
      }
    };
    xmlJs.file.push(f);
    Object.keys(obj.resources[nsName]).forEach((k) => {
      if(obj.resources[nsName][k].source) {
        const resnameObj = {
          sig: k,
          projecturl: Object.keys(obj.resources)[0]
        };
        const resnameStr = JSON.stringify(resnameObj);
        const resnameB64Str = Buffer.from(resnameStr).toString('base64');
        const u = {
          $: {
            id: k,
            'rigi:id': k,
            'rigi:idstr': obj.resources[nsName][k].source.stringId,
            resname: obj.resources[nsName][k].source.stringId
          },
          source: obj.resources[nsName][k].source.text
        };
        if(obj.resources[nsName][k].source.text !== obj.resources[nsName][k].target.text || obj.resources[nsName][k].target.status !== 'needs-translation') {
          u.target = {
            $: {
              state: obj.resources[nsName][k].target.status
            },
            _: obj.resources[nsName][k].target.text
          };
        }
        u['context-group'] = {
          $: {
            purpose: 'information'
          },
          context: {
            $: {
              'context-type': 'x-rigi'
            },
            _: `${Object.keys(obj.resources)[0]}/context/signature/${k}?locale=${obj.targetLanguage}`
          }
        }
        if('note' in obj.resources[nsName][k]) {
          u.note = {
            $: {
              from:'rigi'
            },
            _:obj.resources[nsName][k].note
          };
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
