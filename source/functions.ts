const autotrim = new AutoFunction("trim", 1000,
	["onground", "pitch", "trim"],
	[],
	[], (states, inputs) => {

	const [onground, pitch, trim] =
	states as [boolean, number, number];

	if(onground){
		if(trim !== 0){server.setState("trim", 0);}
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

		if(trim !== newTrim){server.writeState("trim", newTrim);}
	}
});

const autolights = new AutoFunction("lights", 2000,
	["altitudeAGL", "onground", "onrunway", "gear"],
	[],
	[], (states, inputs) => {

	const [altitudeAGL, onground, onrunway, gear] =
	states as [number, boolean, boolean, boolean];

	server.setState("master", 1);
	server.setState("beaconlights", 1);
	server.setState("navlights", 1);

	if(onground){
		server.setState("strobelights", Number(onrunway));
		server.setState("landinglights", Number(onrunway));
	}
	else{
		server.setState("strobelights", 1);

		if(altitudeAGL < 1000){server.setState("landinglights", Number(gear));}
		else{server.setState("landinglights", 0);}
	}
});

const autogear = new AutoFunction("gear", 1000,
	["gear", "altitudeAGL", "verticalspeed"],
	[],
	[], (states, inputs) => {

	const [gear, altitudeAGL, verticalspeed] =
	states as [boolean, number, number];

	let newState = gear;

	if(altitudeAGL < 100 || (verticalspeed <= -500 && altitudeAGL < 1200)){
		newState = true;
	}
	else if(verticalspeed >= 500 || altitudeAGL >= 2000){
		newState = false;
	}

	// readcommand to use the animation
	if(newState !== gear){server.readState("commands/LandingGear");}
});

const autobrakes = new AutoFunction("autobrakes", 1000,
	["leftbrake", "rightbrake", "autobrakes", "onground", "onrunway", "groundspeed"],
	[],
	[], (states, inputs) => {

	const [leftbrake, rightbrake, autobrakes, onground, onrunway, groundspeed] =
	states as [number, number, number, boolean, boolean, number];

	let newBrakes = autobrakes;

	if(onground && !onrunway){newBrakes = 0;}
	else if(!onground){newBrakes = 2;}
	else if(onrunway){newBrakes = 3;}

	if(onground && groundspeed > 30 && (leftbrake > 0.3 || rightbrake > 0.3)){
		newBrakes = 0;
	}

	if(newBrakes !== autobrakes){server.writeState("autobrakes", newBrakes);}
});

const autoflaps = new AutoFunction("flaps", 1000,
	["flaps", "airspeed", "altitudeAGL", "verticalspeed", "flapcount", "onground", "onrunway"],
	["flaplow", "flaphigh", "flapto"],
	[], (states, inputs) => {

	const [flaps, airspeed, altitudeAGL, verticalspeed, flapcount, onground, onrunway] =
	states as [number, number, number, number, number, boolean, boolean];

	const [flaplow, flaphigh, flapto] =
	inputs as [number, number, number];

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

	if(newFlaps !== flaps){server.writeState("flaps", newFlaps);}
});

const autospoilers = new AutoFunction("spoilers", 1000,
	["airspeed", "spd", "altitude", "altitudeAGL", "onrunway", "onground"],
	[],
	[], (states, inputs) => {

	const [airspeed, spd, altitude, altitudeAGL, onrunway, onground] =
	states as [number, number, number, number, number, boolean, boolean];

	let newSpoilers = 0;

	if(onrunway || (!onground && altitudeAGL < 1000)){
		newSpoilers = 2;
	}
	else if(!onground && (airspeed - spd >= 20 || (spd > 255 && altitude < 10000)) && altitude < 28000){
		newSpoilers = 1;
	}

	server.setState("spoilers", newSpoilers);
});

