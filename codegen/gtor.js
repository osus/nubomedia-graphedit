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
	model.name=inModel.editor.name;
	model.package=inModel.editor.package;
	
    return model;
}
function processNodes(inModel){
	var hierarchy=[];
	var keys=Object.keys(inModel.graphs);
	var graph=inModel.graphs[keys[0]];//take only first graph no matter its name
	var connections=graph.connections;
	var nodes=graph.nodes;
	
	var numnodes=nodes.length;
	var numconnections=connections.length;
	
	var i=0;
	for(i=0; i<numnodes; i++){
		var node=nodes[i];
		if(node.type==="WebRtcEndpoint" && hierarchy.length==0){//first point
			var newnode={};
			newnode.name=node.name;
			newnode.id=node.id;
			newnode.type=node.type;
			newnode.properties=node.properties;
			newnode.stream="mediaPipeline";
			newnode.inObject=node.name;
			hierarchy.push(newnode);
			break;
		}
	}
	//cambio esto
	//en vez de recorrer las connections desde el webrtc, recorro los componentes desde el webrtc
	//busco las connections del webrtc
	//las mapeo
	//busco los nodos que se conectan al webrtc
	//los mapeo
	//los que se conectan a los anteriores
	//hasta el final
	
	
	//tengo el punto de inicio, ahora analizo las connections buscando el webrtc como source
	for(i=0; i<numconnections; i++){
		var connection=connections[i];
		var lastnode=hierarchy[hierarchy.length-1].id;
		if(connection.target===hierarchy[0].id){//si es el ultimo nodo que se reinyecta al primero, fin.
			var sourcenode=getNodeById(nodes, connection.source);
			hierarchy[0].inObject=sourcenode.name;
			break;
		}else if(connection.source===lastnode){
			var sourcenode=getNodeById(nodes, connection.target);
			var newnode={};
			newnode.id=connection.target;
			newnode.name=sourcenode.name;
			newnode.type=sourcenode.type;
			newnode.properties=sourcenode.properties;
			//newnode.stream=newnode.name;
			newnode.stream="mediaPipeline";
			newnode.inObject=newnode.name;
			hierarchy.push(newnode);
		}
	}
	//console.log(JSON.stringify(hierarchy, null, 2));
	console.log('Analyzing model nodes...'.yellow + '  Done.'.green);
	//console.log(JSON.stringify(hierarchy, null, 2));
	var generated=generateCodeFromFilters(hierarchy);
	return generated;
}
function generateCodeFromFilters(nodes){
	//filtersList
	var imports="";
	var code="";
	var events="";
	
	var len=nodes.length;
	for(var i=0; i<len; i++){
		var node=nodes[i];
		node.properties.name=node.name;
		if(i>0){
			node.properties.inStream=nodes[i-1].stream;
			node.properties.inObject=nodes[i-1].inObject;
		}
		switch(node.type){
			case "WebRtcEndpoint":
				break;
			case "RecorderEndpoint":
				console.log('Generating RecorderEndpoint code...'.yellow + '  Done.'.green);
				imports+=filtersList.RecorderEndpoint.imports.join("\r\n");
				code+=filtersList.RecorderEndpoint.code.join("\r\n");
				events+=filtersList.RecorderEndpoint.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "FaceOverlayFilter":
				console.log('Generating FaceOverlayFilter code...'.yellow + '  Done.'.green);
				imports+=filtersList.FaceOverlayFilter.imports.join("\r\n");
				code+=filtersList.FaceOverlayFilter.code.join("\r\n");
				events+=filtersList.FaceOverlayFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "ImageOverlayFilter":
				console.log('Generating FaceOverlayFilter code...'.yellow + '  Done.'.green);
				imports+=filtersList.ImageOverlayFilter.imports.join("\r\n");
				code+=filtersList.ImageOverlayFilter.code.join("\r\n");
				events+=filtersList.ImageOverlayFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "ZBarFilter":
				console.log('Generating FaceOverlayFilter code...'.yellow + '  Done.'.green);
				imports+=filtersList.ZBarFilter.imports.join("\r\n");
				code+=filtersList.ZBarFilter.code.join("\r\n");
				events+=filtersList.ZBarFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "PlateDetectorFilter":
				console.log('Generating PlateDetectorFilter code...'.yellow + '  Done.'.green);
				imports+=filtersList.PlateDetectorFilter.imports.join("\r\n");
				code+=filtersList.PlateDetectorFilter.code.join("\r\n");
				events+=filtersList.PlateDetectorFilter.events.join("\r\n");
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "ChromaFilter":
				console.log('Generating ChromaFilter code...'.yellow + '  Done.'.green);
				imports+=filtersList.ChromaFilter.imports.join("\r\n");
				code+=filtersList.ChromaFilter.code.join("\r\n");
				events+=filtersList.ChromaFilter.events.join("\r\n");
				processNodeProperties(code, events, node.properties);
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
			case "PlateDetectorFilter":
				console.log('Generating PlateDetectorFilter code...'.yellow + '  Done.'.green);
				imports+=filtersList.PlateDetectorFilter.imports.join("\r\n");
				code+=filtersList.PlateDetectorFilter.code.join("\r\n");
				events+=filtersList.PlateDetectorFilter.events.join("\r\n");
				processNodeProperties(code, events, node.properties);
				code=processNodeProperties(code, node.properties);
				events=processNodeProperties(events, node.properties);
				break;
				
				
		}
		imports+="\r\n";
		code+="\r\n";
		events+="\r\n";
	}
	var model={
		"imports" : imports,
		"filters" : code,
		"events" : events,
		"outStream" : nodes[0].inObject,
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
        if (value) {
        	output = output.replace(new RegExp( placeHolder, 'g'), value);
        }
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
};

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