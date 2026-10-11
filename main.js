import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const UI={
  canvas:$("#scene"),loading:$("#sceneLoading"),badge:$("#characterBadge"),
  stepPill:$("#stepPill"),subtitle:$("#sceneSubtitle"),time:$("#timeValue"),status:$("#statusValue"),detail:$("#statusDetail"),
  title:$("#scenarioTitle"),situation:$("#scenarioSituation"),stepNumber:$("#stepNumber"),progress:$("#scenarioProgress"),
  choices:$("#choices"),feedback:$("#feedback"),nextScenario:$("#nextScenario"),reset:$("#resetBtn"),
  overlay:$("#dialogueOverlay"),overlayAvatar:$("#overlayAvatar"),overlaySpeaker:$("#overlaySpeaker"),overlayRole:$("#overlayRole"),overlayText:$("#overlayText"),
  replayOverlay:$("#replayOverlay"),nextDialogue:$("#nextDialogue"),hideOverlay:$("#hideOverlay"),showDialogue:$("#showDialogue"),
  dialog:$("#knowledgeDialog"),closeHub:$("#closeHub"),hubTitle:$("#hubTitle"),tabs:$$(".hub-tab"),panels:$$(".hub-panel"),
  openHandouts:$("#openHandouts"),openUDL:$("#openUDL"),openKPI:$("#openKPI"),openPriorities:$("#openPriorities"),
  search:$("#resourceSearch"),resourceList:$("#resourceList"),resourceDetail:$("#resourceDetail"),udlGrid:$("#udlGrid"),udlRecommendation:$("#udlRecommendation"),
  kpiGrid:$("#kpiGrid"),kpiInsight:$("#kpiInsight"),priorityList:$("#priorityList"),
  scoreTotal:$("#scoreTotal"),scoreProblem:$("#scoreProblem"),scoreComm:$("#scoreComm"),scoreGuest:$("#scoreGuest"),scorePriority:$("#scorePriority"),
  barProblem:$("#barProblem"),barComm:$("#barComm"),barGuest:$("#barGuest"),barPriority:$("#barPriority"),cameras:$$(".camera-btn")
};