const autospeed = new AutoFunction("autospeed", 1000,
	["onground", "verticalspeed", "altitudeAGL", "altitude", "latitude", "longitude", "spd", "approach"],
	["latref", "longref", "climbspd", "climbalt", "spdref", "cruisespd"],
	[], (states, inputs) => {

	const [onground, verticalspeed, altitudeAGL, altitude, latitude, longitude, spd, approach] =
	states as [boolean, number, number, number, number, number, number, boolean];

	const [latref, longref, climbspd, climbalt, spdref, cruisespd] =
	inputs as [number, number, number, number, number, number];

	// elevation is optional, so its not in the inputs
	const elevation = dom.readInput("altref") as number|null;

	if(onground){
		autospeed.arm();
		return;
	}

	//const cruisespd = domInterface.load("cruisespd").get("cruisespd") as number|null;
	const alt = (elevation === null) ? altitudeAGL : altitude - elevation;

	let newSpeed = spd;

	if(autoland.isActive() || approach){
		const distance = calcLLdistance({lat:latitude, long:longitude}, {lat:latref, long:longref});

		let speed = (distance - 2.5) * 10 + spdref;
		speed = Math.round(speed / 10) * 10;

		speed = Math.max(speed, spdref);
		speed = Math.min(speed, spd);

		newSpeed = speed;
	}
	else if(flypattern.isActive() || altitude < climbalt + 250){
		newSpeed = climbspd;
	}
	else if(altitude < 10000 || (altitude < 12000 && verticalspeed <= -500)){
		newSpeed = 250;
	}
	else if(alt >= 10000){
		newSpeed = cruisespd;
	}

	newSpeed = Math.min(newSpeed, cruisespd);

	if(newSpeed !== spd){server.writeState("spd", newSpeed);}
});

const altchange = new AutoFunction("altchange", 1000,
	["airspeed", "altitude", "alt"],
	["flcinput", "flcmode"],
	[], (states, inputs) => {

	const [airspeed, altitude, alt] =
	states as [number, number, number];

	const [flcinput, flcmode] =
	inputs as [number, climbType];

	let output = flcinput;

	const diffrence = alt - altitude;

	if(Math.abs(diffrence) < 100){
		altchange.setActive(false);
		return;
	}

	if(flcmode === "v"){output = NMtoFT * Math.tan(output * toRad);}
	if(flcmode !== "f"){output *= airspeed / 60;}

	output *= Math.sign(diffrence);

	server.writeState("vs", output);
});

const markposition = new AutoFunction("markposition", -1,
	["latitude", "longitude", "altitude", "heading"],
	[],
	[], (states, inputs) => {

	const [latitude, longitude, altitude, heading] =
	states as [number, number, number, number];

	dom.write("latref", latitude);
	dom.write("longref", longitude);
	dom.write("hdgref", Math.round(heading * 10) / 10);
	dom.write("altref", Math.round(altitude));
});

const setrunway = new AutoFunction("setrunway", -1,
	["route", "coordinates"],
	[],
	[], (states, inputs) => {

	const [route, coordinates] =
	states as [string, string];

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

	dom.write("latref", latref);
	dom.write("longref", longref);
	dom.write("hdgref", null);
	dom.write("altref", null);
});

const rejecttakeoff = new AutoFunction("reject", -1,
	[],
	[],
	[], (states, inputs) => {

	if(autotakeoff.isActive()){
		autotakeoff.error("Reject Takeoff");
	}

	server.writeState("autopilot", false);
	server.writeState("throttle", -100);
});

const takeoffconfig = new AutoFunction("takeoffconfig", -1,
	["onground", "heading", "altitude"],
	["climbalt", "climbtype", "flcinputref", "flcmoderef"],
	[], (states, inputs) => {

	const [onground, heading, altitude] =
	states as [boolean, number, number];

	const [climbalt, climbtype, flcinputref, flcmoderef] =
	inputs as [number, altType, number, climbType];

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

	dom.write("flcinput", flcinputref);
	dom.write("flcmode", flcmoderef);

	server.writeState("alt", alt);
	server.writeState("hdg", heading);
	server.writeState("vs", 0);

	server.writeState("parkingbrake", false);
});

