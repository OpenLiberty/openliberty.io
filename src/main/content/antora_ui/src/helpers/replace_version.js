'use strict'
var fs = require("fs");
var path = require("path");
let files = [];
var process = require("process");
const express = require('express')
const app = express()
var moveFrom = "src/main/content/docs-javadoc/modules/reference/liberty-javaee7-javadoc";
var moveTo = "src/main/content/docs/build/site/docs/latest/reference/javadoc";
function replace_version(from, to) {
    //from = from+to;
    //console.log("page----------->"+page)
    app.use ((req, res, next) => {
        console.log("apapapappapappapapappapa")
        from = req.originalUrl;
        res.locals.host = req.get('host');
        res.locals.protocol = req.protocol;
        next();
    });
    //console.log("from"+from);
    /*if(from.indexOf('liberty-javaee') > -1) {
        //page.url = "";
        //console.log("innnnnnnnnnnn")
        var returnedfiles = getFilesRecursively(moveFrom);
        //console.log("files");
        //console.log(returnedfiles);
        for(var i=0; i<returnedfiles.length; i++) {
            var jd = returnedfiles[i];
            //var subStr = path.substring(path.indexOf('liberty-javaee'));

            jd = jd.substring(jd.indexOf('liberty-javaee') + 24);
            var pack = jd.substring(0, jd.lastIndexOf('/'));
            page.url = from+'?package=' +pack +'/package-frame.html&class=' +jd;
            console.log("page.url"+page.url);
            //from = page.url;
        }
    }*/
    if((from.includes('/reference/javadoc/liberty-jakartaee'))||
    (from.includes('/reference/javadoc/liberty-javaee'))||
    (from.includes('/reference/javadoc/microprofile'))) {
        from = "";
    }
    else {
    from = from.split('/');
    from[2] = to; // Version piece of the path
    from = from.join('/')
    }
    console.log("from"+from);
  //if(from.indexOf('liberty-javaee') > -1) {
      console.log("frmo--------"+from)
  //}
    return from;
};
function getFilesRecursively(directory) {
    var filesInDirectory = fs.readdirSync(directory);
    for (var file of filesInDirectory) {
      var absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
          getFilesRecursively(absolute);
      } else {
          files.push(absolute);
      }
    }
    return files;
}
module.exports = replace_version