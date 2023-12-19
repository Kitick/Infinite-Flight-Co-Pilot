const autotrim = new autofunction("trim", 1000, [], ["pitch", "trim", "onground"], [], data => {
    const states = data.states;

    const onground = states.get("onground") as boolean;
    const pitch = states.get("pitch") as number;
    const trim = states.get("trim") as number;

    if(onground){
        autotrim.arm();
        return;
    }

    const deadzone = 2;
    let mod = 10;

    if(Math.abs(pitch) < 10){
        mod = 1;
    }
    else if(Math.abs(pitch) < 50){
        mod = 5;
    }

    if(Math.abs(pitch) >= deadzone){
        let newTrim = trim + mod * Math.sign(pitch);
        newTrim = Math.round(newTrim / mod) * mod;

        write("trim", newTrim);
    }
});

const autolights = new autofunction("lights", 2000, [], ["altitudeAGL", "onground", "onrunway", "gear"], [], data => {
    const states = data.states;

    const altitudeAGL = states.get("altitudeAGL") as number;
    const onground = states.get("onground") as boolean;
    const onrunway = states.get("onrunway") as boolean;
    const gear = states.get("gear") as boolean;

    write("master", true);
    write("beaconlights", true);
    write("navlights", true);

    if(onground){
        write("strobelights", onrunway);
        write("landinglights", onrunway);
    }
    else{
        write("strobelights", true);

        if(altitudeAGL < 1000 && gear){write("landinglights", true);}
        else{write("landinglights", false);}
    }
});

const autogear = new autofunction("gear", 1000, [], ["gear", "altitudeAGL", "verticalspeed"], [], data => {
    const states = data.states;

    const gear = states.get("gear") as boolean;
    const altitudeAGL = states.get("altitudeAGL") as number;
    const verticalspeed = states.get("verticalspeed") as number;

    let newState = gear;

    if(altitudeAGL < 100 || (verticalspeed <= -500 && altitudeAGL < 1500)){
        newState = true;
    }
    else if(verticalspeed >= 500 || altitudeAGL >= 2000){
        newState = false;
    }

    // readcommand to use the animation
    if(newState !== gear){read("commands/LandingGear");}
});

const autobrakes = new autofunction("autobrakes", 1000, [], ["leftbrake", "rightbrake", "autobrakes", "onground", "onrunway", "groundspeed"], [], data => {
    const states = data.states;

    const leftbrake = states.get("leftbrake") as number;
    const rightbrake = states.get("rightbrake") as number;
    const autobrakes = states.get("autobrakes") as number;
    const onground = states.get("onground") as boolean;
    const onrunway = states.get("onrunway") as boolean;
    const groundspeed = states.get("groundspeed") as number;

    let newBrakes = autobrakes;

    if(onground && !onrunway){newBrakes = 0;}
    else if(!onground){newBrakes = 2;}
    else if(onrunway){newBrakes = 3;}

    if(onground && groundspeed > 30 && (leftbrake > 0.3 || rightbrake > 0.3)){
        newBrakes = 0;
    }

    if(newBrakes !== autobrakes){write("autobrakes", newBrakes);}
});

const autoflaps = new autofunction("flaps", 1000, ["flaplow", "flaphigh", "flapto"], ["flaps", "airspeed", "altitudeAGL", "verticalspeed", "flapcount", "onground", "onrunway"], [], data => {
    const inputs = data.inputs;
    const states = data.states;

    const flaplow = inputs.get("flaplow") as number;
    const flaphigh = inputs.get("flaphigh") as number;
    const flapto = inputs.get("flapto") as number;

    const flaps = states.get("flaps") as number;
    const airspeed = states.get("airspeed") as number;
    const altitudeAGL = states.get("altitudeAGL") as number;
    const verticalspeed = states.get("verticalspeed") as number;
    const flapcount = states.get("flapcount") as number;
    const onground = states.get("onground") as boolean;
    const onrunway = states.get("onrunway") as boolean;

    if((flapto < 0 || flapto > flapcount - 1) || (flaphigh < flaplow)){
        autoflaps.error();
        return;
    }

    let newFlaps = flaps;

    if(onground){
        if(onrunway){newFlaps = flapto;}
        else{newFlaps = 0;}
    }
    else if(altitudeAGL >= 250){
        const count = flapcount - 1;

        const mod = (flaphigh - flaplow) / count;
        newFlaps = Math.round((flaphigh - airspeed) / mod);

        newFlaps = Math.max(newFlaps, 0);
        newFlaps = Math.min(newFlaps, count);
    }

    if((verticalspeed >= 500 && newFlaps > flaps) || (verticalspeed <= -500 && newFlaps < flaps)){
        newFlaps = flaps;
    }

    if(newFlaps !== flaps){write("flaps", newFlaps);}
});

