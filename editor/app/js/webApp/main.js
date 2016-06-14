export function readFile(file, callback) {
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function() {
    var result = JSON.parse(this.result) || {};
    callback(result);
  };
}

export function writeFile(filename, object) {
  _download(filename, object);
}

function _download(filename, jsonObject) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonObject)));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}