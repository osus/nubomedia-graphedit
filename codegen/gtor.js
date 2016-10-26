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
var fs = require('fs-extra');
var path = require('path');

var numDirs = 0;
var genFiles = 0;
var copiedFiles = 0;
var filtersList;
var nodesHierarchy;

function generate(gtor, modelFile, outputDirectory) {
    var t0 = new Date();
    //0. load model file
    console.log('Loading model...'.yellow + '  Done.'.green);
    var originalModel = loadModel(modelFile);
    filtersList=loadFiltersModules();
    
    var model = deriveDesignModel(originalModel);

		if (!model) {
			return 0;
		}

    //console.log(JSON.stringify(filtersList, null, 2));    
    //console.log(JSON.stringify(model, null, 2));
    //console.log('Done.'.green);
    
    numDirs = 0;
    genFiles = 0;
    copiedFiles = 0;
    
    //1. recursive copy files & gen
    console.log('Generating project...'.yellow);
    
    outputDirectory=path.join(outputDirectory, model.name);
    cleanDirectory(outputDirectory);
    recursiveGenerateDir('gtors/' + gtor, outputDirectory, model);    
    
    var t1 = new Date();
    var ellapsed = (t1 - t0);
    
    console.log(gtor.green + ' generation ' + 'Done.'.green);
    console.log('  ' + (numDirs+'').yellow + ' directories, ' +  
                (copiedFiles+'').yellow + ' copied files, and ' + 
                (genFiles+'').yellow + ' generated files in '+ (ellapsed + ' ms').green);
    
    return 0;
}

function deriveDesignModel(inModel) {
	var model=processNodes(inModel);
	if (model) {
		model.name=inModel.editor.name;
		model.package=inModel.editor.package;
	}
	return model;
}
function getNodeConectedTo(nodes, connections, nodeid, origin){
	var numnodes=nodes.length;
	var numconnections=connections.length;
	var found=[];
	
	for(var i=0; i<numconnections; i++){
		var connection=connections[i];
		//console.log("Checking: "+i+" "+connection.source+" === "+nodeid);
		if(connection.source===nodeid){
			var node=getNodeById(nodes, connection.target);
			if(connection.target!=origin)
				node.connected=getNodeConectedTo(nodes, connections, node.id, origin);//busco los que se conectan a este recursivamente
			else
				node.connected=[];
			found.push(node);
		}
	}
	return found;
}

var hierarchy=[];
function processNodes(inModel){
	hierarchy=[];
	var keys=Object.keys(inModel.graphs);
	var graph=inModel.graphs[keys[0]];//take only first graph no matter its name
	var connections=graph.connections;
	var nodes=graph.nodes;
	
	var numnodes=nodes.length;
	var numconnections=connections.length;
	var ordernodes=[];
	
	var i=0;
	for(i=0; i<numnodes; i++){
		var node=nodes[i];
		if(node.type==="WebRtcEndpoint"){//first point
			var newnode=JSON.parse(JSON.stringify(node));
			var connected=getNodeConectedTo(nodes, connections, node.id, node.id);//nodos conectados al anterior
			newnode.connected=connected;
			ordernodes.push(newnode);
			break;
		}
	}
	//console.log(JSON.stringify(ordernodes, null, 2));
	//tengo la secuencia completa de nodos conectados entre si en los "connected"
	//returns in the global var hierarchy
	
	generateNodesPool(ordernodes, undefined);
	//console.log(JSON.stringify(hierarchy, null, 2));
	console.log('Analyzing model nodes...'.yellow + '  Done.'.green);
	//console.log(JSON.stringify(hierarchy, null, 2));
	var generated=generateCodeFromFilters(hierarchy);
	return generated;
}
function generateNodesPool(ordernodes, parent){
	var numconnections=ordernodes.length;
	
	for(var i=0; i<numconnections; i++){
		var node=ordernodes[i];
		var newnode={};
		var found=false;
		for(var j=0; j<hierarchy.length; j++){
			if(hierarchy[j].id==node.id){//the node is already in the model, add reference
				found=true;
				hierarchy[j].properties.inObject=parent.name;
				break;
			}
		}
		if(!found){
			newnode.id=node.id;
			newnode.name=node.name;
			newnode.type=node.type;
			newnode.properties=(typeof node.properties !== 'undefined') ? node.properties : {};
			newnode.properties.inStream="mediaPipeline";
			newnode.properties.name=node.name;
			if(parent!=undefined)
				newnode.properties.inObject=parent.name;
			else
				newnode.properties.inObject=null;
			hierarchy.push(newnode);
			generateNodesPool(node.connected, node);
		}		
	}
}
function generateCodeFromFilters(nodes){
	//filtersList
	var imports="";
	var importsarr=[];
	var code="";
	var events="";
	
	var len=nodes.length;
	for(var i=0; i<len; i++){
		var node=nodes[i];

		switch(node.type){
			case "WebRtcEndpoint":
				break;
			case "RecorderEndpoint":
				console.log('Generating RecorderEndpoint code...'.yellow + '  Done.'.green);
				importsarr = importsarr.concat(filtersList.RecorderEndpoint.imports.filter(function (item) {
				    return importsarr.indexOf(item) < 0;
				}));
				code+=filtersList.RecorderEndpoint.code.join("\r\n");
				events+=filtersList.RecorderEndpoint.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "FaceOverlayFilter":
				console.log('Generating FaceOverlayFilter code...'.yellow + '  Done.'.green);
				importsarr = importsarr.concat(filtersList.FaceOverlayFilter.imports.filter(function (item) {
				    return importsarr.indexOf(item) < 0;
				}));
				code+=filtersList.FaceOverlayFilter.code.join("\r\n");
				events+=filtersList.FaceOverlayFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "ImageOverlayFilter":
				console.log('Generating ImageOverlayFilter code...'.yellow + '  Done.'.green);
				importsarr = importsarr.concat(filtersList.ImageOverlayFilter.imports.filter(function (item) {
				    return importsarr.indexOf(item) < 0;
				}));
				code+=filtersList.ImageOverlayFilter.code.join("\r\n");
				events+=filtersList.ImageOverlayFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "ZBarFilter":
				console.log('Generating ZBarFilter code...'.yellow + '  Done.'.green);
				importsarr = importsarr.concat(filtersList.ZBarFilter.imports.filter(function (item) {
				    return importsarr.indexOf(item) < 0;
				}));
				code+=filtersList.ZBarFilter.code.join("\r\n");
				events+=filtersList.ZBarFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "PlateDetectorFilter":
				console.log('Generating PlateDetectorFilter code...'.yellow + '  Done.'.green);
				importsarr = importsarr.concat(filtersList.PlateDetectorFilter.imports.filter(function (item) {
				    return importsarr.indexOf(item) < 0;
				}));
				code+=filtersList.PlateDetectorFilter.code.join("\r\n");
				events+=filtersList.PlateDetectorFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "ChromaFilter":
				console.log('Generating ChromaFilter code...'.yellow + '  Done.'.green);
				importsarr = importsarr.concat(filtersList.ChromaFilter.imports.filter(function (item) {
				    return importsarr.indexOf(item) < 0;
				}));
				code+=filtersList.ChromaFilter.code.join("\r\n");
				events+=filtersList.ChromaFilter.events.join("\r\n");
				processNodeProperties(code, events, node.properties);
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
		}
		//imports+="\r\n\r\n";
		code+="\r\n\r\n";
		events+="\r\n\r\n";
	}
	

	if (nodes[0] == null) {
		console.error('Invalid model');
		return;
	}

	var model={
		"imports" : importsarr.join("\r\n"),
		"filters" : code,
		"events" : events,
		"outStream" : nodes[0].properties.inObject,
		"webrtcobject" : nodes[0].name
	}
	//console.log(JSON.stringify(model, null, 2));
	return model;
}