let scene,camera,renderer,raycaster,pointer,staff,guestMale,guestFemale;
let simData,resources=[],stepIndex=0,currentStep=null,selected=null,dialogueIndex=0,priorityOrder=[];
let score={problem:0,communication:0,guest:0,priority:0},lastKpi=null,lastUdl={engagement:0,representation:0,action:0};
let targetCamera={pos:new THREE.Vector3(8.7,6.2,10.6),look:new THREE.Vector3(0,1,-.65)},currentLook=targetCamera.look.clone();
let yaw=0,pitch=0,zoom=1,dragging=false,lastX=0,lastY=0,speaking=null;
const clock=new THREE.Clock();
const cameraViews={
 overview:{pos:new THREE.Vector3(8.7,6.2,10.6),look:new THREE.Vector3(0,1,-.65)},
 desk:{pos:new THREE.Vector3(3.8,3.3,5.6),look:new THREE.Vector3(-.4,1.15,-1.15)},
 guests:{pos:new THREE.Vector3(-3.8,2.7,3.8),look:new THREE.Vector3(.7,1.1,-.3)},
 lounge:{pos:new THREE.Vector3(7.1,3.2,1.0),look:new THREE.Vector3(3.6,.9,1.4)}
};

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function mat(color,rough=.72,metal=.04){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
function box(w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function cyl(r,h,color,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}

function buildLobby(){
 scene.background=new THREE.Color(0xe8eceb);scene.fog=new THREE.Fog(0xe8eceb,18,34);
 box(18,.2,13,0xe7e0d8,0,-.1,0);box(18,6,.25,0xf4f0eb,0,3,-5.7);box(.25,6,13,0xede9e4,-8.85,3,0);
 box(6.8,1.05,1,0xb8946e,-1,.55,-1.45);box(6.2,.58,.84,0xd3b48f,-1,.89,-1.38);box(6.5,.12,1.08,0xf0e4d3,-1,1.18,-1.38);
 for(let i=0;i<12;i++)box(.09,2.3,.08,0xcaa77d,-3.2+i*.46,2.65,-5.46);
 box(2.55,.55,.18,0x2f6668,-1,3.68,-5.38);addTextPlane("RECEPTION",-1,3.69,-5.26,1.9,.38);
 box(.52,.32,.05,0x1f3038,-2.55,1.55,-1.92);box(.52,.32,.05,0x1f3038,.15,1.55,-1.92);
 box(2.1,1.5,.12,0x274951,-5.9,2.25,-3.2);addTextPlane("LIVE OPERATIONS",-5.9,2.35,-3.12,1.55,.75);
 box(5,.05,3.3,0xf2eee6,4.35,.03,1.5);sofa(4.15,.55,.9);sofa(5.65,.55,.25);box(2,.16,1,0xcda77b,4.7,.32,2.15);
 for(let i=0;i<4;i++)box(.08,3,.08,0x5c6b70,3+i*1.65,2.7,-5.42);
 plant(-6.1,-.1,-2.6);plant(7.2,-.05,2.6);plant(3.7,.05,-4.8);floorLamp(6.8,0,.9);cyl(.13,.08,0x4a5152,-.45,1.28,-.95);
}
function sofa(x,z,rot=0){const g=new THREE.Group();const s=new THREE.Mesh(new THREE.BoxGeometry(2,.42,.85),mat(0xa9c3bc));s.position.y=.48;g.add(s);const b=new THREE.Mesh(new THREE.BoxGeometry(2,.68,.22),mat(0xa9c3bc));b.position.set(0,.82,-.33);g.add(b);g.position.set(x,0,z);g.rotation.y=rot;scene.add(g)}
function plant(x,y,z){const p=new THREE.Mesh(new THREE.CylinderGeometry(.3,.38,.55,22),mat(0xb38b64));p.position.set(x,y+.28,z);scene.add(p);for(let i=0;i<7;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),mat(0x6f9a75));l.scale.set(.65,1.5,.55);l.position.set(x+(i-3)*.08,y+.78+Math.abs(i-3)*.04,z);scene.add(l)}}
function floorLamp(x,y,z){box(.08,1.85,.08,0x9b744d,x,y+.93,z);const s=new THREE.Mesh(new THREE.CylinderGeometry(.34,.48,.52,28),mat(0xf2eadf));s.position.set(x,y+1.95,z);scene.add(s)}
function addTextPlane(text,x,y,z,w,h){const c=document.createElement("canvas");c.width=512;c.height=256;const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="700 38px Arial";text.split("\n").forEach((line,i)=>ctx.fillText(line,256,100+i*55));const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true}));m.position.set(x,y,z);scene.add(m)}

