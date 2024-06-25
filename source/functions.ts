const autotrim = new Autofunction("trim", 1000, [], [], async domInputs => {

	const states = await readAsync("onground", "pitch", "trim");
	const [onground, pitch, trim] = states as [boolean, number, number];

	if(onground){
		if(trim !== 0){write("trim", 0);}
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

const autolights = new Autofunction("lights", 2000, [], [], async domInputs => {

	const states = await readAsync("altitudeAGL", "onground", "onrunway", "gear");
	const [altitudeAGL, onground, onrunway, gear] = states as [number, boolean, boolean, boolean];

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

const autogear = new Autofunction("gear", 1000, [], [], async domInputs => {

	const states = await readAsync("gear", "altitudeAGL", "verticalspeed");
	const [gear, altitudeAGL, verticalspeed] = states as [boolean, number, number];

	let newState = gear;

	if(altitudeAGL < 100 || (verticalspeed <= -500 && altitudeAGL < 1200)){
		newState = true;
	}
	else if(verticalspeed >= 500 || altitudeAGL >= 2000){
		newState = false;
	}

	// readcommand to use the animation
	if(newState !== gear){readAsync("commands/LandingGear");}
});

const autobrakes = new Autofunction("autobrakes", 1000, [], [], async domInputs => {

	const states = await readAsync("leftbrake", "rightbrake", "autobrakes", "onground", "onrunway", "groundspeed");
	const [leftbrake, rightbrake, autobrakes, onground, onrunway, groundspeed] = states as [number, number, number, boolean, boolean, number];

	let newBrakes = autobrakes;

	if(onground && !onrunway){newBrakes = 0;}
	else if(!onground){newBrakes = 2;}
	else if(onrunway){newBrakes = 3;}

	if(onground && groundspeed > 30 && (leftbrake > 0.3 || rightbrake > 0.3)){
		newBrakes = 0;
	}

	if(newBrakes !== autobrakes){write("autobrakes", newBrakes);}
});

const autoflaps = new Autofunction("flaps", 1000, ["flaplow", "flaphigh", "flapto"], [], async domInputs => {

	const states = await readAsync("flaps", "airspeed", "altitudeAGL", "verticalspeed", "flapcount", "onground", "onrunway");
	const [flaps, airspeed, altitudeAGL, verticalspeed, flapcount, onground, onrunway] = states as [number, number, number, number, number, boolean, boolean];

	const [flaplow, flaphigh, flapto] = domInputs as [number, number, number];

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

const autospoilers = new Autofunction("spoilers", 1000, [], [], async domInputs => {

	const states = await readAsync("spoilers", "airspeed", "spd", "altitude", "altitudeAGL", "onrunway", "onground");
	const [spoilers, airspeed, spd, altitude, altitudeAGL, onrunway, onground] = states as [number, number, number, number, number, boolean, boolean];

	let newSpoilers = 0;

	if(onrunway || (!onground && altitudeAGL < 1000)){
		newSpoilers = 2;
	}
	else if(!onground && (airspeed - spd >= 20 || (spd > 255 && altitude < 10000)) && altitude < 28000){
		newSpoilers = 1;
	}

	if(newSpoilers !== spoilers){write("spoilers", newSpoilers);}
});

const autospeed = new Autofunction("autospeed", 1000, ["latref", "longref", "climbspd", "climbalt", "spdref", "cruisespd"], [], async domInputs => {

	const states = await readAsync("onground", "verticalspeed", "altitudeAGL", "altitude", "latitude", "longitude", "spd");
	const [onground, verticalspeed, altitudeAGL, altitude, latitude, longitude, spd] = states as [boolean, number, number, number, number, number, number];

	const [latref, longref, climbspd, climbalt, spdref, cruisespd] = domInputs as [number, number, number, number, number, number];

	// elevation is optional, so its not in the domInputs
	const elevation = domInterface.load("altref")[0] as number|null;

	if(onground){
		autospeed.arm();
		return;
	}

	//const cruisespd = domInterface.load("cruisespd").get("cruisespd") as number|null;
	const alt = (elevation === null) ? altitudeAGL : altitude - elevation;

	let newSpeed = spd;

	if(autoland.isActive()){
		const distance = calcLLdistance({lat:latitude, long:longitude}, {lat:latref, long:longref});

		let speed = (distance - 2.5) * 10 + spdref;
		speed = Math.min(speed, spd);
		speed = Math.round(speed / 10) * 10;
		speed = Math.max(speed, spdref);

		newSpeed = speed;
	}
	else if(flypattern.isActive() || altitude <= climbalt){
		newSpeed = climbspd;
	}
	else if(altitude < 10000 || (altitude < 12000 && verticalspeed <= -500)){
		newSpeed = 250;
	}
	else if(alt >= 10000){
		newSpeed = cruisespd;
	}

	newSpeed = Math.min(newSpeed, cruisespd);

	if(newSpeed !== spd){write("spd", newSpeed);}
});

const levelchange = new Autofunction("levelchange", 1000, ["flcinput", "flcmode"], [], async domInputs => {

	const states = await readAsync("airspeed", "altitude", "alt");
	const [airspeed, altitude, alt] = states as [number, number, number];

	const [flcinput, flcmode] = domInputs as [number, climbType];

	let output = flcinput;

	const diffrence = alt - altitude;

	if(Math.abs(diffrence) < 100){
		levelchange.setActive(false);
		return;
	}

	if(flcmode === "v"){output = NMtoFT * Math.tan(output * toRad);}
	if(flcmode !== "f"){output *= airspeed / 60;}

	output *= Math.sign(diffrence);

	write("vs", output);
});

const markposition = new Autofunction("markposition", -1, [], [], async domInputs => {

	const states = await readAsync("latitude", "longitude", "altitude", "heading");
	const [latitude, longitude, altitude, heading] = states as [number, number, number, number];

	domInterface.save("latref", latitude);
	domInterface.save("longref", longitude);
	domInterface.save("hdgref", Math.round(heading));
	domInterface.save("altref", Math.round(altitude));
});

const setrunway = new Autofunction("setrunway", -1, [], [], async domInputs => {

	const states = await readAsync("route", "coordinates");
	const [route, coordinates] = states as [string, string];

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

	const runway = fpl[rwIndex][2] + fpl[rwIndex][3] + "0";
	const runwayCoords = coordinates.split(" ")[rwIndex].split(",");

	const latref = parseFloat(runwayCoords[0]);
	const longref = parseFloat(runwayCoords[1]);
	const hdgref = parseInt(runway);

	domInterface.save("latref", latref);
	domInterface.save("longref", longref);
	domInterface.save("hdgref", hdgref);
	domInterface.save("altref", null);
});

const rejecttakeoff = new Autofunction("reject", -1, [], [], async domInputs => {

	const states = await readAsync("onrunway");
	const [onrunway] = states as [boolean];

	if(!onrunway){
		rejecttakeoff.error();
		console.log("Not on a runway");
		return;
	}

	if(autotakeoff.isActive()){
		autotakeoff.error();
	}

	write("autopilot", false);
	write("throttle", -100);
});

const takeoffconfig = new Autofunction("takeoffconfig", -1, ["climbalt", "climbtype", "flcinputref", "flcmoderef"], [], async domInputs => {

	const states = await readAsync("onground", "heading", "altitude");
	const [onground, heading, altitude] = states as [boolean, number, number];

	const [climbalt, climbtype, flcinputref, flcmoderef] = domInputs as [number, altType, number, climbType];

	if(!onground){
		takeoffconfig.error();
		console.log("Not on the ground");
		return;
	}

	let alt = climbalt;
	if(climbtype === "agl"){
		const agl = Math.round(altitude / 100) * 100;
		alt += agl;
	}

	domInterface.save("flcinput", flcinputref);
	domInterface.save("flcmode", flcmoderef);

	write("alt", alt);
	write("hdg", heading);
	write("vs", 0);

	write("parkingbrake", false);
});

const autotakeoff = new Autofunction("autotakeoff", 500, ["rotate", "climbspd", "climbthrottle", "takeoffspool", "takeofflnav", "takeoffvnav"], [takeoffconfig, rejecttakeoff], async domInputs => {

	const states = await readAsync("onground", "n1", "airspeed");
	const [onground, n1, airspeed] = states as [boolean, number|null, number];

	const [rotate, climbspd, climbthrottle, takeoffspool, takeofflnav, takeoffvnav] = domInputs as [number, number, number, boolean, boolean, boolean];

	const throttle = 2 * climbthrottle - 100;

	let stage = autotakeoff.stage;

	if(stage === 0){
		if(!onground){
			autotakeoff.error();
			console.log("Not on a runway");
			return;
		}

		takeoffconfig.setActive(true);
		levelchange.setActive(false);

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
			levelchange.setActive(true);
			stage++;
		}
	}
	else if(stage === 3){
		if(climbspd - airspeed < 10){
			if(takeofflnav){write("navon", true);}
			if(takeoffvnav){vnavSystem.setActive(true);}

			write("spdon", true);
			stage++;
		}
	}
	else{
		autotakeoff.setActive(false);
	}

	autotakeoff.stage = stage;
});

/*
const flytoDelay = 1000;
const flyto = new Autofunction("flyto", flytoDelay, ["flytolat", "flytolong", "flytohdg"], ["latitude", "longitude", "variation"], [], async domInputs => {



	const flytolat = domInputs.get("flytolat") as number;
	const flytolong = domInputs.get("flytolong") as number;
	const flytohdg = domInputs.get("flytohdg") as number;

	const latitude = states.get("latitude") as number;
	const longitude = states.get("longitude") as number;
	const variation = states.get("variation") as number;

	const distance = calcLLdistance({lat:latitude, long:longitude}, {lat:flytolat, long:flytolong});

	if(distance < 1){
		flyto.setActive(false);
		return;
	}

	let pid = flyto.memory.get("pid") as PID | undefined;
	if(pid === undefined){
		pid = new PID(1, 0, 0, 0, 360, true);
		flyto.memory.set("pid", pid);
	}

	const deltaY = flytolat - latitude;
	const deltaX = (flytolong - longitude) * Math.cos((latitude + flytolat) * 0.5 * toRad);
	const course = Math.atan2(deltaX, deltaY) * toDeg - variation;

	const courseOut = pid.update(course, flytohdg, flytoDelay / 1000);

	console.log(course, flytohdg, courseOut);
	write("hdg", courseOut);
});
*/

const flyto = new Autofunction("flyto", 1000, ["flytolat", "flytolong", "flytohdg"], [], async domInputs => {

	const states = await readAsync("latitude", "longitude", "variation", "groundspeed", "wind", "winddir");
	const [latitude, longitude, variation, groundspeed, wind, winddir] = states as [number, number, number, number, number, number];

	const [flytolat, flytolong, flytohdg] = domInputs as [number, number, number];

	function cyclical(value:number):number {
		value = ((value % 360) + 360) % 360;
		return value;
	}

	const distance = calcLLdistance({lat:latitude, long:longitude}, {lat:flytolat, long:flytolong});

	if(distance < 1){
		flyto.setActive(false);
		return;
	}

	// Direct To
	const deltaY = flytolat - latitude;
	const deltaX = (flytolong - longitude) * Math.cos((latitude + flytolat) * 0.5 * toRad);
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

const flypattern = new Autofunction("flypattern", 1000, ["latref", "longref", "hdgref", "updist", "downwidth", "finallength", "turnconst", "leg", "direction", "approach"], [], async domInputs => {

	const states = await readAsync("latitude", "longitude", "variation", "groundspeed");
	const [latitude, longitude, variation, groundspeed] = states as [number, number, number, number];

	const [latref, longref, hdgref, updist, downwidth, finallength, turnconst, leg, direction, approach] = domInputs as [number, number, number, number, number, number, number, patternLeg, string, boolean];

	const circuit = (direction === "r") ? 1 : -1;
	const hdg90 = hdgref + 90 * circuit;

	const refrence = {location:{lat:latref, long:longref}, hdg:hdgref};
	const final = refrence;

	const upwind = {
		location:calcLLfromHD(refrence.location, hdgref, updist + 1.5, variation),
		hdg:hdgref,
	};
	const crosswind = {
		location:calcLLfromHD(upwind.location, hdg90, downwidth, variation),
		hdg:hdg90,
	};
	const base = {
		location:calcLLfromHD(refrence.location, hdgref + 180, finallength, variation),
		hdg:hdg90 + 180,
	};
	const downwind = {
		location:calcLLfromHD(base.location, hdg90, downwidth, variation),
		hdg:hdgref + 180,
	};

	const pattern = {
		u:upwind,
		c:crosswind,
		d:downwind,
		b:base,
		f:final,
	};

	const currentLeg = pattern[leg];
	const distance = calcLLdistance({lat:latitude, long:longitude}, currentLeg.location);

	const speed = groundspeed / 60; // kts to nm/m
	const turnrate = (turnconst / groundspeed) * 60 * toRad; // deg/s to rad/m

	let legout = leg;
	if(distance < speed / turnrate){
		const legOrder = ["u", "c", "d", "b", "f"];
		let legIndex = legOrder.indexOf(leg);

		if(leg !== "f" || (leg === "f" && distance < 1)){
			legIndex = (legIndex + 1) % 5;
			legout = legOrder[legIndex] as patternLeg;
		}
	}

	if(legout === "f" && approach){
		autoland.setActive(true);
	}

	const latout = currentLeg.location.lat;
	const longout = currentLeg.location.long;
	const hdgout = ((currentLeg.hdg % 360) + 360) % 360;

	domInterface.save("leg", legout);
	domInterface.save("flytolat", latout);
	domInterface.save("flytolong", longout);
	domInterface.save("flytohdg", hdgout);

	flyto.setActive(true);
});

const goaround = new Autofunction("goaround", -1, ["climbalt", "climbspd", "climbtype", "altref", "flcinputref", "flcmoderef"], [], async domInputs => {

	const states = await readAsync("onground");
	const [onground] = states as [boolean];

	const [climbalt, climbspd, climbtype, altref, flcinputref, flcmoderef] = domInputs as [number, number, altType, number, number, climbType];

	if(onground){
		goaround.error();
		console.log("Cannot goaround on the ground");
		return;
	}

	autoland.error();

	domInterface.save("leg", "u");
	domInterface.save("flcinput", flcinputref);
	domInterface.save("flcmode", flcmoderef);

	let alt = climbalt;
	if(climbtype === "agl"){
		const agl = Math.round(altref / 100) * 100;
		alt += agl;
	}

	write("spd", climbspd);
	write("alt", alt);
	write("spdon", true);
	write("alton", true);
	write("hdgon", true);

	levelchange.setActive(true);
});

const autoland = new Autofunction("autoland", 500, ["latref", "longref", "altref", "hdgref", "vparef", "flare", "touchdown", "option", "flcinputref", "flcmoderef"], [flypattern, goaround], async domInputs => {

	const states = await readAsync("latitude", "longitude", "altitude", "groundspeed", "onrunway");
	const [latitude, longitude, altitude, groundspeed, onrunway] = states as [number, number, number, number, boolean];

	const [latref, longref, altref, hdgref, vparef, flare, touchdown, option, flcinputref, flcmoderef] = domInputs as [number, number, number, number, number, number, number, string, number, climbType];

	const altitudeAGL = altitude - altref;

	if(autoland.stage === 0){
		domInterface.save("flcmode", "v");
		domInterface.save("leg", "f");
		autoland.stage++;
	}

	const touchdownZone = calcLLfromHD({lat:latref, long:longref}, hdgref, touchdown / NMtoFT);
	const touchdownDistance = calcLLdistance({lat:latitude, long:longitude}, touchdownZone);

	if(autoland.stage === 1 && altitudeAGL <= flare){
		autoland.stage++;

		levelchange.setActive(false);

		domInterface.save("flcinput", flcinputref);
		domInterface.save("flcmode", flcmoderef);

		return;
	}

	if(autoland.stage === 2){
		write("vs", -200);

		if(option !== "p"){
			write("spdon", false);
			write("throttle", -100);
		}

		if(option === "p"){
			autoland.setActive(false);
			setTimeout(() => {goaround.setActive(true);}, 10000);
		}
		else if(option === "l" && onrunway){
			autoland.setActive(false);
			flypattern.setActive(false);
			flyto.setActive(false);
			write("autopilot", false);
		}
		else if(option === "t" && onrunway){
			autoland.setActive(false);
			setTimeout(() => {autotakeoff.setActive(true);}, 5000);
		}
		else if(option === "s" && groundspeed < 1){
			autoland.setActive(false);
			autotakeoff.setActive(true);
		}

		return;
	}

	const currentVPA = Math.asin(altitudeAGL / (touchdownDistance * NMtoFT)) * toDeg;

	let mod = 3;
	let limit = 1;

	if(touchdownDistance <= 2){
		mod = 1;
		limit = 0.5;
	}
	else if(touchdownDistance <= 3){
		mod = 2;
		limit = 0.75;
	}

	let vpaout = currentVPA - mod * (vparef - currentVPA);
	vpaout = Math.round(vpaout * 100) / 100;

	if(touchdownDistance > 3 && (vpaout < vparef - limit || (vpaout < vparef - 0.25 && domInterface.load("flcinput")[0] === 0))){
		vpaout = 0;
	}

	vpaout = Math.min(vpaout, vparef + limit);

	domInterface.save("flcinput", vpaout);

	write("alt", -1000);

	levelchange.setActive(true);
	flypattern.setActive(true);

	if(autogear.isActive()){autogear.setActive(option !== "p");}
});

const updatefpl = new Autofunction("updatefpl", -1, [], [], async domInputs => {

	const states = await readAsync("fplinfo");
	const [fplinfo] = states as [string];

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

const vnavSystem = new Autofunction("vnav", 1000, [], [], async domInputs => {

	const states = await readAsync("fplinfo", "onground", "autopilot", "groundspeed", "altitude", "vnavon");
	const [fplinfo, onground, autopilot, groundspeed, altitude, vnavon] = states as [string, boolean, boolean, number, number, boolean];

	if(onground || !autopilot || vnavon || levelchange.isActive()) {
		vnavSystem.error();
		return;
	}

	updatefpl.setActive(true);

	const fpl:fplStruct = JSON.parse(fplinfo);
	const flightPlanItems = fpl.detailedInfo.flightPlanItems;

	let nextWaypoint:vnavWaypoint = {
		name:fpl.waypointName,
		index:-1,
		children:0,
		altitude:0,
		altitudeRestriction:[],
		altitudeRestrictionDistance:0,
		restrictionLocation:{lat:0, long:0}
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
		nextWaypoint.altitudeRestrictionDistance = calcLLdistance({lat:fpl.nextWaypointLatitude, long:fpl.nextWaypointLongitude}, nextWaypoint.restrictionLocation);
		const altDiffrence = nextWaypoint.altitudeRestriction[0] - altitude;
		const eteToNext = ((fpl.distanceToNext + nextWaypoint.altitudeRestrictionDistance) / groundspeed) * 60;
		const fpm = altDiffrence / eteToNext;
		write("alt", nextWaypoint.altitudeRestriction[0]);
		write("vs", fpm);
	}

	vnavSystem.stage = stage;
});

let calloutFlags:boolean[] = [];

const callout = new Autofunction("callout", 250, ["rotate", "minumuns"], [], async domInputs => {

	const states = await readAsync("onrunway", "airspeed", "verticalspeed", "throttle", "gear", "altitudeAGL", "altitude");
	const [onrunway, airspeed, verticalspeed, throttle, gear, altitudeAGL, altitude] = states as [boolean, number, number, number, boolean, number, number];

	const [rotate, minumuns] = domInputs as [number, number];

	// elevation is optional, so its not in the domInputs
	const elevation = domInterface.load("altref")[0] as number|null;
	const alt = (elevation === null) ? altitudeAGL : altitude - elevation;

	const v1 = rotate;
	const v2 = rotate + 10;

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
				speak(alts[i].toString());
				calloutFlags[i] = true;
				break;
			}
		}
	}

	callout.stage = stage;
});

const autofunctions = [autobrakes, autoflaps, autogear, autoland, autolights, autospeed, autospoilers, autotakeoff, autotrim, callout, flypattern, flyto, goaround, levelchange, markposition, rejecttakeoff, setrunway, takeoffconfig, updatefpl, vnavSystem];