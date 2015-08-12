console.log('settings.js');

document.addEventListener('DOMContentLoaded', function(){

    var input = document.getElementById('mute-person'),
      submitForm = document.getElementById('submit-form'),
      flag = document.getElementById('status-flag'),
      list = document.getElementById('mute-list'),
      emptyMsg = document.getElementById('no-mutes');

    function removeNamefromData(name) {
      chrome.storage.sync.get("muted_list", function(data) {
        if (data["muted_list"]){
          console.log(data["muted_list"]);
          // Remove one item at index 0
          var position = data["muted_list"].indexOf(name);
         
          console.log('position: ' + position);
          if (position !== -1) {
            data["muted_list"].splice(position, 1);
          }
          
          chrome.storage.sync.set(data, function() {
              //console.log('Item deleted!');
          });
        }
      });
    }

    function listName(name) {
			var listItem = document.createElement("li"),
          button = document.createElement("button"),
          buttonText = document.createTextNode('Remove'),
          text = document.createTextNode(name);

      button.appendChild(buttonText);
      button.classList.add('remove');
			listItem.appendChild(text);
      listItem.appendChild(button);
			list.appendChild(listItem);

      button.addEventListener("click", function(e){
        var removeThis = this.parentNode.childNodes[0].nodeValue,
        parentLi = this.parentNode;
        
        removeNamefromData(removeThis);
        parentLi.remove();
        console.dir(list);
        if (list.children.length === 0) {
          emptyMsg.classList.remove('hide');
        }
      });
		}

    function sanitizeUrl(profileUrl) {
      var trimmedUrl = profileUrl.split('?')[0],
      santizedUrl = stripHttp(trimmedUrl);
      return santizedUrl;
    }

    function stripHttp(httpUrl) {
      var strippedUrl = httpUrl.split('facebook.com/')[1];
      if ( strippedUrl !== undefined) {
        return strippedUrl;
      } else {
        return httpUrl;
      }
    }
        
      
    // set the initial state of the checkbox
    chrome.storage.sync.get("status_pref", function(data){
      if (data["status_pref"]){
        flag.checked = true;
      } else {
        flag.checked = false;
      }
    });

    flag.addEventListener("change", function(){
      chrome.storage.sync.set({ "status_pref": flag.checked});
      console.log('flag changed');
    });

    // set the initial state of the list of muted names
    chrome.storage.sync.get("muted_list", function(data){
      if ((Array.isArray(data["muted_list"])) && (data["muted_list"].length >= 1) ) {
      	var namesList = data["muted_list"];
        console.log('muted list has data, add some names to UI.');
        console.log(namesList);
        emptyMsg.classList.add('hide');
        namesList.forEach(function(entry) {
				   listName(entry);
				});

      } else {
        
        console.log('muted list had no data, add an empty message');
      }
    });
    
    // listens for form submit
    submitForm.addEventListener("click", function(e){
        e.preventDefault();
        console.log('submit clicked');

        var uglyUrl = input.value;

        var newPerson = sanitizeUrl(uglyUrl);

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

});