const autospoilers = new autofunction("spoilers", 1000, [], ["spoilers", "airspeed", "spd", "altitude", "altitudeAGL", "onrunway", "onground"], [], data => {
    const states = data.states;

    const spoilers = states.get("spoilers") as number;
    const airspeed = states.get("airspeed") as number;
    const spd = states.get("spd") as number;
    const altitude = states.get("altitude") as number;
    const altitudeAGL = states.get("altitudeAGL") as number;
    const onrunway = states.get("onrunway") as boolean;
    const onground = states.get("onground") as boolean;

    let newSpoilers = 0;

    if(onrunway || (!onground && altitudeAGL < 1000)){
        newSpoilers = 2;
    }
    else if(airspeed - spd >= 20 && altitude < 28000){
        newSpoilers = 1;
    }

    if(newSpoilers !== spoilers){write("spoilers", newSpoilers);}
});

const levelchange = new autofunction("levelchange", 1000, ["flcinput", "flcmode"], ["airspeed", "altitude", "alt", "vs"], [], data => {
    const inputs = data.inputs;
    const states = data.states;

    const flcinput = inputs.get("flcinput") as number;
    const flcmode = inputs.get("flcmode") as string;

    const airspeed = states.get("airspeed") as number;
    const altitude = states.get("altitude") as number;
    const alt = states.get("alt") as number;
    const vs = states.get("vs") as number;

    let output = flcinput;

    const diffrence = alt - altitude;

    if(Math.abs(diffrence) < 100){
        levelchange.active = false;
        return;
    }

    if(flcmode === "v"){
        output = 6076.12 * Math.tan(output * toRad);
    }

    if(flcmode !== "f"){
        output *= Math.sign(diffrence) * (airspeed / 60);
    }

    output = Math.round(output / 100) * 100;

    if(output !== vs){write("vs", output);}
});

const markposition = new autofunction("markposition", -1, [], ["latitude", "longitude", "altitude", "heading"], [], data => {
    const states = data.states;

    const latitude = states.get("latitude") as number;
    const longitude = states.get("longitude") as number;
    const altitude = states.get("altitude") as number;
    const heading = states.get("heading") as number;

    autofunction.cache.save("latref", latitude);
    autofunction.cache.save("longref", longitude);
    autofunction.cache.save("hdgref", Math.round(heading));
    autofunction.cache.save("altref", Math.round(altitude));
});

const setrunway = new autofunction("setrunway", -1, [], ["route", "coordinates"], [], data => {
    const states = data.states;

    const route = states.get("route") as string;
    const coordinates = states.get("coordinates") as string;

    const fpl = route.split(",");
    let rwIndex = -1;

    for(let i = 0, length = fpl.length; i < length; i++){
        if(fpl[i].search(/RW\d\d.*/) === 0){
            rwIndex = i;
            break;
        }
    }

    if(rwIndex === -1){
        setrunway.error();
        return;
    }

    const runwayCoords = coordinates.split(" ")[rwIndex].split(",");
    const latref = parseFloat(runwayCoords[0]);
    const longref = parseFloat(runwayCoords[1]);
    const hdgref = parseInt(route[rwIndex][2] + route[rwIndex][3] + "0");

    autofunction.cache.save("latref", latref);
    autofunction.cache.save("longref", longref);
    autofunction.cache.save("hdgref", hdgref);
});

