import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/+esm";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js/+esm";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js/+esm";
import * as SkeletonUtils from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/utils/SkeletonUtils.js/+esm";

const $ = (s) => document.querySelector(s);

const UI = {
  canvas: $("#threeCanvas"), wrap: $("#sceneWrap"), loading: $("#loading"),
  choices: $("#choices"), situation: $("#situationText"), step: $("#stepChip"),
  supportBtn: $("#supportBtn"), supportBox: $("#supportBox"),
  voiceToggleBtn: $("#voiceToggleBtn"), resourcesBtn: $("#resourcesBtn"),
  continueBtn: $("#continueBtn"), feedbackCard: $("#feedbackCard"),
  feedbackTitle: $("#feedbackTitle"), feedbackText: $("#feedbackText"), feedbackWhy: $("#feedbackWhy"),
  actionOverlay: $("#actionOverlay"), actionText: $("#actionText"),
  dialogueOverlay: $("#dialogueOverlay"), dialogueAvatar: $("#dialogueAvatar"),
  dialogueRole: $("#dialogueRole"), dialogueName: $("#dialogueName"), dialogueText: $("#dialogueText"),
  dialogueLog: $("#dialogueLog"), dialogueState: $("#dialogueState"),
  replayVoiceBtn: $("#replayVoiceBtn"), skipDialogueBtn: $("#skipDialogueBtn"),
  timer: $("#timerDisplay"), transferStatus: $("#transferStatus"), transferDetail: $("#transferDetail"),
  objectHint: $("#objectHint"), total: $("#totalScore"),
  problemValue: $("#problemValue"), communicationValue: $("#communicationValue"),
  priorityValue: $("#priorityValue"), adaptabilityValue: $("#adaptabilityValue"),
  problemBar: $("#problemBar"), communicationBar: $("#communicationBar"),
  priorityBar: $("#priorityBar"), adaptabilityBar: $("#adaptabilityBar"),
  decisionTime: $("#decisionTime"), helpRequests: $("#helpRequests"),
  decisionCount: $("#decisionCount"), resourceCount: $("#resourceCount"),
  reset: $("#resetBtn"), cameraButtons: [...document.querySelectorAll(".camera-btn")],
  rotateLeft: $("#rotateLeft"), rotateRight: $("#rotateRight"), zoomIn: $("#zoomIn"), zoomOut: $("#zoomOut"),
  resourcesModal: $("#resourcesModal"), resourcesBackdrop: $("#resourcesBackdrop"),
  closeResourcesBtn: $("#closeResourcesBtn"), resourceSearch: $("#resourceSearch"),
  resourceList: $("#resourceList"), resourceContent: $("#resourceContent"),
  characterModeBadge: $("#characterModeBadge")
};

