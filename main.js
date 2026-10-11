import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const UI={
  canvas:document.querySelector("#scene"),
  loading:document.querySelector("#sceneLoading"),
  badge:document.querySelector("#characterBadge"),
  dialogue:document.querySelector("#dialogueText"),
  speaker:document.querySelector("#speakerRole"),
  avatar:document.querySelector("#speakerAvatar"),
  feedback:document.querySelector("#feedback"),
  choices:[...document.querySelectorAll(".choice")],
  cameras:[...document.querySelectorAll(".camera-btn")],
  reset:document.querySelector("#resetBtn"),
  resources:document.querySelector("#resourcesBtn"),
  replay:document.querySelector("#replayBtn"),
  skip:document.querySelector("#skipBtn"),
  dialog:document.querySelector("#resourceDialog"),
  closeResources:document.querySelector("#closeResources"),
  resourceSearch:document.querySelector("#resourceSearch"),
  resourceList:document.querySelector("#resourceList"),
  scoreTotal:document.querySelector("#scoreTotal"),
  scoreProblem:document.querySelector("#scoreProblem"),
  scoreComm:document.querySelector("#scoreComm"),
  scoreGuest:document.querySelector("#scoreGuest"),
  barProblem:document.querySelector("#barProblem"),
  barComm:document.querySelector("#barComm"),
  barGuest:document.querySelector("#barGuest")
};

let scene,camera,renderer,raycaster,pointer;
let staff,guestMale,guestFemale;
let targetCamera={pos:new THREE.Vector3(8.7,6.2,10.6),look:new THREE.Vector3(0,1,-.65)};
let currentLook=targetCamera.look.clone();
let yaw=0,pitch=0,zoom=1,dragging=false,lastX=0,lastY=0;
let speaking=null;
let resources=[];
let scores={problem:0,comm:0,guest:0};
let selected=null;
const clock=new THREE.Clock();

const cameraViews={
  overview:{pos:new THREE.Vector3(8.7,6.2,10.6),look:new THREE.Vector3(0,1,-.65)},
  desk:{pos:new THREE.Vector3(3.7,3.4,5.7),look:new THREE.Vector3(-.4,1.15,-1.1)},
  guests:{pos:new THREE.Vector3(-3.8,2.7,3.8),look:new THREE.Vector3(.6,1.1,-.45)},
  lounge:{pos:new THREE.Vector3(7.2,3.2,1.0),look:new THREE.Vector3(3.5,.9,1.4)}
};

const decisionData={
  A:{
    delta:{problem:34,comm:24,guest:30},
    className:"good",
    text:"Buona scelta. Hai cercato una soluzione concreta prima di trasferire ulteriore stress agli ospiti. Ora comunica tempi, costo e piano alternativo.",
    line:"Ho trovato un NCC disponibile. Vi confermo il nuovo orario e mi occupo personalmente del coordinamento."
  },
  B:{
    delta:{problem:18,comm:32,guest:25},
    className:"good",
    text:"Comunicazione efficace, ma serve trasformare rapidamente l'informazione in una soluzione operativa. Mantieni gli ospiti aggiornati con tempi precisi.",
    line:"Mi dispiace per il contrattempo. Vi chiedo cinque minuti: verifico subito una soluzione alternativa e torno da voi con un piano preciso."
  },
  C:{
    delta:{problem:15,comm:16,guest:14},
    className:"warn",
    text:"L'escalation può essere corretta, ma in questo caso rallenta una decisione che rientra nell'autonomia operativa del Guest Relations.",
    line:"Coinvolgo il responsabile per valutare la situazione. Vi aggiorno appena ricevo indicazioni."
  }
};

function mat(color,rough=.72,metal=.04){
  return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
}
function box(w,h,d,color,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
function cyl(r,h,color,x,y,z){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat(color));
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}