const flyto = new autofunction("flyto", 1000, ["flytolat", "flytolong", "flytohdg"], ["latitude", "longitude", "variation", "groundspeed", "wind", "winddir"], [], data => {
    const inputs = data.inputs;
    const states = data.states;

    const flytolat = inputs.get("flytolat") as number;
    const flytolong = inputs.get("flytolong") as number;
    const flytohdg = inputs.get("flytohdg") as number;

    const latitude = states.get("latitude") as number;
    const longitude = states.get("longitude") as number;
    const variation = states.get("variation") as number;
    const groundspeed = states.get("groundspeed") as number;
    const wind = states.get("wind") as number;
    const winddir = states.get("winddir") as number;

    const distance = calcLLdistance(latitude, longitude, flytolat, flytolong);

    if(distance < 1){
        flyto.active = false;
        return;
    }

    // Direct To
    const deltaY = 60 * (flytolat - latitude);
    const deltaX = 60 * (flytolong - longitude) * Math.cos((latitude + flytolat) * 0.5 * toRad);
    let course = cyclical(Math.atan2(deltaX, deltaY) * toDeg - variation);

    const hdgTarget = cyclical(flytohdg);
    let diffrence = hdgTarget - course;

    if(diffrence > 180){diffrence -= 360;}
    else if(diffrence < -180){diffrence += 360;}

    // Course Correction
    if(Math.abs(diffrence) < 5){course -= -0.1 * diffrence ** 3 + 8.5 * diffrence;}
    else{course -= 30 * Math.sign(diffrence);}

    // Wind Correction
    const windmag = cyclical(winddir - variation + 180);
    let courseMath = -course + 90;
    let windMath = -windmag + 90;

    courseMath *= toRad;
    windMath *= toRad;

    const courseX = 2 * groundspeed * Math.cos(courseMath);
    const courseY = 2 * groundspeed * Math.sin(courseMath);
    const windX = wind * Math.cos(windMath);
    const windY = wind * Math.sin(windMath);

    course = cyclical(Math.atan2(courseX - windX, courseY - windY) * toDeg);

    write("hdg", course);
});

const flypattern = new autofunction("flypattern", 1000, ["latref", "longref", "hdgref", "updist", "downwidth", "finallength", "turnconst", "leg", "direction", "approach"], ["latitude", "longitude", "variation", "groundspeed"], [], data => {
    const inputs = data.inputs;
    const states = data.states;

    const latref = inputs.get("latref") as number;
    const longref = inputs.get("longref") as number;
    const hdgref = inputs.get("hdgref") as number;
    const updist = inputs.get("updist") as number;
    const downwidth = inputs.get("downwidth") as number;
    const finallength = inputs.get("finallength") as number;
    const turnconst = inputs.get("turnconst") as number;
    const leg = inputs.get("leg") as string;
    const direction = inputs.get("direction") as string;
    const approach = inputs.get("approach") as boolean;

    const latitude = states.get("latitude") as number;
    const longitude = states.get("longitude") as number;
    const variation = states.get("variation") as number;
    const groundspeed = states.get("groundspeed") as number;

    const legs = ["u", "c", "d", "b", "f"];

    let legIndex = legs.indexOf(leg);
    const circuit = (direction === "r") ? 1 : -1;

    const hdg90 = hdgref + 90 * circuit;
    const hdgs = [hdgref, hdg90, hdgref + 180, hdg90 + 180, hdgref];

    let pattern = [];
    pattern[0] = calcLLfromHD(latref, longref, hdgref, updist + 1.5, variation);
    pattern[1] = calcLLfromHD(pattern[0][0], pattern[0][1], hdg90, downwidth, variation);
    pattern[3] = calcLLfromHD(latref, longref, hdgref + 180, finallength, variation);
    pattern[2] = calcLLfromHD(pattern[3][0], pattern[3][1], hdg90, downwidth, variation);
    pattern[4] = [latref, longref];

    const distance = calcLLdistance(latitude, longitude, pattern[legIndex][0], pattern[legIndex][1]);

    const speed = groundspeed / 60; // kts to nm/m
    const turnrate = (turnconst / groundspeed) * 60 * toRad; // deg/s to rad/m

    if(distance < speed / turnrate){
        if(legIndex !== 4 || (legIndex === 4 && distance < 1)){
            legIndex = (legIndex + 1) % 5;
        }
    }

    if(legIndex === 4 && approach){
        autoland.active = true;
    }

    const legout = legs[legIndex];
    const latout = pattern[legIndex][0];
    const longout = pattern[legIndex][1];
    const hdgout = cyclical(hdgs[legIndex]);

    autofunction.cache.save("leg", legout);
    autofunction.cache.save("flytolat", latout);
    autofunction.cache.save("flytolong", longout);
    autofunction.cache.save("flytohdg", hdgout);

    flyto.active = true;
});