const scenario = [
  {
    situation:"Sono le 17:45. Fuori piove intensamente. Una coppia di ospiti deve raggiungere una cena prenotata fuori città. Il transfer organizzato dall'hotel comunica improvvisamente che non potrà effettuare il servizio.",
    resource:"service-recovery",
    choices:[
      {id:"s1a",label:"Comunico la cancellazione e suggerisco agli ospiti di cercare autonomamente un taxi.",action:"Informi gli ospiti della cancellazione e trasferisci su di loro la ricerca di un'alternativa.",scores:{problem:1,communication:1,priority:1,adaptability:0},loss:2,status:["CANCELLED","Nessuna alternativa attiva"],feedback:["L'ospite percepisce scarso presidio del problema.","La comunicazione è chiara, ma il servizio viene interrotto nel momento in cui l'ospite ha più bisogno di supporto.","La struttura deve accompagnare l'ospite verso una soluzione praticabile."],sequence:[
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Mi dispiace, il transfer è stato cancellato. Potete provare a cercare un taxi tramite il vostro telefono.",anim:"point"},
        {actor:"guestA",avatar:"MT",role:"Ospite",name:"Mr. Taylor",text:"Devo occuparmene io? Il servizio era stato organizzato dall'hotel.",anim:"upset"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Capisco. Se non trovate nulla, posso provare ad aiutarvi più tardi.",anim:"neutral"}
      ]},
      {id:"s1b",label:"Mi scuso, verifico subito alternative affidabili e comunico tempi, costi e opzioni realistiche.",action:"Prendi in carico l'imprevisto, verifichi soluzioni alternative e mantieni gli ospiti informati.",scores:{problem:3,communication:3,priority:3,adaptability:3},loss:1,status:["SEARCHING","Verifica taxi e NCC…"],feedback:["L'ospite percepisce che l'hotel sta gestendo l'imprevisto.","Hai trasformato un disservizio in una gestione attiva dell'esperienza.","La gestione professionale dell'imprevisto richiede responsabilità, comunicazione e alternative rapide."],sequence:[
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Mi dispiace per l'inconveniente. Verifico subito due alternative disponibili e vi indico tempi e costi.",anim:"walk_phone"},
        {actor:"guestA",avatar:"MT",role:"Ospite",name:"Mr. Taylor",text:"Grazie. Dobbiamo arrivare entro le 19:00.",anim:"concerned"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Sto controllando ora. Vi aggiorno tra pochi istanti.",anim:"screen"}
      ]},
      {id:"s1c",label:"Aspetto alcuni minuti nella speranza che il fornitore originale trovi una soluzione.",action:"Decidi di attendere senza attivare subito un piano alternativo.",scores:{problem:0,communication:1,priority:0,adaptability:1},loss:6,status:["WAITING","Tempo perso: +6 min"],feedback:["L'incertezza aumenta mentre il tempo diminuisce.","L'attesa conserva una possibilità, ma non crea un piano B.","Quando il tempo è critico, serve almeno l'attivazione parallela di un'alternativa."],sequence:[
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Aspettiamo qualche minuto: il fornitore potrebbe ancora trovare una soluzione.",anim:"clock"},
        {actor:"guestB",avatar:"ST",role:"Ospite",name:"Mrs. Taylor",text:"Preferirei però sapere subito quali alternative abbiamo.",anim:"upset"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Capisco. Attendo ancora un momento e poi rivalutiamo.",anim:"neutral"}
      ]}
    ]
  },
  {
    situation:"Hai due possibilità: un taxi disponibile tra 10 minuti ma con tempo di percorrenza incerto, oppure un NCC disponibile tra 25 minuti a costo maggiore. La cena inizia tra 40 minuti.",
    resource:"concierge-transfer",
    choices:[
      {id:"s2a",label:"Prenoto subito il taxi perché arriva prima.",action:"Privilegi la rapidità e confermi il taxi senza confrontare con gli ospiti rischi e condizioni.",scores:{problem:2,communication:1,priority:3,adaptability:2},loss:3,status:["TAXI · 10 MIN","Percorrenza non garantita"],feedback:["La soluzione è rapida, ma poco condivisa.","Hai privilegiato il tempo di arrivo del mezzo senza rendere espliciti i rischi.","Una buona decisione considera velocità, affidabilità e trasparenza."],sequence:[
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Ho trovato un taxi tra 10 minuti. Lo prenoto subito per voi.",anim:"phone"},
        {actor:"guestA",avatar:"MT",role:"Ospite",name:"Mr. Taylor",text:"È sicuro che riusciremo ad arrivare in tempo?",anim:"concerned"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Non posso garantirlo, ma è l'opzione che arriva prima.",anim:"neutral"}
      ]},
      {id:"s2b",label:"Presento entrambe le alternative, spiego tempi e rischi e consiglio quella più coerente con l'orario.",action:"Confronti alternative, rischi e tempi e accompagni gli ospiti verso una decisione consapevole.",scores:{problem:3,communication:3,priority:3,adaptability:3},loss:2,status:["TAXI · 10 MIN","Consigliato per orario cena"],feedback:["Decisione trasparente e orientata all'obiettivo.","Hai mantenuto gli ospiti informati e li hai aiutati a scegliere in base al vincolo reale.","Il professionista rende leggibili le alternative e formula una raccomandazione motivata."],sequence:[
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Ho trovato due opzioni: taxi tra 10 minuti, oppure NCC tra 25 minuti. Considerando la cena alle 19:00, vi consiglio il taxi.",anim:"screen"},
        {actor:"guestB",avatar:"ST",role:"Ospite",name:"Mrs. Taylor",text:"Perfetto. Preferiamo arrivare con un po' di margine.",anim:"relaxed"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Procedo subito e vi confermo targa e orario di arrivo.",anim:"phone"}
      ]},
      {id:"s2c",label:"Prenoto l'NCC più costoso senza informare prima gli ospiti, perché lo considero più affidabile.",action:"Scegli autonomamente il servizio più affidabile, ma introduci un costo aggiuntivo senza condividerlo.",scores:{problem:2,communication:0,priority:2,adaptability:1},loss:4,status:["NCC · 25 MIN","Costo superiore"],feedback:["La soluzione è affidabile, ma manca trasparenza.","Hai scelto una soluzione valida senza coinvolgere gli ospiti sul costo.","La qualità della soluzione deve essere accompagnata da informazione chiara e consenso."],sequence:[
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Ho prenotato un NCC. Arriverà tra circa 25 minuti.",anim:"phone"},
        {actor:"guestA",avatar:"MT",role:"Ospite",name:"Mr. Taylor",text:"Va bene. Il costo è quello previsto inizialmente?",anim:"concerned"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"No, è superiore. Ho scelto comunque l'opzione più affidabile.",anim:"neutral"}
      ]}
    ]
  },
  {
    situation:"Mentre stai finalizzando il nuovo transfer, arriva un altro ospite al desk chiedendo assistenza urgente per un bagaglio smarrito. La coppia attende ancora la conferma definitiva.",
    resource:"priority-management",
    choices:[
      {id:"s3a",label:"Interrompo la prima gestione e passo immediatamente al nuovo ospite.",action:"Interrompi una gestione quasi conclusa per prendere in carico la nuova richiesta.",scores:{problem:1,communication:1,priority:0,adaptability:2},loss:3,status:["PENDING","Conferma non completata"],feedback:["La nuova urgenza viene gestita, ma la prima resta aperta.","Hai mostrato reattività, ma hai perso il controllo sulla priorità già prossima alla scadenza.","Gestire più richieste significa decidere quale task chiudere prima e comunicare l'attesa."],sequence:[
        {actor:"newGuest",avatar:"NG",role:"Guest",name:"Nuovo ospite",text:"Scusi, la compagnia ha perso il mio bagaglio e ho bisogno di aiuto subito.",anim:"walk_in"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Certo, mi occupo subito del suo caso.",anim:"turn"},
        {actor:"guestA",avatar:"MT",role:"Ospite in attesa",name:"Mr. Taylor",text:"Noi stiamo ancora aspettando la conferma del taxi.",anim:"upset"}
      ]},
      {id:"s3b",label:"Confermo prima il transfer, aggiorno la coppia e poi prendo in carico il secondo ospite.",action:"Chiudi il task più urgente, comunichi l'esito e subito dopo gestisci la nuova richiesta.",scores:{problem:3,communication:3,priority:3,adaptability:3},loss:1,status:["CONFIRMED","Taxi in arrivo · 9 min"],feedback:["Hai mantenuto il controllo delle priorità.","La coppia riceve una conferma definitiva e il nuovo ospite viene preso in carico subito dopo.","L'autonomia professionale emerge quando si gestiscono simultaneamente priorità e comunicazione."],sequence:[
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Confermo: il taxi è in arrivo tra 9 minuti. Vi invio anche la targa sul telefono.",anim:"screen"},
        {actor:"guestA",avatar:"MT",role:"Ospite",name:"Mr. Taylor",text:"Perfetto, grazie per aver risolto.",anim:"relaxed"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Ora mi occupo subito del bagaglio smarrito. Grazie per l'attesa.",anim:"turn"}
      ]},
      {id:"s3c",label:"Chiedo al secondo ospite di tornare più tardi senza spiegazioni.",action:"Proteggi la prima attività, ma rimandi la seconda richiesta senza contestualizzare l'attesa.",scores:{problem:1,communication:0,priority:2,adaptability:0},loss:1,status:["CONFIRMED","Taxi in arrivo · 9 min"],feedback:["La priorità viene rispettata, ma la comunicazione crea frizione.","Hai evitato di interrompere il task principale, ma il secondo ospite non riceve rassicurazione.","Gestire le priorità non significa ignorare chi deve attendere."],sequence:[
        {actor:"newGuest",avatar:"NG",role:"Guest",name:"Nuovo ospite",text:"Scusi, la compagnia ha perso il mio bagaglio.",anim:"walk_in"},
        {actor:"staff",avatar:"GR",role:"Guest Experience Agent",name:"Giulia Rossi",text:"Deve tornare più tardi.",anim:"neutral"},
        {actor:"newGuest",avatar:"NG",role:"Guest",name:"Nuovo ospite",text:"Non può almeno dirmi quanto dovrò aspettare?",anim:"upset"}
      ]}
    ]
  }
];

const state = {
  step:0, locked:false,
  scores:{problem:0,communication:0,priority:0,adaptability:0},
  helpRequests:0, decisionCount:0, remainingMinutes:40,
  stepStart:performance.now(), metrics:[], voice:true, resources:[], skip:false, lastLine:null
};

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let scene,camera,renderer,world,staff,guestA,guestB,newGuest,phone,monitor,board;
let desiredPos=new THREE.Vector3(9.5,5.4,10.5),desiredTarget=new THREE.Vector3(0,1.45,0),lookTarget=new THREE.Vector3(0,1.45,0),angle=.72,radius=12.2,drag=false,lastX=0,hovered=null,selected=null;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),interactive=[],clock=new THREE.Clock();
const views={overview:{p:[9.5,5.4,10.5],t:[0,1.45,0]},desk:{p:[4.8,3.25,5.8],t:[-1.7,1.25,-1.1]},lounge:{p:[7.2,3.35,6.7],t:[3.1,1,1.8]},concierge:{p:[-5.4,3.05,4.4],t:[-2.2,1.25,-1]}};

let resources=[],activeResource=null;
const gltfLoader=new GLTFLoader();
const PREMIUM_MODEL_URLS={
  receptionist:[
    "./models/harper.glb",
    "https://www.innerscene.com/api/library/locomotion-collection-harper-3d-person-animated-797e1e2a/download"
  ],
  guest:[
    "./models/jordan.glb",
    "https://www.innerscene.com/api/library/locomotion-collection-jordan-3d-person-animated-911f1584/download"
  ]
};
let premiumMode=false;
let speakingCharacter=null;
let speechPulse=0;


function mat(color,o={}){return new THREE.MeshStandardMaterial({color,roughness:o.roughness??.72,metalness:o.metalness??.03,transparent:o.transparent??false,opacity:o.opacity??1})}
function box(size,pos,color,o={}){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color,o));m.position.set(...pos);m.castShadow=o.cast??true;m.receiveShadow=o.receive??true;if(o.name)m.name=o.name;(o.parent||world).add(m);return m}
function cyl(rt,rb,h,pos,color,o={}){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,20),mat(color,o));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;(o.parent||world).add(m);return m}
function label(text,bg="#254d52",w=768,font=54){const c=document.createElement("canvas");c.width=w;c.height=160;const x=c.getContext("2d");x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle="#fff";x.font=`700 ${font}px sans-serif`;x.textAlign="center";x.textBaseline="middle";x.fillText(text,c.width/2,c.height/2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(3.35,.7),new THREE.MeshStandardMaterial({map:t,roughness:.6}))}
function plant(x,z,s=1){cyl(.2*s,.25*s,.4*s,[x,.2*s,z],0x8b6a4d,{roughness:.86});const lm=mat(0x556e57,{roughness:.92});for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.18*s,10,8),lm);l.scale.set(.7,1.7,.5);l.position.set(x+Math.sin(i*1.4)*.2*s,.56*s+i*.045*s,z+Math.cos(i*1.4)*.2*s);l.rotation.z=i%2?.28:-.28;l.castShadow=true;world.add(l)}}
function luggage(x,z,color){box([.38,.58,.24],[x,.29,z],color,{roughness:.78});box([.16,.05,.035],[x,.63,z],0x313739,{roughness:.35,metalness:.5})}
function sofa(x,z,color){box([1.7,.44,.72],[x,.45,z],color,{roughness:.95});box([1.7,.68,.18],[x,.75,z-.28],color,{roughness:.95});box([.18,.44,.72],[x-.77,.53,z],color,{roughness:.95});box([.18,.44,.72],[x+.77,.53,z],color,{roughness:.95})}



