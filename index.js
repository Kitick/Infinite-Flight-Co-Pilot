"use strict";class Alias{alt;conversion;static storage=new Map;static get(t){return this.storage.get(t)}constructor(t,e,s=null){this.alt=e,this.conversion=s,Alias.storage.set(t,this)}}new Alias("aircraft/0/name","aircraft"),new Alias("simulator/throttle","throttle",-.1),new Alias("aircraft/0/systems/landing_gear/lever_state","gear"),new Alias("aircraft/0/systems/spoilers/state","spoilers"),new Alias("aircraft/0/systems/axes/elevator_trim","trim"),new Alias("aircraft/0/systems/flaps/state","flaps"),new Alias("aircraft/0/systems/parking_brake/state","parkingbrake"),new Alias("aircraft/0/indicated_airspeed","airspeed",1.94384),new Alias("aircraft/0/groundspeed","groundspeed",1.94384),new Alias("aircraft/0/altitude_msl","altitude"),new Alias("aircraft/0/altitude_agl","altitudeAGL"),new Alias("aircraft/0/heading_magnetic","heading",180/Math.PI),new Alias("aircraft/0/vertical_speed","verticalspeed",196.8504),new Alias("aircraft/0/systems/autopilot/vnav/on","vnavon"),new Alias("aircraft/0/flightplan/full_info","fplinfo"),new Alias("aircraft/0/systems/autopilot/on","autopilot"),new Alias("aircraft/0/systems/autopilot/alt/on","alton"),new Alias("aircraft/0/systems/autopilot/vs/on","vson"),new Alias("aircraft/0/systems/autopilot/spd/on","spdon"),new Alias("aircraft/0/systems/autopilot/hdg/on","hdgon"),new Alias("aircraft/0/systems/autopilot/nav/on","navon"),new Alias("aircraft/0/systems/autopilot/alt/target","alt",3.28084),new Alias("aircraft/0/systems/autopilot/vs/target","vs",3.28084),new Alias("aircraft/0/systems/autopilot/spd/target","spd",1.94384),new Alias("aircraft/0/systems/autopilot/hdg/target","hdg",180/Math.PI),new Alias("aircraft/0/systems/axes/pitch","pitch"),new Alias("aircraft/0/systems/axes/roll","roll"),new Alias("aircraft/0/systems/axes/yaw","yaw"),new Alias("aircraft/0/latitude","latitude"),new Alias("aircraft/0/longitude","longitude"),new Alias("aircraft/0/magnetic_variation","variation",180/Math.PI),new Alias("environment/wind_velocity","wind",1.94384),new Alias("environment/wind_direction_true","winddir",180/Math.PI),new Alias("aircraft/0/flightplan/route","route"),new Alias("aircraft/0/flightplan/coordinates","coordinates"),new Alias("aircraft/0/configuration/flaps/stops","flapcount"),new Alias("aircraft/0/systems/engines/0/n1","n1",100),new Alias("aircraft/0/is_on_ground","onground"),new Alias("aircraft/0/is_on_runway","onrunway"),new Alias("aircraft/0/systems/auto_brakes/command_state","autobrakes"),new Alias("aircraft/0/systems/brakes/left/percentage","leftbrake"),new Alias("aircraft/0/systems/brakes/right/percentage","rightbrake"),new Alias("aircraft/0/systems/electrical_switch/master_switch/state","master"),new Alias("aircraft/0/systems/electrical_switch/nav_lights_switch/state","navlights"),new Alias("aircraft/0/systems/electrical_switch/strobe_lights_switch/state","strobelights"),new Alias("aircraft/0/systems/electrical_switch/landing_lights_switch/state","landinglights"),new Alias("aircraft/0/systems/electrical_switch/beacon_lights_switch/state","beaconlights");class Item{id;type;name;alias=null;conversion=null;value=null;callbacks=[];constructor(t,e,s){this.id=t,this.type=e,this.name=s;const a=Alias.get(this.name);void 0!==a&&(this.alias=a.alt,this.conversion=a.conversion)}get buffer(){let t,e=this.value;if(null===e)return Buffer.from([0]);switch(null!==this.conversion&&(e/=this.conversion),this.type){case 0:e=Number(e),t=Buffer.from([e]);case 1:t=Buffer.allocUnsafe(4),t.writeInt32LE(e);break;case 2:t=Buffer.allocUnsafe(4),t.writeFloatLE(e);break;case 3:t=Buffer.allocUnsafe(8),t.writeDoubleLE(e);break;case 4:t=Buffer.allocUnsafe(4+e.length),t.writeInt32LE(e.length),t.write(e,4);break;case 5:t=Buffer.allocUnsafe(8),t.writeBigInt64LE(e);break;default:throw"buffer type is not valid"}return t}set buffer(t){let e;switch(this.type){case 0:e=Boolean(t[0]);break;case 1:e=t.readInt32LE();break;case 2:e=t.readFloatLE();break;case 3:e=t.readDoubleLE();break;case 4:e=t.toString("utf8",4);break;case 5:e=t.readBigInt64LE();break;default:throw"buffer type is not valid"}null!==this.conversion&&(e*=this.conversion),this.value=e}callback(){this.callbacks.forEach((t=>{t()})),this.callbacks=[]}}const Net=require("net"),UDP=require("dgram");class Client{socket;address;device=new Net.Socket;scanner=UDP.createSocket("udp4");scanning=!1;active=!1;dataBuffer=[];manifest=new Map;constructor(t,e=""){this.socket=t,this.address=e,this.initManifest(),this.device.on("data",(t=>{console.log(this.address+" Rx\t\t",t);for(let e of t)this.dataBuffer.push(e);this.validate()})),this.device.on("error",(t=>{"ECONNREFUSED"===t.code&&this.log(this.address+" TCP Connection Refused")})),this.log(this.address+" TCP Socket Created")}initManifest(){this.manifest=new Map,this.addItem(new Item(-1,4,"manifest"))}log(t){this.socket.emit("log",t),console.log(t)}findAddress(t=(()=>{})){this.scanning?this.log("Already Searching for UDP Packets"):(this.log("Searching for UDP Packets..."),this.scanner.on("message",((e,s)=>{this.address=s.address,this.log(this.address+" UDP Packet Found"),this.scanner.close(),this.scanning=!1,t()})),this.scanning=!0,this.scanner.bind(15e3))}connect(){if(this.log(this.address+" Attempting TCP Connection"),""!==this.address)return this.active?(this.log(this.address+" TCP Already Active"),void this.socket.emit("ready",this.address)):void this.device.connect({host:this.address,port:10112},(()=>{this.log(this.address+" TCP Established, Requesting Manifest"),this.active=!0,this.readState("manifest")}));this.findAddress((()=>{this.connect()}))}close(){this.scanning&&(this.scanner.close(),this.scanning=!1),this.active&&(this.active=!1,this.device.end((()=>{this.log(this.address+" TCP Closed")})))}validate(){if(this.dataBuffer.length<9)return;const t=Buffer.from(this.dataBuffer.slice(4,8)).readInt32LE()+8;if(this.dataBuffer.length<t)return;const e=Buffer.from(this.dataBuffer.slice(0,4)).readInt32LE(),s=Buffer.from(this.dataBuffer.slice(8,t));this.dataBuffer.splice(0,t),this.processData(e,s),this.dataBuffer.length>0&&this.validate()}processData(t,e){if(-1===t){this.initManifest();return e.toString().split("\n").forEach((t=>{const e=t.split(","),s=parseInt(e[0]),a=parseInt(e[1]),i=e[2],r=new Item(s,a,i);this.addItem(r)})),this.log(this.address+" Manifest Built, API Ready"),void this.socket.emit("ready",this.address)}const s=this.getItem(t.toString());void 0!==s&&(s.buffer=e,s.callback())}initalBuffer(t,e){let s=Buffer.allocUnsafe(5);return s.writeInt32LE(t),s[4]=e,s}readState(t,e=(()=>{})){const s=this.getItem(t);if(void 0===s||-1===s.type)return void e();if(s.callbacks.push(e),s.callbacks.length>1)return;const a=this.initalBuffer(s.id,0);this.device.write(a),console.log(this.address+" Tx "+s.id+"\t",a)}writeState(t){const e=this.getItem(t);if(void 0===e)return;let s=this.initalBuffer(e.id,1);s=Buffer.concat([s,e.buffer]),this.device.write(s),console.log(this.address+" Tx "+e.id+"\t",s)}addItem(t){this.manifest.set(t.id.toString(),t),this.manifest.set(t.name,t),null!==t.alias&&this.manifest.set(t.alias,t)}getItem(t){const e=this.manifest.get(t);return void 0===e&&this.log(this.address+" Invalid Item "+t),e}}class Controller{static clients=new Map;static bridge(t,e){let s=this.clients.get(t.id);void 0===s&&(s=new Client(t,e),this.clients.set(t.id,s)),s.connect()}static close(t){const e=this.clients.get(t.id);return void 0!==e&&(e.close(),this.clients.delete(t.id),!0)}static read(t,e,s=(t=>{})){const a=this.clients.get(t.id),i=a?.getItem(e);void 0!==i&&void 0!==a?a.readState(e,(()=>{let t=i.value;s(t)})):s(void 0)}static write(t,e,s){const a=this.clients.get(t.id),i=a?.getItem(e);void 0!==i&&void 0!==a&&(i.value=s,a.writeState(e))}}const Express=require("express"),app=new Express,server=app.listen(8080),io=require("socket.io")(server);app.use(Express.static(__dirname+"/public")),io.on("connection",(t=>{t.on("test",(t=>{t("Connected to Server"),console.log("New Client Connected")})),t.on("bridge",((e,s)=>{const a=e+" Connection Requested";s(a),console.log(a),Controller.bridge(t,e)})),t.on("break",(e=>{const s="Closure Requested";e(s),console.log(s),Controller.close(t)})),t.on("read",((e,s)=>{console.log("Read "+e),Controller.read(t,e,s)})),t.on("write",((e,s)=>{console.log("Write "+e+" = "+s.toString()),Controller.write(t,e,s)}))})),console.log("\nLoading Complete, Server Ready"),console.log("\nOpen Browser to localhost:8080\n");