function findNode(root,names){let found=null;root.traverse(o=>{if(found)return;const n=(o.name||"").toLowerCase();if(names.some(k=>n.includes(k.toLowerCase())))found=o});return found}
function prepareCharacter(gltf,opts){
 const root=gltf.scene,b=new THREE.Box3().setFromObject(root),size=new THREE.Vector3();b.getSize(size);root.scale.setScalar(opts.height/Math.max(size.y,.001));
 const b2=new THREE.Box3().setFromObject(root);root.position.y-=b2.min.y;root.position.x=opts.x;root.position.z=opts.z;root.rotation.y=opts.rotationY;
 root.userData={...root.userData,role:opts.role,label:opts.label,baseY:opts.rotationY,home:new THREE.Vector3(opts.x,root.position.y,opts.z),phase:Math.random()*6};
 root.userData.rig={head:findNode(root,["head"]),jaw:findNode(root,["jaw"]),leftArm:findNode(root,["leftarm"]),rightArm:findNode(root,["rightarm"]),leftFore:findNode(root,["leftforearm"]),rightFore:findNode(root,["rightforearm"])};
 Object.values(root.userData.rig).filter(Boolean).forEach(n=>n.userData.baseRot=n.rotation.clone());root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(root);return root;
}
function resetRig(c){if(!c?.userData?.rig)return;Object.values(c.userData.rig).forEach(n=>{if(n?.userData?.baseRot)n.rotation.copy(n.userData.baseRot)});c.rotation.y=c.userData.baseY}
function animateCharacter(c,t){if(!c?.userData?.rig)return;resetRig(c);c.position.y=c.userData.home.y+Math.sin(t*1.5+c.userData.phase)*.012;const r=c.userData.rig;if(r.head)r.head.rotation.y+=Math.sin(t*.7+c.userData.phase)*.03;if(c===speaking&&r.jaw)r.jaw.rotation.x+=(.5+.5*Math.sin(t*14))*.045}
function gesture(type){if(!staff?.userData?.rig)return;const r=staff.userData.rig;resetRig(staff);if(type==="phone"){if(r.rightArm)r.rightArm.rotation.z+=.55;if(r.rightFore)r.rightFore.rotation.x-=1.1}else if(type==="screen"){if(r.leftArm)r.leftArm.rotation.z-=.35}else if(type==="point"){if(r.rightArm)r.rightArm.rotation.z+=.35}}
async function loadModels(){const loader=new GLTFLoader(),manifest=await fetch("./models/manifest.json").then(r=>r.json()),load=n=>new Promise((res,rej)=>loader.load("./models/"+n,res,undefined,rej));const [r,m,f]=await Promise.all([load(manifest.receptionist),load(manifest.guest_male),load(manifest.guest_female)]);staff=prepareCharacter(r,{height:1.72,x:-1.25,z:-2.18,rotationY:0,role:"staff",label:"Giulia Rossi"});guestMale=prepareCharacter(m,{height:1.82,x:.55,z:-.12,rotationY:Math.PI,role:"guest",label:"Mr. Taylor"});guestFemale=prepareCharacter(f,{height:1.70,x:1.45,z:.10,rotationY:Math.PI,role:"guest",label:"Mrs. Taylor"});speaking=staff}
function fallback(){const make=(x,z,c,role,rot)=>{const g=new THREE.Group();const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.55,8,16),mat(c)),head=new THREE.Mesh(new THREE.SphereGeometry(.16,20,16),mat(0xd7a17e));torso.position.y=1.25;head.position.y=1.82;g.add(torso,head);g.position.set(x,0,z);g.rotation.y=rot;g.userData={role,label:role,baseY:rot,home:new THREE.Vector3(x,0,z),phase:0,rig:null};scene.add(g);return g};staff=make(-1.25,-2.18,0x2d6668,"staff",0);guestMale=make(.55,-.12,0x536b84,"guest",Math.PI);guestFemale=make(1.45,.1,0x9a6f59,"guest",Math.PI);speaking=staff;UI.badge.textContent="Fallback 3D attivo"}

