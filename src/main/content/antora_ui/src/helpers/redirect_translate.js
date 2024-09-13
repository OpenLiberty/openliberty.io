'use strict'
const { posix: path } = require('path')

function redirect_translate (lang,from){
    let currpath, newpath
    currpath = from;
    newpath = currpath.split('/');
    if( lang == "ja"){
        if(newpath[1]==lang){
            return currpath;
        }
        else if(newpath[1] == "zh-Hans"){
             newpath[1] = "ja";
             newpath = newpath.join('/');
            // newurl= currorg + newpath
            return newpath;
        }
        else{
            newpath[0] = "/ja";
            newpath = newpath.join('/');
            return newpath;
        }
    }
    else if( lang == "zh-Hans"){
        if(newpath[1]==lang){
            return currpath;
        }
        else if(newpath[1] == "ja"){
             newpath[1] = "zh-Hans"
             newpath = newpath.join('/');
            return newpath;
        }
        else{
            newpath[0] = "/zh-Hans";
            newpath = newpath.join('/');
            return newpath;
        }
    }
}

module.exports = redirect_translate
