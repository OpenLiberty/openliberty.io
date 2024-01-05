'use strict'

module.exports = (a) => {
    var parts = a.split("/");
    if(parts.includes("ja")){
        return "/ja";
    }
    else if(parts.includes("zh-Hans")){
        return "/zh-Hans";
    }
    return "";
}