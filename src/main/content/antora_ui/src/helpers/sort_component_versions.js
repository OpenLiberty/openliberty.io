'use strict'

const { posix: path } = require('path')

// Map the versions to an array of numbers, then sort the version arrays by number, then join the version numbers again with periods.
function sort_component_versions (versions) {
  versions = versions.map(function(version){
      version.displayVersion = version.displayVersion.split('.').map(function(number){
          return parseInt(number);
      })
      return version;
  }).sort(function(versionA,versionB){
    let a = versionA.displayVersion;
    let b = versionB.displayVersion;
    for (var i = 0; i < Math.max(a.length, b.length); i++) {
        if (b[i]-a[i] != 0) return b[i]-a[i]; 
    }
    return 0;
  }).map(function(version){
      version.displayVersion = version.displayVersion.join('.');
      return version;
  })
  return versions;
}

module.exports = sort_component_versions
