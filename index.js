"use strict";class a{id;type;name;static#a=new Map;static addAlias(a,t,s=null){this.#a.set(a,{alt:t,conversion:s})}#t=null;#s=null;#e=null;#i=[];constructor(t,s,e){this.id=t,this.type=s,this.name=e;const i=a.#a.get(this.name);void 0!==i&&(this.#t=i.alt,this.#s=i.conversion)}get alias(){return this.#t}get conversion(){return this.#s}get value(){return this.#e}set value(a){"number"==typeof a&&isNaN(a)&&(a=null),this.#e=a}get buffer(){let a,t=this.value;if(null===t)throw this.name+" value is invalid";switch(null!==this.conversion&&(t/=this.conversion),this.type){case 0:a=Buffer.allocUnsafe(1),a.writeInt8(Number(t));break;case 1:a=Buffer.allocUnsafe(4),a.writeInt32LE(t);break;case 2:a=Buffer.allocUnsafe(4),a.writeFloatLE(t);break;case 3:a=Buffer.allocUnsafe(8),a.writeDoubleLE(t);break;case 4:a=Buffer.allocUnsafe(4+t.length),a.writeInt32LE(t.length),a.write(t,4);break;case 5:a=Buffer.allocUnsafe(8),a.writeBigInt64LE(t);break;default:throw"buffer type is invalid"}return a}set buffer(a){let t;switch(this.type){case 0:t=Boolean(a.readInt8());break;case 1:t=a.readInt32LE();break;case 2:t=a.readFloatLE();break;case 3:t=a.readDoubleLE();break;case 4:t=a.toString("utf8",4);break;case 5:t=a.readBigInt64LE();break;default:throw"buffer type is not valid"}null!==this.conversion&&(t*=this.conversion),this.value=t}addCallback(a){this.#i.push(a);return this.#i.length}callback(){this.#i.forEach((a=>{a(this.#e)})),this.#i=[]}}a.addAlias("aircraft/0/name","aircraft"),a.addAlias("simulator/throttle","throttle",-.1),a.addAlias("aircraft/0/systems/landing_gear/lever_state","gear"),a.addAlias("aircraft/0/systems/spoilers/state","spoilers"),a.addAlias("aircraft/0/systems/axes/elevator_trim","trim"),a.addAlias("aircraft/0/systems/flaps/state","flaps"),a.addAlias("aircraft/0/systems/parking_brake/state","parkingbrake"),a.addAlias("aircraft/0/indicated_airspeed","airspeed",1.94384),a.addAlias("aircraft/0/groundspeed","groundspeed",1.94384),a.addAlias("aircraft/0/altitude_msl","altitude"),a.addAlias("aircraft/0/altitude_agl","altitudeAGL"),a.addAlias("aircraft/0/heading_magnetic","heading",180/Math.PI),a.addAlias("aircraft/0/vertical_speed","verticalspeed",196.8504),a.addAlias("aircraft/0/systems/autopilot/vnav/on","vnavon"),a.addAlias("aircraft/0/flightplan/full_info","fplinfo"),a.addAlias("aircraft/0/systems/autopilot/on","autopilot"),a.addAlias("aircraft/0/systems/autopilot/alt/on","alton"),a.addAlias("aircraft/0/systems/autopilot/vs/on","vson"),a.addAlias("aircraft/0/systems/autopilot/spd/on","spdon"),a.addAlias("aircraft/0/systems/autopilot/hdg/on","hdgon"),a.addAlias("aircraft/0/systems/autopilot/nav/on","navon"),a.addAlias("aircraft/0/systems/autopilot/approach/on","approach"),a.addAlias("aircraft/0/systems/autopilot/alt/target","alt",3.28084),a.addAlias("aircraft/0/systems/autopilot/vs/target","vs",3.28084),a.addAlias("aircraft/0/systems/autopilot/spd/target","spd",1.94384),a.addAlias("aircraft/0/systems/autopilot/hdg/target","hdg",180/Math.PI),a.addAlias("aircraft/0/systems/axes/pitch","pitch"),a.addAlias("aircraft/0/systems/axes/roll","roll"),a.addAlias("aircraft/0/systems/axes/yaw","yaw"),a.addAlias("aircraft/0/latitude","latitude"),a.addAlias("aircraft/0/longitude","longitude"),a.addAlias("aircraft/0/magnetic_variation","variation",180/Math.PI),a.addAlias("environment/wind_velocity","wind",1.94384),a.addAlias("environment/wind_direction_true","winddir",180/Math.PI),a.addAlias("aircraft/0/flightplan/route","route"),a.addAlias("aircraft/0/flightplan/coordinates","coordinates"),a.addAlias("aircraft/0/configuration/flaps/stops","flapcount"),a.addAlias("aircraft/0/systems/engines/0/n1","n1",100),a.addAlias("aircraft/0/is_on_ground","onground"),a.addAlias("aircraft/0/is_on_runway","onrunway"),a.addAlias("aircraft/0/systems/auto_brakes/command_state","autobrakes"),a.addAlias("aircraft/0/systems/brakes/left/percentage","leftbrake"),a.addAlias("aircraft/0/systems/brakes/right/percentage","rightbrake"),a.addAlias("aircraft/0/systems/electrical_switch/master_switch/state","master"),a.addAlias("aircraft/0/systems/electrical_switch/nav_lights_switch/state","navlights"),a.addAlias("aircraft/0/systems/electrical_switch/strobe_lights_switch/state","strobelights"),a.addAlias("aircraft/0/systems/electrical_switch/landing_lights_switch/state","landinglights"),a.addAlias("aircraft/0/systems/electrical_switch/beacon_lights_switch/state","beaconlights");const t=require("net"),s=require("dgram");class e{#r="";#n=new t.Socket;#l=null;#o=null;#d=!1;#c=Buffer.alloc(0);#h=new Map;logTransmits=!0;logPings=!1;constructor(){this.#f(),this.#n.on("data",(a=>{this.#c=Buffer.concat([this.#c,a]),this.#u()})),this.log("TCP Socket Created")}get#g(){return null!==this.#l}#m(){this.#g&&(clearTimeout(this.#o),this.#o=null,this.#l.close(),this.#l=null)}async#p(){if(this.#g)return this.log("Already searching for packets"),Promise.reject();this.log("Searching for UDP packets..."),this.#l=s.createSocket("udp4");const a=new Promise(((a,t)=>{this.#l.on("message",((t,s)=>{let e=s.address;this.log(e+" UDP Packet Found"),this.#m(),a(e)})),this.#l.on("error",(a=>{this.log("UDP Error: "+a.code),this.#m(),t()})),this.#l.bind(15e3)})),t=new Promise(((a,t)=>{this.#o=setTimeout((()=>{this.log("UDP search timed out\n\nTry using an IP address"),this.#m(),t()}),1e4)}));return Promise.race([a,t])}async connect(a=""){return this.#d?(this.log(this.#r+" TCP is already active"),this.#r):(this.#r=a,""===this.#r&&(this.#r=await this.#p()),this.log(this.#r+" Attempting TCP Connection"),this.#n.on("error",(a=>("ECONNREFUSED"===a.code?this.log(this.#r+" TCP Connection Refused"):this.log(this.#r+" TCP Error: "+a.code),Promise.reject()))),new Promise((a=>{this.#n.connect({host:this.#r,port:10112},(async()=>{this.#d=!0,this.log(this.#r+" TCP Established, Requesting Manifest"),await this.readState("manifest"),a(this.#r)}))})))}async close(){if(this.#g&&this.#m(),this.#d)return this.#d=!1,new Promise((a=>{this.#n.end((()=>{this.log(this.#r+" TCP Closed"),this.#r="",a()}))}));this.log("TCP Closed")}#f(){this.#h.clear(),this.addItem(new a(-1,4,"manifest"))}#u(){if(this.#c.length<9)return;const a=this.#c.readInt32LE(4)+8;if(this.#c.length<a)return;const t=this.#c.subarray(0,a),s=t.readInt32LE(0),e=t.subarray(8,a);this.#c=this.#c.subarray(a),this.#v(s,e,t),this.#c.length>=9&&this.#u()}#w(t){this.#f();t.toString().split("\n").forEach((t=>{const s=t.split(","),e=parseInt(s[0]),i=parseInt(s[1]),r=s[2],n=new a(e,i,r);this.addItem(n)})),this.log(this.#r+"\nManifest Built, API Ready")}#v(a,t,s){const e=this.#h.get(a);void 0!==e&&(-1===a?this.#w(t):e.buffer=t,this.#y(e,s,"Rx"),e.callback())}#A(a,t){let s=Buffer.allocUnsafe(5);return s.writeInt32LE(a),s[4]=t,s}#y(a,t,s,e=!0){if(!this.logTransmits)return;const i=" = "+a.value?.toString(),r=e?i:"";console.log(`${this.#r} | ${s} (${a.id.toString()}) ${a.alias??a.name}${r} |`,t)}log(a){l.send("log",a),console.log(a)}async readState(a){return new Promise((t=>{const s=this.#h.get(a);if(void 0===s)return void t(null);if(-1===s.type)t(null);else{if(s.addCallback(t)>1)return}const e=this.#A(s.id,0);this.#n.write(e),this.#y(s,e,"Qx",!1)}))}writeState(a,t){const s=this.#h.get(a);if(void 0===s)return void this.log(`Item '${a}' is invalid`);s.value=t;let e=this.#A(s.id,1);e=Buffer.concat([e,s.buffer]),this.#n.write(e),this.#y(s,e,"Tx")}addItem(a){this.#h.set(a.id,a),this.#h.set(a.name,a),null!==a.alias&&this.#h.set(a.alias,a)}}const{app:i,BrowserWindow:r,ipcMain:n}=require("electron");let l,o;i.whenReady().then((()=>{const a=new r({width:1600,height:900,webPreferences:{nodeIntegration:!1,contextIsolation:!0,preload:__dirname+"/preload.js"}});a.loadFile("public/index.html"),l=a.webContents,o=new e,console.log("\nLoading Complete, Server Ready\n")})),n.on("start",(async(a,[t,s])=>{o.log("Connection Requested");const e=await o.connect(s);l.send("response",t,e)})),n.on("stop",(async(a,[t])=>{o.log("Closure Requested"),await o.close(),l.send("response",t)})),n.on("read",(async(a,[t,s])=>{const e=await o.readState(s);l.send("response",t,e)})),n.on("write",((a,[t,s])=>{o.writeState(t,s)})),n.on("ping",(async(a,[t])=>{const s=performance.now(),e=o.logTransmits;o.logTransmits=o.logPings,await o.readState("autopilot"),o.logTransmits=e;const i=performance.now()-s;l.send("response",t,i)}));