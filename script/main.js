'use strict';

var ghostData = [];
var mapData = [];
var ghostDataAddr = './data/ghostdata.json';
var mapDataAddr = './data/mapdata.json';

/**
 * A shorter way to get elements by ID
 * 
 * @param {any} selector the ID of the DOM Object
 * @returns corresponding DOM object
 */
function getId(selector) {
    return document.getElementById(selector);
}

/**
 * Draw the map accourding to the data
 * 
 * @param {any} myGhostData the data of the ghosts
 */
function renderGhost(myGhostData) {
    var myMap = getId('map-container');
    myGhostData.forEach(function (curVar, index, array) {
        myMap.innerHTML += '<div id="' + curVar.id +
            '" class="points points-ghosts" style="top: ' + curVar.pos[0] +
            'px; left: ' + curVar.pos[1] +
            'px;" ghost-index="' + index +
            '" ' + (curVar.found ? 'ghost-found' : '') +
            ' ></div>';
    });
}
/*
function renderMap(mapData){
    var myMap = getId('map-container');
    mapData.forEach(function (curVar, index, array) {
        myMap.innerHTML += '<div id="' + curVar.id +
            '" class="mapmodule" style="top: ' + curVar.pos[0] +
            'px; left: ' + curVar.pos[1] +
            'px;" map-index="' + index +
            '" ' + (curVar.found ? 'map-found' : '') +
            ' ></div>';
    });
}
*/

/**
 * Get ghost data via localStorage or ajax
 * 
 * @param {any} srcAddr where the data of the ghost is on the server
 * @param {any} success what to do when the data is gotten, as JSON String
 */
function getGhostData(srcAddr, success) {
    var myGhostData = null;
    if (myGhostData = storage.get('ghostData')) {
        success.call(this, myGhostData);
    } else {
        var xhr = new XMLHttpRequest;
        xhr.open('GET', srcAddr);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                myGhostData = xhr.responseText;
                storage.set('ghostData', myGhostData);
                success.call(this, myGhostData);
            }
        };
        xhr.send();
    }
}
/*
function getMapData(srcAddr, success) {
    var myMapData = null;
    if (myMapData = storage1.get('mapData')) {
        success.call(this, mapData);
    } else {
        var xhr = new XMLHttpRequest;
        xhr.open('GET', srcAddr);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                mapData = xhr.responseText;
                storage1.set('mapData', mapData);
                success.call(this, mapData);
            }
        };
        xhr.send();
    }
}
*/
/**
 * Change particular ghost to the status of "found"
 * 
 * @param {any} id the ID of the ghost which you want to change the status
 */
function setFound(id) {
    var curPoint = document.getElementById(id);
    var index = parseInt(curPoint.getAttribute('ghost-index'));
    ghostData[index].found = true;
    storage.set('ghostData', JSON.stringify(ghostData));
    curPoint.setAttribute('ghost-found', true);
}

// Entry
getGhostData(ghostDataAddr, function (myGhostData) {
    myGhostData = JSON.parse(myGhostData);
    ghostData = myGhostData;
    renderGhost(myGhostData);
});
/*
getMapData(mapDataAddr, function (mapData) {
    mapData = JSON.parse(mapData);
    mapData = mapData;
    renderMap(mapData);
});
*/




/**
 * Change pictures of  "collection"
 * 
 * @param {any} id the ID of the character which you want to change the status
 */
function collectPartChange(id, part, src){
    var collectman = document.getElementById(id);
    if(part == "left"){
        var collectpart = collectman.children[0];
        collectpart.style.background = "url(" + src + ")";

    }else{
        var collectpart = collectman.children[1];
        collectpart.style.background = "url(" + src + ")";
    }
}


collectPartChange("co-witch", "left", "./imgs/collection/witch1.png");
collectPartChange("co-witch", "right", "./imgs/collection/witch2.png");

//navigator click function
var mappart = getId('map');
var collectionpart = getId('collectionpart');
var hauntpart = getId('hauntpart');

function gtmapClick(){
    mappart.style.display = "block";
    collectionpart.style.display = "none";
    hauntpart.style.display = "none";
}

function hauntClick(){
    mappart.style.display = "none";
    collectionpart.style.display = "none";
    hauntpart.style.display = "block";
}

function collectionClick(){
    mappart.style.display = "none";
    collectionpart.style.display = "block";
    hauntpart.style.display = "none";
}

/**
 * ***************************************************************
 * **************    A-frame click events    *********************
 * ***************************************************************
 */

function ghost1(){
    modelOnclick('ghost1model','Ghost Head +1');
    collectPartChange("co-ghost", "left", "./imgs/collection/ghost1.png");
}

function vampire1(){
    collectPartChange("co-vampire", "left", "./imgs/collection/vampire1.png");
}

var once = true;
function modelOnclick(id,words){
    if(once){
        var myModel = getId(id);
        myModel.innerHTML += '<div class="collect-hints">'+ words +'</div>';
        once = false;
        }
    }
