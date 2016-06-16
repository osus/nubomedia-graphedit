var spawn = require('child_process').spawn;
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Config vars
var codegen =  '../codegen/';
var tempPath   = __dirname + '/../tmp/',
  modelPath    = tempPath + 'model/',
  genPath      = tempPath + 'gen/';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/', function(req, res) {

  var status = 200;
  var response = {
    'success': true,
    'data': ''
  };

  // Create model file
  var graph = req.body;
  var name  = graph.editor.name + '.ngeprj';
  fs.writeFile(modelPath + name, JSON.stringify(graph));

  // Generate code
  var exec = spawn('node', [codegen, 'gen', '-m', modelPath + name, '-o', genPath], {
    cwd: codegen,
    env: process.env
  });
  var decoder = new StringDecoder('utf8');
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
  exec.on('exit', function(exitCode) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Length': res.length
    });
    if (status == 200) {

    }
    res.status(status).send(response);
  });
});

app.listen(3000, function() {
  console.log('Server listening on port 3000');
});