const autotakeoff = new AutoFunction("autotakeoff", 500,
	["onrunway", "n1", "airspeed"],
	["rotate", "climbspd", "climbthrottle", "takeoffspool", "takeofflnav", "takeoffvnav"],
	[takeoffconfig, rejecttakeoff], (states, inputs) => {

	const [onrunway, n1, airspeed] =
	states as [boolean, number|null, number];

	const [rotate, climbspd, climbthrottle, takeoffspool, takeofflnav, takeoffvnav] =
	inputs as [number, number, number, boolean, boolean, boolean];

	const throttle = 2 * climbthrottle - 100;

	let stage = autotakeoff.stage;

	if(stage === 0){
		if(!onrunway){
			autotakeoff.error("Not on a Runway");
			return;
		}

		autotakeoff.status = "Inital Setup";

		takeoffconfig.setActive(true);
		altchange.setActive(false);

		server.writeState("spd", climbspd);

		server.writeState("autopilot", true);
		server.writeState("alton", true);
		server.writeState("vson", false);
		server.writeState("hdgon", true);

		const initalThrottle = takeoffspool ? -40 : throttle;
		server.writeState("throttle", initalThrottle);

		stage++;
	}
	else if(stage === 1){
		server.writeState("vson", true);

		if(!takeoffspool){
			stage++;
		}
		else if(n1 === null || n1 >= 40){
			server.writeState("throttle", throttle);
			stage++;
		}
		else{
			autotakeoff.status = "Spolling Engines";
		}
	}
	else if(stage === 2){
		autotakeoff.status = "Takeoff Roll";

		if(airspeed >= rotate){
			altchange.setActive(true);
			stage++;
		}
	}
	else if(stage === 3){
		autotakeoff.status = "Rotate";

		if(climbspd - airspeed < 10){
			autotakeoff.status = "Climbout";

			if(takeofflnav){server.writeState("navon", true);}
			//if(takeoffvnav){vnavSystem.setActive(true);}

			server.writeState("spdon", true);
			stage++;
		}
	}
	else{
		autotakeoff.status = "Takeoff Complete";
		autotakeoff.setActive(false);
	}

	autotakeoff.stage = stage;
});

const flyto = new AutoFunction("flyto", 500,
	["latitude", "longitude", "variation", "groundspeed", "wind", "winddir"],
	["flytolat", "flytolong", "flytohdg"],
	[], (states, inputs) => {

	const [latitude, longitude, variation, groundspeed, wind, winddir] =
	states as [number, number, number, number, number, number];

	const [flytolat, flytolong, flytohdg] =
	inputs as [number, number, number];

	function cyclical(value:number):number {
		value = ((value % 360) + 360) % 360;
		return value;
	}

	const distance = calcLLdistance({lat:latitude, long:longitude}, {lat:flytolat, long:flytolong});

	if(distance < 1){
		flyto.status = "Arrived";
		flyto.setActive(false);
		return;
	}

	const hdgTarget = cyclical(flytohdg);

	// X and Y are in nm
    const deltaY = 60 * (flytolat - latitude);
    const deltaX = 60 * (flytolong - longitude) * Math.cos((latitude + flytolat) * 0.5 * toRad);
    const direct = cyclical(Math.atan2(deltaX, deltaY) * toDeg - variation);

    let diffrence = hdgTarget - direct;

    if(diffrence > 180){diffrence -= 360;}
    else if(diffrence < -180){diffrence += 360;}

	const xtrack = distance * Math.sin(diffrence * toRad);

	const absTrack = Math.abs(xtrack);
	const intAngle = 45;
	const intDist = 1;

	let correction = 150 * absTrack * (flyto.memory.manual ?? 1);
	correction = Math.min(correction, 30);

	if(absTrack > intDist){correction = intAngle;}

	const course = cyclical(hdgTarget - correction * Math.sign(xtrack));

	// Wind Correction
	const windmag = cyclical(winddir - variation + 180);
	const courseMath = (-course + 90) * toRad;
	const windMath = (-windmag + 90) * toRad;

	const courseX = 2 * groundspeed * Math.cos(courseMath);
	const courseY = 2 * groundspeed * Math.sin(courseMath);
	const windX = wind * Math.cos(windMath);
	const windY = wind * Math.sin(windMath);

	const windCorrect = cyclical(Math.atan2(courseX - windX, courseY - windY) * toDeg);

	function leftright(value:number, round:number = 1):string {
		return `${value < 0 ? "L":"R"} ${Math.abs(value).toFixed(round)}`;
	}

	flyto.status = `Distance: ${distance.toFixed(1)}nm`;
	flyto.status += `\nX-Track: ${leftright(xtrack, 2)}nm`;
	flyto.status += `\n\nDirect: ${direct.toFixed(0)}°`;
	flyto.status += `\nOffset: ${leftright(diffrence)}°`;
	flyto.status += `\nCrab Angle: ${leftright(windCorrect - course)}°`;

	server.writeState("hdg", windCorrect);
});