function buildLobby(){
  scene.background=new THREE.Color(0xe8eceb);
  scene.fog=new THREE.Fog(0xe8eceb,18,34);

  // floor / walls
  box(18,.2,13,0xe7e0d8,0,-.1,0);
  box(18,6,.25,0xf4f0eb,0,3,-5.7);
  box(.25,6,13,0xede9e4,-8.85,3,0);

  // reception desk
  box(6.8,1.05,1.0,0xb8946e,-1.0,.55,-1.45);
  box(6.2,.58,.84,0xd3b48f,-1.0,.89,-1.38);
  box(6.5,.12,1.08,0xf0e4d3,-1.0,1.18,-1.38);
  box(1.35,.56,.05,0xf5eee4,-2.75,.72,-.86);
  box(1.35,.56,.05,0xf5eee4,-.95,.72,-.86);
  box(1.35,.56,.05,0xf5eee4,.85,.72,-.86);

  // wall slats behind reception
  for(let i=0;i<12;i++) box(.09,2.3,.08,0xcaa77d,-3.2+i*.46,2.65,-5.46);
  box(2.55,.55,.18,0x2f6668,-1.0,3.68,-5.38);
  addTextPlane("RECEPTION", -1.0,3.69,-5.26,1.9,.38);

  // workstations
  box(.52,.32,.05,0x1f3038,-2.55,1.55,-1.92); box(.52,.32,.05,0x1f3038,.15,1.55,-1.92);
  box(.6,.07,.28,0x2c363a,-2.55,1.33,-1.75); box(.6,.07,.28,0x2c363a,.15,1.33,-1.75);

  // cancellation board
  box(2.1,1.5,.12,0x274951,-5.9,2.25,-3.2);
  addTextPlane("TRANSFER STATUS\nCANCELLED", -5.9,2.35,-3.12,1.55,.75);

  // lounge rug / sofas
  box(5.0,.05,3.3,0xf2eee6,4.35,.03,1.5);
  sofa(4.15,.55,.9); sofa(5.65,.55,.25);
  box(2.0,.16,1.0,0xcda77b,4.7,.32,2.15);

  // windows
  for(let i=0;i<4;i++){
    const frame=box(.08,3.0,.08,0x5c6b70,3.0+i*1.65,2.7,-5.42);
  }
  // glass
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.0),new THREE.MeshPhysicalMaterial({
    color:0xd9e7eb,transparent:true,opacity:.34,roughness:.15,transmission:.1
  }));
  glass.position.set(5.25,2.7,-5.5);scene.add(glass);

  // plants / lamps
  plant(-6.1,-.1,-2.6); plant(7.2,-.05,2.6); plant(3.7,.05,-4.8);
  floorLamp(6.8,.0,.9);

  // bell
  cyl(.13,.08,0x4a5152,-.45,1.28,-.95);
}

function sofa(x,z,rot=0){
  const g=new THREE.Group();
  const seat=new THREE.Mesh(new THREE.BoxGeometry(2.0,.42,.85),mat(0xa9c3bc));
  seat.position.y=.48;g.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(2.0,.68,.22),mat(0xa9c3bc));
  back.position.set(0,.82,-.33);g.add(back);
  const armGeo=new THREE.BoxGeometry(.22,.62,.84);
  const a1=new THREE.Mesh(armGeo,mat(0x9eb9b2));a1.position.set(-.92,.65,0);g.add(a1);
  const a2=a1.clone();a2.position.x=.92;g.add(a2);
  g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
}
function plant(x,y,z){
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.3,.38,.55,22),mat(0xb38b64));pot.position.set(x,y+.28,z);scene.add(pot);
  for(let i=0;i<7;i++){
    const leaf=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),mat(0x6f9a75));
    leaf.scale.set(.65,1.5,.55);leaf.rotation.z=(i-3)*.18;leaf.position.set(x+(i-3)*.08,y+.78+Math.abs(i-3)*.04,z);scene.add(leaf);
  }
}
function floorLamp(x,y,z){
  box(.08,1.85,.08,0x9b744d,x,y+.93,z);
  const shade=new THREE.Mesh(new THREE.CylinderGeometry(.34,.48,.52,28),mat(0xf2eadf));
  shade.position.set(x,y+1.95,z);scene.add(shade);
}
function addTextPlane(text,x,y,z,w,h){
  const c=document.createElement("canvas");c.width=512;c.height=256;
  const ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle="#ffffff";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.font="700 38px Arial";
  const lines=text.split("\n");
  lines.forEach((line,i)=>ctx.fillText(line,256,100+i*55));
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true}));
  mesh.position.set(x,y,z);scene.add(mesh);
}