const autospeed = new autofunction("autospeed", 1000, ["latref", "longref", "climbspd", "spdref"], ["onground", "airspeed", "verticalspeed", "altitudeAGL", "altitude", "latitude", "longitude", "spd"], [], data => {
    const inputs = data.inputs;
    const states = data.states;

    const latref = inputs.get("latref") as number;
    const longref = inputs.get("longref") as number;
    const climbspd = inputs.get("climbspd") as number;
    const spdref = inputs.get("spdref") as number;

    const onground = states.get("onground") as boolean;
    const airspeed = states.get("airspeed") as number;
    const verticalspeed = states.get("verticalspeed") as number;
    const altitudeAGL = states.get("altitudeAGL") as number;
    const altitude = states.get("altitude") as number;
    const latitude = states.get("latitude") as number;
    const longitude = states.get("longitude") as number;
    const spd = states.get("spd") as number;

    if(onground){
        autospeed.arm();
        return;
    }

    // elevation and cruisespd is optional
    const elevation = autofunction.cache.load("altref").get("altref") as number|null;
    const cruisespd = autofunction.cache.load("cruisespd").get("cruisespd") as number|null;
    const alt = (elevation === null) ? altitudeAGL : altitude - elevation;

    if(autoland.active){
        const distance = calcLLdistance(latitude, longitude, latref, longref);
        
        let speed = (distance - 2.5) * 10 + spdref;
        speed = Math.min(speed, spd);
        speed = Math.round(speed / 10) * 10;
        speed = Math.max(speed, spdref);

        write("spd", speed);
    }
    else if(flypattern.active){

    }
    else if(autotakeoff.active){
        if(verticalspeed > 500 && alt <= 10000 && climbspd - airspeed < 10){
            write("spd", climbspd);
            write("spdon", true);
        }
    }

    if(verticalspeed < -500 && alt <= 12000 && alt >= 10000){
        write("spd", 250);
    }

    if(cruisespd !== null && verticalspeed > 500 && alt > 10000){
        write("spd", cruisespd);
    }
});

const goaround = new autofunction("goaround", -1, ["climbalt", "climbspd", "climbtype", "flapto"], ["altitude", "vs"], [levelchange, autoflaps, autogear, autospoilers], data => {
    const inputs = data.inputs;
    const states = data.states;

    const climbalt = inputs.get("climbalt") as number;
    const climbspd = inputs.get("climbspd") as number;
    const climbtype = inputs.get("climbtype") as string;
    const flapto = inputs.get("flapto") as number;

    const altitude = states.get("altitude") as number;
    const vs = states.get("vs") as number;

    autospeed.active = false;
    autoland.error();

    autofunction.cache.save("flcmode", "g");
    autofunction.cache.save("flcinput", 500);
    autofunction.cache.save("leg", "u");

    let alt = climbalt;
    const inmsl = climbtype === "msl";
    const agl = Math.round(altitude / 100) * 100;
    alt += inmsl ? 0 : agl;

    write("spd", climbspd);
    write("alt", alt);
    write("spdon", true);
    write("alton", true);
    write("flaps", flapto);

    if(vs < 0){write("vs", 0);}

    flypattern.active = true;

    setTimeout(() => {
        levelchange.active = true;
    }, 500);

    autoflaps.active = true;
    autogear.active = true;
    autospoilers.active = true;
});