const flypattern = new AutoFunction("flypattern", 1000,
	["latitude", "longitude", "variation", "groundspeed"],
	["latref", "longref", "hdgref", "updist", "downwidth", "finallength", "leg", "direction", "approachfinal"],
	[], (states, inputs) => {

	const [latitude, longitude, variation, groundspeed] =
	states as [number, number, number, number];

	const [latref, longref, hdgref, updist, downwidth, finallength, leg, direction, approachfinal] =
	inputs as [number, number, number, number, number, number, patternLeg, string, boolean];

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
	const turnrate = (350 / groundspeed) * 60 * toRad; // deg/s to rad/m

	let legout = leg;
	if(distance < speed / turnrate){
		const legOrder = ["u", "c", "d", "b", "f"];
		let legIndex = legOrder.indexOf(leg);

		if(leg !== "f" || (leg === "f" && distance < 1)){
			legIndex = (legIndex + 1) % 5;
			legout = legOrder[legIndex] as patternLeg;
		}
	}

	if(legout === "f" && approachfinal){
		autoland.setActive(true);
	}

	const latout = currentLeg.location.lat;
	const longout = currentLeg.location.long;
	const hdgout = ((currentLeg.hdg % 360) + 360) % 360;

	dom.write("leg", legout);
	dom.write("flytolat", latout);
	dom.write("flytolong", longout);
	dom.write("flytohdg", hdgout);

	flyto.setActive(true);
});

const goaround = new AutoFunction("goaround", -1,
	["onground"],
	["climbalt", "climbspd", "climbtype", "altref", "flcinputref", "flcmoderef"],
	[], (states, inputs) => {

	const [onground] =
	states as [boolean];

	const [climbalt, climbspd, climbtype, altref, flcinputref, flcmoderef] =
	inputs as [number, number, altType, number, number, climbType];

	if(onground){
		goaround.error();
		autoland.status = "Cannot Go-Around on the ground";
		return;
	}

	autoland.error("Go-Around");

	dom.write("leg", "u");
	dom.write("flcinput", flcinputref);
	dom.write("flcmode", flcmoderef);

	let alt = climbalt;
	if(climbtype === "agl"){
		const agl = Math.round(altref / 100) * 100;
		alt += agl;
	}

	server.setState("spd", climbspd);
	server.setState("alt", alt);
	server.setState("spdon", true);
	server.setState("alton", true);
	server.setState("hdgon", true);

	altchange.setActive(true);
});

