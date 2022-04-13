$(window).on("load", function(){
    $.ready.then(function(){
        console.log("its changed");
       $("a").each(function(){
           if(this.hostname !== location.hostname){
               this.target = "_blank";
               this.setAttribute("rel", "noopener noreferrer");
           }
       });
    });
});