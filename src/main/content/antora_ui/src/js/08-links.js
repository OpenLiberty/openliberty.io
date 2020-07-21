$(window).on("load", function(){
    $.ready.then(function(){
       $("a").each(function(){
           if(this.hostname !== location.hostname){
               this.target = "_blank";
               this.setAttribute("rel", "noopener noreferrer");
           }
       });
    });
});