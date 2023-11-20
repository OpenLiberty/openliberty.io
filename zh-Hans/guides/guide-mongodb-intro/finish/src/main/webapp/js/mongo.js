/*******************************************************************************
* Copyright (c) 2020 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     IBM Corporation - initial API and implementation
*******************************************************************************/

function addCrewMember(e) {
    var userCreationForm = document.getElementById("userCreation");

    var crewMember = {
        name: userCreationForm.elements.crewMemberName.value,
        crewID: userCreationForm.elements.crewMemberID.value,
        rank: userCreationForm.elements.crewMemberRank.value
    };
    
    var request = new XMLHttpRequest();

    request.onload = function () {
        if (this.status === 200) {
            userCreationForm.reset();
            refreshDocDisplay();
        } else {
            var i = 0;
            for (m of JSON.parse(this.response)) {
                toast(m, i++);
            }
        }
    }

    request.open("POST", "api/crew/", true);
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(crewMember));
    
    e.preventDefault();
}

function toggleUpdateForm(entry) { 
    if (document.getElementById("docID").value === entry._id.$oid) {
        clearUpdateForm();
        return;
    }

    var userUpdateForm = document.getElementById("userUpdate");

    userUpdateForm.elements.docID.value = entry._id.$oid;
    userUpdateForm.elements.updateCrewMemberName.value = entry.Name;
    userUpdateForm.elements.updateCrewMemberID.value = entry.CrewID;
    userUpdateForm.elements.updateCrewMemberRank.value = entry.Rank;
    
    userUpdateForm.classList.remove("hidden");
}

function clearUpdateForm() {
    document.getElementById("userUpdate").classList.add("hidden");
    document.getElementById("userUpdate").reset();
}

function updateCrewMember(e) {
    var userUpdateForm = document.getElementById("userUpdate");
    
    var id = userUpdateForm.elements.docID.value;
    var crewMember = {
        name: userUpdateForm.elements.updateCrewMemberName.value,
        crewID: userUpdateForm.elements.updateCrewMemberID.value,
        rank: userUpdateForm.elements.updateCrewMemberRank.value
    };

    var request = new XMLHttpRequest();

    request.onload = function () {
        if (this.status === 200) {
            clearUpdateForm();
            refreshDocDisplay();
        } else {
            var i = 0;
            for (m of JSON.parse(this.response)) {
                toast(m, i++);
            }
        }
    }

    request.open("PUT", "api/crew/" + id, true);
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(crewMember));

    e.preventDefault();
}

function refreshDocDisplay() {
    var request = new XMLHttpRequest();

    request.onload = function () {
        if (this.status === 200) {
            clearDisplay();
            doc = JSON.parse(this.responseText);

            doc.forEach(addToDisplay);
            if (doc.length > 0) {
                document.getElementById("userDisplay").style.display = 'flex';
                document.getElementById("docDisplay").style.display = 'flex';
            } else {
                document.getElementById("userDisplay").style.display = 'none';
                document.getElementById("docDisplay").style.display = 'none';
            }
            document.getElementById("docText").innerHTML = JSON.stringify(doc, null, 2);
        }
    }

    request.open("GET", "api/crew", true);
    request.send();
}

function addToDisplay(entry) {
    var userHtml = "<div>Name: " + entry.Name + "</div>" +
        "<div>ID: " + entry.CrewID + "</div>" +
        "<div>Rank: " + entry.Rank + "</div>" +
        "<button class=\"deleteButton\" onclick=\"remove(event,'" + entry._id.$oid + "')\">Delete</button>";

    var userDiv = document.createElement("div");
    userDiv.setAttribute("class", "user flexbox");
    userDiv.setAttribute("id", entry._id.$oid);
    userDiv.onclick = function() { toggleUpdateForm(entry) };
    userDiv.innerHTML = userHtml;
    document.getElementById("userBoxes").appendChild(userDiv);
}

function clearDisplay() {
    var usersDiv = document.getElementById("userBoxes");
    while (usersDiv.firstChild) {
        usersDiv.removeChild(usersDiv.firstChild);
    }
}

function remove(e, id) {
    var request = new XMLHttpRequest();

    request.onload = function () {
        if (this.status === 200) { 
            if (id === document.getElementById("docID").value) {
                clearUpdateForm();
            }
            document.getElementById(id).remove();
            refreshDocDisplay();
        }
    }

    request.open("DELETE", "api/crew/" + id, true);
    request.send();

    e.stopPropagation();
}

function toast(message, index) {
    var length = 3000;
    var toast = document.getElementById("toast");
    setTimeout(function () { toast.innerText = message; toast.className = "show"; }, length * index);
    setTimeout(function () { toast.className = toast.className.replace("show", ""); }, length + length * index);
}