import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/+esm";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js/+esm";

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
  resourceList: $("#resourceList"), resourceContent: $("#resourceContent")
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

function mat(color,o={}){return new THREE.MeshStandardMaterial({color,roughness:o.roughness??.72,metalness:o.metalness??.03,transparent:o.transparent??false,opacity:o.opacity??1})}
function box(size,pos,color,o={}){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color,o));m.position.set(...pos);m.castShadow=o.cast??true;m.receiveShadow=o.receive??true;if(o.name)m.name=o.name;(o.parent||world).add(m);return m}
function cyl(rt,rb,h,pos,color,o={}){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,20),mat(color,o));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;(o.parent||world).add(m);return m}
function label(text,bg="#254d52",w=768,font=54){const c=document.createElement("canvas");c.width=w;c.height=160;const x=c.getContext("2d");x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle="#fff";x.font=`700 ${font}px sans-serif`;x.textAlign="center";x.textBaseline="middle";x.fillText(text,c.width/2,c.height/2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(3.35,.7),new THREE.MeshStandardMaterial({map:t,roughness:.6}))}
function plant(x,z,s=1){cyl(.2*s,.25*s,.4*s,[x,.2*s,z],0x8b6a4d,{roughness:.86});const lm=mat(0x556e57,{roughness:.92});for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.18*s,10,8),lm);l.scale.set(.7,1.7,.5);l.position.set(x+Math.sin(i*1.4)*.2*s,.56*s+i*.045*s,z+Math.cos(i*1.4)*.2*s);l.rotation.z=i%2?.28:-.28;l.castShadow=true;world.add(l)}}
function luggage(x,z,color){box([.38,.58,.24],[x,.29,z],color,{roughness:.78});box([.16,.05,.035],[x,.63,z],0x313739,{roughness:.35,metalness:.5})}
function sofa(x,z,color){box([1.7,.44,.72],[x,.45,z],color,{roughness:.95});box([1.7,.68,.18],[x,.75,z-.28],color,{roughness:.95});box([.18,.44,.72],[x-.77,.53,z],color,{roughness:.95});box([.18,.44,.72],[x+.77,.53,z],color,{roughness:.95})}

function createCharacter(x,z,uniform,hair,role){
  const g=new THREE.Group();g.position.set(x,0,z);g.userData.role=role;g.userData.home=new THREE.Vector3(x,0,z);g.userData.walking=false;g.userData.phase=Math.random()*6;
  const skin=mat(0xd1a07b,{roughness:.9}),fabric=mat(uniform,{roughness:.88}),dark=mat(0x2d3437,{roughness:.86});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.3,.54,8,16),fabric);torso.scale.set(.95,1.08,.72);torso.position.y=1.28;torso.castShadow=true;g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.235,20,16),skin);head.position.y=1.92;g.add(head);
  const hm=new THREE.Mesh(new THREE.SphereGeometry(.242,20,16,0,Math.PI*2,0,Math.PI*.58),mat(hair,{roughness:.94}));hm.position.y=2;g.add(hm);
  const la=new THREE.Group(),ra=new THREE.Group();const ageo=new THREE.CylinderGeometry(.065,.065,.52,10);
  const lau=new THREE.Mesh(ageo,fabric);lau.position.y=-.26;la.add(lau);la.position.set(-.39,1.47,0);la.rotation.z=.12;g.add(la);
  const rau=new THREE.Mesh(ageo,fabric);rau.position.y=-.26;ra.add(rau);ra.position.set(.39,1.47,0);ra.rotation.z=-.12;g.add(ra);
  const legs=[];
  [-.14,.14].forEach(px=>{const pivot=new THREE.Group();pivot.position.set(px,.86,0);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.78,10),dark);leg.position.y=-.39;pivot.add(leg);const shoe=new THREE.Mesh(new THREE.BoxGeometry(.17,.07,.3),mat(0x15191a,{roughness:.75}));shoe.position.set(0,-.8,.07);pivot.add(shoe);legs.push(pivot);g.add(pivot)});
  if(role==="staff"){const badge=new THREE.Mesh(new THREE.BoxGeometry(.13,.16,.022),mat(0xf4f4f1,{roughness:.65}));badge.position.set(.18,1.36,.21);g.add(badge)}
  g.userData.parts={torso,head,leftArm:la,rightArm:ra,legs};world.add(g);return g
}
function resetPose(c){if(!c)return;c.rotation.set(0,0,0);const p=c.userData.parts;p.head.rotation.set(0,0,0);p.leftArm.rotation.set(0,0,.12);p.rightArm.rotation.set(0,0,-.12);p.legs.forEach(l=>l.rotation.set(0,0,0))}
function setPose(c,name){resetPose(c);if(!c)return;const p=c.userData.parts;if(name==="phone"){p.rightArm.rotation.z=-1.08;p.rightArm.rotation.x=-.33}else if(name==="screen"){p.head.rotation.y=-.45;p.leftArm.rotation.z=.55}else if(name==="point"){p.rightArm.rotation.z=-1.15;p.rightArm.rotation.x=-.65}else if(name==="clock"){p.head.rotation.y=.42;p.leftArm.rotation.z=.4}else if(name==="turn"){c.rotation.y=-1.08}else if(name==="upset"){p.leftArm.rotation.z=.72;p.rightArm.rotation.z=-.72}else if(name==="concerned"){p.head.rotation.z=-.12;p.leftArm.rotation.z=.42}else if(name==="relaxed"){p.head.rotation.x=.07}}