function findNode(root,names){
  let found=null;
  root.traverse(o=>{
    if(found)return;
    const n=(o.name||"").toLowerCase();
    if(names.some(k=>n.includes(k.toLowerCase()))) found=o;
  });
  return found;
}
function prepareCharacter(gltf,opts){
  const root=gltf.scene;
  const box3=new THREE.Box3().setFromObject(root);
  const size=new THREE.Vector3();box3.getSize(size);
  const scale=opts.height/Math.max(size.y,.001);
  root.scale.setScalar(scale);

  const b2=new THREE.Box3().setFromObject(root);
  root.position.y-=b2.min.y;
  root.position.x=opts.x;
  root.position.z=opts.z;
  root.rotation.y=opts.rotationY||0;

  root.userData.role=opts.role;
  root.userData.label=opts.label;
  root.userData.baseY=root.rotation.y;
  root.userData.home=new THREE.Vector3(opts.x,root.position.y,opts.z);
  root.userData.phase=Math.random()*Math.PI*2;
  root.userData.rig={
    head:findNode(root,["head"]),
    jaw:findNode(root,["jaw"]),
    leftArm:findNode(root,["leftarm"]),
    rightArm:findNode(root,["rightarm"]),
    leftFore:findNode(root,["leftforearm"]),
    rightFore:findNode(root,["rightforearm"]),
    leftUp:findNode(root,["leftupleg"]),
    rightUp:findNode(root,["rightupleg"]),
    leftLeg:findNode(root,["leftleg"]),
    rightLeg:findNode(root,["rightleg"])
  };
  Object.values(root.userData.rig).filter(Boolean).forEach(n=>{
    n.userData.baseRot=n.rotation.clone();
  });

  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  scene.add(root);
  return root;
}
function resetNode(node){
  if(node?.userData?.baseRot)node.rotation.copy(node.userData.baseRot);
}
function resetRig(c){
  if(!c?.userData?.rig)return;
  Object.values(c.userData.rig).forEach(resetNode);
  c.rotation.y=c.userData.baseY||0;
}
function animateCharacter(c,t){
  if(!c?.userData?.rig)return;
  const r=c.userData.rig;
  resetRig(c);
  const breathe=Math.sin(t*1.6+c.userData.phase)*.018;
  c.position.y=c.userData.home.y+breathe;
  if(r.head && r.head.userData.baseRot){
    r.head.rotation.y+=Math.sin(t*.75+c.userData.phase)*.035;
  }
  if(c===speaking){
    const p=.5+.5*Math.sin(t*14);
    if(r.jaw && r.jaw.userData.baseRot)r.jaw.rotation.x+=p*.05;
    if(r.rightFore && r.rightFore.userData.baseRot)r.rightFore.rotation.x-=.12*p;
  }
}
function gesture(type){
  if(!staff?.userData?.rig)return;
  const r=staff.userData.rig;
  resetRig(staff);
  if(type==="explain"){
    if(r.leftArm)r.leftArm.rotation.z-=.48;
    if(r.leftFore)r.leftFore.rotation.z-=.35;
    if(r.rightArm)r.rightArm.rotation.z+=.35;
  }
  if(type==="phone"){
    if(r.rightArm)r.rightArm.rotation.z+=.55;
    if(r.rightFore)r.rightFore.rotation.x-=1.15;
  }
  if(type==="reassure"){
    if(r.leftArm)r.leftArm.rotation.z-=.3;
    if(r.rightArm)r.rightArm.rotation.z+=.3;
  }
}

async function loadModels(){
  const loader=new GLTFLoader();
  const manifest=await fetch("./models/manifest.json",{cache:"no-store"}).then(r=>{
    if(!r.ok)throw new Error("manifest.json non trovato");
    return r.json();
  });
  const load=(name)=>new Promise((resolve,reject)=>loader.load(`./models/${name}`,resolve,undefined,reject));
  const [r,m,f]=await Promise.all([
    load(manifest.receptionist),
    load(manifest.guest_male),
    load(manifest.guest_female)
  ]);

  staff=prepareCharacter(r,{height:1.72,x:-1.25,z:-2.18,rotationY:0,role:"staff",label:"Giulia Rossi"});
  guestMale=prepareCharacter(m,{height:1.82,x:.55,z:-.12,rotationY:Math.PI,role:"guest",label:"Mr. Taylor"});
  guestFemale=prepareCharacter(f,{height:1.70,x:1.45,z:.10,rotationY:Math.PI,role:"guest",label:"Mrs. Taylor"});
  speaking=staff;
}