const autoland = new AutoFunction("autoland", 500,
	["latitude", "longitude", "altitude", "groundspeed", "onrunway"],
	["latref", "longref", "altref", "hdgref", "vparef", "flare", "touchdown", "option", "flcinputref", "flcmoderef"],
	[flypattern, goaround], (states, inputs) => {

	const [latitude, longitude, altitude, groundspeed, onrunway] =
	states as [number, number, number, number, boolean];

	const [latref, longref, altref, hdgref, vparef, flare, touchdown, option, flcinputref, flcmoderef] =
	inputs as [number, number, number, number, number, number, number, string, number, climbType];

	const altitudeAGL = altitude - altref;

	if(autoland.stage === 0){
		dom.write("flcmode", "v");
		dom.write("leg", "f");
		autoland.stage++;
	}

	if(autoland.stage === 1 && altitudeAGL <= flare){
		autoland.status = "Flare";
		autoland.stage++;

		altchange.setActive(false);

		dom.write("flcinput", flcinputref);
		dom.write("flcmode", flcmoderef);

		return;
	}

	if(autoland.stage === 2){
		if(option !== "p"){
			server.writeState("vs", -200);
			server.writeState("spdon", false);
			server.writeState("throttle", -100);
		}
		else{
			server.writeState("vs", 0);
		}

		if(option === "p"){
			autoland.status = "Flying Low-Pass";

			autoland.setActive(false);
			setTimeout(() => {goaround.setActive(true);}, 10000);
		}
		else if(option === "l" && onrunway){
			autoland.status = "Landing Complete";

			autoland.setActive(false);
			flypattern.setActive(false);
			flyto.setActive(false);
			server.writeState("autopilot", false);
		}
		else if(option === "t" && onrunway){
			autoland.status = "Preparing for Takeoff";

			autoland.setActive(false);
			setTimeout(() => {
				autoland.status = "Touch and Go Complete";
				autotakeoff.setActive(true);
			}, 5000);
		}
		else if(option === "s" && onrunway){
			autoland.status = "Stopping for Stop and Go";

			if(groundspeed > 1){return;}

			autoland.status = "Stop and Go Complete";
			autoland.setActive(false);
			autotakeoff.setActive(true);
		}

		return;
	}

	const touchdownZone = calcLLfromHD({lat:latref, long:longref}, hdgref, touchdown / NMtoFT);
	const distance = calcLLdistance({lat:latitude, long:longitude}, touchdownZone);

	const currentVPA = Math.atan2(altitudeAGL / NMtoFT, distance) * toDeg;
	const diffrence = vparef - currentVPA;

	const xtrack = distance * Math.sin(diffrence * toRad);

	const correction = 100 * xtrack * (autoland.memory.manual ?? 1);

	let vpaout = vparef - correction;
	vpaout = Math.round(vpaout * 100) / 100;

	function ubovebelow(value:number, round:number = 1):string {
		return `${value > 0 ? "B":"U"} ${Math.abs(value).toFixed(round)}`;
	}

	autoland.status = `Distance: ${distance.toFixed(2)}nm`;
	autoland.status += `\nVX-Track: ${ubovebelow(xtrack * NMtoFT, 0)}ft`;
	autoland.status += `\n\nVPA: ${currentVPA.toFixed(2)}°`;
	autoland.status += `\nOffset: ${ubovebelow(diffrence, 2)}°`;

	vpaout = Math.max(vpaout, 0);
	vpaout = Math.min(vpaout, vparef + 2);

	dom.write("flcinput", vpaout);

	server.writeState("alt", -1000);

	altchange.setActive(true);
	flypattern.setActive(true);

	if(autogear.isActive()){autogear.setActive(option !== "p");}
});

/*
const updatefpl = new AutoFunction("updatefpl", -1,
	["fplinfo"],
	[],
	[], (states, inputs) => {

	const [fplinfo] =
	states as [string];

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

const vnavSystem = new AutoFunction("vnav", 1000,
	["fplinfo", "onground", "autopilot", "groundspeed", "altitude", "vnavon"],
	[],
	[], (states, inputs) => {

	const [fplinfo, onground, autopilot, groundspeed, altitude, vnavon] =
	states as [string, boolean, boolean, number, number, boolean];

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

const callout = new AutoFunction("callout", 250,
	["onrunway", "airspeed", "verticalspeed", "throttle", "gear", "altitudeAGL", "altitude"],
	["rotate", "minumuns"],
	[], (states, inputs) => {

	const [onrunway, airspeed, verticalspeed, throttle, gear, altitudeAGL, altitude] =
	states as [boolean, number, number, number, boolean, number, number];

	const [rotate, minumuns] =
	inputs as [number, number];

	// elevation is optional, so its not in the inputs
	const elevation = domInterface.read("altref")[0] as number|null;
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
*/