const autoland = new autofunction("autoland", 1000, ["latref", "longref", "altref", "hdgref", "vparef", "flare", "touchdown", "option"], ["latitude", "longitude", "altitude", "groundspeed", "onrunway"], [levelchange, autoflaps, autogear, autospeed, flypattern, goaround, autospoilers], data => {
    const inputs = data.inputs;
    const states = data.states;

    const latref = inputs.get("latref") as number;
    const longref = inputs.get("longref") as number;
    const altref = inputs.get("altref") as number;
    const hdgref = inputs.get("hdgref") as number;
    const vparef = inputs.get("vparef") as number;
    const flare = inputs.get("flare") as number;
    const touchdown = inputs.get("touchdown") as number;
    const option = inputs.get("option") as string;

    const latitude = states.get("latitude") as number;
    const longitude = states.get("longitude") as number;
    const altitude = states.get("altitude") as number;
    const groundspeed = states.get("groundspeed") as number;
    const onrunway = states.get("onrunway") as boolean;

    if(autoland.stage === 0){
        autofunction.cache.save("leg", "f");
        autofunction.cache.save("flcmode", "v");
        autoland.stage++;
    }

    const touchdownZone = calcLLfromHD(latref, longref, hdgref, touchdown / 6076.12);
    const touchdownDistance = 6076.12 * calcLLdistance(latitude, longitude, touchdownZone[0], touchdownZone[1]); // nm to ft

    if(autoland.stage === 2 || touchdownDistance <= 1000){
        autoland.stage = 2;

        autospeed.active = false;
        levelchange.active = false;

        autofunction.cache.save("flcmode", "g");
        autofunction.cache.save("flcinput", 500);

        write("vs", -200);

        if(option !== "p"){
            write("spdon", false);
            write("throttle", -100);
        }

        if(option === "p"){
            autoland.active = false;
            setTimeout(() => {goaround.active = true;}, 10000);
        }
        else if(option === "l"){
            autoland.active = false;
            flypattern.active = false;
            flyto.active = false;
        }
        else if(option === "t" && onrunway){
            autoland.active = false;
            setTimeout(() => {autotakeoff.active = true;}, 5000);
        }
        else if(option === "s" && groundspeed < 1){
            autoland.active = false;
            autotakeoff.active = true;
        }
    }
    else{
        const altDiffrence = altitude - altref;
        const currentVPA = Math.asin(altDiffrence / touchdownDistance) * toDeg;

        let mod = 2;
        if(touchdownDistance <= 6076){mod = 0.5;}

        let vpaout = currentVPA - mod * (vparef - currentVPA);
        vpaout = Math.round(vpaout * 10) / 10;

        vpaout = Math.min(vpaout, vparef + 0.5);
        if(vpaout < vparef - 0.5){vpaout = 0;}

        autofunction.cache.save("flcinput", vpaout);

        const stopalt = altref + flare;
        write("alt", stopalt);

        levelchange.active = true;
        autospeed.active = true;
        flypattern.active = true;
        autoflaps.active = true;
        autospeed.active = true;
        autospoilers.active = true;
        autogear.active = option !== "p";
    }
});

const rejecttakeoff = new autofunction("reject", -1, [], [], [], data => {
    if(autotakeoff.active){
        autotakeoff.error();
        write("throttle", -100);
    }
    else{
        rejecttakeoff.error();
    }
});

const takeoffconfig = new autofunction("takeoffconfig", -1, ["climbalt", "climbtype"], ["onground", "heading", "altitude"], [], data => {
    const inputs = data.inputs;
    const states = data.states;

    const climbalt = inputs.get("climbalt") as number;
    const climbtype = inputs.get("climbtype") as string;
    const onground = inputs.get("onground") as boolean;

    const heading = states.get("heading") as number;
    const altitude = states.get("altitude") as number;

    if(!onground){
        takeoffconfig.error();
        return;
    }

    let alt = climbalt;
    const inmsl = climbtype === "msl";
    const agl = Math.round(altitude / 100) * 100;
    alt += inmsl ? 0 : agl;

    write("alt", alt);
    write("hdg", heading);
    write("vs", 0);

    write("parkingbrake", false);
});

const autotakeoff = new autofunction("autotakeoff", 500, ["rotate", "climbspd", "climbthrottle", "takeoffspool", "takeofflnav", "takeoffvnav"], ["onrunway", "n1", "airspeed"], [takeoffconfig, levelchange, autotrim, autogear, autoflaps, autospoilers, rejecttakeoff], data => {
    const inputs = data.inputs;
    const states = data.states;

    const rotate = inputs.get("rotate") as number;
    const climbspd = inputs.get("climbspd") as number;
    const climbthrottle = inputs.get("climbthrottle") as number;
    const takeoffspool = inputs.get("takeoffspool") as boolean;
    const takeofflnav = inputs.get("takeofflnav") as boolean;
    const takeoffvnav = inputs.get("takeoffvnav") as boolean;

    const onrunway = states.get("onrunway") as boolean;
    const n1 = states.get("n1") as number;
    const airspeed = states.get("airspeed") as number;

    const throttle = 2 * climbthrottle - 100;

    let stage = autotakeoff.stage;

    if(stage === 0){
        if(!onrunway){
            autotakeoff.error();
            return;
        }

        takeoffconfig.active = true;
        levelchange.active = false;
        autoland.active = false;

        autogear.active = true;
        autoflaps.active = true;
        autospoilers.active = true;

        write("spd", climbspd);

        write("autopilot", true);
        write("alton", true);
        write("vson", false);
        write("hdgon", true);

        const initalThrottle = takeoffspool ? -20 : throttle;
        write("throttle", initalThrottle);

        stage++;
    }
    else if(stage === 1){
        write("vson", true);

        if(!takeoffspool){
            stage++;
        }
        else if(n1 === null){
            write("throttle", throttle);
            stage++;
        }
        else if(n1 >= 40){
            write("throttle", throttle);
            stage++;
        }
    }
    else if(stage === 2){
        if(airspeed >= rotate){
            levelchange.active = true;
            stage++;
        }
    }
    else if(stage === 3){
        if(climbspd - airspeed < 10){
            if(takeofflnav){write("navon", true);}
            if(takeoffvnav){vnavSystem.active = true;}

            write("spdon", true);
            stage++;
        }
    }
    else{
        autotakeoff.active = false;
    }

    autotakeoff.stage = stage;
});