function processNodeProperties(origin, properties){
	var output = '' + origin;
    Object.keys(properties).forEach(function(key) {
        var placeHolder = '\{\{' + key + '\}\}';
        var value = properties[key];
        //if (value) {
        	output = output.replace(new RegExp( placeHolder, 'g'), value);
        //}
    });
    return output;
}

function getNodeById(nodes, id){
	var numnodes=nodes.length;
	for(i=0; i<numnodes; i++){
		var node=nodes[i];
		if(nodes[i].id==id){
			return nodes[i];
			break;
		}
	}
	return null;
}
function recursiveGenerateDir(inDir, outDir, model) {
   if( fs.existsSync(inDir) ) {
       fs.readdirSync(inDir).forEach(function(file, index) {
            var inFile = path.join(inDir, file);
            var outFile = path.join(outDir, file);
            if(fs.lstatSync(inFile).isDirectory()) { 
                // recurse on dirs
                numDirs++;
                if(file==="package"){
                	var folders = model.package.split(".");
                	outFile=createPackageFolders(folders, outDir);
                }else{
                    fs.mkdirSync(outFile);
                }
                recursiveGenerateDir(inFile, outFile, model);
            } else { 
                //copy or generate files
                if (path.extname(inFile) === '.stg') {
                    //generate
                    genFiles++;
                    var outFile = outFile.substring(0, outFile.length - 4); //remove template extension
                    outFile=outFile.replace("!NAME!", model.name);
                    generateFile(inFile, outFile, model);
                }
                else {
                    //copy
                    copiedFiles++;
                    copyFile(inFile, outFile);
                }
            }
        });
    } 
}

function createPackageFolders(folders, outDir){
	for(var i=0; i<folders.length; i++){
		var folder=folders[i];
		outDir = path.join(outDir, folder);
		fs.mkdirSync(outDir);
	}
	return outDir;
}
function copyFile(inFile, outFile) {
    console.log('  Copying    ' + outFile.grey);
    
    fs.copySync(inFile, outFile);
}

function generateFile(templateFile, outFile, model) {
    console.log('  Generating ' + outFile.grey);
    
    var tpl = fs.readFileSync(templateFile);
    var output = generateTemplate(tpl, model);
    fs.writeFileSync(outFile, output);    
}

function generateTemplate(tpl, model) {
    var output = '' + tpl;
    Object.keys(model).forEach(function(key) {
        var placeHolder = '\{\{' + key + '\}\}';
        var value = model[key];
        
        if (value) {
            output = output.replace(new RegExp( placeHolder, 'g'), value);
        }
    });
    return output;
}

function cleanDirectory(path) {
    deleteFolderRecursive(path);    
    fs.mkdirSync(path);    
}

function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function loadModel(modelFile) {
    var data = fs.readFileSync(modelFile);
    return JSON.parse(data);
}

function loadFiltersModules() {
    var data = fs.readFileSync("gtors/filters.json");
    return JSON.parse(data);
}

module.exports = {
    generate: generate,
    generateTemplate : generateTemplate
};