console.log('settings.js');

document.addEventListener('DOMContentLoaded', function(){

    var input = document.getElementById('mute-person'),
      submitForm = document.getElementById('submit-form'),
      list = document.getElementById('mute-list'),
      emptyMsg = document.getElementById('no-mutes'),
      reset = document.getElementById('reset'),
      radioTransparency = document.getElementsByName('transparencylevel');

      console.log(radioTransparency);

    function removeNamefromData(name) {
      console.log('name 1: ' + name );
      chrome.storage.sync.get("muted_list", function(data) {
        if (data["muted_list"]){
          console.log(data["muted_list"]);
          // Remove one item at index 0
          var profileData = data["muted_list"],
              spliceList = [];
          _.each(profileData, function(profile, index){
            console.log('name: ' + name);
            console.log('profileData: ' + profileData);
            console.log('profile: ' + profile);
            console.log('index: ' + index);
            var profileToDelete = profile[0].indexOf(name);
            if (profileToDelete !== -1) {
             spliceList.push(index);
            } 
            console.log('----------')
          });
          spliceList.reverse();
          console.log(spliceList);

          _.each(spliceList, function(entry) {
            data["muted_list"].splice(entry, 1);
          });
          //
          console.log('deleted!');
         
          /* console.log('position: ' + position);
          if (position !== -1) {
            data["muted_list"].splice(position, 1);
          } */
          
          chrome.storage.sync.set(data, function() {
              //console.log('Item deleted!');
          });
        }
      });
    }

    // Adds the markup to the list
    function listName(profile) {
			var listItem = document.createElement("li"),
        button = document.createElement("button"),
        buttonSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        buttonArt = document.createElementNS("http://www.w3.org/2000/svg","path"),
        text = document.createTextNode(profile[0]),
        profileLink = document.createElement("a"),
        urlType = profile[1];

      button.appendChild(buttonSvg);
      buttonSvg.setAttributeNS(null, "width", "11");
      buttonSvg.setAttributeNS(null, "height", "10")
      buttonSvg.appendChild(buttonArt);
      buttonArt.setAttributeNS(null, "d", "M7.691 1.712l-2.19 2.19-2.19-2.19c-.112-.112-.289-.115-.401-.004l-1.194 1.194c-.111.112-.108.288.004.401l2.19 2.19-2.19 2.19c-.111.112-.115.29-.004.402l1.194 1.193c.111.112.289.109.401-.003l2.19-2.191 2.19 2.19c.114.113.288.113.399.001l1.193-1.193c.111-.112.111-.286 0-.398l-2.189-2.19 2.189-2.19c.111-.112.111-.286 0-.398l-1.193-1.194c-.111-.112-.285-.112-.399 0z");  

      button.classList.add('remove');
      listItem.appendChild(profileLink);
			profileLink.appendChild(text);
      if (urlType === "vanity") {
        profileLink.href = "http://facebook.com/" + profile[0];
      } else if (urlType === "id") {
        profileLink.href = "http://facebook.com/profile.php?id=" + profile[0];
      }
      profileLink.target = "blank";
      
      listItem.appendChild(button);
			list.appendChild(listItem);

      button.addEventListener("click", function(e){
        var removeThis = this.parentNode.childNodes[0].childNodes[0].nodeValue,
        parentLi = this.parentNode;
        console.log('removeThis = ' + removeThis); 
        removeNamefromData(removeThis);
        parentLi.remove();
        if (list.children.length === 0) {
          emptyMsg.classList.remove('hide');
        }
      });
		}

    // Strips the domain and unnecessary URL params from profile URL
    function trimProfileUrl(profileUrl) {
      var pretrimmedUrl, trimmedUrl, urlType;
      if (profileUrl.indexOf('profile.php') > -1 ) {
        // this is a non-vanity URL
        pretrimmedUrl = profileUrl.split('?id=')[1];
        trimmedUrl = pretrimmedUrl.split('&')[0];
        urlType = "id";
      } else {
        // this is a vanity URL
        pretrimmedUrl = profileUrl.split('?')[0];
        trimmedUrl = pretrimmedUrl.split('facebook.com/')[1];
        urlType = "vanity";
      }
      return [trimmedUrl, urlType];
    }


    // set the initial transparency level
    chrome.storage.sync.get("transparency", function(data){
      if (data["transparency"]){
        console.log('initial get ' + data["transparency"]);
        var activeRadio = document.getElementById(data["transparency"]);
        activeRadio.checked = true;
      } else {
        console.log('blank ' + data["transparency"]);
        var defaultRadio = document.getElementById("medium");
        defaultRadio.checked = true;
        console.log(data["transparency"]);
      }
    });

    // Listens for changing the transparency level
    [].forEach.call(radioTransparency, function(radio) {
        radio.addEventListener("change", function(){
          if (radio.checked === true) {
            chrome.storage.sync.set({ "transparency": radio.value});
            console.log('transparency: ' + radio.value);
          }
          
        });
    });

    // set the initial state of the list of muted names
    chrome.storage.sync.get("muted_list", function(data){
      if ((Array.isArray(data["muted_list"])) && (data["muted_list"].length >= 1) ) {
      	var namesList = data["muted_list"];
        //console.log('muted list has data, add some names to UI.');
        //console.log(namesList);
        emptyMsg.classList.add('hide');
        namesList.forEach(function(entry) {
				   listName(entry);
				});

      } else {
        console.log('muted list has no data');
      }
    });
    
    // listens for profileURL form submit
    submitForm.addEventListener("click", function(e){
        e.preventDefault();
        console.log('submit clicked');

        var uglyUrl = input.value;

        var newPerson = trimProfileUrl(uglyUrl);
        console.log(newPerson);

        if (uglyUrl !== '') {
        	chrome.storage.sync.get("muted_list", function(data){
			      if (data["muted_list"]){
			        
			        var existingArray = data["muted_list"];
			        existingArray.push(newPerson);
			        chrome.storage.sync.set({ muted_list: existingArray});
              console.log('muted list has data:' + data["muted_list"]);
			      } else {
			      	console.log('muted list has no data, make an array');
			      	var newArray = [];
			      	newArray.push(newPerson);
			      	chrome.storage.sync.set({ "muted_list": newArray});
			      }

		    	});
          emptyMsg.classList.add('hide');
          listName(newPerson);  
        }
       
       input.blur();
       input.value = null;
    });

    // resets the list of profiles
    reset.addEventListener("click", function(e){ 
      e.preventDefault();
      chrome.storage.sync.set({"muted_list": null});
      console.log('reset');
      chrome.storage.sync.get("muted_list", function(data) {
        console.log(data["muted_list"]);
      });
    });
});