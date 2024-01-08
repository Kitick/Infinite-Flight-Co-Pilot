"use strict";class t{id;type;name;static#t=new Map;static addAlias(t,a,e=null){this.#t.set(t,{alt:a,conversion:e})}#a=null;#e=null;#s=null;#i=[];constructor(a,e,s){this.id=a,this.type=e,this.name=s;const i=t.#t.get(this.name);void 0!==i&&(this.#a=i.alt,this.#e=i.conversion)}get alias(){return this.#a}get conversion(){return this.#e}get value(){return this.#s}set value(t){"number"==typeof t&&isNaN(t)&&(t=null),this.#s=t}get buffer(){let t,a=this.value;if(null===a)throw this.name+" value is invalid";switch(null!==this.conversion&&(a/=this.conversion),this.type){case 0:t=Buffer.allocUnsafe(1),t.writeInt8(Number(a));break;case 1:t=Buffer.allocUnsafe(4),t.writeInt32LE(a);break;case 2:t=Buffer.allocUnsafe(4),t.writeFloatLE(a);break;case 3:t=Buffer.allocUnsafe(8),t.writeDoubleLE(a);break;case 4:t=Buffer.allocUnsafe(4+a.length),t.writeInt32LE(a.length),t.write(a,4);break;case 5:t=Buffer.allocUnsafe(8),t.writeBigInt64LE(a);break;default:throw"buffer type is invalid"}return t}set buffer(t){let a;switch(this.type){case 0:a=Boolean(t.readInt8());break;case 1:a=t.readInt32LE();break;case 2:a=t.readFloatLE();break;case 3:a=t.readDoubleLE();break;case 4:a=t.toString("utf8",4);break;case 5:a=t.readBigInt64LE();break;default:throw"buffer type is not valid"}null!==this.conversion&&(a*=this.conversion),this.value=a}addCallback(t=(()=>{})){this.#i.push(t);return this.#i.length}callback(){this.#i.forEach((t=>{t()})),this.#i=[]}}t.addAlias("aircraft/0/name","aircraft"),t.addAlias("simulator/throttle","throttle",-.1),t.addAlias("aircraft/0/systems/landing_gear/lever_state","gear"),t.addAlias("aircraft/0/systems/spoilers/state","spoilers"),t.addAlias("aircraft/0/systems/axes/elevator_trim","trim"),t.addAlias("aircraft/0/systems/flaps/state","flaps"),t.addAlias("aircraft/0/systems/parking_brake/state","parkingbrake"),t.addAlias("aircraft/0/indicated_airspeed","airspeed",1.94384),t.addAlias("aircraft/0/groundspeed","groundspeed",1.94384),t.addAlias("aircraft/0/altitude_msl","altitude"),t.addAlias("aircraft/0/altitude_agl","altitudeAGL"),t.addAlias("aircraft/0/heading_magnetic","heading",180/Math.PI),t.addAlias("aircraft/0/vertical_speed","verticalspeed",196.8504),t.addAlias("aircraft/0/systems/autopilot/vnav/on","vnavon"),t.addAlias("aircraft/0/flightplan/full_info","fplinfo"),t.addAlias("aircraft/0/systems/autopilot/on","autopilot"),t.addAlias("aircraft/0/systems/autopilot/alt/on","alton"),t.addAlias("aircraft/0/systems/autopilot/vs/on","vson"),t.addAlias("aircraft/0/systems/autopilot/spd/on","spdon"),t.addAlias("aircraft/0/systems/autopilot/hdg/on","hdgon"),t.addAlias("aircraft/0/systems/autopilot/nav/on","navon"),t.addAlias("aircraft/0/systems/autopilot/alt/target","alt",3.28084),t.addAlias("aircraft/0/systems/autopilot/vs/target","vs",3.28084),t.addAlias("aircraft/0/systems/autopilot/spd/target","spd",1.94384),t.addAlias("aircraft/0/systems/autopilot/hdg/target","hdg",180/Math.PI),t.addAlias("aircraft/0/systems/axes/pitch","pitch"),t.addAlias("aircraft/0/systems/axes/roll","roll"),t.addAlias("aircraft/0/systems/axes/yaw","yaw"),t.addAlias("aircraft/0/latitude","latitude"),t.addAlias("aircraft/0/longitude","longitude"),t.addAlias("aircraft/0/magnetic_variation","variation",180/Math.PI),t.addAlias("environment/wind_velocity","wind",1.94384),t.addAlias("environment/wind_direction_true","winddir",180/Math.PI),t.addAlias("aircraft/0/flightplan/route","route"),t.addAlias("aircraft/0/flightplan/coordinates","coordinates"),t.addAlias("aircraft/0/configuration/flaps/stops","flapcount"),t.addAlias("aircraft/0/systems/engines/0/n1","n1",100),t.addAlias("aircraft/0/is_on_ground","onground"),t.addAlias("aircraft/0/is_on_runway","onrunway"),t.addAlias("aircraft/0/systems/auto_brakes/command_state","autobrakes"),t.addAlias("aircraft/0/systems/brakes/left/percentage","leftbrake"),t.addAlias("aircraft/0/systems/brakes/right/percentage","rightbrake"),t.addAlias("aircraft/0/systems/electrical_switch/master_switch/state","master"),t.addAlias("aircraft/0/systems/electrical_switch/nav_lights_switch/state","navlights"),t.addAlias("aircraft/0/systems/electrical_switch/strobe_lights_switch/state","strobelights"),t.addAlias("aircraft/0/systems/electrical_switch/landing_lights_switch/state","landinglights"),t.addAlias("aircraft/0/systems/electrical_switch/beacon_lights_switch/state","beaconlights");const a=require("net"),e=require("dgram");class s{#r;#n="";#l=new a.Socket;#d=null;#o=null;#c=!1;#h=Buffer.alloc(0);#f=new Map;constructor(t){this.#r=t,this.#u(),this.#l.on("data",(t=>{console.log(this.#n+" Rx\t\t\t",t),this.#h=Buffer.concat([this.#h,t]),this.#g()})),this.#l.on("error",(t=>{"ECONNREFUSED"===t.code&&this.log(this.#n+" TCP Connection Refused")})),this.log("TCP Socket Created")}get#v(){return null!==this.#d}#u(){this.#f=new Map,this.addItem(new t(-1,4,"manifest"))}#m(){this.#v&&(clearTimeout(this.#o),this.#o=null,this.#d.close(),this.#d=null)}#p(){this.#v?this.log("Already searching for packets"):(this.log("Searching for UDP packets..."),this.#d=e.createSocket("udp4"),this.#d.on("message",((t,a)=>{let e=a.address;this.log(e+" UDP Packet Found"),this.#m(),this.connect(e)})),this.#d.bind(15e3),this.#o=setTimeout((()=>{this.#m(),this.log("UDP search timed out\n\nTry using an IP address")}),1e4))}#g(){if(this.#h.length<9)return;const t=this.#h.readInt32LE(4)+8;if(this.#h.length<t)return;const a=this.#h.readInt32LE(0),e=this.#h.subarray(8,t);this.#h=this.#h.subarray(t),this.#A(a,e),this.#h.length>0&&this.#g()}#A(a,e){if(-1===a){this.#u();return e.toString().split("\n").forEach((a=>{const e=a.split(","),s=parseInt(e[0]),i=parseInt(e[1]),r=e[2],n=new t(s,i,r);this.addItem(n)})),this.log(this.#n+"\nManifest Built, API Ready"),void this.#r.emit("ready",this.#n)}const s=this.getItem(a.toString());void 0!==s&&(s.buffer=e,s.callback())}#b(t,a){let e=Buffer.allocUnsafe(5);return e.writeInt32LE(t),e[4]=a,e}#w(t,a,e,s=!1){const i=s?" =":"",r=s?a.value:"";console.log(this.#n,"Tx",t,"("+a.id.toString()+")"+i,r,e)}log(t){this.#r.emit("log",t),console.log(t)}connect(t=""){if(this.#c)return this.log(this.#n+" TCP is already active"),void this.#r.emit("ready",this.#n);this.#n=t,""!==this.#n?(this.log(this.#n+" Attempting TCP Connection"),this.#l.connect({host:this.#n,port:10112},(()=>{this.#c=!0,this.log(this.#n+" TCP Established, Requesting Manifest"),this.readState("manifest")}))):this.#p()}close(){this.#v&&this.#m(),this.#c?(this.#c=!1,this.#l.end((()=>{this.log(this.#n+" TCP Closed"),this.#n=""}))):this.log("TCP Closed")}readState(t,a=(()=>{})){const e=this.getItem(t);if(void 0===e)return void a();if(-1===e.type)a();else{if(e.addCallback(a)>1)return}const s=this.#b(e.id,0);this.#l.write(s),this.#w(t,e,s)}writeState(t){const a=this.getItem(t);if(void 0===a)return;let e=this.#b(a.id,1);e=Buffer.concat([e,a.buffer]),this.#l.write(e),this.#w(t,a,e,!0)}addItem(t){this.#f.set(t.id.toString(),t),this.#f.set(t.name,t),null!==t.alias&&this.#f.set(t.alias,t)}getItem(t){const a=this.#f.get(t);return void 0===a&&this.log(this.#n+" Invalid Item "+t),a}}const i=require("express"),r=new i,n=r.listen(8080),l=require("socket.io")(n);r.use(i.static(__dirname+"/public")),l.on("connection",(t=>{t.on("disconnect",(()=>{console.log("Client Disconnected"),d.remove(t)})),t.on("bridge",(a=>{d.log(t,"Connection Requested"),d.bridge(t,a)})),t.on("break",(()=>{d.log(t,"Closure Requested"),d.close(t)})),t.on("read",((a,e)=>{d.read(t,a,e)})),t.on("write",((a,e)=>{d.write(t,a,e)})),console.log("New Client Connected")}));const d=new class{#y=new Map;constructor(){}bridge(t,a){let e=this.#y.get(t.id);void 0===e&&(e=new s(t),this.#y.set(t.id,e)),e.connect(a)}close(t){const a=this.#y.get(t.id);return void 0!==a&&(a.close(),!0)}remove(t){const a=this.close(t);return a&&this.#y.delete(t.id),a}read(t,a,e=(t=>{})){const s=this.#y.get(t.id),i=s?.getItem(a);void 0!==i&&void 0!==s?s.readState(a,(()=>{let t=i.value;e(t)})):e(void 0)}write(t,a,e){const s=this.#y.get(t.id),i=s?.getItem(a);void 0!==i&&void 0!==s&&(i.value=e,s.writeState(a))}log(t,a){const e=this.#y.get(t.id);void 0!==e&&e.log(a)}};console.log("\nLoading Complete, Server Ready"),console.log("\nOpen Browser to localhost:8080\n");