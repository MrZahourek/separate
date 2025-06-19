export const VISITOR_HITBOX_CORDS = {
    angel: [{x:154,y:895},{x:180,y:859},{x:180,y:859},{x:160,y:711},{x:162,y:689},{x:142,y:635},{x:135,y:558},{x:123,y:549},{x:130,y:525},{x:126,y:454},{x:101,y:469},{x:94,y:463},{x:105,y:590},{x:138,y:803},{x:127,y:823},{x:105,y:826},{x:73,y:763},{x:64,y:771},{x:53,y:761},{x:32,y:657},{x:23,y:652},{x:32,y:560},{x:30,y:500},{x:23,y:493},{x:26,y:417},{x:16,y:331},{x:6,y:323},{x:28,y:231},{x:24,y:220},{x:45,y:209},{x:75,y:170},{x:102,y:165},{x:126,y:181},{x:141,y:179},{x:136,y:145},{x:143,y:124},{x:123,y:82},{x:133,y:35},{x:170,y:8},{x:208,y:3},{x:253,y:9},{x:289,y:33},{x:308,y:66},{x:306,y:91},{x:283,y:124},{x:285,y:154},{x:283,y:175},{x:301,y:163},{x:332,y:146},{x:373,y:172},{x:433,y:264},{x:443,y:383},{x:419,y:531},{x:411,y:684},{x:388,y:789},{x:350,y:812},{x:340,y:800},{x:321,y:793},{x:342,y:689},{x:334,y:673},{x:349,y:540},{x:344,y:527},{x:362,y:426},{x:337,y:438},{x:291,y:421},{x:286,y:430},{x:309,y:520},{x:316,y:561},{x:306,y:614},{x:319,y:674},{x:301,y:680},{x:289,y:680},{x:278,y:862},{x:311,y:908},{x:306,y:915},{x:278,y:917},{x:262,y:911},{x:239,y:892},{x:233,y:693},{x:225,y:693},{x:227,y:721},{x:216,y:838},{x:225,y:882},{x:178,y:912},{x:153,y:910}],
    stone: [{x:17,y:14},{x:9,y:24},{x:4,y:33},{x:2,y:43},{x:2,y:56},{x:6,y:71},{x:15,y:83},{x:26,y:92},{x:48,y:98},{x:68,y:95},{x:83,y:86},{x:93,y:73},{x:98,y:59},{x:99,y:41},{x:92,y:24},{x:80,y:11},{x:62,y:3},{x:42,y:2}],
    heart: [{x:105,y:81},{x:128,y:81},{x:146,y:86},{x:152,y:92},{x:154,y:116},{x:162,y:116},{x:175,y:111},{x:172,y:102},{x:157,y:96},{x:163,y:83},{x:177,y:90},{x:174,y:77},{x:186,y:69},{x:193,y:72},{x:206,y:36},{x:205,y:29},{x:214,y:27},{x:227,y:32},{x:233,y:38},{x:228,y:47},{x:225,y:48},{x:205,y:94},{x:203,y:105},{x:206,y:107},{x:213,y:97},{x:239,y:74},{x:234,y:57},{x:235,y:52},{x:245,y:49},{x:253,y:54},{x:255,y:27},{x:268,y:26},{x:271,y:30},{x:270,y:49},{x:277,y:44},{x:287,y:49},{x:290,y:58},{x:290,y:62},{x:267,y:80},{x:273,y:94},{x:270,y:101},{x:260,y:100},{x:255,y:89},{x:236,y:107},{x:239,y:116},{x:256,y:125},{x:260,y:134},{x:262,y:149},{x:279,y:155},{x:287,y:155},{x:301,y:146},{x:308,y:150},{x:310,y:161},{x:305,y:162},{x:298,y:168},{x:300,y:171},{x:312,y:177},{x:317,y:186},{x:319,y:193},{x:304,y:221},{x:295,y:226},{x:285,y:224},{x:280,y:218},{x:278,y:211},{x:270,y:201},{x:262,y:196},{x:260,y:195},{x:259,y:205},{x:266,y:210},{x:283,y:233},{x:295,y:256},{x:294,y:268},{x:300,y:282},{x:296,y:286},{x:302,y:312},{x:299,y:343},{x:294,y:359},{x:291,y:373},{x:287,y:381},{x:285,y:397},{x:280,y:399},{x:280,y:412},{x:270,y:432},{x:269,y:442},{x:265,y:449},{x:260,y:455},{x:244,y:466},{x:220,y:466},{x:213,y:462},{x:192,y:463},{x:171,y:454},{x:125,y:427},{x:75,y:383},{x:72,y:372},{x:61,y:353},{x:60,y:348},{x:53,y:328},{x:55,y:323},{x:52,y:314},{x:40,y:298},{x:30,y:251},{x:41,y:199},{x:56,y:150},{x:59,y:142},{x:56,y:108},{x:54,y:97},{x:45,y:90},{x:28,y:83},{x:19,y:67},{x:25,y:55},{x:37,y:38},{x:48,y:40},{x:90,y:58}]
}

export const VISITOR_IMAGE_DESIRED_SIZE = {
    angel: {width: 280, height: 575},
    heart: {width: 230, height: 300},
    stone: {width: 70, height: 70},
    warlock: {width: 300, height: 575},
    hollow: {width: 280, height: 575},
    horde: {width: 340, height: 640},
    hunter: {width: 280, height: 575}
};

export const HITBOX_ORIGINAL_SCREEN = {
    angel: {width: 1920, height: 919},
    stone: {width: 100, height: 100},
    heart: {width: 345, height: 486},
    horde: {width: 1920, height: 919},
    warlock: {width: 1920, height: 919},
    hollow: {width: 1920, height: 919},
    closet: {width: 1920, height: 919}
};

export const ITEMS_IN_ROOM = new Map([
    ["hall 1", []],
    ["bathroom", []],
    ["living room", []],
    ["kitchen", []],
    ["hall 2", []],
    ["office", []],
    ["master bedroom", []],
    ["kid bedroom", []]
]);

export const ROOM_FAVORITES = new Map([
    ["hall 1", "doorman"],
    ["bathroom", "hunter"],
    ["living room", "horde"],
    ["kitchen", "angel"],
    ["hall 2", "reanimation"],
    ["office", "hollow"],
    ["master bedroom", "hollow"],
    ["kid bedroom", "jester"]
]);

export const VISITORS_REQUIREMENTS = new Map([
    ["angel", []],
    ["hollow", []],
    ["hunter", []],
    ["doorman", []],
    ["jester", []],
    ["jester clone", []],
    ["horde", []],
    ["horde heart", ["closet"]],
    ["reanimation", []],
    ["warlock", []],
    ["seelie stone", ["closet"]]
]);

export const VISITOR_SPAWN_PLACES = new Map([
    ["angel", ["room"]],
    ["hollow", ["room"]],
    ["hunter", ["room"]],
    ["doorman", ["room"]],
    ["jester", ["room", "closet"]],
    ["jester clone", ["room", "closet"]],
    ["horde", ["room"]],
    ["horde heart", ["closet"]],
    ["reanimation", ["room"]],
    ["warlock", ["room"]],
    ["seelie stone", ["closet"]]
]);

export const VISITOR_ABILITIES = new Map([
    ["angel", ["walker"]],
    ["hollow", ["walker"]],
    ["hunter", ["room blocker"]],
    ["doorman", ["room blocker"]],
    ["jester", []],
    ["jester clone", []],
    ["horde", []],
    ["horde heart", []],
    ["reanimation", ["walker"]],
    ["warlock", ["walker"]],
    ["seelie stone", []]
]);