const updatefpl = new autofunction("updatefpl", -1, [], ["fplinfo"], [], data => {
    const states = data.states;

    const fplinfo = states.get("fplinfo") as string;

    const fpl:fplStruct = JSON.parse(fplinfo);
    const flightPlanItems = fpl.detailedInfo.flightPlanItems;

    const lastIndex = flightPlanItems.length - 1;
    const lastId = `index${lastIndex}children`;
    const lastItem = document.getElementById(lastId + "0");

    const lastChildren = flightPlanItems[lastIndex].children;
    if(lastChildren === null){return;}

    const lastChildId = lastId + (lastChildren.length - 1).toString();
    const lastChildItem = document.getElementById(lastChildId);

    if (lastItem === null || (lastChildren !== null && lastChildItem === null)) {
        const div = document.getElementById("waypoints") as HTMLDivElement;
        div.innerHTML = "";

        for (let i = 0, length = flightPlanItems.length; i < length; i++) {
            let waypoint;
            const itemChildren = flightPlanItems[i].children;
            if (itemChildren === null) {
                waypoint = fpl.detailedInfo.waypoints[i];
                showfpl(`index${i}children0`, waypoint, div);
            } else {
                for (let j = 0, length = itemChildren.length; j < length; j++) {
                    waypoint = itemChildren[j].identifier;
                    showfpl(`index${i}children${j}`, waypoint, div);
                }
            }
        }
    }
});

function nextRestriction(item:fplItemStruct, waypoint:vnavWaypoint, itemIndex:number, childIndex:number):vnavWaypoint {
    if(item.identifier === waypoint.name || item.name === waypoint.name) {
        waypoint.index = itemIndex;
        waypoint.children = childIndex;
        waypoint.altitude = item.altitude;
    }
    if(itemIndex >= waypoint.index && item.altitude !== -1) {
        waypoint.altitudeRestriction.push(item.altitude);
        waypoint.restrictionLocation = {lat:item.location.Latitude, long:item.location.Longitude};
    }

    return waypoint;
}

