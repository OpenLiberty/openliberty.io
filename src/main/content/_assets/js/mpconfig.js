/** 
  Copyright (c) 2017 IBM Corporation and others.
  All rights reserved. This program and the accompanying materials
  are made available under the terms of the Eclipse Public License v1.0
  which accompanies this distribution, and is available at
  http://www.eclipse.org/legal/epl-v10.html
 
  Contributors:
      IBM Corporation - initial API and implementation
*/
var request = new XMLHttpRequest();
request.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        document.getElementsByClassName("flexContainer").innerHTML = request.responseText;
        var response = JSON.parse(request.responseText);      
        var carTypes = response.carTypes;
        console.log(carTypes);
        for (var i = 0; i < carTypes.length; i++) {
            var card = document.createElement("div");
            card.className = "card";
            var cardText = document.createElement("span");
            cardText.className = "cardText";
            cardText.innerHTML = carTypes[i];
            card.appendChild(cardText);
            document.getElementsByClassName("flexContainer")[0].appendChild(card);
        }
    } else if (this.readyState == 4) {
        var flexContainer = document.getElementsByClassName("flexContainer")[0].innerHTML = "<h3 style='align:center;'>No car types could be retrieved</h3>";
    }
};
request.open("GET", "/inventory/carTypes", true);
request.send();