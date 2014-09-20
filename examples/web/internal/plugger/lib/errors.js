var PluginNotLoaded = module.exports.PluginNotLoaded = function PluginNotLoaded(name) {
    this.name = name;
    this.message = 'Plugin "'+name+'" not loaded, can\'t set status.';
}
PluginNotLoaded.prototype = Error.prototype;

var PluginDoesNotExist = module.exports.PluginDoesNotExist = function PluginDoesNotExist(name) {
    this.name = name;
    this.message = 'Plugin '+name+' does not exist';
}
PluginDoesNotExist.prototype = Error.prototype;

var InvalidSemVer = module.exports.InvalidSemVer = function InvalidSemVer(name, version) {
    this.name = name;
    this.version = version;
    this.message = 'Plugin '+name+' has an invalid version '+version;
}
InvalidSemVer.prototype = Error.prototype;

var FileNotFound = module.exports.FileNotFound = function FileNotFound(file, location) {
    this.file = file;
    this.location = location;
    this.message = 'Could not locate plugin file '+file+' at '+location;
}
InvalidSemVer.prototype = Error.prototype;
