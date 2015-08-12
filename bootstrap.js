// when the extension is first installed
chrome.runtime.onInstalled.addListener(function(details) {
    chrome.storage.sync.set({"muted_people": null});
    chrome.storage.sync.set({ "status_pref": true});
});

 // listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(id, info, tab){

    if (tab.url.toLowerCase().indexOf("facebook.com") > -1){
        chrome.pageAction.show(tab.id);
    }

});