async function loadData(){simData=await fetch("./data/scenarios.json",{cache:"no-store"}).then(r=>r.json());const rd=await fetch("./data/resources.json",{cache:"no-store"}).then(r=>r.json());resources=rd.handouts||[];renderResourceList("");setStep(0)}
function setStep(i){stepIndex=i;currentStep=simData.steps[i];selected=null;dialogueIndex=0;priorityOrder=currentStep.priorities.map((p,j)=>({title:p[0],level:p[1],detail:p[2],id:j}));score={problem:0,communication:0,guest:0,priority:0};lastKpi=null;lastUdl={engagement:0,representation:0,action:0};renderStep();setDialogue(currentStep.dialogue[0]);speaking=staff;UI.overlay.classList.remove("hidden")}
function renderStep(){
 const totalSteps=simData.steps.length;UI.stepPill.textContent=`Scenario ${stepIndex+1}/${totalSteps}`;UI.stepNumber.textContent=`Scenario ${stepIndex+1} di ${totalSteps}`;UI.progress.textContent=`${Math.round((stepIndex+1)/totalSteps*100)}%`;
 UI.title.textContent=currentStep.title;UI.situation.textContent=currentStep.situation;UI.subtitle.textContent=currentStep.situation;UI.time.textContent=String(currentStep.time).padStart(2,"0")+":00";UI.status.textContent=currentStep.status;UI.detail.textContent=currentStep.detail;
 UI.choices.innerHTML=currentStep.choices.map(c=>`<button class="choice" data-id="${c.id}"><span class="choice-code">${c.id.slice(-1).toUpperCase()}</span><span><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.detail)}</small></span></button>`).join("");
 UI.choices.querySelectorAll(".choice").forEach(b=>b.addEventListener("click",()=>selectChoice(b.dataset.id)));
 UI.feedback.className="feedback";UI.feedback.innerHTML="<span class='feedback-label'>Feedback della simulazione</span><p>Valuta le alternative e seleziona l'azione che adotteresti.</p>";
 UI.nextScenario.disabled=true;UI.nextScenario.textContent=stepIndex===simData.steps.length-1?"Concludi simulazione":"Scenario successivo";updateScores();renderKPI();renderUDL();renderPriorities();
}
function selectChoice(id){
 const c=currentStep.choices.find(x=>x.id===id);selected=c;score={...c.scores};lastKpi=c.kpi;lastUdl=c.udl;
 UI.choices.querySelectorAll(".choice").forEach(b=>{b.disabled=true;b.classList.toggle("selected",b.dataset.id===id)});
 UI.feedback.className="feedback "+(((score.problem+score.communication+score.guest+score.priority)/4)>=75?"good":"warn");
 UI.feedback.innerHTML=`<span class="feedback-label">Feedback della simulazione</span><p>${escapeHtml(c.feedback)}</p>`;
 setDialogue(["GR","Giulia Rossi · Guest Relations",c.nextLine]);speaking=staff;gesture(c.id.endsWith("b")?"screen":c.id.endsWith("a")?"phone":"point");speak(c.nextLine);updateScores();renderKPI();renderUDL();UI.nextScenario.disabled=false;UI.overlay.classList.remove("hidden");
}
function updateScores(){const total=Math.round((score.problem+score.communication+score.guest+score.priority)/4);UI.scoreTotal.textContent=`${total} / 100`;const vals=[["Problem",score.problem],["Comm",score.communication],["Guest",score.guest],["Priority",score.priority]];for(const [k,v] of vals){UI["score"+k].textContent=v;UI["bar"+k].style.width=v+"%"}}
function setDialogue(d){UI.overlayAvatar.textContent=d[0];UI.overlaySpeaker.textContent=d[2];UI.overlayRole.textContent=d[1];UI.overlayText.textContent=d[3]||d[2]}
function nextDialogue(){dialogueIndex=(dialogueIndex+1)%currentStep.dialogue.length;const d=currentStep.dialogue[dialogueIndex];UI.overlayAvatar.textContent=d[0];UI.overlaySpeaker.textContent=d[1];UI.overlayRole.textContent=d[0]==="GR"?"Guest Relations":"Ospite";UI.overlayText.textContent=d[2];speaking=d[0]==="GR"?staff:(dialogueIndex%2?guestMale:guestFemale)}
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="it-IT";u.rate=.95;speechSynthesis.speak(u)}catch{}}