function dynamicBoard(){const c=document.createElement("canvas");c.width=560;c.height=380;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.85,1.28),new THREE.MeshStandardMaterial({map:t,roughness:.55}));m.userData.canvas=c;m.userData.texture=t;m.name="Transfer dashboard";return m}
function updateBoard(status,detail){const c=board.userData.canvas,x=c.getContext("2d");x.fillStyle="#20343a";x.fillRect(0,0,c.width,c.height);x.fillStyle="#9fb6b9";x.font="700 24px sans-serif";x.fillText("TRANSFER STATUS",34,48);x.fillStyle=status.includes("CONFIRMED")?"#a8d6b1":status.includes("CANCELLED")?"#f0ad9f":"#f0d3a1";x.font="800 44px sans-serif";x.fillText(status,34,108);x.fillStyle="#fff";x.font="600 26px sans-serif";x.fillText(detail,34,154);x.fillStyle="#88a2a6";x.font="600 21px sans-serif";x.fillText("Dinner reservation · 19:00",34,228);x.fillText("Weather · Heavy rain",34,268);board.userData.texture.needsUpdate=true}

function buildWorld(){
  world=new THREE.Group();scene.add(world);
  box([14.5,.18,10.7],[0,-.09,0],0xcfc7bd,{roughness:.92});box([14.5,4.6,.18],[0,2.3,-5.25],0xf0ece6,{roughness:.96});box([.18,4.6,10.7],[-7.16,2.3,0],0xebe7e1,{roughness:.96});box([.18,4.6,10.7],[7.16,2.3,0],0xebe7e1,{roughness:.96});
  for(let i=0;i<14;i++)box([.11,2.75,.09],[-2.55+i*.38,2.15,-5.12],0x8a6b51,{roughness:.7});
  box([4.9,1.15,1.15],[-1.5,.58,-1.15],0x795d47,{roughness:.66});box([4.96,.11,1.2],[-1.5,1.18,-1.15],0xe8e1d7,{roughness:.38});box([4.15,.55,.05],[-1.5,.64,-.56],0x9f8166,{roughness:.68});
  const rs=label("RECEPTION");rs.position.set(-1.5,2.55,-4.98);world.add(rs);
  monitor=box([.78,.48,.06],[-2.25,1.5,-1.03],0x20292d,{roughness:.26,metalness:.3,name:"PMS Monitor"});phone=box([.34,.12,.22],[-.85,1.29,-1.04],0x32383a,{roughness:.45,name:"Telefono reception"});box([.2,.1,.25],[-.25,1.29,-1.06],0x303536,{roughness:.35});
  box([4,.025,2.8],[3.65,.018,1.85],0xc7b8a4,{roughness:.98});sofa(3.7,1.35,0x72867a);sofa(3.7,2.55,0x667b72);box([1.25,.13,.82],[2.05,.37,1.94],0x8b6b50,{roughness:.62});cyl(.035,.035,1.65,[5.45,.82,2.65],0xb19573,{roughness:.25,metalness:.65});cyl(.30,.24,.42,[5.45,1.77,2.65],0xe8dbc9,{roughness:.92});
  const glass=new THREE.MeshPhysicalMaterial({color:0xa8c1cc,roughness:.1,transparent:true,opacity:.22,transmission:.35,thickness:.02});for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,3.1),glass);p.position.set(3.5+i*1.2,1.75,-5.08);world.add(p)}
  [3.05,4.25,5.45,6.65].forEach(x=>box([.06,3.2,.06],[x,1.75,-5.02],0x686f72,{roughness:.3,metalness:.7}));
  const rm=new THREE.LineBasicMaterial({color:0x8fb0bf,transparent:true,opacity:.55});for(let i=0;i<34;i++){const x=3+(i%10)*.42,y=.7+(i%6)*.55,z=-5.2-(i%3)*.04,g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,y+.38,z),new THREE.Vector3(x-.1,y,z)]);world.add(new THREE.Line(g,rm))}
  luggage(5.8,.8,0x73543d);luggage(6.25,1.25,0x465c70);
  box([2.2,.92,.78],[-4.9,.46,.55],0x88705c,{roughness:.7});box([2.26,.09,.84],[-4.9,.97,.55],0xe5ddd0,{roughness:.4});const cs=label("CONCIERGE","#566f72",620,48);cs.scale.set(.73,.73,.73);cs.position.set(-4.9,2.3,-.22);world.add(cs);
  board=dynamicBoard();board.position.set(-5,1.95,.45);board.rotation.y=.12;world.add(board);updateBoard("CANCELLED","Nessuna alternativa attiva");
  plant(-6.2,-3.6);plant(6.2,3.9,1.05);plant(4.9,-3.8,.85);
  staff=createCharacter(-1.55,-.1,0x2f5a60,0x2b2420,"staff");guestA=createCharacter(.75,.18,0x8b6955,0x46352a,"guest");guestB=createCharacter(1.55,.4,0x606a82,0x43312a,"guest");newGuest=createCharacter(6,.8,0x657260,0x2f2824,"guest");newGuest.visible=false;
  interactive.push(monitor,phone,board)
}

