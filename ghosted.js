var killed_comments = [];
var storyContainerClasses = ["_5jmm"];
var commentClasses = ["UFIComment"];
var bannedDomains = ["facebook.com/buzzfeed", "bzfd.it", "buzzfeed.com"];
var somevar;

function getMutedList(value) {
  chrome.storage.sync.get("muted_list", function (data) {
    var bannedPersons = null;
    if (data["muted_list"]) { 
      bannedPersons = data["muted_list"];
      value(bannedPersons);
    } 
  });
}

/* getMutedList( function(idk) {
  console.log(idk);
}); */


var DEBUG = false;
var DEBUG_DOMAIN = "athletics.bowdoin.edu";

function ghost() {
  chrome.storage.sync.get("status_pref", function(data){
    if (data["status_pref"]){
      // find all potential posts
      _.each(commentClasses, function(commentClass){
        posts = document.getElementsByClassName(commentClass);
        _.each(posts, function(post){
          ghostkillLinks(post);
        });
      });
    }
  });
}

function removeUrlParams(profileUrl) {
  var trimmedUrl = profileUrl.split('?')[0];
  return trimmedUrl;
}

function stripHttp(profileUrl) {
  var trimmedUrl = profileUrl.split('facebook.com/')[1];
  return trimmedUrl;
}

function ghostkillLinks(item){
  var imageLinks = item.getElementsByClassName("UFIImageBlockImage");
  _.each(imageLinks, function(link){
    var href = link.href.toLowerCase();
    href = removeUrlParams(href);
    href = stripHttp(href);
    //console.log(href);
    getMutedList( function(bannedName) {
         _.each(bannedName, function(profileUrl){
            // can't use indexOf in case a shorter name is contained in a longer name
            // ie Kim John --> Kim Johnson
            if ( (href == profileUrl) || (DEBUG && href.indexOf(DEBUG_DOMAIN) !== -1)){
              ghostkillItem(item);
            }
          /* if (href.indexOf(profileUrl) !== -1 || (DEBUG && href.indexOf(DEBUG_DOMAIN) !== -1)){
            ghostkillItem(item);
          } */
      });
    });
   

  });
}

function ghostkillItem(item){

  // set the story to be invisible
  if (DEBUG){
    item.style.opacity = "0.5";
  } else {
    item.style.opacity = "0.2";
    //item.style.display = "None";
  }

  // add this story to the list of killed stories
  if (killed_comments.indexOf(item) == -1){
    if (DEBUG){
      console.log("killed a link");
    }
    killed_comments.push(item);
  }

}

ghost();

// debounce the function so it's not running constantly
var scrollGhost = _.debounce(ghost, 50);
document.addEventListener("scroll", scrollGhost);