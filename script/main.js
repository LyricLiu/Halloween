'use strict';

var storage = {
    prefix: 'ghostgame',
    get: function (index) {
        return localStorage.getItem(this.prefix + '-' + index);
    },
    set: function (index, data) {
        localStorage.setItem(this.prefix + '-' + index, data);
    }
}

var GPSCalc = {
    topLeftOnGps: [-84.407478, 33.781556],
    bottomRightOnGps: [-84.390230, 33.771280],
    topLeftOnMap: [37.5, 27],
    bottomRightOnMap: [454.5, 611],
    GPSToMap: function (gpsPos, offset) {
        return [
            ((gpsPos[1] - this.topLeftOnGps[1]) / (this.bottomRightOnGps[1] - this.topLeftOnGps[1])) * (this.bottomRightOnMap[0] - this.topLeftOnMap[0]) + this.topLeftOnMap[0] - (offset / 2),
            ((gpsPos[0] - this.topLeftOnGps[0]) / (this.bottomRightOnGps[0] - this.topLeftOnGps[0])) * (this.bottomRightOnMap[1] - this.topLeftOnMap[1]) + this.topLeftOnMap[1] - (offset / 2)
        ];
    }
}

var ghostData = [];

/**
 * A shorter way to get elements by ID
 * 
 * @param {any} selector the ID of the DOM Object
 * @returns corresponding DOM object
 */
function getId(selector) {
    return document.getElementById(selector);
}


function getPointId(id) {
    return getId('point-' + id);
}

/**
 * Draw the map accourding to the data
 * 
 * @param {any} myGhostData the data of the ghosts
 */
function renderGhost(myGhostData) {
    var myMap = getId('map-container');
    myGhostData.forEach(function (curVar, index, array) {
        myMap.innerHTML += '<div id="point-' + curVar.id +
            '" class="points points-ghosts" style="top: ' + curVar.pos[0] +
            'px; left: ' + curVar.pos[1] +
            'px;" ghost-index="' + index +
            '"></div>';
        if (curVar.found) {
            setGhost(curVar.id, 'found');
        }
    });
}

function renderCharacter(id) {
    var myMap = getId('map-container');
    var character = getId(id);
    var characterGpsPos = character.getAttribute('lla').trim().split(' ').map(function (a) {
                return parseFloat(a)
            });
    var characterPos = GPSCalc.GPSToMap(characterGpsPos, 10);
    myMap.innerHTML += '<div class="character-icon" style="top: ' + characterPos[0] +
            'px; left: ' + characterPos[1] +
            'px"></div>';
}

/**
 * Get ghost data via localStorage or ajax
 * 
 * @param {Function} success what to do when the data is gotten, as JSON String
 */
function getGhostData(success) {
    var myGhostData = null;
    if (!(myGhostData = storage.get('ghostData'))) {
        var myGhostDataArr = [];
        var ghosts = document.getElementsByClassName('ItemCollect');
        for (var i = 0; i < ghosts.length; i++) {
            var ghostGpsPos = ghosts[i].getAttribute('lla').trim().split(' ').map(function (a) {
                return parseFloat(a)
            });
            var ghostId = ghosts[i].getAttribute('id');
            myGhostDataArr.push({
                id: ghostId,
                pos: GPSCalc.GPSToMap(ghostGpsPos, 6),
                found: false
            });
        }
        myGhostData = JSON.stringify(myGhostDataArr);
    }
    storage.set('ghostData', myGhostData);
    success.call(this, myGhostData);
}


// Entry
getGhostData(function (myGhostData) {
    myGhostData = JSON.parse(myGhostData);
    ghostData = myGhostData;
    renderGhost(myGhostData);
});

/**
 * Change pictures of  "collection"
 * 
 * @param {any} id the ID of the ghost you want to change
 * @param {any} part the picture you want to change
 * @param {any} status 'on' or 'off' to change the status
 */