function createFallbackHuman(x,z,color,role,rot){
  const g=new THREE.Group();
  const skin=mat(0xd7a17e);
  const jacket=mat(color);
  const pants=mat(0x31383e);

  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.23,.55,8,16),jacket);torso.position.y=1.27;g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.16,24,18),skin);head.scale.y=1.1;head.position.y=1.83;g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.165,20,14,0,Math.PI*2,0,Math.PI*.55),mat(0x342820));hair.position.y=1.89;g.add(hair);
  for(const s of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.48,6,12),jacket);arm.position.set(s*.31,1.26,0);g.add(arm);
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.58,6,12),pants);leg.position.set(s*.11,.55,0);g.add(leg);
  }
  g.position.set(x,0,z);g.rotation.y=rot;g.userData={role,baseY:rot,home:new THREE.Vector3(x,0,z),phase:Math.random()*6,rig:null};scene.add(g);return g;
}

function setupFallback(){
  if(staff||guestMale||guestFemale)return;
  staff=createFallbackHuman(-1.25,-2.18,0x2d6668,"staff",0);
  guestMale=createFallbackHuman(.55,-.12,0x536b84,"guest",Math.PI);
  guestFemale=createFallbackHuman(1.45,.10,0x9a6f59,"guest",Math.PI);
  speaking=staff;
  UI.badge.textContent="Personaggi 3D base";
}

function bind(){
  UI.cameras.forEach(btn=>btn.addEventListener("click",()=>{
    UI.cameras.forEach(b=>b.classList.remove("active"));btn.classList.add("active");
    const v=cameraViews[btn.dataset.camera];targetCamera={pos:v.pos.clone(),look:v.look.clone()};yaw=0;pitch=0;zoom=1;
  }));
  UI.choices.forEach(btn=>btn.addEventListener("click",()=>selectChoice(btn.dataset.choice)));
  UI.reset.addEventListener("click",resetSimulation);
  UI.replay.addEventListener("click",()=>speak(UI.dialogue.textContent));
  UI.skip.addEventListener("click",()=>speechSynthesis?.cancel?.());
  UI.resources.addEventListener("click",()=>UI.dialog.showModal());
  UI.closeResources.addEventListener("click",()=>UI.dialog.close());
  UI.resourceSearch.addEventListener("input",()=>renderResources(UI.resourceSearch.value));

  UI.canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;UI.canvas.setPointerCapture(e.pointerId)});
  UI.canvas.addEventListener("pointermove",e=>{
    if(!dragging)return;
    yaw+=(e.clientX-lastX)*.006; pitch+=(e.clientY-lastY)*.004;
    pitch=Math.max(-.55,Math.min(.55,pitch)); lastX=e.clientX;lastY=e.clientY;
  });
  UI.canvas.addEventListener("pointerup",()=>dragging=false);
  UI.canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.68,Math.min(1.45,zoom+e.deltaY*.0007))},{passive:false});
  UI.canvas.addEventListener("click",pickCharacter);
  addEventListener("resize",resize);
}

function pickCharacter(e){
  if(!raycaster)return;
  const rect=UI.canvas.getBoundingClientRect();
  pointer.x=((e.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects([staff,guestMale,guestFemale].filter(Boolean),true);
  if(!hits.length)return;
  let o=hits[0].object;
  while(o.parent && !o.userData?.role)o=o.parent;
  if(o.userData?.role==="staff"){
    setDialogue("Guest Relations · Giulia Rossi","Sto verificando la soluzione più rapida e sostenibile per gli ospiti.","GR");
    speaking=staff;gesture("explain");
  }else{
    setDialogue("Ospiti · Famiglia Taylor","Abbiamo bisogno di sapere se riusciremo ad arrivare in tempo.","GT");
    speaking=o;gesture("reassure");
  }
}

function selectChoice(key){
  selected=key;
  UI.choices.forEach(b=>{b.classList.toggle("selected",b.dataset.choice===key);b.disabled=true});
  const d=decisionData[key];
  scores.problem=d.delta.problem;scores.comm=d.delta.comm;scores.guest=d.delta.guest;
  updateScores();
  UI.feedback.className=`feedback ${d.className}`;
  UI.feedback.innerHTML=`<span class="feedback-label">Feedback della simulazione</span><p>${d.text}</p>`;
  setDialogue("Guest Relations · Giulia Rossi",d.line,"GR");
  speaking=staff;
  if(key==="A")gesture("phone");
  else if(key==="B")gesture("explain");
  else gesture("reassure");
  speak(d.line);
}

function updateScores(){
  const total=Math.round((scores.problem+scores.comm+scores.guest)/3);
  UI.scoreTotal.textContent=`${total} / 100`;
  UI.scoreProblem.textContent=scores.problem;UI.scoreComm.textContent=scores.comm;UI.scoreGuest.textContent=scores.guest;
  UI.barProblem.style.width=`${scores.problem}%`;UI.barComm.style.width=`${scores.comm}%`;UI.barGuest.style.width=`${scores.guest}%`;
}
function resetSimulation(){
  selected=null;scores={problem:0,comm:0,guest:0};updateScores();
  UI.choices.forEach(b=>{b.disabled=false;b.classList.remove("selected")});
  UI.feedback.className="feedback";
  UI.feedback.innerHTML="<span class='feedback-label'>Feedback della simulazione</span><p>Scegli un'azione. La scena reagirà alla tua decisione e aggiornerà le competenze osservate.</p>";
  setDialogue("Guest Relations · Giulia Rossi","Il transfer è stato cancellato. Dobbiamo trovare una soluzione senza aumentare lo stress degli ospiti.","GR");
  speaking=staff;resetRig(staff);resetRig(guestMale);resetRig(guestFemale);
}
function setDialogue(role,text,avatar){
  UI.speaker.textContent=role;UI.dialogue.textContent=text;UI.avatar.textContent=avatar;
}
function speak(text){
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);u.lang="it-IT";u.rate=.95;speechSynthesis.speak(u);
  }catch(e){}
}