function openHub(tab){UI.dialog.showModal();switchTab(tab)}
function switchTab(tab){UI.tabs.forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));UI.panels.forEach(p=>p.classList.toggle("active",p.id==="tab-"+tab));UI.hubTitle.textContent={handouts:"Dispense",udl:"Analisi UDL",kpi:"Analisi KPI",priorities:"Gestione delle priorità"}[tab]}
function renderResourceList(q){const x=(q||"").toLowerCase(),list=resources.filter(r=>!x||(`${r.title} ${r.category} ${r.summary} ${r.body.join(" ")}`).toLowerCase().includes(x));UI.resourceList.innerHTML=list.map(r=>`<button class="resource-card" data-id="${r.id}"><span>${escapeHtml(r.category)}</span><strong>${escapeHtml(r.title)}</strong><p>${escapeHtml(r.summary)}</p></button>`).join("");UI.resourceList.querySelectorAll(".resource-card").forEach(b=>b.addEventListener("click",()=>showResource(b.dataset.id)))}
function showResource(id){const r=resources.find(x=>x.id===id);if(!r)return;UI.resourceList.querySelectorAll(".resource-card").forEach(b=>b.classList.toggle("active",b.dataset.id===id));UI.resourceDetail.className="resource-detail";UI.resourceDetail.innerHTML=`<span class="eyebrow">${escapeHtml(r.category)}</span><h4>${escapeHtml(r.title)}</h4><p>${escapeHtml(r.summary)}</p><ul>${r.body.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul><div class="resource-tip"><strong>Da ricordare</strong><br>${escapeHtml(r.tip)}</div>`}
function renderUDL(){
 const cards=[
   ["◎","Coinvolgimento","Motivazione, scelta, obiettivi e feedback",lastUdl.engagement],
   ["◫","Rappresentazione","Scena 3D, testo, dialogo, KPI e dispense",lastUdl.representation],
   ["↗","Azione ed espressione","Decisioni, priorità, replay e percorsi alternativi",lastUdl.action]
 ];
 UI.udlGrid.innerHTML=cards.map(c=>`<div class="udl-card"><div class="udl-icon">${c[0]}</div><h4>${c[1]}</h4><p>${c[2]}</p><div class="udl-score">${c[3]}%</div><div class="udl-meter"><i style="width:${c[3]}%"></i></div></div>`).join("");
 const avg=Math.round((lastUdl.engagement+lastUdl.representation+lastUdl.action)/3);
 UI.udlRecommendation.innerHTML=selected?`<strong>Analisi adattiva:</strong> indice UDL della decisione <strong>${avg}%</strong>. ${avg>=85?"La scelta sostiene autonomia, comprensione e azione con più canali informativi.":avg>=60?"La scelta è accessibile in parte, ma può essere migliorata rendendo più espliciti alternative e feedback.":"La decisione limita scelta, chiarezza o possibilità di azione dell’utente."}`:`<strong>Prima della decisione:</strong> consulta le dispense, ascolta il dialogo o analizza le priorità. ITSphere offre canali diversi per comprendere lo stesso problema.`;
}
function renderKPI(){const k=lastKpi||{resolution:"—",satisfaction:"—",risk:"—",cost:"—"};UI.kpiGrid.innerHTML=[["Tempo di risoluzione",k.resolution,"Rapidità operativa"],["Soddisfazione ospite",k.satisfaction,"Impatto stimato"],["Rischio escalation",k.risk,"Rischio reputazionale"],["Costo soluzione",k.cost,"Impatto economico"]].map(x=>`<div class="kpi-card"><span>${x[0]}</span><strong>${escapeHtml(x[1])}</strong><small>${x[2]}</small></div>`).join("");UI.kpiInsight.textContent=selected?`La decisione ${selected.id.slice(-1).toUpperCase()} produce un equilibrio specifico tra rapidità, customer experience, rischio e costo.`:"Seleziona una decisione per visualizzare l’impatto sui KPI."}
function renderPriorities(){UI.priorityList.innerHTML=priorityOrder.map((p,i)=>`<div class="priority-item"><div class="priority-rank">${i+1}</div><div class="priority-copy"><strong>${escapeHtml(p.title)}</strong><small>${escapeHtml(p.detail)}</small><span class="priority-tag ${p.level}">${p.level.toUpperCase()}</span></div><div class="priority-actions"><button data-up="${p.id}">↑</button><button data-down="${p.id}">↓</button></div></div>`).join("");UI.priorityList.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>movePriority(+b.dataset.up,-1));UI.priorityList.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>movePriority(+b.dataset.down,1))}
function movePriority(id,d){const i=priorityOrder.findIndex(x=>x.id===id),j=i+d;if(i<0||j<0||j>=priorityOrder.length)return;[priorityOrder[i],priorityOrder[j]]=[priorityOrder[j],priorityOrder[i]];renderPriorities()}