function collectPartChange(kindId, part, status) {
    var father = getId('co-' + kindId);
    var things = father.getElementsByTagName('span');
    var thingToChange = things[part - 1];
    var curGhost = getId(kindId + (part == 3 ? '' : part));

    thingToChange.style.background = 'url(./imgs/collection/' + kindId + (part == 3 ? '' : part) + (status == 'on' ? '' : 'b') + '.png)';
    if (part != 3) {
        curGhost.setAttribute('should-be-discovered', (status == 'off' ? 'true' : 'false'));
        if (status == 'on') {
            thingToChange.setAttribute('found', 'found');
            if (things[0].getAttribute('found') == things[1].getAttribute('found')) {
                collectPartChange(kindId, 3, 'on');
                var Character = getId(kindId);
                Character.setAttribute('visible','true');
                renderCharacter(kindId);
            }
        } else {
            thingToChange.removeAttribute('found');
            collectPartChange(kindId, 3, 'off');
        }
    } else {
        curGhost.setAttribute('should-be-discovered', (status == 'on' ? 'true' : 'false'));
    }
}

/**
 * Zoom collection part
 * 
 * @param {any} id the ID of the ghost you want to change
 */

function zoomCollection(pic) {
    var zoom = getId('zoom');
    zoom.style.display = "block";
    zoom.style.background = 'url(./imgs/zoom/' + pic + '-zoom.png)';
}

function zoomDelete() {
    var zoom = getId('zoom');
    zoom.style.display = "none";
}

/********** GPS Module **********/

var urhere = getId('urhere');

function calcDist(map1, map2) {
    return Math.sqrt((map2[0] - map1[0]) * (map2[0] - map1[0]) + (map2[1] - map1[1]) * (map2[1] - map1[1]));
}

function displayNearest(mapPositon, limit) {
    var distData = [];
    var items = document.getElementsByTagName('ar-geopose');
    for (var i = 0; i < items.length; i++) {
        if (items[i].getAttribute('should-be-discovered') == 'true') {
            var curGpsPos = items[i].getAttribute('lla').trim().split(' ').map(function (a) {
                return parseFloat(a);
            });
            var curMapPos = GPSCalc.GPSToMap(curGpsPos, 24);
            var curDistData = {
                id: items[i].getAttribute('id'),
                dist: calcDist(mapPositon, curMapPos)
            };
            if (curDistData.dist <= limit) {
                items[i].setAttribute('visible', 'true');
            } else {
                items[i].setAttribute('visible', 'false');
            }
            distData.push(curDistData);
        } else {
            items[i].setAttribute('visible', 'false');
        }
    }

    console.table(distData);
}

function gpsSuccess(position) {
    urhere.removeAttribute('gps-error');
    var mapPositon = GPSCalc.GPSToMap([position.coords.longitude, position.coords.latitude], 24);
    urhere.style.top = mapPositon[0] + 'px';
    urhere.style.left = mapPositon[1] + 'px';
    displayNearest(mapPositon, 200);
}

function gpsError() {
    urhere.setAttribute('gps-error', 'gps-error');
}

setInterval(function () {
    navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError);
}, 500)

//navigator click function
var mappart = getId('map');
var collectionpart = getId('collectionpart');
var hauntpart = getId('hauntpart');

function gtmapClick() {
    mappart.style.display = "block";
    collectionpart.style.display = "none";
    hauntpart.style.display = "none";
}

function hauntClick() {
    mappart.style.display = "none";
    collectionpart.style.display = "none";
    hauntpart.style.display = "block";
}

function collectionClick() {
    mappart.style.display = "none";
    collectionpart.style.display = "block";
    hauntpart.style.display = "none";
}


/**
 * Change the status of particular ghost
 * 
 * @param {String} id the ID of the ghost which you want to change the status
 * @param {String} status the status you want to change to
 */
function setGhost(id, status) {
    var curPoint = getPointId(id);
    var curGhost = getId(id);
    console.log(getPointId(id));
    var kindId = id.slice(0, -1);
    var kindIndex = id[id.length - 1] - '0';
    var index = parseInt(curPoint.getAttribute('ghost-index'));
    if (status == 'found') {
        ghostData[index].found = true;
        curPoint.setAttribute('ghost-found', 'ghost-found');
        collectPartChange(kindId, kindIndex, 'on');
    } else if (status == 'notfound') {
        ghostData[index].found = false;
        curPoint.removeAttribute('ghost-found');
        collectPartChange(kindId, kindIndex, 'off');
    } else {
        throw new Error('Status ' + status + ' not specificed');
    }
    storage.set('ghostData', JSON.stringify(ghostData));
    curPoint.setAttribute('visible', 'false');
}

function addWord(id1,id2) {
    var a = getId(id1);
    var b = getId(id2);
    a.setAttribute('visible', 'false');
    b.setAttribute('visible', 'true');
}

function clearcache(){
    localStorage.clear();
}