function loadGLBOnce(url){
  return new Promise((resolve,reject)=>gltfLoader.load(url,resolve,undefined,reject));
}
async function loadGLB(urls){
  const list=Array.isArray(urls)?urls:[urls];
  let lastErr;
  for(const url of list){
    try{return await loadGLBOnce(url)}catch(e){lastErr=e}
  }
  throw lastErr;
}
function normalizeName(name=""){return name.toLowerCase().replace(/[^a-z0-9]/g,"")}
function findNodeByTokens(root,tokens){
  const wanted=tokens.map(normalizeName);
  let best=null;
  root.traverse(o=>{
    const n=normalizeName(o.name);
    if(!n)return;
    if(wanted.some(t=>n===t||n.endsWith(t)||n.includes(t))) best=best||o;
  });
  return best;
}
function collectRig(root){
  return {
    hips:findNodeByTokens(root,["hips","mixamorighips"]),
    spine:findNodeByTokens(root,["spine2","spine1","spine"]),
    neck:findNodeByTokens(root,["neck"]),
    head:findNodeByTokens(root,["head"]),
    jaw:findNodeByTokens(root,["jaw","jawbone"]),
    leftArm:findNodeByTokens(root,["leftarm"]),
    rightArm:findNodeByTokens(root,["rightarm"]),
    leftForeArm:findNodeByTokens(root,["leftforearm"]),
    rightForeArm:findNodeByTokens(root,["rightforearm"]),
    leftHand:findNodeByTokens(root,["lefthand"]),
    rightHand:findNodeByTokens(root,["righthand"]),
    leftUpLeg:findNodeByTokens(root,["leftupleg"]),
    rightUpLeg:findNodeByTokens(root,["rightupleg"]),
    leftLeg:findNodeByTokens(root,["leftleg"]),
    rightLeg:findNodeByTokens(root,["rightleg"])
  };
}
function rememberRigBase(rig){
  Object.values(rig).forEach(b=>{if(b&&!b.userData.itsBaseRotation)b.userData.itsBaseRotation=b.rotation.clone()});
}
function resetRig(rig){
  Object.values(rig).forEach(b=>{if(b?.userData?.itsBaseRotation)b.rotation.copy(b.userData.itsBaseRotation)});
}
function tintModel(root,color,amount=.18){
  const tint=new THREE.Color(color);
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true;o.receiveShadow=true;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    const clones=mats.map(m=>{
      if(!m)return m;
      const c=m.clone();
      if(c.color)c.color.lerp(tint,amount);
      c.roughness=Math.max(c.roughness??.5,.52);
      return c;
    });
    o.material=Array.isArray(o.material)?clones:clones[0];
  });
}
function scaleAndCenterModel(model,targetHeight=1.95,rotationY=0){
  model.rotation.y=rotationY;
  model.scale.setScalar(1);
  model.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(model),size=new THREE.Vector3();
  box.getSize(size);
  const scale=targetHeight/Math.max(size.y,.001);
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(model);
  const center=new THREE.Vector3();box.getCenter(center);
  model.position.x-=center.x;
  model.position.z-=center.z;
  model.position.y-=box.min.y;
}
function makeNameBadge(text){
  const c=document.createElement("canvas");c.width=280;c.height=96;
  const ctx=c.getContext("2d");ctx.fillStyle="#f7f4ed";ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle="#254d52";ctx.font="700 34px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,c.width/2,c.height/2);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(.25,.086),new THREE.MeshStandardMaterial({map:tex,roughness:.55}));
}
function addProfessionalReceptionistDetails(wrapper){
  const badge=makeNameBadge("GIULIA");
  badge.position.set(.18,1.40,.24);
  badge.rotation.y=0;
  wrapper.add(badge);
}
function mapAnimationClips(animations=[]){
  const map={};animations.forEach(c=>map[normalizeName(c.name)]=c);return map;
}
function pickClip(character,candidates){
  if(!character?.userData?.clips)return null;
  for(const candidate of candidates){
    const key=Object.keys(character.userData.clips).find(k=>k.includes(normalizeName(candidate)));
    if(key)return character.userData.clips[key];
  }
  return null;
}
function playPremiumClip(character,candidates,{loop=true,fade=.22}={}){
  if(!character?.userData?.mixer)return false;
  const clip=pickClip(character,Array.isArray(candidates)?candidates:[candidates]);
  if(!clip)return false;
  const next=character.userData.mixer.clipAction(clip);
  if(character.userData.currentAction===next)return true;
  next.reset();next.enabled=true;next.setEffectiveWeight(1);next.setEffectiveTimeScale(1);
  next.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);next.clampWhenFinished=!loop;next.fadeIn(fade).play();
  if(character.userData.currentAction)character.userData.currentAction.fadeOut(fade);
  character.userData.currentAction=next;
  return true;
}
function setupPremiumCharacter(source,animations,{x,z,height=1.98,tint=0xffffff,tintAmount=.1,role="guest",rotationY=0,label=""}={}){
  const wrapper=new THREE.Group();
  wrapper.position.set(x,0,z);wrapper.userData.home=new THREE.Vector3(x,0,z);wrapper.userData.walking=false;wrapper.userData.phase=Math.random()*6;wrapper.userData.kind="premium";wrapper.userData.role=role;wrapper.userData.label=label;
  const visual=SkeletonUtils.clone(source);
  tintModel(visual,tint,tintAmount);
  scaleAndCenterModel(visual,height,rotationY);
  wrapper.add(visual);
  wrapper.userData.visual=visual;
  wrapper.userData.rig=collectRig(visual);rememberRigBase(wrapper.userData.rig);
  wrapper.userData.clips=mapAnimationClips(animations);
  if(animations?.length){wrapper.userData.mixer=new THREE.AnimationMixer(visual);playPremiumClip(wrapper,["idle"],{loop:true,fade:0})}
  wrapper.userData.morphs=[];
  visual.traverse(o=>{
    if(!o.isMesh||!o.morphTargetDictionary||!o.morphTargetInfluences)return;
    for(const [name,index] of Object.entries(o.morphTargetDictionary)){
      const n=normalizeName(name);
      if(n.includes("mouth")||n.includes("jaw")||n.includes("viseme"))wrapper.userData.morphs.push({mesh:o,index});
    }
  });
  if(role==="staff")addProfessionalReceptionistDetails(wrapper);
  world.add(wrapper);
  return wrapper;
}
async function loadPremiumCharacters(){
  if(UI.characterModeBadge)UI.characterModeBadge.textContent="Caricamento persone realistiche…";
  try{
    const [harper,jordan]=await Promise.all([
      loadGLB(PREMIUM_MODEL_URLS.receptionist),
      loadGLB(PREMIUM_MODEL_URLS.guest)
    ]);

    const old=[staff,guestA,guestB,newGuest];
    old.forEach(c=>{if(c)world.remove(c)});

    // Receptionist: donna in business clothes, dietro il bancone.
    staff=setupPremiumCharacter(harper.scene,harper.animations,{
      x:-1.55,z:-1.92,height:1.74,tint:0xffffff,tintAmount:0,
      role:"staff",rotationY:Math.PI,label:"Giulia Rossi"
    });

    // Ospite uomo in business/casual clothes.
    guestA=setupPremiumCharacter(jordan.scene,jordan.animations,{
      x:.70,z:.20,height:1.83,tint:0xffffff,tintAmount:0,
      role:"guest",rotationY:Math.PI,label:"Mr. Taylor"
    });

    // Ospite donna: clone del modello Harper, senza badge da receptionist.
    guestB=setupPremiumCharacter(harper.scene,harper.animations,{
      x:1.55,z:.42,height:1.70,tint:0xffffff,tintAmount:0,
      role:"guest",rotationY:Math.PI,label:"Mrs. Taylor"
    });

    // Secondo ospite uomo.
    newGuest=setupPremiumCharacter(jordan.scene,jordan.animations,{
      x:6,z:.8,height:1.79,tint:0xffffff,tintAmount:0,
      role:"guest",rotationY:Math.PI,label:"Nuovo ospite"
    });
    newGuest.visible=false;

    premiumMode=true;
    if(UI.characterModeBadge){
      UI.characterModeBadge.textContent="Persone realistiche · GLB";
      UI.characterModeBadge.classList.remove("is-fallback");
      UI.characterModeBadge.classList.add("is-premium");
    }
  }catch(err){
    console.warn("Personaggi realistici non disponibili: uso fallback locale",err);
    premiumMode=false;
    // Il fallback resta operativo, ma viene mantenuto dietro la UI senza spacciarlo per modello realistico.
    if(UI.characterModeBadge){
      UI.characterModeBadge.textContent="Modelli umani non caricati";
      UI.characterModeBadge.classList.remove("is-premium");
      UI.characterModeBadge.classList.add("is-fallback");
    }
  }
}
function resetPremiumPose(c){
  if(!c?.userData?.rig)return;
  resetRig(c.userData.rig);
  if(c.userData.mixer)playPremiumClip(c,["idle"],{loop:true});
}
function applyRigOffset(bone,x=0,y=0,z=0){if(!bone)return;bone.rotation.x+=x;bone.rotation.y+=y;bone.rotation.z+=z}
function setPremiumPose(c,name){
  if(!c)return;
  if(c.userData.mixer)playPremiumClip(c,["idle"],{loop:true});
  resetRig(c.userData.rig||{});
  const r=c.userData.rig||{};
  if(c.userData.role!=="staff"){
    if(name==="upset"&&playPremiumClip(c,["headshake","head_shake"],{loop:false}))return;
    if(name==="concerned"&&playPremiumClip(c,["sadpose","sad_pose"],{loop:true}))return;
    if(name==="relaxed"&&playPremiumClip(c,["agree"],{loop:false}))return;
    playPremiumClip(c,["idle"],{loop:true});
  }
  if(name==="phone"){
    applyRigOffset(r.rightArm,-.25,0,-1.05);applyRigOffset(r.rightForeArm,-.15,0,-1.0);applyRigOffset(r.head,.03,-.16,0);
  }else if(name==="screen"){
    applyRigOffset(r.head,.02,-.35,0);applyRigOffset(r.leftArm,-.25,0,.62);applyRigOffset(r.leftForeArm,-.15,0,.4);
  }else if(name==="point"){
    applyRigOffset(r.rightArm,-.52,0,-1.0);applyRigOffset(r.rightForeArm,-.2,0,-.28);
  }else if(name==="clock"){
    applyRigOffset(r.head,0,.28,0);applyRigOffset(r.leftArm,-.18,0,.45);applyRigOffset(r.leftForeArm,-.2,0,.35);
  }else if(name==="turn"){
    c.rotation.y=-1.0;applyRigOffset(r.head,0,.24,0);
  }else if(name==="upset"){
    applyRigOffset(r.leftArm,0,0,.55);applyRigOffset(r.rightArm,0,0,-.55);applyRigOffset(r.head,0,0,.05);
  }else if(name==="concerned"){
    applyRigOffset(r.head,.04,0,-.08);applyRigOffset(r.leftArm,0,0,.28);
  }else if(name==="relaxed"){
    applyRigOffset(r.head,.04,0,0);
  }
}
function createCharacter(x,z,uniform,hair,role){
  const g=new THREE.Group();
  g.position.set(x,0,z);
  g.userData.role=role;
  g.userData.home=new THREE.Vector3(x,0,z);
  g.userData.walking=false;
  g.userData.phase=Math.random()*6;

  const skin=mat(role==="staff"?0xe0b08c:0xd7a582,{roughness:.93});
  const fabric=mat(uniform,{roughness:.9});
  const dark=mat(0x2f3336,{roughness:.88});
  const shirt=mat(role==="staff"?0xf6f4ef:0xece8e1,{roughness:.92});
  const hairMat=mat(hair,{roughness:.95});
  const lips=mat(0xa96d64,{roughness:.95});
  const metal=mat(0xb9b7b3,{roughness:.32,metalness:.7});

  const hips=new THREE.Group();
  hips.position.y=.98;
  g.add(hips);

  const pelvis=new THREE.Mesh(new THREE.CapsuleGeometry(.17,.20,7,14),role==="staff"?fabric:dark);
  pelvis.scale.set(1.12,1,.82);
  pelvis.position.y=.06;
  pelvis.castShadow=true;
  hips.add(pelvis);

  const waist=new THREE.Group();
  waist.position.y=.34;
  hips.add(waist);

  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.56,8,18),fabric);
  torso.scale.set(role==="staff"?.96:1.02,1.1,.76);
  torso.position.y=.38;
  torso.castShadow=true;
  waist.add(torso);

  const shirtFront=new THREE.Mesh(new THREE.BoxGeometry(.22,.42,.06),shirt);
  shirtFront.position.set(0,.39,.27);
  shirtFront.castShadow=true;
  waist.add(shirtFront);

  if(role==="staff"){
    const scarf=new THREE.Mesh(new THREE.BoxGeometry(.14,.32,.05),mat(0x8aa0a2,{roughness:.85}));
    scarf.position.set(0,.41,.29);
    waist.add(scarf);
    const badge=new THREE.Mesh(new THREE.BoxGeometry(.12,.16,.02),shirt);
    badge.position.set(.19,.35,.29);
    waist.add(badge);
    const badgeClip=new THREE.Mesh(new THREE.BoxGeometry(.02,.03,.01),metal);
    badgeClip.position.set(.19,.44,.305);
    waist.add(badgeClip);
  }

  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.12,16),skin);
  neck.position.y=.83;
  waist.add(neck);

  const headPivot=new THREE.Group();
  headPivot.position.y=.94;
  waist.add(headPivot);

  const head=new THREE.Mesh(new THREE.SphereGeometry(.24,28,24),skin);
  head.scale.set(.98,1.07,.94);
  head.castShadow=true;
  headPivot.add(head);

  const nose=new THREE.Mesh(new THREE.SphereGeometry(.03,12,12),skin);
  nose.scale.set(.75,1.1,1.3);
  nose.position.set(0,-.01,.22);
  headPivot.add(nose);

  const eyeGeo=new THREE.SphereGeometry(.022,12,12);
  const eyeMat=mat(0x1f2326,{roughness:.4});
  const leftEye=new THREE.Mesh(eyeGeo,eyeMat); leftEye.position.set(-.075,.045,.205);
  const rightEye=new THREE.Mesh(eyeGeo,eyeMat); rightEye.position.set(.075,.045,.205);
  headPivot.add(leftEye,rightEye);

  const browGeo=new THREE.BoxGeometry(.06,.01,.01);
  const lb=new THREE.Mesh(browGeo,hairMat); lb.position.set(-.075,.10,.208); lb.rotation.z=.15;
  const rb=new THREE.Mesh(browGeo,hairMat); rb.position.set(.075,.10,.208); rb.rotation.z=-.15;
  headPivot.add(lb,rb);

  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.06,.012,.01),lips);
  mouth.position.set(0,-.10,.205);
  headPivot.add(mouth);

  const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.247,26,20,0,Math.PI*2,0,Math.PI*.68),hairMat);
  hairCap.scale.set(1.01,1.03,1.01);
  hairCap.position.y=.05;
  headPivot.add(hairCap);

  if(role==="staff"){
    const fringe=new THREE.Mesh(new THREE.BoxGeometry(.24,.085,.16),hairMat);
    fringe.position.set(0,.11,.12);
    fringe.rotation.x=-.22;
    headPivot.add(fringe);
    const ponyTail=new THREE.Mesh(new THREE.CapsuleGeometry(.06,.24,6,12),hairMat);
    ponyTail.position.set(0,-.04,-.22);
    ponyTail.rotation.x=.4;
    headPivot.add(ponyTail);
  } else {
    const sideL=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.22,6,10),hairMat);
    sideL.position.set(-.18,-.02,.02); sideL.rotation.z=.18;
    const sideR=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.22,6,10),hairMat);
    sideR.position.set(.18,-.02,.02); sideR.rotation.z=-.18;
    headPivot.add(sideL,sideR);
  }

  const shoulderBar=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.42,8,12),fabric);
  shoulderBar.rotation.z=Math.PI/2;
  shoulderBar.position.set(0,.67,.02);
  waist.add(shoulderBar);

  function makeArm(side=1){
    const shoulder=new THREE.Group();
    shoulder.position.set(.31*side,.66,0);
    waist.add(shoulder);

    const upper=new THREE.Mesh(new THREE.CylinderGeometry(.07,.06,.35,14),fabric);
    upper.position.y=-.18; upper.castShadow=true; shoulder.add(upper);

    const elbow=new THREE.Group();
    elbow.position.y=-.34; shoulder.add(elbow);

    const lower=new THREE.Mesh(new THREE.CylinderGeometry(.06,.05,.30,14),role==="staff"?shirt:fabric);
    lower.position.y=-.15; lower.castShadow=true; elbow.add(lower);

    const hand=new THREE.Mesh(new THREE.SphereGeometry(.055,12,12),skin);
    hand.scale.set(.9,1,.75); hand.position.y=-.31; elbow.add(hand);

    return {shoulder, elbow, upper, lower, hand};
  }

  const leftArm=makeArm(-1), rightArm=makeArm(1);
  leftArm.shoulder.rotation.z=.14;
  rightArm.shoulder.rotation.z=-.14;

  function makeLeg(side=1){
    const hip=new THREE.Group();
    hip.position.set(.12*side,.02,0);
    hips.add(hip);

    const upper=new THREE.Mesh(new THREE.CylinderGeometry(.09,.08,.42,14),dark);
    upper.position.y=-.21; upper.castShadow=true; hip.add(upper);

    const knee=new THREE.Group();
    knee.position.y=-.41; hip.add(knee);

    const lower=new THREE.Mesh(new THREE.CylinderGeometry(.075,.06,.40,14),dark);
    lower.position.y=-.2; lower.castShadow=true; knee.add(lower);

    const shoe=new THREE.Mesh(new THREE.BoxGeometry(.18,.07,.33),mat(0x1a1d1f,{roughness:.78}));
    shoe.position.set(0,-.42,.07); shoe.castShadow=true; knee.add(shoe);

    return {hip, knee, upper, lower, shoe};
  }

  const legL=makeLeg(-1), legR=makeLeg(1);

  if(role==="staff"){
    const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.24,.31,.36,18,1,true),fabric);
    skirt.position.set(0,-.04,0);
    skirt.castShadow=true;
    hips.add(skirt);
  } else {
    const jacket=new THREE.Mesh(new THREE.BoxGeometry(.62,.28,.36),fabric);
    jacket.position.set(0,.55,-.02);
    jacket.visible=false;
  }

  g.userData.parts={
    hips, torso, waist, headPivot, head, mouth,
    leftArm:leftArm.shoulder, rightArm:rightArm.shoulder,
    leftForearm:leftArm.elbow, rightForearm:rightArm.elbow,
    leftHand:leftArm.hand, rightHand:rightArm.hand,
    legs:[legL.hip, legR.hip], knees:[legL.knee, legR.knee],
    leftLeg:legL.hip, rightLeg:legR.hip,
    eyes:[leftEye,rightEye], brows:[lb,rb]
  };
  world.add(g);
  return g;
}
function resetPose(c){
  if(!c)return;
  if(c.userData?.kind==="premium"){resetPremiumPose(c);return;}
  c.rotation.set(0,0,0);const p=c.userData.parts;p.headPivot.rotation.set(0,0,0);p.torso.rotation.set(0,0,0);p.leftArm.rotation.set(0,0,.14);p.rightArm.rotation.set(0,0,-.14);p.leftForearm.rotation.set(0,0,0);p.rightForearm.rotation.set(0,0,0);p.legs.forEach(l=>l.rotation.set(0,0,0));p.knees.forEach(k=>k.rotation.set(0,0,0));
}
function setPose(c,name){
  if(!c)return;
  if(c.userData?.kind==="premium"){setPremiumPose(c,name);return;}
  resetPose(c);const p=c.userData.parts;if(name==="phone"){p.rightArm.rotation.z=-.92;p.rightArm.rotation.x=-.28;p.rightForearm.rotation.z=-.55;p.leftArm.rotation.z=.28}else if(name==="screen"){p.headPivot.rotation.y=-.36;p.leftArm.rotation.z=.66;p.leftForearm.rotation.z=.22}else if(name==="point"){p.rightArm.rotation.z=-1.1;p.rightArm.rotation.x=-.55;p.rightForearm.rotation.z=-.2}else if(name==="clock"){p.headPivot.rotation.y=.35;p.leftArm.rotation.z=.48;p.leftForearm.rotation.z=.35}else if(name==="turn"){c.rotation.y=-1;p.headPivot.rotation.y=.28}else if(name==="upset"){p.leftArm.rotation.z=.7;p.rightArm.rotation.z=-.7;p.leftForearm.rotation.z=.18;p.rightForearm.rotation.z=-.18;p.headPivot.rotation.z=.05}else if(name==="concerned"){p.headPivot.rotation.z=-.1;p.leftArm.rotation.z=.35;p.leftForearm.rotation.z=.18}else if(name==="relaxed"){p.headPivot.rotation.x=.06;p.rightArm.rotation.z=-.2}else if(name==="neutral"){p.headPivot.rotation.y=.05}
}

