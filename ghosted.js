var killed_containers = [],
  structure = {
    stories : {
      containerClasses : ["_5jmm"],
      imageLinkClasses : [ "_5v9u", "_5pb8"]
    },
    comments : {
      containerClasses : ["UFIComment"],
      imageLinkClasses : ["UFIImageBlockImage"]
    }
  };
  
  
function getMutedList(value) {
  chrome.storage.sync.get("muted_list", function (data) {
    var bannedPersons = null;
    if (data["muted_list"]) { 
      bannedPersons = data["muted_list"];
      value(bannedPersons);
    } 
  });
}

function getTransparency(value) {
  chrome.storage.sync.get("transparency", function (data) {
    var level = null;
    if (data["transparency"]) { 
      level = data["transparency"];
      value(level);
    } 
  });
}
// Pattern for fetching async values
/* getMutedList( function(idk) {
  console.log(idk);
}); */

function ghost() {
    _.each(structure, function(contentType) {
      // find all potential posts
      var containerClasses = contentType.containerClasses,
          imageLinkClasses = contentType.imageLinkClasses;
      _.each(containerClasses, function(containerClass){
        posts = document.getElementsByClassName(containerClass);
        _.each(posts, function(post){
          ghostkillLinks(post, imageLinkClasses);
        });
      });
    });
}

function removeUrlParams(profileUrl) {
  var pretrimmedUrl, trimmedUrl;
  if (profileUrl.indexOf('profile.php') > -1 ) {
    // this is a non-vanity URL
    pretrimmedUrl = profileUrl.split('?id=')[1];
    trimmedUrl = pretrimmedUrl.split('&')[0];
  } else {
    // this is a vanity URL
    pretrimmedUrl = profileUrl.split('?')[0];
    trimmedUrl = pretrimmedUrl.split('facebook.com/')[1];

  }
  return trimmedUrl;
}

function ghostkillLinks(item, imageLinkClasses){
  _.each(imageLinkClasses, function(imageLinkClass) { 
    var imageLinks = item.getElementsByClassName(imageLinkClass);
    // console.log(imageLinks);
    _.each(imageLinks, function(link){
      
      if (link.href) {
        var href = link.href.toLowerCase();
        href = removeUrlParams(href);
        //console.log(href);
        getMutedList( function(bannedPerson) {
          _.each(bannedPerson, function(profileUrl){
            //console.log(profileUrl[0]);
              // can't use indexOf in case a shorter name is contained in a longer name
              // ie Kim John --> Kim Johnson
              if (href == profileUrl[0].toLowerCase() ) {
                ghostkillItem(item);
              }
          });
        });
      }
    });
  });
}

function ghostkillItem(item){
  getTransparency( function(level) {
    //console.log(level)
    var opacityLevel;
    if (level === "off") { 
      opacityLevel = "1";
    } else if (level === "low") {
      opacityLevel = "0.25";
    } else if (level === "medium") {
      opacityLevel = "0.1";
    } else if (level === "high") {
      opacityLevel = "0";
    }

    // set the comment to be invisible
    item.style.opacity = opacityLevel;
  });   

  // add this story to the list of killed stories
  if (killed_containers.indexOf(item) == -1){
    killed_containers.push(item);
  }
}

ghost();

// debounce the function so it's not running constantly
var scrollGhost = _.debounce(ghost, 100);
document.addEventListener("scroll", scrollGhost);

chrome.storage.onChanged.addListener(function(changes, namespace) {
  // When new profiles are added to list, or transparency level is changed, re-run ghost function
  for (key in changes) {
    if ((key === "transparency") || (key === "muted_list")) {
      ghost();
    }
  }

  //Debug helper
  /*
  for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  } */
});
