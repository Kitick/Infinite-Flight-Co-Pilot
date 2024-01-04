"use strict";class StateCache{#t=new Map;constructor(){}#e(t){const e=this.#t.get(t.id);if(void 0===e)return;let n=null;switch(t.type){case"number":n=parseFloat(t.value);break;case"checkbox":n=t.checked;break;case"select-one":n=t.value}"number"==typeof n&&isNaN(n)&&(n=null),e.value=n}#n(t){t.classList.add("error"),setTimeout((()=>{t.classList.remove("error")}),2e3)}addArray(t){t.forEach((t=>{if(void 0===this.#t.get(t)){const e=document.getElementById(t);if(null!==e){const t=e;t.addEventListener("change",(()=>{this.#e(t)})),this.#t.set(t.id,{dom:t,value:null}),this.#e(t)}}}))}add(...t){this.addArray(t)}loadArray(t){let e=new Map;return t.forEach((t=>{const n=this.load(t);void 0!==n&&e.set(t,n)})),e}load(t){const e=this.#t.get(t)?.value;return e}loadAll(){let t=new Map;return this.#t.forEach(((e,n)=>{t.set(n,e.value)})),t}save(t,e){const n=this.#t.get(t);if(void 0===n)return;n.value=e;const a=n.dom;"boolean"!=typeof e?(null===e&&(e=""),a.value=e.toString()):a.checked=e}isValid(t,e=!1){const n=this.#t.get(t);if(void 0===n)return!1;const a=null!==n.value;return!a&&e&&this.#n(n.dom),a}isValidArray(t,e=!1){let n=!0;return t.forEach((t=>{n=this.isValid(t,e)&&n})),n}}class ProfileStorage{static defaultName="#default";#a;constructor(t){this.#a=t;const e=ProfileStorage.defaultName;null===localStorage.getItem(e)&&this.save(e),this.#o(),this.load(e)}#o(){let t=[];for(let e=0,n=localStorage.length;e<n;e++)t.push(localStorage.key(e));t.sort(),this.#a.innerHTML="",t.forEach((t=>{let e=new Option(t,t);this.#a.appendChild(e)}))}#i(t,e){const n=document.getElementById(t);null!==n&&(n.className=e,setTimeout((()=>{n.className="off"}),500))}add(t=prompt("Enter the name of the profile:")){for(;""===t;)t=prompt("Name cannot be blank:");null!==t&&(this.save(t),this.#o(),this.#a.value=t)}save(t=this.#a.value){if(""===t)return void this.add();const e=Autofunction.cache.loadAll();let n={};e.forEach(((t,e)=>{n[e]=t})),localStorage.setItem(t,JSON.stringify(n)),this.#i("save","active")}load(t=this.#a.value){const e=localStorage.getItem(t);if(""===t||null===e)return void this.#i("load","error");this.#a.value=t;const n=document.getElementById("loadempty").checked,a=JSON.parse(e);for(let t in a){let e=a[t];if(null!==e){let t=parseFloat(e.toString());isNaN(t)||(e=t)}else if(!n)continue;Autofunction.cache.save(t,e)}this.#i("load","active")}remove(t=this.#a.value){if(""===t)return;confirm("Are you sure you want to delete: "+t)&&(localStorage.removeItem(t),this.#o())}}class Autofunction{delay;#s;#l=null;#c=new Map;#r=[];#u=[];#d=0;#g=0;#f=!1;#h=!1;#p;stage=0;static cache=new StateCache;constructor(t,e,n,a,o,i){this.delay=e;const s=document.getElementById(t);if(null===s)throw"Element "+t+" is undefined";this.#s=s,this.#s.addEventListener("click",(()=>{dependencyCheck(t),this.setActive()})),this.#v(),this.#d=a.length,this.#r=n,this.#u=o,this.#p=i,this.#r.forEach((t=>{let e=document.getElementById(t);if(null!==e&&"INPUT"===e.tagName&&"number"===e.type){const t=e,n=document.getElementById("tooltip");t.addEventListener("mouseenter",(()=>{n.innerText=t.placeholder})),t.addEventListener("mouseout",(()=>{n.innerText="Tooltip"}))}})),a.forEach((t=>{this.#c.set(t,null)})),Autofunction.cache.addArray(n)}getInputs(){return this.#r}getDependents(){return this.#u}isActive(){return this.#f}setActive(t=!this.#f){if(this.#f!==t){if(this.#f=t,this.#v(),this.#f)return this.stage=0,void this.#m();null!==this.#l&&(clearTimeout(this.#l),this.#l=null)}}#v(){this.#s.className=this.isActive()?"active":"off"}#m(){this.validateInputs(!0)?this.#y((()=>{const t=this.#h;this.#h=!1,this.#p({states:this.#c,inputs:Autofunction.cache.loadArray(this.#r)}),!this.#h&&t&&this.#v(),-1!==this.delay?this.#f&&(this.#l=setTimeout((()=>{this.#l=null,this.#m()}),this.delay)):this.setActive(!1)})):this.error()}#y(t=(()=>{})){0!==this.#d?(this.#g=0,this.#c.forEach(((e,n)=>{read(n,(e=>{this.#w(n,e,t)}))}))):t()}#w(t,e,n=(()=>{})){this.#c.set(t,e),this.#g++,this.#g===this.#d&&n()}validateInputs(t=!1){let e=Autofunction.cache.isValidArray(this.#r,t);return this.#u.forEach((t=>{e=t.validateInputs()&&e})),e}arm(){this.#h=!0,this.#s.className="armed"}error(){this.setActive(!1),this.#s.className="error",setTimeout((()=>{this.#v()}),2e3)}}function cyclical(t,e=360){return t=(t%e+e)%e}function dms(t,e=0,n=0){return Math.sign(t)*(Math.abs(t)+e/60+n/3600)}function calcLLfromHD(t,e,n,a=0){e=90-e-a,e*=toRad;const o=(n/=60)*Math.sin(e)+t.lat;return{lat:o,long:n*Math.cos(e)/Math.cos(toRad*(t.lat+o)*.5)+t.long}}function calcLLdistance(t,e){const n=60*(e.lat-t.lat);return((60*(e.long-t.long)*Math.cos(.5*(t.lat+e.lat)*toRad))**2+n**2)**.5}function controlThrottle(t,e,n){write("spdon",!1),write("throttle",t>0?-80:-100),write("spd",e),write("spoilers",1),n&&(write("spdon",!0),write("spoilers",2))}function showfpl(t,e,n){const a=document.createElement("input"),o=document.createElement("br");a.type="number",a.id=t,n.innerHTML+=" "+e,n.appendChild(a),n.appendChild(o)}function nextRestriction(t,e,n,a){return t.identifier!==e.name&&t.name!==e.name||(e.index=n,e.children=a,e.altitude=t.altitude),n>=e.index&&-1!==t.altitude&&(e.altitudeRestriction.push(t.altitude),e.restrictionLocation={lat:t.location.Latitude,long:t.location.Longitude}),e}function speak(t){t=t.toString();const e=document.getElementById("voices").selectedIndex,n=speechSynthesis.getVoices(),a=document.getElementById("utterancerate");let o=parseInt(a.value);isNaN(o)&&(o=1);const i=new SpeechSynthesisUtterance(t);i.rate=o,i.voice=n[e],speechSynthesis.speak(i)}speechSynthesis.getVoices();const toDeg=180/Math.PI,toRad=Math.PI/180;function setAll(t){const e="off"===t;autogear.setActive(e),autospoilers.setActive(e),autotrim.setActive(e),autoflaps.setActive(e),autolights.setActive(e),autobrakes.setActive(e),autospeed.setActive(e);document.getElementById("all").className=e?"active":"off"}function config(){const t=new Map;t.set("autoflaps",{instance:autoflaps,checked:document.getElementById("configflaps").checked}),t.set("autospeed",{instance:autoflaps,checked:document.getElementById("configspeed").checked}),t.set("autotakeoff",{instance:autoflaps,checked:document.getElementById("configtakeoff").checked}),t.set("flypattern",{instance:autoflaps,checked:document.getElementById("configpattern").checked}),t.set("autoland",{instance:autoflaps,checked:document.getElementById("configland").checked});let e=[];t.forEach((t=>{if(t.checked){const n=[t.instance];n.concat(t.instance.getDependents()),n.forEach((t=>{t.getInputs().forEach((t=>{-1===e.indexOf(t)&&e.push(t)}))}))}})),e.forEach((t=>{const e=document.getElementById(t);if(null!==e&&"number"===e.type){const n=prompt(e.placeholder+"\nLeave blank to not change");null!==n&&""!==n&&Autofunction.cache.save(t,n)}}))}function dependencyCheck(t){"autoland"===t&&autoland.isActive()&&Autofunction.cache.load("approach")?Autofunction.cache.save("approach",!1):"flypattern"===t&&flypattern.isActive()?(autoland.setActive(!1),flyto.setActive(!1)):"flyto"===t&&flyto.isActive()&&(flypattern.setActive(!1),autoland.setActive(!1))}const autotrim=new Autofunction("trim",1e3,[],["pitch","trim","onground"],[],(t=>{const e=t.states,n=e.get("onground"),a=e.get("pitch"),o=e.get("trim");if(n)return void autotrim.arm();let i=10;if(Math.abs(a)<10?i=1:Math.abs(a)<50&&(i=5),Math.abs(a)>=2){let t=o+i*Math.sign(a);t=Math.round(t/i)*i,write("trim",t)}})),autolights=new Autofunction("lights",2e3,[],["altitudeAGL","onground","onrunway","gear"],[],(t=>{const e=t.states,n=e.get("altitudeAGL"),a=e.get("onground"),o=e.get("onrunway"),i=e.get("gear");write("master",!0),write("beaconlights",!0),write("navlights",!0),a?(write("strobelights",o),write("landinglights",o)):(write("strobelights",!0),write("landinglights",!!(n<1e3&&i)))})),autogear=new Autofunction("gear",1e3,[],["gear","altitudeAGL","verticalspeed"],[],(t=>{const e=t.states,n=e.get("gear"),a=e.get("altitudeAGL"),o=e.get("verticalspeed");let i=n;a<100||o<=-500&&a<1500?i=!0:(o>=500||a>=2e3)&&(i=!1),i!==n&&read("commands/LandingGear")})),autobrakes=new Autofunction("autobrakes",1e3,[],["leftbrake","rightbrake","autobrakes","onground","onrunway","groundspeed"],[],(t=>{const e=t.states,n=e.get("leftbrake"),a=e.get("rightbrake"),o=e.get("autobrakes"),i=e.get("onground"),s=e.get("onrunway"),l=e.get("groundspeed");let c=o;i&&!s?c=0:i?s&&(c=3):c=2,i&&l>30&&(n>.3||a>.3)&&(c=0),c!==o&&write("autobrakes",c)})),autoflaps=new Autofunction("flaps",1e3,["flaplow","flaphigh","flapto"],["flaps","airspeed","altitudeAGL","verticalspeed","flapcount","onground","onrunway"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("flaplow"),o=e.get("flaphigh"),i=e.get("flapto"),s=n.get("flaps"),l=n.get("airspeed"),c=n.get("altitudeAGL"),r=n.get("verticalspeed"),u=n.get("flapcount"),d=n.get("onground"),g=n.get("onrunway");if(i<0||i>u-1||o<a)return void autoflaps.error();let f=s;if(d)f=g?i:0;else if(c>=250){const t=u-1,e=(o-a)/t;f=Math.round((o-l)/e),f=Math.max(f,0),f=Math.min(f,t)}(r>=500&&f>s||r<=-500&&f<s)&&(f=s),f!==s&&write("flaps",f)})),autospoilers=new Autofunction("spoilers",1e3,[],["spoilers","airspeed","spd","altitude","altitudeAGL","onrunway","onground"],[],(t=>{const e=t.states,n=e.get("spoilers"),a=e.get("airspeed"),o=e.get("spd"),i=e.get("altitude"),s=e.get("altitudeAGL"),l=e.get("onrunway"),c=e.get("onground");let r=0;l||!c&&s<1e3?r=2:a-o>=20&&i<28e3&&(r=1),r!==n&&write("spoilers",r)})),autospeed=new Autofunction("autospeed",1e3,["latref","longref","climbspd","spdref","cruisespd"],["onground","airspeed","verticalspeed","altitudeAGL","altitude","latitude","longitude","spd"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("latref"),o=e.get("longref"),i=e.get("climbspd"),s=e.get("spdref"),l=e.get("cruisespd"),c=n.get("onground"),r=n.get("airspeed"),u=n.get("verticalspeed"),d=n.get("altitudeAGL"),g=n.get("altitude"),f=n.get("latitude"),h=n.get("longitude"),p=n.get("spd");if(c)return void autospeed.arm();const v=Autofunction.cache.load("altref"),m=null===v?d:g-v;if(autoland.isActive()){let t=10*(calcLLdistance({lat:f,long:h},{lat:a,long:o})-2.5)+s;t=Math.min(t,p),t=10*Math.round(t/10),t=Math.max(t,s),write("spd",t)}else flypattern.isActive()||autotakeoff.isActive()&&u>500&&m<=1e4&&i-r<10&&(write("spd",i),write("spdon",!0));u<-500&&m<=12e3&&m>=1e4&&write("spd",250),null!==l&&u>500&&m>1e4&&write("spd",l)})),levelchange=new Autofunction("levelchange",1e3,["flcinput","flcmode"],["airspeed","altitude","alt"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("flcinput"),o=e.get("flcmode"),i=n.get("airspeed"),s=n.get("altitude");let l=a;const c=n.get("alt")-s;Math.abs(c)<100?levelchange.setActive(!1):("v"===o&&(l=6076.12*Math.tan(l*toRad)),"f"!==o&&(l*=i/60),l*=Math.sign(c),write("vs",l))})),markposition=new Autofunction("markposition",-1,[],["latitude","longitude","altitude","heading"],[],(t=>{const e=t.states,n=e.get("latitude"),a=e.get("longitude"),o=e.get("altitude"),i=e.get("heading");Autofunction.cache.save("latref",n),Autofunction.cache.save("longref",a),Autofunction.cache.save("hdgref",Math.round(i)),Autofunction.cache.save("altref",Math.round(o))})),setrunway=new Autofunction("setrunway",-1,[],["route","coordinates"],[],(t=>{const e=t.states,n=e.get("route"),a=e.get("coordinates"),o=n.split(",");let i=-1;for(let t=0,e=o.length;t<e;t++)if(0===o[t].search(/RW\d\d.*/)){i=t;break}if(-1===i)return void setrunway.error();const s=o[i][2]+o[i][3]+"0",l=a.split(" ")[i].split(","),c=parseFloat(l[0]),r=parseFloat(l[1]),u=parseInt(s);Autofunction.cache.save("latref",c),Autofunction.cache.save("longref",r),Autofunction.cache.save("hdgref",u)})),rejecttakeoff=new Autofunction("reject",-1,[],["onrunway"],[],(t=>{if(!t.states.get("onrunway"))return rejecttakeoff.error(),void console.log("Not on a runway");autotakeoff.isActive()&&autotakeoff.error(),write("autopilot",!1),write("throttle",-100)})),takeoffconfig=new Autofunction("takeoffconfig",-1,["climbalt","climbtype","flcinputref","flcmoderef"],["onground","heading","altitude"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("climbalt"),o=e.get("climbtype"),i=e.get("flcinputref"),s=e.get("flcmoderef"),l=n.get("onground"),c=n.get("heading"),r=n.get("altitude");if(!l)return takeoffconfig.error(),void console.log("Not on the ground");let u=a;if("agl"===o){u+=100*Math.round(r/100)}Autofunction.cache.save("flcinput",i),Autofunction.cache.save("flcmode",s),write("alt",u),write("hdg",c),write("vs",0),write("parkingbrake",!1)})),autotakeoff=new Autofunction("autotakeoff",500,["rotate","climbspd","climbthrottle","takeoffspool","takeofflnav","takeoffvnav"],["onrunway","n1","airspeed"],[takeoffconfig,rejecttakeoff],(t=>{const e=t.inputs,n=t.states,a=e.get("rotate"),o=e.get("climbspd"),i=e.get("climbthrottle"),s=e.get("takeoffspool"),l=e.get("takeofflnav"),c=e.get("takeoffvnav"),r=n.get("onrunway"),u=n.get("n1"),d=n.get("airspeed"),g=2*i-100;let f=autotakeoff.stage;if(0===f){if(!r)return autotakeoff.error(),void console.log("Not on a runway");takeoffconfig.setActive(!0),levelchange.setActive(!1),write("spd",o),write("autopilot",!0),write("alton",!0),write("vson",!1),write("hdgon",!0);write("throttle",s?-20:g),f++}else 1===f?(write("vson",!0),s?(null===u||u>=40)&&(write("throttle",g),f++):f++):2===f?d>=a&&(levelchange.setActive(!0),f++):3===f?o-d<10&&(l&&write("navon",!0),c&&vnavSystem.setActive(!0),write("spdon",!0),f++):autotakeoff.setActive(!1);autotakeoff.stage=f})),flyto=new Autofunction("flyto",1e3,["flytolat","flytolong","flytohdg"],["latitude","longitude","variation","groundspeed","wind","winddir"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("flytolat"),o=e.get("flytolong"),i=e.get("flytohdg"),s=n.get("latitude"),l=n.get("longitude"),c=n.get("variation"),r=n.get("groundspeed"),u=n.get("wind"),d=n.get("winddir");if(calcLLdistance({lat:s,long:l},{lat:a,long:o})<1)return void flyto.setActive(!1);const g=60*(a-s),f=60*(o-l)*Math.cos(.5*(s+a)*toRad);let h=cyclical(Math.atan2(f,g)*toDeg-c);let p=cyclical(i)-h;p>180?p-=360:p<-180&&(p+=360),Math.abs(p)<5?h-=-.1*p**3+8.5*p:h-=30*Math.sign(p);let v=90-h,m=90-cyclical(d-c+180);v*=toRad,m*=toRad;const y=2*r*Math.cos(v),w=2*r*Math.sin(v),A=u*Math.cos(m),k=u*Math.sin(m);h=cyclical(Math.atan2(y-A,w-k)*toDeg),write("hdg",h)})),flypattern=new Autofunction("flypattern",1e3,["latref","longref","hdgref","updist","downwidth","finallength","turnconst","leg","direction","approach"],["latitude","longitude","variation","groundspeed"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("latref"),o=e.get("longref"),i=e.get("hdgref"),s=e.get("updist"),l=e.get("downwidth"),c=e.get("finallength"),r=e.get("turnconst"),u=e.get("leg"),d=e.get("direction"),g=e.get("approach"),f=n.get("latitude"),h=n.get("longitude"),p=n.get("variation"),v=n.get("groundspeed"),m=i+90*("r"===d?1:-1),y={location:{lat:a,long:o},hdg:i},w=y,A={location:calcLLfromHD(y.location,i,s+1.5,p),hdg:i},k={location:calcLLfromHD(A.location,m,l,p),hdg:m},b={location:calcLLfromHD(y.location,i+180,c,p),hdg:m+180},L={u:A,c:k,d:{location:calcLLfromHD(b.location,m,l,p),hdg:i+180},b:b,f:w}[u],M=calcLLdistance({lat:f,long:h},L.location);let S=u;if(M<v/60/(r/v*60*toRad)){const t=["u","c","d","b","f"];let e=t.indexOf(u);("f"!==u||"f"===u&&M<1)&&(e=(e+1)%5,S=t[e])}"f"===S&&g&&autoland.setActive(!0);const E=L.location.lat,I=L.location.long,N=cyclical(L.hdg);Autofunction.cache.save("leg",S),Autofunction.cache.save("flytolat",E),Autofunction.cache.save("flytolong",I),Autofunction.cache.save("flytohdg",N),flyto.setActive(!0)})),goaround=new Autofunction("goaround",-1,["climbalt","climbspd","climbtype","flcinputref","flcmoderef"],["onground","altitude","vs"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("climbalt"),o=e.get("climbspd"),i=e.get("climbtype"),s=e.get("flcinputref"),l=e.get("flcmoderef"),c=n.get("onground"),r=n.get("altitude");n.get("vs");if(c)return goaround.error(),void console.log("Cannot goaround on the ground");autoland.error(),Autofunction.cache.save("leg","u"),Autofunction.cache.save("flcinput",s),Autofunction.cache.save("flcmode",l);let u=a;if("agl"===i){u+=100*Math.round(r/100)}write("spd",o),write("alt",u),write("spdon",!0),write("alton",!0),write("hdgon",!0),levelchange.setActive(!0)})),autoland=new Autofunction("autoland",1e3,["latref","longref","altref","hdgref","vparef","flare","touchdown","option","flcinputref","flcmoderef"],["latitude","longitude","altitude","groundspeed","onrunway"],[flypattern,goaround],(t=>{const e=t.inputs,n=t.states,a=e.get("latref"),o=e.get("longref"),i=e.get("altref"),s=e.get("hdgref"),l=e.get("vparef"),c=e.get("flare"),r=e.get("touchdown"),u=e.get("option"),d=e.get("flcinputref"),g=e.get("flcmoderef"),f=n.get("latitude"),h=n.get("longitude"),p=n.get("altitude"),v=n.get("groundspeed"),m=n.get("onrunway");0===autoland.stage&&(Autofunction.cache.save("flcmode","v"),Autofunction.cache.save("leg","f"),autoland.stage++);const y=6076.12*calcLLdistance({lat:f,long:h},calcLLfromHD({lat:a,long:o},s,r/6076.12));if(1===autoland.stage&&y<=1e3&&autoland.stage++,autoland.stage>=2)return 2===autoland.stage&&(autoland.stage++,levelchange.setActive(!1),Autofunction.cache.save("flcinput",d),Autofunction.cache.save("flcmode",g),write("vs",-200)),"p"!==u&&(write("spdon",!1),write("throttle",-100)),void("p"===u?(autoland.setActive(!1),setTimeout((()=>{goaround.setActive(!0)}),1e4)):"l"===u&&m?(autoland.setActive(!1),flypattern.setActive(!1),flyto.setActive(!1),write("autopilot",!1)):"t"===u&&m?(autoland.setActive(!1),setTimeout((()=>{autotakeoff.setActive(!0)}),5e3)):"s"===u&&v<1&&(autoland.setActive(!1),autotakeoff.setActive(!0)));const w=p-i,A=Math.asin(w/y)*toDeg;let k=2;y<=6076&&(k=.5);let b=A-k*(l-A);b=Math.round(100*b)/100,b=Math.min(b,l+.5),b<l-.5&&(b=0),Autofunction.cache.save("flcinput",b);write("alt",i+c),levelchange.setActive(!0),flypattern.setActive(!0),autogear.isActive()&&autogear.setActive("p"!==u)})),updatefpl=new Autofunction("updatefpl",-1,[],["fplinfo"],[],(t=>{const e=t.states.get("fplinfo"),n=JSON.parse(e),a=n.detailedInfo.flightPlanItems,o=a.length-1,i=`index${o}children`,s=document.getElementById(i+"0"),l=a[o].children;if(null===l)return;const c=i+(l.length-1).toString(),r=document.getElementById(c);if(null===s||null!==l&&null===r){const t=document.getElementById("waypoints");t.innerHTML="";for(let e=0,o=a.length;e<o;e++){let o;const i=a[e].children;if(null===i)o=n.detailedInfo.waypoints[e],showfpl(`index${e}children0`,o,t);else for(let n=0,a=i.length;n<a;n++)o=i[n].identifier,showfpl(`index${e}children${n}`,o,t)}}})),vnavSystem=new Autofunction("vnav",1e3,[],["fplinfo","onground","autopilot","groundspeed","altitude","vnavon"],[],(t=>{const e=t.states,n=e.get("fplinfo"),a=e.get("onground"),o=e.get("autopilot"),i=e.get("groundspeed"),s=e.get("altitude"),l=e.get("vnavon");if(a||!o||l||levelchange.isActive())return void vnavSystem.error();updatefpl.setActive(!0);const c=JSON.parse(n),r=c.detailedInfo.flightPlanItems;let u={name:c.waypointName,index:-1,children:0,altitude:0,altitudeRestriction:[],altitudeRestrictionDistance:0,restrictionLocation:{lat:0,long:0}},d=vnavSystem.stage;for(let t=0,e=r.length;t<e;t++){const e=r[t],n=e.children;if(null===n)u=nextRestriction(e,u,t,0);else for(let e=0;e<n.length;e++)u=nextRestriction(n[t],u,t,e)}const g=`index${u.index}children${u.children}`,f=document.getElementById(g);if(null!==f&&"INPUT"===f.tagName){const t=f.value;""!==t&&c.distanceToNext<=10&&write("spd",t)}if(0===u.altitudeRestriction.length)return speak("No altitude restriction, VNAV disabled"),void vnavSystem.error();if(-1!==u.altitude){const t=(u.altitude-s)/c.eteToNext;write("alt",u.altitude),write("vs",t)}else{u.altitudeRestrictionDistance=calcLLdistance({lat:c.nextWaypointLatitude,long:c.nextWaypointLongitude},u.restrictionLocation);const t=(u.altitudeRestriction[0]-s)/((c.distanceToNext+u.altitudeRestrictionDistance)/i*60);write("alt",u.altitudeRestriction[0]),write("vs",t)}vnavSystem.stage=d}));let calloutFlags=[];const callout=new Autofunction("callout",250,["rotate","minumuns"],["onrunway","airspeed","verticalspeed","throttle","gear","altitudeAGL","altitude"],[],(t=>{const e=t.inputs,n=t.states,a=e.get("rotate"),o=e.get("minumuns"),i=n.get("onrunway"),s=n.get("airspeed"),l=n.get("verticalspeed"),c=n.get("throttle"),r=n.get("gear"),u=n.get("altitudeAGL"),d=n.get("altitude"),g=a,f=a+10,h=Autofunction.cache.load("altref"),p=null===h?u:d-h;let v=callout.stage;0===v&&(calloutFlags=[!1,!1,!1,!1,!1,!1,!1,!1],v++),1===v&&s>=g&&i&&c>40?(speak("V1"),v++):2===v&&s>=a&&i&&c>40?(speak("Rotate"),v++):3===v&&s>=f&&c>40&&(speak("V2"),v++),!speechSynthesis.speaking&&l<-500&&!r&&p<=1e3&&speak("Landing Gear"),!speechSynthesis.speaking&&l<-500&&p<=o+10&&p>=o&&speak("Minimums");const m=[1e3,500,100,50,40,30,20,10];if(l<-500)for(let t=0,e=m.length-1;t<e;t++)if(!speechSynthesis.speaking&&p<=m[t]&&p>m[t+1]&&!calloutFlags[t]){speak(m[t].toString()),calloutFlags[t]=!0;break}callout.stage=v})),autofunctions=[autobrakes,autoflaps,autogear,autoland,autolights,autospeed,autospoilers,autotakeoff,autotrim,callout,flypattern,flyto,goaround,levelchange,markposition,rejecttakeoff,setrunway,takeoffconfig,updatefpl,vnavSystem];function bridge(){let t=document.getElementById("address").value;const e=t.split(".");""!==t&&(e.length<2&&(t="1."+t),e.length<3&&(t="168."+t),e.length<4&&(t="192."+t)),socket.volatile.emit("bridge",t)}function closeBridge(){reset(),socket.volatile.emit("break")}function read(t,e=(t=>{})){socket.emit("read",t,(t=>{e(t)}))}function readAsync(t,e=(t=>{})){socket.emit("readAsync",t,(t=>{e(t)}))}function readLog(t){read(t,(t=>{console.log(t)}))}function write(t,e){socket.emit("write",t,e)}function setHidden(t){for(let e=1,n=panels.length;e<n;e++){panels[e].hidden=t}}function reset(){setHidden(!0),autofunctions.forEach((t=>{t.isActive()&&t.setActive(!1)})),storage.load(ProfileStorage.defaultName)}function log(t){statLog.innerText=t,console.log(t)}let statLog=document.getElementById("status"),panels=document.getElementsByClassName("panel");const storage=new ProfileStorage(document.getElementById("configselect")),select=document.getElementById("voices"),voices=speechSynthesis.getVoices();for(let t=0,e=voices.length;t<e;t++){const e=new Option(voices[t].lang,t.toString());select.add(e)}const socket=io();socket.on("connect",(()=>{log("Connected to Server")})),socket.on("disconnect",(()=>{reset(),log("Server Disconnected\n\nPlease Restart Server")})),socket.on("connect_error",(()=>{console.clear()})),socket.on("ready",(t=>{document.getElementById("address").value=t,setHidden(!1)})),socket.on("log",(t=>{log(t)}));