function dynamicBoard(){const c=document.createElement("canvas");c.width=560;c.height=380;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.85,1.28),new THREE.MeshStandardMaterial({map:t,roughness:.55}));m.userData.canvas=c;m.userData.texture=t;m.name="Transfer dashboard";return m}
function updateBoard(status,detail){const c=board.userData.canvas,x=c.getContext("2d");x.fillStyle="#20343a";x.fillRect(0,0,c.width,c.height);x.fillStyle="#9fb6b9";x.font="700 24px sans-serif";x.fillText("TRANSFER STATUS",34,48);x.fillStyle=status.includes("CONFIRMED")?"#a8d6b1":status.includes("CANCELLED")?"#f0ad9f":"#f0d3a1";x.font="800 44px sans-serif";x.fillText(status,34,108);x.fillStyle="#fff";x.font="600 26px sans-serif";x.fillText(detail,34,154);x.fillStyle="#88a2a6";x.font="600 21px sans-serif";x.fillText("Dinner reservation · 19:00",34,228);x.fillText("Weather · Heavy rain",34,268);board.userData.texture.needsUpdate=true}

function buildWorld(){
  world=new THREE.Group();scene.add(world);
  box([14.5,.18,10.7],[0,-.09,0],0xcfc7bd,{roughness:.92});box([14.5,4.6,.18],[0,2.3,-5.25],0xf0ece6,{roughness:.96});box([.18,4.6,10.7],[-7.16,2.3,0],0xebe7e1,{roughness:.96});box([.18,4.6,10.7],[7.16,2.3,0],0xebe7e1,{roughness:.96});
  for(let i=0;i<14;i++)box([.11,2.75,.09],[-2.55+i*.38,2.15,-5.12],0x8a6b51,{roughness:.7});
  box([4.9,1.15,1.15],[-1.5,.58,-1.15],0x795d47,{roughness:.66});box([4.96,.11,1.2],[-1.5,1.18,-1.15],0xe8e1d7,{roughness:.38});box([4.15,.55,.05],[-1.5,.64,-.56],0x9f8166,{roughness:.68});
  const rs=label("RECEPTION");rs.position.set(-1.5,2.55,-4.98);world.add(rs);
  monitor=box([.78,.48,.06],[-2.25,1.5,-1.03],0x20292d,{roughness:.26,metalness:.3,name:"PMS Monitor"}); phone=box([.34,.12,.22],[-.85,1.29,-1.04],0x32383a,{roughness:.45,name:"Telefono reception"}); box([.2,.1,.25],[-.25,1.29,-1.06],0x303536,{roughness:.35}); const bell=cyl(.08,.14,.12,[-1.45,1.31,-.98],0xc8a96f,{roughness:.28,metalness:.8}); bell.name="Campanello reception"; interactive.push(bell); const keyRack=box([.55,.45,.04],[-.25,2.05,-5.0],0xdfd7cc,{roughness:.8}); const keyRingMat=mat(0xb9b7b3,{roughness:.32,metalness:.7}); for(let i=0;i<6;i++){const k=new THREE.Mesh(new THREE.TorusGeometry(.035,.01,10,22),keyRingMat); k.position.set(-.46+(i%3)*.18,1.98-Math.floor(i/3)*.18,-4.96); k.rotation.x=Math.PI/2; world.add(k);} 
  box([4,.025,2.8],[3.65,.018,1.85],0xc7b8a4,{roughness:.98});sofa(3.7,1.35,0x72867a);sofa(3.7,2.55,0x667b72);box([1.25,.13,.82],[2.05,.37,1.94],0x8b6b50,{roughness:.62});cyl(.035,.035,1.65,[5.45,.82,2.65],0xb19573,{roughness:.25,metalness:.65});cyl(.30,.24,.42,[5.45,1.77,2.65],0xe8dbc9,{roughness:.92});
  const glass=new THREE.MeshPhysicalMaterial({color:0xa8c1cc,roughness:.1,transparent:true,opacity:.22,transmission:.35,thickness:.02});for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,3.1),glass);p.position.set(3.5+i*1.2,1.75,-5.08);world.add(p)}
  [3.05,4.25,5.45,6.65].forEach(x=>box([.06,3.2,.06],[x,1.75,-5.02],0x686f72,{roughness:.3,metalness:.7}));
  const rm=new THREE.LineBasicMaterial({color:0x8fb0bf,transparent:true,opacity:.55});for(let i=0;i<34;i++){const x=3+(i%10)*.42,y=.7+(i%6)*.55,z=-5.2-(i%3)*.04,g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,y+.38,z),new THREE.Vector3(x-.1,y,z)]);world.add(new THREE.Line(g,rm))}
  luggage(5.8,.8,0x73543d);luggage(6.25,1.25,0x465c70);
  box([2.2,.92,.78],[-4.9,.46,.55],0x88705c,{roughness:.7});box([2.26,.09,.84],[-4.9,.97,.55],0xe5ddd0,{roughness:.4});const cs=label("CONCIERGE","#566f72",620,48);cs.scale.set(.73,.73,.73);cs.position.set(-4.9,2.3,-.22);world.add(cs);
  board=dynamicBoard();board.position.set(-5,1.95,.45);board.rotation.y=.12;world.add(board);updateBoard("CANCELLED","Nessuna alternativa attiva");
  plant(-6.2,-3.6);plant(6.2,3.9,1.05);plant(4.9,-3.8,.85);
  staff=createCharacter(-1.55,-.1,0x2f5a60,0x342722,"staff"); guestA=createCharacter(.75,.18,0x8e6b58,0x4a362c,"guest"); guestB=createCharacter(1.55,.4,0x62738b,0x4a3428,"guest"); newGuest=createCharacter(6,.8,0x6a7868,0x332a25,"guest"); newGuest.visible=false; setPose(staff,"neutral");
  interactive.push(monitor,phone,board)
}