async function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0xdfe5e7);scene.fog=new THREE.Fog(0xdfe5e7,18,34);
  camera=new THREE.PerspectiveCamera(46,1,.1,100);camera.position.copy(desiredPos);
  renderer=new THREE.WebGLRenderer({canvas:UI.canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff8ee,0x6f7c82,1.7));const sun=new THREE.DirectionalLight(0xfff1dc,2.3);sun.position.set(7,10,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);const warm=new THREE.PointLight(0xffd6a6,15,9,2);warm.position.set(-1.4,3.1,-.6);scene.add(warm);const loungeLight=new THREE.PointLight(0xffddb5,10,7,2);loungeLight.position.set(3.8,2.8,2.2);scene.add(loungeLight);
  buildWorld();bind();resize();renderStep();animate();await loadResources();UI.loading.style.display="none"
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
function walk(char,target,speed){if(reduced){char.position.copy(target);return Promise.resolve()}return new Promise(resolve=>{char.userData.walking=true;char.userData.target=target.clone();char.userData.speed=speed;char.userData.resolve=resolve})}
function updateMotion(char,dt,t){if(!char||!char.visible)return;const p=char.userData.parts;if(char.userData.walking){const dir=char.userData.target.clone().sub(char.position),dist=dir.length();if(dist<.035){char.position.copy(char.userData.target);char.userData.walking=false;p.legs.forEach(l=>l.rotation.x=0);const r=char.userData.resolve;char.userData.resolve=null;if(r)r()}else{dir.normalize();char.position.addScaledVector(dir,Math.min(dist,char.userData.speed*dt));char.rotation.y=Math.atan2(dir.x,dir.z);const c=Math.sin(t*10);p.legs[0].rotation.x=c*.38;p.legs[1].rotation.x=-c*.38;p.leftArm.rotation.x=-c*.2;p.rightArm.rotation.x=c*.2}}else if(!reduced){p.torso.position.y=1.28+Math.sin(t*1.7+char.userData.phase)*.006;p.head.position.y=1.92+Math.sin(t*1.7+char.userData.phase)*.003}}
function appendLog(line){const d=document.createElement("div");d.className="log-item";d.innerHTML=`<div class="log-who">${esc(line.name)}<br><span style="color:#7b858b;font-weight:600">${esc(line.role)}</span></div><p class="log-line">${esc(line.text)}</p>`;UI.dialogueLog.appendChild(d)}
function toggleVoice(){state.voice=!state.voice;UI.voiceToggleBtn.classList.toggle("active-tool",state.voice);UI.voiceToggleBtn.textContent=state.voice?"🔊 Voce ON":"🔇 Voce OFF";if(!state.voice)stopSpeech()}
function speak(line,force=false){return new Promise(resolve=>{if(!("speechSynthesis" in window)||(!state.voice&&!force)){resolve();return}stopSpeech();const u=new SpeechSynthesisUtterance(line.text);const english=line.name.includes("Taylor");u.lang=english?"en-GB":"it-IT";u.rate=.96;u.pitch=line.actor==="staff"?1.03:.95;const voices=speechSynthesis.getVoices(),v=voices.find(x=>x.lang?.toLowerCase().startsWith(english?"en":"it"));if(v)u.voice=v;u.onend=resolve;u.onerror=resolve;speechSynthesis.speak(u)})}
function stopSpeech(){if("speechSynthesis" in window)speechSynthesis.cancel()}

