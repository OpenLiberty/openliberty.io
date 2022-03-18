'use strict'

module.exports.register = function () {
    this.on('contentAggregated', ({ contentAggregate }) => {
      contentAggregate.sort(sortByProperty("version"));
    })
}
function sortByProperty(property){  
    return function(a,b){
        var aProp = a[property].split('.').map( n => +n-100000 ).join('.')
        var bProp = b[property].split('.').map( n => +n-100000 ).join('.')
       if(aProp < bProp)  
          return -1;  
       else if(aProp > bProp)  
          return 1;  
   
       return 0;
    }  
}