async function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0xdfe5e7);scene.fog=new THREE.Fog(0xdfe5e7,18,34);
  camera=new THREE.PerspectiveCamera(46,1,.1,100);camera.position.copy(desiredPos);
  renderer=new THREE.WebGLRenderer({canvas:UI.canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff8ee,0x6f7c82,1.7));const sun=new THREE.DirectionalLight(0xfff1dc,2.3);sun.position.set(7,10,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);const warm=new THREE.PointLight(0xffd6a6,15,9,2);warm.position.set(-1.4,3.1,-.6);scene.add(warm);const loungeLight=new THREE.PointLight(0xffddb5,10,7,2);loungeLight.position.set(3.8,2.8,2.2);scene.add(loungeLight);
  buildWorld();
  bind();
  resize();
  renderStep();
  animate();
  UI.loading.style.display="none";
  loadResources();
  loadPremiumCharacters().catch(err=>console.warn("Upgrade personaggi non completato",err))
}

function bind(){
  UI.supportBtn.addEventListener("click",()=>{state.helpRequests++;UI.helpRequests.textContent=state.helpRequests;UI.supportBox.classList.toggle("show")});
  UI.voiceToggleBtn.addEventListener("click",toggleVoice);
  UI.resourcesBtn.addEventListener("click",()=>openResources(scenario[state.step].resource));
  UI.replayVoiceBtn.addEventListener("click",()=>{if(state.lastLine)speak(state.lastLine,true)});
  UI.skipDialogueBtn.addEventListener("click",()=>{state.skip=true;stopSpeech()});
  UI.continueBtn.addEventListener("click",()=>{stopSpeech();if(state.step<scenario.length-1){state.step++;state.stepStart=performance.now();selected=null;state.skip=false;renderStep();setView("overview")}else complete()});
  UI.reset.addEventListener("click",reset);
  UI.cameraButtons.forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  UI.rotateLeft.addEventListener("click",()=>{angle-=.18;orbit()});UI.rotateRight.addEventListener("click",()=>{angle+=.18;orbit()});UI.zoomIn.addEventListener("click",()=>{radius=Math.max(7.8,radius-.7);orbit()});UI.zoomOut.addEventListener("click",()=>{radius=Math.min(16.5,radius+.7);orbit()});
  UI.canvas.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;UI.canvas.setPointerCapture(e.pointerId)});
  UI.canvas.addEventListener("pointermove",e=>{hover(e);if(!drag||state.locked)return;angle-=(e.clientX-lastX)*.006;lastX=e.clientX;orbit()});
  UI.canvas.addEventListener("pointerup",()=>{drag=false;if(hovered){UI.objectHint.textContent=desc(hovered.name);UI.objectHint.classList.add("show");setTimeout(()=>UI.objectHint.classList.remove("show"),2200)}});
  UI.canvas.addEventListener("wheel",e=>{if(state.locked)return;e.preventDefault();radius=THREE.MathUtils.clamp(radius+e.deltaY*.008,7.8,16.5);orbit()},{passive:false});
  UI.closeResourcesBtn.addEventListener("click",closeResources);UI.resourcesBackdrop.addEventListener("click",closeResources);UI.resourceSearch.addEventListener("input",()=>renderResourceList(UI.resourceSearch.value));
  addEventListener("resize",resize)
}
function orbit(){desiredPos.set(Math.sin(angle)*radius,5,Math.cos(angle)*radius);desiredTarget.set(0,1.45,-.2);UI.cameraButtons.forEach(b=>b.classList.remove("active"))}
function setView(n){const v=views[n];if(!v)return;desiredPos.set(...v.p);desiredTarget.set(...v.t);UI.cameraButtons.forEach(b=>b.classList.toggle("active",b.dataset.view===n))}
function renderStep(){const s=scenario[state.step];UI.step.textContent=`${state.step+1} / ${scenario.length}`;UI.situation.textContent=s.situation;UI.choices.innerHTML="";UI.continueBtn.classList.remove("show");UI.feedbackCard.classList.remove("active");UI.feedbackTitle.textContent="—";UI.feedbackText.textContent="Il feedback apparirà dopo la sequenza.";UI.feedbackWhy.textContent="—";UI.dialogueState.textContent="In attesa";UI.supportBox.classList.remove("show");s.choices.forEach((c,i)=>{const b=document.createElement("button");b.className="choice-btn";b.type="button";b.innerHTML=`<strong>${String.fromCharCode(65+i)}.</strong> ${c.label}`;b.addEventListener("click",()=>choose(c,b));UI.choices.appendChild(b)});newGuest.visible=state.step===2;if(state.step===2)newGuest.position.set(6,0,.8);metrics()}
async function choose(c,b){if(state.locked||selected)return;selected=c;state.locked=true;state.decisionCount++;const dt=(performance.now()-state.stepStart)/1000;state.metrics.push({step:state.step+1,choice:c.id,decisionTimeSeconds:+dt.toFixed(2),helpRequests:state.helpRequests,resources:[...state.resources]});UI.decisionTime.textContent=`${dt.toFixed(1)} s`;UI.decisionCount.textContent=state.decisionCount;[...UI.choices.children].forEach(x=>x.disabled=true);b.classList.add("selected");Object.keys(state.scores).forEach(k=>state.scores[k]+=c.scores[k]||0);state.remainingMinutes=Math.max(0,state.remainingMinutes-c.loss);UI.timer.textContent=`${String(state.remainingMinutes).padStart(2,"0")}:00`;UI.transferStatus.textContent=c.status[0];UI.transferDetail.textContent=c.status[1];updateBoard(...c.status);metrics();await playSequence(c);UI.feedbackTitle.textContent=c.feedback[0];UI.feedbackText.textContent=c.feedback[1];UI.feedbackWhy.textContent=c.feedback[2];UI.feedbackCard.classList.add("active");UI.continueBtn.textContent=state.step===scenario.length-1?"Mostra risultato finale":"Continua";UI.continueBtn.classList.add("show");UI.dialogueState.textContent="Sequenza completata";state.locked=false}
async function playSequence(c){UI.actionText.textContent=c.action;UI.actionOverlay.classList.add("show");desiredPos.set(4.65,3.05,4.65);desiredTarget.set(-.15,1.35,-.25);await wait(reduced?250:850);UI.actionOverlay.classList.remove("show");UI.dialogueLog.innerHTML="";UI.dialogueState.textContent="Dialogo in corso";state.skip=false;for(const line of c.sequence){if(state.skip)break;const char={staff,guestA,guestB,newGuest}[line.actor];await action(char,line.anim);UI.dialogueAvatar.textContent=line.avatar;UI.dialogueRole.textContent=line.role;UI.dialogueName.textContent=line.name;UI.dialogueText.textContent=line.text;UI.dialogueOverlay.classList.add("show");appendLog(line);state.lastLine=line;const speakPromise=speak(line);await Promise.race([wait(reduced?350:Math.min(2600,1100+line.text.length*14)),speakPromise])}UI.dialogueOverlay.classList.remove("show");stopSpeech();[staff,guestA,guestB,newGuest].forEach(resetPose);await wait(reduced?100:350);setView("overview")}
async function action(char,anim){if(anim==="walk_phone"){await walk(staff,new THREE.Vector3(-1.02,0,-.28),.9);setPose(staff,"phone")}else if(anim==="walk_in"){newGuest.visible=true;await walk(newGuest,new THREE.Vector3(4.7,0,.35),1.1);setPose(newGuest,"upset")}else setPose(char,anim)}
function walk(char,target,speed){if(reduced){char.position.copy(target);return Promise.resolve()}if(char?.userData?.kind==="premium")playPremiumClip(char,["walk"],{loop:true});return new Promise(resolve=>{char.userData.walking=true;char.userData.target=target.clone();char.userData.speed=speed;char.userData.resolve=resolve})}
function updateMotion(char,dt,t){
  if(!char||!char.visible)return;
  if(char.userData?.mixer)char.userData.mixer.update(dt);
  if(char.userData?.kind==="premium"){
    const r=char.userData.rig||{};
    if(char.userData.walking){
      const dir=char.userData.target.clone().sub(char.position),dist=dir.length();
      if(dist<.035){
        char.position.copy(char.userData.target);char.userData.walking=false;
        playPremiumClip(char,["idle"],{loop:true});
        resetRig(r);
        const done=char.userData.resolve;char.userData.resolve=null;if(done)done();
      }else{
        dir.normalize();char.position.addScaledVector(dir,Math.min(dist,char.userData.speed*dt));char.rotation.y=Math.atan2(dir.x,dir.z);
        if(char.userData.role==="staff"){
          const cyc=Math.sin(t*9);applyRigOffset(r.leftUpLeg,cyc*.28,0,0);applyRigOffset(r.rightUpLeg,-cyc*.28,0,0);applyRigOffset(r.leftArm,-cyc*.18,0,0);applyRigOffset(r.rightArm,cyc*.18,0,0);
        }
      }
    }else if(!reduced&&char.userData.role==="staff"){
      const breathe=Math.sin(t*1.55+char.userData.phase);
      applyRigOffset(r.spine,breathe*.006,0,0);applyRigOffset(r.head,0,Math.sin(t*.8+char.userData.phase)*.012,0);
    }
    if(speakingCharacter===char){
      const pulse=.5+.5*Math.sin(t*18+speechPulse);
      if(r.jaw)applyRigOffset(r.jaw,pulse*.045,0,0);
      char.userData.morphs?.forEach(({mesh,index})=>{mesh.morphTargetInfluences[index]=pulse*.55});
      applyRigOffset(r.head,Math.sin(t*4)*.012,0,0);
    }else{
      char.userData.morphs?.forEach(({mesh,index})=>{mesh.morphTargetInfluences[index]*=.75});
    }
    return;
  }
  const p=char.userData.parts;
  if(char.userData.walking){const dir=char.userData.target.clone().sub(char.position),dist=dir.length();if(dist<.035){char.position.copy(char.userData.target);char.userData.walking=false;p.legs.forEach(l=>l.rotation.x=0);p.knees.forEach(k=>k.rotation.x=0);p.leftArm.rotation.x=0;p.rightArm.rotation.x=0;const done=char.userData.resolve;char.userData.resolve=null;if(done)done()}else{dir.normalize();char.position.addScaledVector(dir,Math.min(dist,char.userData.speed*dt));char.rotation.y=Math.atan2(dir.x,dir.z);const cyc=Math.sin(t*10);p.legs[0].rotation.x=cyc*.42;p.legs[1].rotation.x=-cyc*.42;p.knees[0].rotation.x=Math.max(0,-cyc)*.28;p.knees[1].rotation.x=Math.max(0,cyc)*.28;p.leftArm.rotation.x=-cyc*.22;p.rightArm.rotation.x=cyc*.22;p.headPivot.rotation.y=Math.sin(t*4)*.03}}else if(!reduced){p.torso.position.y=.38+Math.sin(t*1.65+char.userData.phase)*.008;p.head.position.y=Math.sin(t*1.65+char.userData.phase)*.003;const blink=Math.sin(t*2.1+char.userData.phase*1.7);const eyeScale=blink>.98?.12:1;p.eyes.forEach(e=>e.scale.y=eyeScale);p.mouth.scale.x=.95+Math.sin(t*1.2+char.userData.phase)*.05}
}
function appendLog(line){const d=document.createElement("div");d.className="log-item";d.innerHTML=`<div class="log-who">${esc(line.name)}<br><span style="color:#7b858b;font-weight:600">${esc(line.role)}</span></div><p class="log-line">${esc(line.text)}</p>`;UI.dialogueLog.appendChild(d)}
function toggleVoice(){state.voice=!state.voice;UI.voiceToggleBtn.classList.toggle("active-tool",state.voice);UI.voiceToggleBtn.textContent=state.voice?"🔊 Voce ON":"🔇 Voce OFF";if(!state.voice)stopSpeech()}
function speak(line,force=false){return new Promise(resolve=>{if(!("speechSynthesis" in window)||(!state.voice&&!force)){resolve();return}stopSpeech();const u=new SpeechSynthesisUtterance(line.text);const english=line.name.includes("Taylor");u.lang=english?"en-GB":"it-IT";u.rate=.94;u.pitch=line.actor==="staff"?1.04:.96;const voices=speechSynthesis.getVoices();const pref=voices.find(v=>v.lang?.toLowerCase().startsWith(english?"en-gb":"it-it"))||voices.find(v=>v.lang?.toLowerCase().startsWith(english?"en":"it"));if(pref)u.voice=pref;speakingCharacter={staff,guestA,guestB,newGuest}[line.actor]||null;u.onboundary=()=>{speechPulse+=.9};u.onend=()=>{speakingCharacter=null;resolve()};u.onerror=()=>{speakingCharacter=null;resolve()};speechSynthesis.speak(u)})}
function stopSpeech(){speakingCharacter=null;if("speechSynthesis" in window)speechSynthesis.cancel()}

