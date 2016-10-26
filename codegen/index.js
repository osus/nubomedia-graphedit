/*
 * (C) Copyright 2016 NUBOMEDIA (http://www.nubomedia.eu)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
//Essential Code Generator v. 1.0
var colors = require('colors');
var argv = require('yargs');
var fs = require('fs');
var gtor = require('./gtor');

process.exit(run());

function run() {
    console.log('esl-nubo'.yellow  + ' codgen v. 1.0.0 for Nubomedia');

    var args = argv.usage('Usage: $0 <command> [options]')
        .command('gen', 'Generate a proyect')
        .demand(1)
        .example('$0 gen -m <model.json> -o <outputDir>', 'Generates the model into the output directory')
        .demand('m')
        .alias('m', 'model')
        .nargs('m', 1)
        .describe('m', 'Load a model')
        .demand('o')
        .alias('o', 'output')
        .nargs('o', 1)
        .describe('o', 'Output directory for code generation')
        .help('h')
        .alias('h', 'help')
        .epilog('(c) 2016. Pedro J. Molina')
        .argv;

    var cmd = args._;
    var model = args.m;
    var outputDir = args.o;

    //args validation  
    if (cmd != "gen") {
        console.error('Invalid command specified: ' + cmd.red);
    return 1;
    }
    if (!model || !existsFile(model)) {
        console.error('Model not found: ' + (model || '').red);
        return 1;
    }
    if (!outputDir || !existsFile(outputDir)) {
        console.error('Output directory not found: ' + (outputDir || '').red);
        return 1;
    }

    console.log('Valid parameters.'.green);
    console.log('Generating model: ' + model.yellow +  ' for ' + 'nubomedia'.yellow + ' on folder: ' + outputDir.yellow);

    return gtor.generate('nubomedia', model, outputDir);
}

function existsFile(path) {
    try {
        var data = fs.statSync(path);
        return (data !==null);
    }
    catch (e) {
        return false;
    }
}