function bind(){
 UI.cameras.forEach(b=>b.onclick=()=>{UI.cameras.forEach(x=>x.classList.remove("active"));b.classList.add("active");const v=cameraViews[b.dataset.camera];targetCamera={pos:v.pos.clone(),look:v.look.clone()};yaw=0;pitch=0;zoom=1});
 UI.canvas.onpointerdown=e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;UI.canvas.setPointerCapture(e.pointerId)};UI.canvas.onpointermove=e=>{if(!dragging)return;yaw+=(e.clientX-lastX)*.006;pitch+=(e.clientY-lastY)*.004;pitch=Math.max(-.55,Math.min(.55,pitch));lastX=e.clientX;lastY=e.clientY};UI.canvas.onpointerup=()=>dragging=false;UI.canvas.onwheel=e=>{e.preventDefault();zoom=Math.max(.68,Math.min(1.45,zoom+e.deltaY*.0007))};
 UI.showDialogue.onclick=()=>UI.overlay.classList.remove("hidden");UI.hideOverlay.onclick=()=>UI.overlay.classList.add("hidden");UI.nextDialogue.onclick=nextDialogue;UI.replayOverlay.onclick=()=>speak(UI.overlayText.textContent);
 UI.openHandouts.onclick=()=>openHub("handouts");UI.openUDL.onclick=()=>openHub("udl");UI.openKPI.onclick=()=>openHub("kpi");UI.openPriorities.onclick=()=>openHub("priorities");UI.closeHub.onclick=()=>UI.dialog.close();UI.tabs.forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));UI.search.oninput=()=>renderResourceList(UI.search.value);
 UI.nextScenario.onclick=()=>{if(stepIndex<simData.steps.length-1)setStep(stepIndex+1);else{UI.feedback.className="feedback good";UI.feedback.innerHTML="<span class='feedback-label'>Simulazione completata</span><p>Hai completato i tre scenari. Consulta KPI, UDL e priorità per la debrief finale.</p>";UI.nextScenario.disabled=true}};
 UI.reset.onclick=()=>setStep(0);addEventListener("resize",resize);
}
function resize(){const r=UI.canvas.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
function updateCamera(){const base=targetCamera.pos.clone().multiplyScalar(zoom),dir=base.clone().sub(targetCamera.look),s=new THREE.Spherical().setFromVector3(dir);s.theta+=yaw;s.phi=Math.max(.3,Math.min(Math.PI-.3,s.phi+pitch));const d=new THREE.Vector3().setFromSpherical(s).add(targetCamera.look);camera.position.lerp(d,.08);currentLook.lerp(targetCamera.look,.08);camera.lookAt(currentLook)}
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();updateCamera();animateCharacter(staff,t);animateCharacter(guestMale,t);animateCharacter(guestFemale,t);renderer.render(scene,camera)}
async function init(){scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.copy(targetCamera.pos);renderer=new THREE.WebGLRenderer({canvas:UI.canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();scene.add(new THREE.HemisphereLight(0xfff9ef,0x6f7d82,1.65));const sun=new THREE.DirectionalLight(0xfff0d8,2.25);sun.position.set(6,9,6);sun.castShadow=true;scene.add(sun);buildLobby();bind();resize();await loadData();try{await loadModels();UI.badge.textContent="Personaggi 3D locali · caricati"}catch(e){console.error(e);fallback()}UI.loading.style.display="none";animate()}
try{await init()}catch(err){console.error(err);UI.loading.innerHTML=`<strong>Impossibile inizializzare il motore 3D.</strong><span>${escapeHtml(err?.message||String(err))}</span>`}