async function loadResources(){try{const r=await fetch("./knowledge/resources.json",{cache:"no-store"});resources=await r.json();renderResourceList("")}catch(e){UI.resourceList.innerHTML="<p class='empty-log'>Dispense non disponibili. Verifica la cartella knowledge.</p>"}}
function openResources(id){UI.resourcesModal.classList.add("show");UI.resourcesModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");activeResource=id||activeResource||resources[0]?.id;renderResourceList(UI.resourceSearch.value);if(activeResource)showResource(activeResource)}
function closeResources(){UI.resourcesModal.classList.remove("show");UI.resourcesModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
function renderResourceList(q=""){const s=q.trim().toLowerCase();UI.resourceList.innerHTML="";const filtered=resources.filter(r=>!s||[r.title,r.category,r.summary,...(r.keywords||[])].join(" ").toLowerCase().includes(s));filtered.forEach(r=>{const b=document.createElement("button");b.className="resource-item";b.type="button";b.classList.toggle("active",r.id===activeResource);b.innerHTML=`<strong>${esc(r.title)}</strong><span>${esc(r.category)} · ${esc(r.summary)}</span>`;b.addEventListener("click",()=>showResource(r.id));UI.resourceList.appendChild(b)})}
function showResource(id){const r=resources.find(x=>x.id===id);if(!r)return;activeResource=id;if(!state.resources.includes(id))state.resources.push(id);UI.resourceCount.textContent=state.resources.length;let h=`<h3>${esc(r.title)}</h3><p class="resource-meta">${esc(r.category)} · ${esc(r.summary)}</p>`;for(const s of r.sections||[]){h+=`<h4>${esc(s.heading)}</h4>`;if(s.body)h+=`<p>${esc(s.body)}</p>`;if(s.bullets)h+=`<ul>${s.bullets.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`}if(r.callout)h+=`<div class="resource-callout">${esc(r.callout)}</div>`;UI.resourceContent.innerHTML=h;renderResourceList(UI.resourceSearch.value)}
function metrics(){const max=9,total=Object.values(state.scores).reduce((a,b)=>a+b,0);UI.total.textContent=`${total} pt`;[["problem",UI.problemValue,UI.problemBar],["communication",UI.communicationValue,UI.communicationBar],["priority",UI.priorityValue,UI.priorityBar],["adaptability",UI.adaptabilityValue,UI.adaptabilityBar]].forEach(([k,v,b])=>{v.textContent=state.scores[k];b.style.width=`${Math.min(100,state.scores[k]/max*100)}%`});UI.helpRequests.textContent=state.helpRequests;UI.decisionCount.textContent=state.decisionCount;UI.resourceCount.textContent=state.resources.length}
function complete(){const total=Object.values(state.scores).reduce((a,b)=>a+b,0),pct=Math.round(total/36*100),rank=Object.entries(state.scores).sort((a,b)=>b[1]-a[1]),names={problem:"Problem solving",communication:"Comunicazione",priority:"Gestione delle priorità",adaptability:"Adattabilità"};UI.situation.innerHTML=`<strong>Simulazione completata.</strong><br><br>Indice di performance: <strong>${pct}%</strong><br>Punto di forza prevalente: <strong>${names[rank[0][0]]}</strong><br>Area da rafforzare: <strong>${names[rank.at(-1)[0]]}</strong>.`;UI.choices.innerHTML="<div class='objective-box' style='margin-top:0'><span>DEBRIEFING</span><p>Il sistema ha osservato processo decisionale, tempi, supporti e risorse consultate.</p></div>";UI.continueBtn.classList.remove("show");UI.step.textContent="Completato";UI.dialogueState.textContent="Debriefing";window.ITSphereMetrics={scenarioId:"guest-experience-transfer-v3",decisionTimes:state.metrics.map(m=>m.decisionTimeSeconds),helpRequests:state.helpRequests,resourcesConsulted:[...state.resources],decisions:state.metrics.map(m=>m.choice),scores:{...state.scores},retries:0}}
function reset(){stopSpeech();Object.assign(state,{step:0,locked:false,scores:{problem:0,communication:0,priority:0,adaptability:0},helpRequests:0,decisionCount:0,remainingMinutes:40,stepStart:performance.now(),metrics:[],resources:[],skip:false,lastLine:null});selected=null;activeResource=null;UI.dialogueLog.innerHTML="<p class='empty-log'>Le conversazioni appariranno qui dopo una scelta.</p>";UI.dialogueOverlay.classList.remove("show");UI.actionOverlay.classList.remove("show");UI.decisionTime.textContent="0.0 s";UI.transferStatus.textContent="CANCELLED";UI.transferDetail.textContent="Fornitore non disponibile";UI.timer.textContent="40:00";if(staff)staff.position.copy(staff.userData.home);if(guestA)guestA.position.copy(guestA.userData.home);if(guestB)guestB.position.copy(guestB.userData.home);if(newGuest){newGuest.position.set(6,0,.8);newGuest.visible=false}updateBoard("CANCELLED","Nessuna alternativa attiva");renderStep();setView("overview")}
function hover(e){const r=UI.canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const h=raycaster.intersectObjects(interactive,false);hovered=h.length?h[0].object:null;if(hovered){UI.objectHint.textContent=desc(hovered.name);UI.objectHint.classList.add("show");UI.canvas.style.cursor="pointer"}else{UI.objectHint.classList.remove("show");UI.canvas.style.cursor=drag?"grabbing":"grab"}}
function desc(n){return{"PMS Monitor":"PMS Monitor · verifica prenotazioni e disponibilità","Telefono reception":"Telefono reception · contatta fornitori o reparti","Transfer dashboard":"Dashboard concierge · consulta disponibilità transfer"}[n]||n}
function resize(){const r=UI.wrap.getBoundingClientRect(),h=Math.max(1,UI.canvas.clientHeight||r.height);renderer.setSize(Math.max(1,r.width),h,false);camera.aspect=r.width/h;camera.updateProjectionMatrix()}
function animate(){requestAnimationFrame(animate);const d=Math.min(clock.getDelta(),.05),f=reduced?1:1-Math.pow(.0008,d);camera.position.lerp(desiredPos,Math.min(1,f));lookTarget.lerp(desiredTarget,Math.min(1,f));camera.lookAt(lookTarget);const t=performance.now()*.001;[staff,guestA,guestB,newGuest].forEach(c=>updateMotion(c,d,t));renderer.render(scene,camera)}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

try{await init()}catch(err){console.error(err);UI.loading.innerHTML="<strong>Impossibile inizializzare il motore 3D.</strong><span>Apri il progetto tramite Live Server o GitHub Pages.</span>"}