const vnavSystem = new autofunction("vnav", 1000, [], ["fplinfo", "onground", "autopilot", "groundspeed", "altitude", "vnavon"], [], data => {
    const states = data.states;

    const fplinfo = states.get("fplinfo") as string;
    const onground = states.get("onground") as boolean;
    const autopilot = states.get("autopilot") as boolean;
    const groundspeed = states.get("groundspeed") as number;
    const altitude = states.get("altitude") as number;
    const vnavon = states.get("vnavon") as boolean;

	if(onground || !autopilot || vnavon || levelchange.active) {
		vnavSystem.error();
        return;
	}

    updatefpl.active = true;

    const fpl:fplStruct = JSON.parse(fplinfo);
	const flightPlanItems = fpl.detailedInfo.flightPlanItems;

    let nextWaypoint:vnavWaypoint = {
        name:fpl.waypointName,
        index:-1,
        children:0,
        altitude:0,
        altitudeRestriction:[],
        altitudeRestrictionDistance:0,
        restrictionLocation:{
            lat:0,
            long:0
        }
    };

	let stage = vnavSystem.stage;

	for(let i = 0, length = flightPlanItems.length; i < length; i++) {
        const item = flightPlanItems[i];
        const itemChildren = item.children;

		if(itemChildren === null){
			nextWaypoint = nextRestriction(item, nextWaypoint, i, 0);
		}
        else{
			for(let j = 0; j < itemChildren.length; j++){
				nextWaypoint = nextRestriction(itemChildren[i], nextWaypoint, i, j);
			}
		}
	}

    const itemId = `index${nextWaypoint.index}children${nextWaypoint.children}`;

    const element = document.getElementById(itemId);
    if (element !== null && element.tagName === "INPUT"){
        const item = element as HTMLInputElement;
        const nextWaypointSpeed = item.value;

        if (nextWaypointSpeed !== "") {
            if (fpl.distanceToNext <= 10) {
                write("spd", nextWaypointSpeed);
            }
        }
    }

	if(nextWaypoint.altitudeRestriction.length === 0){
        speak("No altitude restriction, VNAV disabled");
        vnavSystem.error();
		return;
	}

	if(nextWaypoint.altitude !== -1) {
		const altDiffrence = nextWaypoint.altitude - altitude;
		const fpm = altDiffrence / fpl.eteToNext;
		write("alt", nextWaypoint.altitude);
		write("vs", fpm);
	}
    else{
		nextWaypoint.altitudeRestrictionDistance = calcLLdistance(fpl.nextWaypointLatitude, fpl.nextWaypointLongitude, nextWaypoint.restrictionLocation.lat, nextWaypoint.restrictionLocation.long);
		const altDiffrence = nextWaypoint.altitudeRestriction[0] - altitude;
		const eteToNext = ((fpl.distanceToNext + nextWaypoint.altitudeRestrictionDistance) / groundspeed) * 60;
		const fpm = altDiffrence / eteToNext;
		write("alt", nextWaypoint.altitudeRestriction[0]);
		write("vs", fpm);
	}

	vnavSystem.stage = stage;
});

let calloutFlags:boolean[];

const callout = new autofunction("callout", 250, ["rotate", "minumuns"], ["onrunway", "airspeed", "verticalspeed", "throttle", "gear", "altitudeAGL", "altitude"], [], data => {
    const inputs = data.inputs;
    const states = data.states;

    const rotate = inputs.get("rotate") as number;
    const minumuns = inputs.get("minumuns") as number;

    const onrunway = states.get("onrunway") as boolean;
    const airspeed = states.get("airspeed") as number;
    const verticalspeed = states.get("verticalspeed") as number;
    const throttle = states.get("throttle") as number;
    const gear = states.get("gear") as boolean;
    const altitudeAGL = states.get("altitudeAGL") as number;
    const altitude = states.get("altitude") as number;

    const v1 = rotate;
    const v2 = rotate + 10;

    const elevation = autofunction.cache.load("altref").get("altref") as number;
    const alt = (elevation === null) ? altitudeAGL : altitude - elevation;

    let stage = callout.stage;

    if(stage === 0){
        calloutFlags = [false, false, false, false, false, false, false, false];
        stage++;
    }

    if(stage === 1 && airspeed >= v1 && onrunway && throttle > 40){
        speak("V1");
        stage++;
    }
    else if(stage === 2 && airspeed >= rotate && onrunway && throttle > 40){
        speak("Rotate");
        stage++;
    }
    else if(stage === 3 && airspeed >= v2 && throttle > 40){
        speak("V2");
        stage++;
    }

    if(!speechSynthesis.speaking && verticalspeed < -500 && !gear && alt <= 1000){
        speak("Landing Gear");
    }

    if(!speechSynthesis.speaking && verticalspeed < -500 && alt <= minumuns + 10 && alt >= minumuns){
        speak("Minimums");
    }

    const alts = [1000, 500, 100, 50, 40, 30, 20, 10];

    if(verticalspeed < -500){
        for(let i = 0, length = alts.length - 1; i < length; i++){
            if(!speechSynthesis.speaking && alt <= alts[i] && alt > alts[i + 1] && !calloutFlags[i]){
                speak(alts[i]);
                calloutFlags[i] = true;
                break;
            }
        }
    }

    callout.stage = stage;
});

const autofunctions = [autotrim, autolights, autogear, autoflaps, levelchange, markposition, setrunway, flyto, flypattern, rejecttakeoff, takeoffconfig, autotakeoff, autoland, goaround, autospeed, autobrakes, vnavSystem, callout, updatefpl, autospoilers];