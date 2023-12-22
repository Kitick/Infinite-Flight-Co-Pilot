"use strict";class StateCache{#t=new Map;constructor(){}#e(t){let e;switch(t.type){case"number":e=parseFloat(t.value);break;case"checkbox":e=t.checked;break;case"select-one":e=t.value;break;default:e=null}"number"===t.type&&"number"==typeof e&&isNaN(e)&&(e=null);const a=this.#t.get(t.id);void 0!==a&&(a.value=e)}#a(t){t.classList.add("error"),setTimeout((()=>{t.classList.remove("error")}),2e3)}addArray(t){t.forEach((t=>{if(void 0===this.#t.get(t)){const e=document.getElementById(t);if(null!==e){const t=e;t.addEventListener("change",(()=>{this.#e(t)})),this.#t.set(t.id,{dom:t,value:null}),this.#e(t)}}}))}add(...t){this.addArray(t)}loadArray(t){let e=new Map;return t.forEach((t=>{const a=this.#t.get(t)?.value;if(void 0===a)throw t+" is undefined";e.set(t,a)})),e}load(t){return this.loadArray([t]).get(t)}loadAll(){let t=new Map;return this.#t.forEach(((e,a)=>{t.set(a,e.value)})),t}save(t,e){const a=this.#t.get(t);if(void 0===a)return;a.value=e;const n=a.dom;null===e&&(e=""),"checkbox"===n.type&&"boolean"==typeof e?n.checked=e:n.value=e.toString()}isValid(t,e=!1){const a=this.#t.get(t);if(void 0===a)return!1;const n=null!==a.value;return!n&&e&&this.#a(a.dom),n}isValidArray(t,e=!1){let a=!0;return t.forEach((t=>{a=this.isValid(t,e)&&a})),a}}class ProfileStorage{#n;constructor(t){this.#n=t,this.#o()}#o(){let t=[""];for(let e=0,a=localStorage.length;e<a;e++)t.push(localStorage.key(e));t.sort(),this.#n.innerHTML="",t.forEach((t=>{let e=new Option(t,t);this.#n.appendChild(e)}))}#i(t,e){const a=document.getElementById(t);null!==a&&(a.className=e,setTimeout((()=>{a.className="off"}),500))}add(){let t=prompt("Enter the name of the profile:");for(;""===t;)t=prompt("Name cannot be blank:");null!==t&&(localStorage.setItem(t,""),this.#o(),this.#n.value=t,this.save())}save(){const t=this.#n.value;if(""===t)return void this.add();const e=Autofunction.cache.loadAll();let a={};e.forEach(((t,e)=>{a[e]=t})),localStorage.setItem(t,JSON.stringify(a)),this.#i("save","active")}load(){const t=this.#n.value,e=localStorage.getItem(t);if(""===t||null===e)return void this.#i("load","error");const a=JSON.parse(e);for(let t in a){let e=a[t];if(null!==e){let t=parseFloat(e.toString());isNaN(t)||(e=t)}Autofunction.cache.save(t,e)}this.#i("load","active")}remove(){const t=this.#n.value;if(""===t)return;confirm("Are you sure you want to delete: "+t)&&(localStorage.removeItem(t),this.#o())}}class Autofunction{delay;#s;#l=setTimeout((()=>{}),0);#c=new Map;#r=[];#u=[];#d=0;#g=0;#f=!1;#h=!1;#p;stage=0;static cache=new StateCache;constructor(t,e,a,n,o,i){this.delay=e;const s=document.getElementById(t);if(null===s)throw"Element "+t+" is undefined";this.#s=s,this.#s.addEventListener("click",(()=>{dependencyCheck(t),this.setActive()})),this.#v(),this.#d=n.length,this.#r=a,this.#u=o,this.#p=i,this.#r.forEach((t=>{let e=document.getElementById(t);if(null!==e&&"INPUT"===e.tagName&&"number"===e.type){const t=e,a=document.getElementById("tooltip");t.addEventListener("mouseenter",(()=>{a.innerText=t.placeholder})),t.addEventListener("mouseout",(()=>{a.innerText="Tooltip"}))}})),n.forEach((t=>{this.#c.set(t,null)})),Autofunction.cache.addArray(a)}get active(){return this.#f}set active(t){this.setActive(t)}get inputs(){return this.#r}get dependents(){return this.#u}setActive(t=!this.#f){this.active!==t&&(this.#f=t,this.#v(),t?(this.stage=0,this.#m()):clearTimeout(this.#l))}#v(){this.#s.className=this.active?"active":"off"}#m(){this.validateInputs(!0)?this.#y((()=>{const t=this.#h;this.#h=!1,this.#p({states:this.#c,inputs:Autofunction.cache.loadArray(this.inputs)}),!this.#h&&t&&this.#v(),-1!==this.delay?this.active&&(this.#l=setTimeout((()=>{this.#m()}),this.delay)):this.active=!1})):this.error()}#y(t=(()=>{})){0===this.#d?t():(this.#g=0,this.#c.forEach(((e,a)=>{read(a,(e=>{this.#w(a,e,t)}))})))}#w(t,e,a=(()=>{})){this.#c.set(t,e),this.#g++,this.#g===this.#d&&a()}validateInputs(t=!1){let e=Autofunction.cache.isValidArray(this.inputs,t);return this.#u.forEach((a=>{e=Autofunction.cache.isValidArray(a.inputs,t)&&e})),e}arm(){this.#h=!0,this.#s.className="armed"}error(){this.active=!1,this.#s.className="error",this.#l=setTimeout((()=>{this.#v()}),2e3)}}function cyclical(t,e=360){return t=(t%e+e)%e}function dms(t,e=0,a=0){return Math.sign(t)*(Math.abs(t)+e/60+a/3600)}function calcLLfromHD(t,e,a,n=0){e=90-e-n,e*=toRad;const o=(a/=60)*Math.sin(e)+t.lat;return{lat:o,long:a*Math.cos(e)/Math.cos(toRad*(t.lat+o)*.5)+t.long}}function calcLLdistance(t,e){const a=60*(e.lat-t.lat);return((60*(e.long-t.long)*Math.cos(.5*(t.lat+e.lat)*toRad))**2+a**2)**.5}function controlThrottle(t,e,a){write("spdon",!1),write("throttle",t>0?-80:-100),write("spd",e),write("spoilers",1),a&&(write("spdon",!0),write("spoilers",2))}function showfpl(t,e,a){const n=document.createElement("input"),o=document.createElement("br");n.type="number",n.id=t,a.innerHTML+=" "+e,a.appendChild(n),a.appendChild(o)}function nextRestriction(t,e,a,n){return t.identifier!==e.name&&t.name!==e.name||(e.index=a,e.children=n,e.altitude=t.altitude),a>=e.index&&-1!==t.altitude&&(e.altitudeRestriction.push(t.altitude),e.restrictionLocation={lat:t.location.Latitude,long:t.location.Longitude}),e}function speak(t){t=t.toString();const e=document.getElementById("voices").selectedIndex,a=speechSynthesis.getVoices(),n=document.getElementById("utterancerate");let o=parseInt(n.value);isNaN(o)&&(o=1);const i=new SpeechSynthesisUtterance(t);i.rate=o,i.voice=a[e],speechSynthesis.speak(i)}speechSynthesis.getVoices();const toDeg=180/Math.PI,toRad=Math.PI/180;function setAll(t){const e="off"===t;autogear.active=e,autospoilers.active=e,autotrim.active=e,autoflaps.active=e,autolights.active=e,autobrakes.active=e,autospeed.active=e;document.getElementById("all").className=e?"active":"off"}function config(){const t=new Map;t.set("autoflaps",{instance:autoflaps,checked:document.getElementById("configflaps").checked}),t.set("autospeed",{instance:autoflaps,checked:document.getElementById("configspeed").checked}),t.set("autotakeoff",{instance:autoflaps,checked:document.getElementById("configtakeoff").checked}),t.set("flypattern",{instance:autoflaps,checked:document.getElementById("configpattern").checked}),t.set("autoland",{instance:autoflaps,checked:document.getElementById("configland").checked});let e=[];t.forEach((t=>{if(t.checked){const a=t.instance.inputs,n=t.instance.dependents;a.forEach((t=>{-1===e.indexOf(t)&&e.push(t)})),n.forEach((t=>{t.inputs.forEach((t=>{-1===e.indexOf(t)&&e.push(t)}))}))}})),e.forEach((t=>{const e=document.getElementById(t);if(null!==e&&"number"===e.type){const a=prompt(e.placeholder+"\nLeave blank to not change");null!==a&&""!==a&&Autofunction.cache.save(t,a)}}))}function dependencyCheck(t){"autoland"===t&&autoland.active&&Autofunction.cache.load("approach")?Autofunction.cache.save("approach",!1):"flypattern"===t&&flypattern.active?(autoland.active=!1,flyto.active=!1):"flyto"===t&&flyto.active&&(flypattern.active=!1,autoland.active=!1)}const autotrim=new Autofunction("trim",1e3,[],["pitch","trim","onground"],[],(t=>{const e=t.states,a=e.get("onground"),n=e.get("pitch"),o=e.get("trim");if(a)return void autotrim.arm();let i=10;if(Math.abs(n)<10?i=1:Math.abs(n)<50&&(i=5),Math.abs(n)>=2){let t=o+i*Math.sign(n);t=Math.round(t/i)*i,write("trim",t)}})),autolights=new Autofunction("lights",2e3,[],["altitudeAGL","onground","onrunway","gear"],[],(t=>{const e=t.states,a=e.get("altitudeAGL"),n=e.get("onground"),o=e.get("onrunway"),i=e.get("gear");write("master",!0),write("beaconlights",!0),write("navlights",!0),n?(write("strobelights",o),write("landinglights",o)):(write("strobelights",!0),write("landinglights",!!(a<1e3&&i)))})),autogear=new Autofunction("gear",1e3,[],["gear","altitudeAGL","verticalspeed"],[],(t=>{const e=t.states,a=e.get("gear"),n=e.get("altitudeAGL"),o=e.get("verticalspeed");let i=a;n<100||o<=-500&&n<1500?i=!0:(o>=500||n>=2e3)&&(i=!1),i!==a&&read("commands/LandingGear")})),autobrakes=new Autofunction("autobrakes",1e3,[],["leftbrake","rightbrake","autobrakes","onground","onrunway","groundspeed"],[],(t=>{const e=t.states,a=e.get("leftbrake"),n=e.get("rightbrake"),o=e.get("autobrakes"),i=e.get("onground"),s=e.get("onrunway"),l=e.get("groundspeed");let c=o;i&&!s?c=0:i?s&&(c=3):c=2,i&&l>30&&(a>.3||n>.3)&&(c=0),c!==o&&write("autobrakes",c)})),autoflaps=new Autofunction("flaps",1e3,["flaplow","flaphigh","flapto"],["flaps","airspeed","altitudeAGL","verticalspeed","flapcount","onground","onrunway"],[],(t=>{const e=t.inputs,a=t.states,n=e.get("flaplow"),o=e.get("flaphigh"),i=e.get("flapto"),s=a.get("flaps"),l=a.get("airspeed"),c=a.get("altitudeAGL"),r=a.get("verticalspeed"),u=a.get("flapcount"),d=a.get("onground"),g=a.get("onrunway");if(i<0||i>u-1||o<n)return void autoflaps.error();let f=s;if(d)f=g?i:0;else if(c>=250){const t=u-1,e=(o-n)/t;f=Math.round((o-l)/e),f=Math.max(f,0),f=Math.min(f,t)}(r>=500&&f>s||r<=-500&&f<s)&&(f=s),f!==s&&write("flaps",f)})),autospoilers=new Autofunction("spoilers",1e3,[],["spoilers","airspeed","spd","altitude","altitudeAGL","onrunway","onground"],[],(t=>{const e=t.states,a=e.get("spoilers"),n=e.get("airspeed"),o=e.get("spd"),i=e.get("altitude"),s=e.get("altitudeAGL"),l=e.get("onrunway"),c=e.get("onground");let r=0;l||!c&&s<1e3?r=2:n-o>=20&&i<28e3&&(r=1),r!==a&&write("spoilers",r)})),levelchange=new Autofunction("levelchange",1e3,["flcinput","flcmode"],["airspeed","altitude","alt","vs"],[],(t=>{const e=t.inputs,a=t.states,n=e.get("flcinput"),o=e.get("flcmode"),i=a.get("airspeed"),s=a.get("altitude"),l=a.get("alt"),c=a.get("vs");let r=n;const u=l-s;Math.abs(u)<100?levelchange.active=!1:("v"===o&&(r=6076.12*Math.tan(r*toRad)),"f"!==o&&(r*=Math.sign(u)*(i/60)),r=100*Math.round(r/100),r!==c&&write("vs",r))})),markposition=new Autofunction("markposition",-1,[],["latitude","longitude","altitude","heading"],[],(t=>{const e=t.states,a=e.get("latitude"),n=e.get("longitude"),o=e.get("altitude"),i=e.get("heading");Autofunction.cache.save("latref",a),Autofunction.cache.save("longref",n),Autofunction.cache.save("hdgref",Math.round(i)),Autofunction.cache.save("altref",Math.round(o))})),setrunway=new Autofunction("setrunway",-1,[],["route","coordinates"],[],(t=>{const e=t.states,a=e.get("route"),n=e.get("coordinates"),o=a.split(",");let i=-1;for(let t=0,e=o.length;t<e;t++)if(0===o[t].search(/RW\d\d.*/)){i=t;break}if(-1===i)return void setrunway.error();const s=n.split(" ")[i].split(","),l=parseFloat(s[0]),c=parseFloat(s[1]),r=parseInt(a[i][2]+a[i][3]+"0");Autofunction.cache.save("latref",l),Autofunction.cache.save("longref",c),Autofunction.cache.save("hdgref",r)})),flyto=new Autofunction("flyto",1e3,["flytolat","flytolong","flytohdg"],["latitude","longitude","variation","groundspeed","wind","winddir"],[],(t=>{const e=t.inputs,a=t.states,n=e.get("flytolat"),o=e.get("flytolong"),i=e.get("flytohdg"),s=a.get("latitude"),l=a.get("longitude"),c=a.get("variation"),r=a.get("groundspeed"),u=a.get("wind"),d=a.get("winddir");if(calcLLdistance({lat:s,long:l},{lat:n,long:o})<1)return void(flyto.active=!1);const g=60*(n-s),f=60*(o-l)*Math.cos(.5*(s+n)*toRad);let h=cyclical(Math.atan2(f,g)*toDeg-c);let p=cyclical(i)-h;p>180?p-=360:p<-180&&(p+=360),Math.abs(p)<5?h-=-.1*p**3+8.5*p:h-=30*Math.sign(p);let v=90-h,m=90-cyclical(d-c+180);v*=toRad,m*=toRad;const y=2*r*Math.cos(v),w=2*r*Math.sin(v),k=u*Math.cos(m),A=u*Math.sin(m);h=cyclical(Math.atan2(y-k,w-A)*toDeg),write("hdg",h)})),flypattern=new Autofunction("flypattern",1e3,["latref","longref","hdgref","updist","downwidth","finallength","turnconst","leg","direction","approach"],["latitude","longitude","variation","groundspeed"],[flyto],(t=>{const e=t.inputs,a=t.states,n=e.get("latref"),o=e.get("longref"),i=e.get("hdgref"),s=e.get("updist"),l=e.get("downwidth"),c=e.get("finallength"),r=e.get("turnconst"),u=e.get("leg"),d=e.get("direction"),g=e.get("approach"),f=a.get("latitude"),h=a.get("longitude"),p=a.get("variation"),v=a.get("groundspeed"),m=i+90*("r"===d?1:-1),y={location:{lat:n,long:o},hdg:i},w=y,k={location:calcLLfromHD(y.location,i,s+1.5,p),hdg:i},A={location:calcLLfromHD(k.location,m,l,p),hdg:m},b={location:calcLLfromHD(y.location,i+180,c,p),hdg:i+180},L={u:k,c:A,d:{location:calcLLfromHD(b.location,m,l,p),hdg:m},b:b,f:w}[u],M=calcLLdistance({lat:f,long:h},L.location);let E=u;if(M<v/60/(r/v*60*toRad)){const t=["u","c","d","b","f"];let e=t.indexOf(u);("f"!==u||"f"===u&&M<1)&&(e=(e+1)%5,E=t[e])}"f"===E&&g&&(autoland.active=!0);const S=L.location.lat,I=L.location.long,N=cyclical(L.hdg);Autofunction.cache.save("leg",E),Autofunction.cache.save("flytolat",S),Autofunction.cache.save("flytolong",I),Autofunction.cache.save("flytohdg",N),flyto.active=!0})),autospeed=new Autofunction("autospeed",1e3,["latref","longref","climbspd","spdref","cruisespd"],["onground","airspeed","verticalspeed","altitudeAGL","altitude","latitude","longitude","spd"],[],(t=>{const e=t.inputs,a=t.states,n=e.get("latref"),o=e.get("longref"),i=e.get("climbspd"),s=e.get("spdref"),l=e.get("cruisespd"),c=a.get("onground"),r=a.get("airspeed"),u=a.get("verticalspeed"),d=a.get("altitudeAGL"),g=a.get("altitude"),f=a.get("latitude"),h=a.get("longitude"),p=a.get("spd");if(c)return void autospeed.arm();const v=Autofunction.cache.load("altref"),m=null===v?d:g-v;if(autoland.active){let t=10*(calcLLdistance({lat:f,long:h},{lat:n,long:o})-2.5)+s;t=Math.min(t,p),t=10*Math.round(t/10),t=Math.max(t,s),write("spd",t)}else flypattern.active||autotakeoff.active&&u>500&&m<=1e4&&i-r<10&&(write("spd",i),write("spdon",!0));u<-500&&m<=12e3&&m>=1e4&&write("spd",250),null!==l&&u>500&&m>1e4&&write("spd",l)})),goaround=new Autofunction("goaround",-1,["climbalt","climbspd","climbtype"],["onground","altitude","vs"],[levelchange],(t=>{const e=t.inputs,a=t.states,n=e.get("climbalt"),o=e.get("climbspd"),i=e.get("climbtype"),s=a.get("onground"),l=a.get("altitude"),c=a.get("vs"),r=Autofunction.cache.load("flapto");if(s)return goaround.error(),void console.log("Cannot goaround on the ground");autoland.error(),Autofunction.cache.save("flcmode","g"),Autofunction.cache.save("flcinput",500),Autofunction.cache.save("leg","u");let u=n;const d="msl"===i,g=100*Math.round(l/100);u+=d?0:g,write("spd",o),write("alt",u),write("spdon",!0),write("alton",!0),write("hdgon",!0),autoflaps.active&&null!==r&&write("flaps",r),c<0&&write("vs",0),setTimeout((()=>{levelchange.active=!0}),500)})),autoland=new Autofunction("autoland",1e3,["latref","longref","altref","hdgref","vparef","flare","touchdown","option"],["latitude","longitude","altitude","groundspeed","onrunway"],[levelchange,flypattern,goaround],(t=>{const e=t.inputs,a=t.states,n=e.get("latref"),o=e.get("longref"),i=e.get("altref"),s=e.get("hdgref"),l=e.get("vparef"),c=e.get("flare"),r=e.get("touchdown"),u=e.get("option"),d=a.get("latitude"),g=a.get("longitude"),f=a.get("altitude"),h=a.get("groundspeed"),p=a.get("onrunway");0===autoland.stage&&(Autofunction.cache.save("flcmode","v"),Autofunction.cache.save("leg","f"),autoland.stage++);const v=6076.12*calcLLdistance({lat:d,long:g},calcLLfromHD({lat:n,long:o},s,r/6076.12));if(autoland.stage>=2||v<=1e3)return 2===autoland.stage&&(autoland.stage++,levelchange.active=!1,Autofunction.cache.save("flcmode","g"),Autofunction.cache.save("flcinput",500),write("vs",-200)),"p"!==u&&(write("spdon",!1),write("throttle",-100)),void("p"===u?(autoland.active=!1,setTimeout((()=>{goaround.active=!0}),1e4)):"l"===u?(autoland.active=!1,flypattern.active=!1,flyto.active=!1):"t"===u&&p?(autoland.active=!1,setTimeout((()=>{autotakeoff.active=!0}),5e3)):"s"===u&&h<1&&(autoland.active=!1,autotakeoff.active=!0));const m=f-i,y=Math.asin(m/v)*toDeg;let w=2;v<=6076&&(w=.5);let k=y-w*(l-y);k=Math.round(10*k)/10,k=Math.min(k,l+.5),k<l-.5&&(k=0),Autofunction.cache.save("flcinput",k);write("alt",i+c),levelchange.active=!0,flypattern.active=!0,autogear.active&&(autogear.active="p"!==u)})),rejecttakeoff=new Autofunction("reject",-1,[],["onrunway"],[],(t=>{if(!t.states.get("onrunway"))return rejecttakeoff.error(),void console.log("Not on a runway");autotakeoff.active&&autotakeoff.error(),write("throttle",-100)})),takeoffconfig=new Autofunction("takeoffconfig",-1,["climbalt","climbtype"],["onground","heading","altitude"],[],(t=>{const e=t.inputs,a=t.states,n=e.get("climbalt"),o=e.get("climbtype"),i=a.get("onground"),s=a.get("heading"),l=a.get("altitude");if(!i)return takeoffconfig.error(),void console.log("Not on the ground");let c=n;const r="msl"===o,u=100*Math.round(l/100);c+=r?0:u,write("alt",c),write("hdg",s),write("vs",0),write("parkingbrake",!1)})),autotakeoff=new Autofunction("autotakeoff",500,["rotate","climbspd","climbthrottle","takeoffspool","takeofflnav","takeoffvnav"],["onrunway","n1","airspeed"],[takeoffconfig,levelchange,rejecttakeoff],(t=>{const e=t.inputs,a=t.states,n=e.get("rotate"),o=e.get("climbspd"),i=e.get("climbthrottle"),s=e.get("takeoffspool"),l=e.get("takeofflnav"),c=e.get("takeoffvnav"),r=a.get("onrunway"),u=a.get("n1"),d=a.get("airspeed"),g=2*i-100;let f=autotakeoff.stage;if(0===f){if(!r)return autotakeoff.error(),void console.log("Not on a runway");takeoffconfig.active=!0,levelchange.active=!1,write("spd",o),write("autopilot",!0),write("alton",!0),write("vson",!1),write("hdgon",!0);write("throttle",s?-20:g),f++}else 1===f?(write("vson",!0),s?(null===u||u>=40)&&(write("throttle",g),f++):f++):2===f?d>=n&&(levelchange.active=!0,f++):3===f?o-d<10&&(l&&write("navon",!0),c&&(vnavSystem.active=!0),write("spdon",!0),f++):autotakeoff.active=!1;autotakeoff.stage=f})),updatefpl=new Autofunction("updatefpl",-1,[],["fplinfo"],[],(t=>{const e=t.states.get("fplinfo"),a=JSON.parse(e),n=a.detailedInfo.flightPlanItems,o=n.length-1,i=`index${o}children`,s=document.getElementById(i+"0"),l=n[o].children;if(null===l)return;const c=i+(l.length-1).toString(),r=document.getElementById(c);if(null===s||null!==l&&null===r){const t=document.getElementById("waypoints");t.innerHTML="";for(let e=0,o=n.length;e<o;e++){let o;const i=n[e].children;if(null===i)o=a.detailedInfo.waypoints[e],showfpl(`index${e}children0`,o,t);else for(let a=0,n=i.length;a<n;a++)o=i[a].identifier,showfpl(`index${e}children${a}`,o,t)}}})),vnavSystem=new Autofunction("vnav",1e3,[],["fplinfo","onground","autopilot","groundspeed","altitude","vnavon"],[],(t=>{const e=t.states,a=e.get("fplinfo"),n=e.get("onground"),o=e.get("autopilot"),i=e.get("groundspeed"),s=e.get("altitude"),l=e.get("vnavon");if(n||!o||l||levelchange.active)return void vnavSystem.error();updatefpl.active=!0;const c=JSON.parse(a),r=c.detailedInfo.flightPlanItems;let u={name:c.waypointName,index:-1,children:0,altitude:0,altitudeRestriction:[],altitudeRestrictionDistance:0,restrictionLocation:{lat:0,long:0}},d=vnavSystem.stage;for(let t=0,e=r.length;t<e;t++){const e=r[t],a=e.children;if(null===a)u=nextRestriction(e,u,t,0);else for(let e=0;e<a.length;e++)u=nextRestriction(a[t],u,t,e)}const g=`index${u.index}children${u.children}`,f=document.getElementById(g);if(null!==f&&"INPUT"===f.tagName){const t=f.value;""!==t&&c.distanceToNext<=10&&write("spd",t)}if(0===u.altitudeRestriction.length)return speak("No altitude restriction, VNAV disabled"),void vnavSystem.error();if(-1!==u.altitude){const t=(u.altitude-s)/c.eteToNext;write("alt",u.altitude),write("vs",t)}else{u.altitudeRestrictionDistance=calcLLdistance({lat:c.nextWaypointLatitude,long:c.nextWaypointLongitude},u.restrictionLocation);const t=(u.altitudeRestriction[0]-s)/((c.distanceToNext+u.altitudeRestrictionDistance)/i*60);write("alt",u.altitudeRestriction[0]),write("vs",t)}vnavSystem.stage=d}));let calloutFlags=[];const callout=new Autofunction("callout",250,["rotate","minumuns"],["onrunway","airspeed","verticalspeed","throttle","gear","altitudeAGL","altitude"],[],(t=>{const e=t.inputs,a=t.states,n=e.get("rotate"),o=e.get("minumuns"),i=a.get("onrunway"),s=a.get("airspeed"),l=a.get("verticalspeed"),c=a.get("throttle"),r=a.get("gear"),u=a.get("altitudeAGL"),d=a.get("altitude"),g=n,f=n+10,h=Autofunction.cache.load("altref"),p=null===h?u:d-h;let v=callout.stage;0===v&&(calloutFlags=[!1,!1,!1,!1,!1,!1,!1,!1],v++),1===v&&s>=g&&i&&c>40?(speak("V1"),v++):2===v&&s>=n&&i&&c>40?(speak("Rotate"),v++):3===v&&s>=f&&c>40&&(speak("V2"),v++),!speechSynthesis.speaking&&l<-500&&!r&&p<=1e3&&speak("Landing Gear"),!speechSynthesis.speaking&&l<-500&&p<=o+10&&p>=o&&speak("Minimums");const m=[1e3,500,100,50,40,30,20,10];if(l<-500)for(let t=0,e=m.length-1;t<e;t++)if(!speechSynthesis.speaking&&p<=m[t]&&p>m[t+1]&&!calloutFlags[t]){speak(m[t].toString()),calloutFlags[t]=!0;break}callout.stage=v})),autofunctions=[autotrim,autolights,autogear,autoflaps,levelchange,markposition,setrunway,flyto,flypattern,rejecttakeoff,takeoffconfig,autotakeoff,autoland,goaround,autospeed,autobrakes,vnavSystem,callout,updatefpl,autospoilers],socket=io();function bridge(){setVisibility(!0);let t=document.getElementById("address").value;const e=t.split(".");""!==t&&(e.length<2&&(t="1."+t),e.length<3&&(t="168."+t),e.length<4&&(t="192."+t)),socket.emit("bridge",t,(t=>{statLog.innerText=t,console.log(t)}))}function closeBridge(){reset(),socket.emit("break",(t=>{statLog.innerText=t,console.log(t)}))}function read(t,e=(t=>{})){socket.emit("read",t,(t=>{e(t)}))}function readAsync(t,e=(t=>{})){socket.emit("readAsync",t,(t=>{e(t)}))}function readLog(t){read(t,(t=>{console.log(t)}))}function write(t,e){socket.emit("write",t,e)}function setVisibility(t){for(let e=1,a=panels.length;e<a;e++){panels[e].hidden=t}}function reset(){setVisibility(!0),autofunctions.forEach((t=>{t.active&&(t.active=!1)}))}let statLog=document.getElementById("status"),panels=document.getElementsByClassName("panel");const storage=new ProfileStorage(document.getElementById("configselect")),select=document.getElementById("voices"),voices=speechSynthesis.getVoices();for(let t=0,e=voices.length;t<e;t++){const e=new Option(voices[t].lang,t.toString());select.add(e)}socket.emit("test",(t=>{statLog.innerText=t,console.log(t)})),socket.on("ready",(t=>{document.getElementById("address").value=t,setVisibility(!1)})),socket.on("log",(t=>{statLog.innerText=t,console.log(t)}));