async function loadResources(){
  for(const path of ["./resources.json","./knowledge/resources.json"]){
    try{
      const r=await fetch(path,{cache:"no-store"});
      if(!r.ok)continue;
      resources=await r.json();
      renderResourceList("");
      return;
    }catch(e){}
  }
  UI.resourceList.innerHTML="<p class='empty-log'>Dispense non disponibili. Verifica che resources.json sia nella stessa cartella di index.html.</p>";
}
function openResources(id){UI.resourcesModal.classList.add("show");UI.resourcesModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");activeResource=id||activeResource||resources[0]?.id;renderResourceList(UI.resourceSearch.value);if(activeResource)showResource(activeResource)}
function closeResources(){UI.resourcesModal.classList.remove("show");UI.resourcesModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
function renderResourceList(q=""){const s=q.trim().toLowerCase();UI.resourceList.innerHTML="";const filtered=resources.filter(r=>!s||[r.title,r.category,r.summary,...(r.keywords||[])].join(" ").toLowerCase().includes(s));filtered.forEach(r=>{const b=document.createElement("button");b.className="resource-item";b.type="button";b.classList.toggle("active",r.id===activeResource);b.innerHTML=`<strong>${esc(r.title)}</strong><span>${esc(r.category)} · ${esc(r.summary)}</span>`;b.addEventListener("click",()=>showResource(r.id));UI.resourceList.appendChild(b)})}
function showResource(id){const r=resources.find(x=>x.id===id);if(!r)return;activeResource=id;if(!state.resources.includes(id))state.resources.push(id);UI.resourceCount.textContent=state.resources.length;let h=`<h3>${esc(r.title)}</h3><p class="resource-meta">${esc(r.category)} · ${esc(r.summary)}</p>`;for(const s of r.sections||[]){h+=`<h4>${esc(s.heading)}</h4>`;if(s.body)h+=`<p>${esc(s.body)}</p>`;if(s.bullets)h+=`<ul>${s.bullets.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`}if(r.callout)h+=`<div class="resource-callout">${esc(r.callout)}</div>`;UI.resourceContent.innerHTML=h;renderResourceList(UI.resourceSearch.value)}
function metrics(){const max=9,total=Object.values(state.scores).reduce((a,b)=>a+b,0);UI.total.textContent=`${total} pt`;[["problem",UI.problemValue,UI.problemBar],["communication",UI.communicationValue,UI.communicationBar],["priority",UI.priorityValue,UI.priorityBar],["adaptability",UI.adaptabilityValue,UI.adaptabilityBar]].forEach(([k,v,b])=>{v.textContent=state.scores[k];b.style.width=`${Math.min(100,state.scores[k]/max*100)}%`});UI.helpRequests.textContent=state.helpRequests;UI.decisionCount.textContent=state.decisionCount;UI.resourceCount.textContent=state.resources.length}
function complete(){const total=Object.values(state.scores).reduce((a,b)=>a+b,0),pct=Math.round(total/36*100),rank=Object.entries(state.scores).sort((a,b)=>b[1]-a[1]),names={problem:"Problem solving",communication:"Comunicazione",priority:"Gestione delle priorità",adaptability:"Adattabilità"};UI.situation.innerHTML=`<strong>Simulazione completata.</strong><br><br>Indice di performance: <strong>${pct}%</strong><br>Punto di forza prevalente: <strong>${names[rank[0][0]]}</strong><br>Area da rafforzare: <strong>${names[rank.at(-1)[0]]}</strong>.`;UI.choices.innerHTML="<div class='objective-box' style='margin-top:0'><span>DEBRIEFING</span><p>Il sistema ha osservato processo decisionale, tempi, supporti e risorse consultate.</p></div>";UI.continueBtn.classList.remove("show");UI.step.textContent="Completato";UI.dialogueState.textContent="Debriefing";window.ITSphereMetrics={scenarioId:"guest-experience-transfer-v3",decisionTimes:state.metrics.map(m=>m.decisionTimeSeconds),helpRequests:state.helpRequests,resourcesConsulted:[...state.resources],decisions:state.metrics.map(m=>m.choice),scores:{...state.scores},retries:0}}
function reset(){stopSpeech();Object.assign(state,{step:0,locked:false,scores:{problem:0,communication:0,priority:0,adaptability:0},helpRequests:0,decisionCount:0,remainingMinutes:40,stepStart:performance.now(),metrics:[],resources:[],skip:false,lastLine:null});selected=null;activeResource=null;UI.dialogueLog.innerHTML="<p class='empty-log'>Le conversazioni appariranno qui dopo una scelta.</p>";UI.dialogueOverlay.classList.remove("show");UI.actionOverlay.classList.remove("show");UI.decisionTime.textContent="0.0 s";UI.transferStatus.textContent="CANCELLED";UI.transferDetail.textContent="Fornitore non disponibile";UI.timer.textContent="40:00";if(staff)staff.position.copy(staff.userData.home);if(guestA)guestA.position.copy(guestA.userData.home);if(guestB)guestB.position.copy(guestB.userData.home);if(newGuest){newGuest.position.set(6,0,.8);newGuest.visible=false}updateBoard("CANCELLED","Nessuna alternativa attiva");renderStep();setView("overview")}
function hover(e){const r=UI.canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const h=raycaster.intersectObjects(interactive,false);hovered=h.length?h[0].object:null;if(hovered){UI.objectHint.textContent=desc(hovered.name);UI.objectHint.classList.add("show");UI.canvas.style.cursor="pointer"}else{UI.objectHint.classList.remove("show");UI.canvas.style.cursor=drag?"grabbing":"grab"}}
function desc(n){return{"PMS Monitor":"PMS Monitor · verifica prenotazioni e disponibilità","Telefono reception":"Telefono reception · contatta fornitori o reparti","Transfer dashboard":"Dashboard concierge · consulta disponibilità transfer","Campanello reception":"Campanello reception · accoglie l’ospite al desk"}[n]||n}
function resize(){const r=UI.wrap.getBoundingClientRect(),h=Math.max(1,UI.canvas.clientHeight||r.height);renderer.setSize(Math.max(1,r.width),h,false);camera.aspect=r.width/h;camera.updateProjectionMatrix()}
function animate(){requestAnimationFrame(animate);const d=Math.min(clock.getDelta(),.05),f=reduced?1:1-Math.pow(.0008,d);camera.position.lerp(desiredPos,Math.min(1,f));lookTarget.lerp(desiredTarget,Math.min(1,f));camera.lookAt(lookTarget);const t=performance.now()*.001;[staff,guestA,guestB,newGuest].forEach(c=>updateMotion(c,d,t));renderer.render(scene,camera)}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

try{await init()}catch(err){console.error(err);UI.loading.innerHTML="<strong>Impossibile inizializzare il motore 3D.</strong><span>Apri il progetto tramite Live Server o GitHub Pages.</span>"}
