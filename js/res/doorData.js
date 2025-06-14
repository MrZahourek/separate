export const DOORS_IN_ROOM = new Map([
    ["hall 1", [1, 3, 5]],
    ["bathroom", [2, 7]],
    ["living room", [4, 8, 10, 11]],
    ["kitchen", [6, 9]],
    ["hall 2", [12, 13, 20]],
    ["office", [14, 15]],
    ["master bedroom", [16, 17]],
    ["kid bedroom", [19, 18]],
    ["death", []]
]);

export const CLOSETS_IN_ROOM = new Map([
    ["hall 1", []],
    ["bathroom", [1]],
    ["living room", []],
    ["kitchen", [2, 3]],
    ["hall 2", []],
    ["office", [4]],
    ["master bedroom", [5, 6]],
    ["kid bedroom", [7, 8]],
    ["death", []]
]);

/// connections
export const DOOR_CONNECTIONS = {
    1:  ["hall 1",          "bathroom"],
    2:  ["bathroom",        "hall 1"],
    3:  ["hall 1",          "living room"],
    4:  ["living room",     "hall 1"],
    5:  ["hall 1",          "kitchen"],
    6:  ["kitchen",         "hall 1"],
    7:  ["bathroom",        "living room"],
    8:  ["living room",     "bathroom"],
    9:  ["kitchen",         "living room"],
    10: ["living room",     "kitchen"],
    11: ["living room",     "hall 2"],
    12: ["hall 2",          "living room"],
    13: ["hall 2",          "office"],
    14: ["office",          "hall 2"],
    15: ["office",          "master bedroom"],
    16: ["master bedroom",  "office"],
    17: ["master bedroom",  "kid bedroom"],
    18: ["kid bedroom",     "master bedroom"],
    19: ["kid bedroom",     "hall 2"],
    20: ["hall 2",          "kid bedroom"]
};

/// coordinates
export const DOOR_COORDINATES = {
    1:  [{x:80,y:410},{x:80,y:462},{x:305,y:463},{x:305,y:418}],
    2:  [{x:76,y:406},{x:76,y:473},{x:220,y:471},{x:218,y:404}],
    3:  [{x:88,y:572},{x:87,y:625},{x:331,y:626},{x:331,y:574}],
    4:  [{x:81,y:410},{x:81,y:463},{x:204,y:463},{x:203,y:415}],
    5:  [{x:78,y:758},{x:78,y:824},{x:251,y:823},{x:251,y:759}],
    6:  [{x:81,y:403},{x:80,y:470},{x:206,y:470},{x:206,y:407}],
    7:  [{x:86,y:572},{x:84,y:629},{x:332,y:631},{x:331,y:572}],
    8:  [{x:76,y:533},{x:77,y:585},{x:293,y:585},{x:291,y:530}],
    9:  [{x:76,y:530},{x:76,y:585},{x:335,y:586},{x:335,y:534}],
    10: [{x:84,y:637},{x:84,y:689},{x:241,y:688},{x:241,y:642}],
    11: [{x:79,y:750},{x:80,y:804},{x:207,y:803},{x:207,y:753}],
    12: [{x:83,y:641},{x:82,y:687},{x:206,y:687},{x:206,y:642}],
    13: [{x:79,y:417},{x:79,y:465},{x:215,y:464},{x:215,y:415}],
    14: [{x:75,y:406},{x:78,y:471},{x:218,y:468},{x:216,y:412}],
    15: [{x:75,y:526},{x:75,y:592},{x:428,y:588},{x:425,y:531}],
    16: [{x:76,y:407},{x:77,y:467},{x:220,y:466},{x:218,y:408}],
    17: [{x:73,y:526},{x:73,y:592},{x:358,y:590},{x:357,y:526}],
    18: [{x:74,y:533},{x:74,y:588},{x:430,y:588},{x:429,y:533}],
    19: [{x:79,y:405},{x:81,y:471},{x:223,y:470},{x:221,y:406}],
    20: [{x:79,y:529},{x:81,y:588},{x:357,y:586},{x:357,y:528}]
};

/// data for scaling
export const ORIGINAL_SCREEN_SIZE = {width: 1920, height: 919};


export const ROOMS_AROUND = new Map([
    ["hall 1", ["bathroom", "kitchen", "living room"]],
    ["bathroom", ["hall 1", "living room"]],
    ["living room", ["bathroom", "hall 1", "kitchen", "hall 2"]],
    ["kitchen", ["hall 1", " living room"]],
    ["hall 2", ["office", "kid bedroom", "living room"]],
    ["office", ["hall 2", "master bedroom"]],
    ["master bedroom", ["office", "kid bedroom"]],
    ["kid bedroom", ["hall 2", "master bedroom"]],
    ["death", []]
]);