async function loadResources(){
  try{
    const r=await fetch("./data/resources.json",{cache:"no-store"});const data=await r.json();
    resources=data.resources||[];renderResources("");
  }catch(e){
    UI.resourceList.innerHTML="<div class='resource-item'><strong>Risorse non disponibili</strong><p>Verifica data/resources.json.</p></div>";
  }
}
function renderResources(q){
  const query=(q||"").toLowerCase().trim();
  const list=resources.filter(r=>!query||`${r.title} ${r.category} ${r.description}`.toLowerCase().includes(query));
  UI.resourceList.innerHTML=list.map(r=>`<div class="resource-item"><span>${escapeHtml(r.category)}</span><strong>${escapeHtml(r.title)}</strong><p>${escapeHtml(r.description)}</p></div>`).join("")||"<div class='resource-item'><strong>Nessun risultato</strong></div>";
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function resize(){
  const r=UI.canvas.getBoundingClientRect();
  const w=Math.max(1,Math.floor(r.width)),h=Math.max(1,Math.floor(r.height));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}

function updateCamera(){
  const base=targetCamera.pos.clone().multiplyScalar(zoom);
  const dir=base.clone().sub(targetCamera.look);
  const spherical=new THREE.Spherical().setFromVector3(dir);
  spherical.theta+=yaw;spherical.phi=Math.max(.3,Math.min(Math.PI-.3,spherical.phi+pitch));
  const desired=new THREE.Vector3().setFromSpherical(spherical).add(targetCamera.look);
  camera.position.lerp(desired,.08);
  currentLook.lerp(targetCamera.look,.08);
  camera.lookAt(currentLook);
}

function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  updateCamera();
  animateCharacter(staff,t);animateCharacter(guestMale,t);animateCharacter(guestFemale,t);
  renderer.render(scene,camera);
}

async function init(){
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(45,1,.1,100);
  camera.position.copy(targetCamera.pos);

  renderer=new THREE.WebGLRenderer({canvas:UI.canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;

  raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();

  scene.add(new THREE.HemisphereLight(0xfff9ef,0x6f7d82,1.65));
  const sun=new THREE.DirectionalLight(0xfff0d8,2.25);sun.position.set(6,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  const warm=new THREE.PointLight(0xffd4a5,18,10,2);warm.position.set(-1.3,3.2,-.4);scene.add(warm);
  const lounge=new THREE.PointLight(0xffe4bf,11,8,2);lounge.position.set(4.5,2.8,1.4);scene.add(lounge);

  buildLobby();
  bind();
  resize();
  loadResources();

  try{
    await loadModels();
    UI.badge.textContent="Personaggi 3D locali · caricati";
  }catch(err){
    console.error("GLB load error",err);
    setupFallback();
    UI.badge.textContent="Fallback 3D attivo";
  }

  UI.loading.style.display="none";
  animate();
}

try{
  await init();
}catch(err){
  console.error("ITSphere init error",err);
  UI.loading.innerHTML=`<strong>Impossibile inizializzare il motore 3D.</strong><span>${escapeHtml(err?.message||String(err))}</span>`;
}
