// Node core
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var StringDecoder = require('string_decoder').StringDecoder;

// Compression
var fstream = require('fstream');
var tar = require('tar');
var zlib = require('zlib');

// Express
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Config vars
var codegen =  '../codegen/';
var tempPath   = __dirname + '/../tmp/',
  modelPath    = tempPath + 'model/',
  genPath      = tempPath + 'gen/',
  downloadPath = tempPath + 'download/';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/', function(req, res) {
  var status   = 200;
  var response = {
    'success': true,
    'data': ''
  };

  // Create model file
  var graph = req.body;
  var name  = graph.editor.name + '.ngeprj';
  fs.writeFile(modelPath + name, JSON.stringify(graph));

  // Generate code
  var decoder = new StringDecoder('utf8');
  var exec = spawn('node', [codegen, 'gen', '-m', modelPath + name, '-o', genPath], {
    cwd: codegen,
    env: process.env
  });
  exec.stdout.on('data', function(data) {
    console.log(decoder.write(data));
  });
  exec.stderr.on('data', function (data) {
    status = 500;
    response.success = false;
    response.data = decoder.write(data).trim();
    console.log('[!] ' + response.data);
  });

  // Send response
  exec.on('exit', function() {
    res.set({
      'Content-Type': 'application/json',
      'Content-Length': res.length
    });
    if (status == 200) {
      _compressDirectory(genPath + graph.editor.name, graph.editor.name);
      response.data = 'http://' + req.get('host') + '/download?file=' + graph.editor.name;
    }
    res.status(status).send(response);
  });
});

app.get('/download', function(req, res) {
  var file   = downloadPath + req.query.file + '.tar.gz';
  var status = 200;
  var response = {
    'success': true,
    'data': ''
  };
  if (!req.query.file || !fs.existsSync(file)) {
    status = 400;
    response.success = false;
    response.data    = "File not found";
    res.status(status).send(response);
  }
  res.download(file, req.query.file + '.tar.gz', function(err) {
    if (!err) {
      fs.unlink(file);
    }
  });
});

app.listen(3000, function() {
  _setTmpPermissions();
  console.log('Server listening on port 3000');
});

function _setTmpPermissions() {
  fs.chmodSync(tempPath, '777');
  fs.chmodSync(modelPath, '777');
  fs.chmodSync(genPath, '777');
  fs.chmodSync(downloadPath, '777');
}

function _compressDirectory(path, name) {
  fstream.Reader({'path': path, 'type': 'Directory'})
    .pipe(tar.Pack())
    .pipe(zlib.Gzip())
    .pipe(fstream.Writer({
      'path': downloadPath + name + ".tar.gz",
      'mode': 777
    }));
}