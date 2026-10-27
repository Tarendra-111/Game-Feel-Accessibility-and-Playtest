'use strict';
// Single source for all four task builds. Lines like //@if N ... //@else ... //@end are resolved by tools/build.js:
// a block is included in task builds >= N. Search "TASK n" to see what each task adds.
const $=id=>document.getElementById(id),cv=$('c'),X=cv.getContext('2d'),S=480,PI=Math.PI;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),col={};
const readCols=()=>{const s=getComputedStyle(document.documentElement);for(const k of['bg','card','tile','fg','beam','lit','acc','bad','mir','wall'])col[k]=s.getPropertyValue('--'+k).trim()};
readCols();matchMedia('(prefers-color-scheme:dark)').addEventListener('change',readCols);
const GLOW=1; // TASK 4: glow effects on
const DPR=1;
let li=0,G,N,need,moves,par,prev,ang,tn=0,lastT=0;
let cfg={mute:false,reduced:false,stars:[]};
cfg.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches; // TASK 4: respect OS setting
let parts=[],shake=0,cur={x:0,y:0},kb=false;
// ===== TASK 3: persistence (settings + level stars only) and state machine =====
let st='',limit,und;
try{Object.assign(cfg,JSON.parse(localStorage.getItem('lumen-v1')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('lumen-v1',JSON.stringify(cfg))}catch(e){}};
const T={'':['menu'],menu:['select'],select:['menu','playing'],playing:['playing','paused','won','lost','select'],paused:['playing','select'],won:['playing','select'],lost:['playing','select']};
// ===== TASK 2: core loop (flip mirrors, trace beam, light every target) =====
const flip=(x,y)=>{G[y][x]=G[y][x]=='m'?'n':'m'};
function load(i){li=i;G=LV[i].g.map(r=>[...r]);N=G.length;need=G.flat().filter(c=>c=='T'||c=='C').length;par=LV[i].par;moves=0;
ang=G.map(r=>r.map(c=>c=='m'||c=='a'?-PI/4:PI/4));prev=trace(G).hit;
limit=par*2+3;und=[];
parts=[];shake=0;cur={x:0,y:0};
outer:for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(G[y][x]=='m'||G[y][x]=='n'){cur={x,y};break outer}
hud('Level '+(li+1)+': light every ring and crystal.')}
function rotate(x,y){const c=G[y][x];if(c!='m'&&c!='n')return;
if(st!='playing')return;
flip(x,y);moves++;
und.push([x,y]);
beep(420+(moves%4)*40);
const h=trace(G).hit;
for(const k of h)if(!prev.has(k)){const[a,b]=k.split(',');burst(+a,+b);beep(880,.15)}
prev=h;hud();
if(h.size==need)onWin();
else if(moves>=limit)onLose();
}
function hud(m){
$('hud').textContent=`Level ${li+1} · Moves ${moves}/${limit} · Par ${par} · Lit ${prev.size}/${need}`;
if(m)$('msg').textContent=m}
// TASK 3: scoring (stars vs par), lose by move limit, undo
function onWin(){const s=moves<=par?3:moves<=par+2?2:1;cfg.stars[li]=Math.max(cfg.stars[li]||0,s);save();
[523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,.15),i*120));
go('won')}
function onLose(){
shake=1;beep(130,.3,'sawtooth');
go('lost')}
function undoMove(){if(st!='playing'||!und.length)return;const[x,y]=und.pop();flip(x,y);moves--;prev=trace(G).hit;
beep(300);
hud('Undid a move.')}
// ===== TASK 4: game feel (particles, synthesized sound with mute) =====
const burst=(cx,cy)=>{if(cfg.reduced)return;const c=S/N;for(let k=0;k<16;k++){const a=Math.random()*7,v=60+Math.random()*140;parts.push({x:(cx+.5)*c,y:(cy+.5)*c,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:.6})}};
let ac;function beep(f,d=.08,ty='sine'){if(cfg.mute)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),a=ac.createGain();o.type=ty;o.frequency.value=f;a.gain.setValueAtTime(.07,ac.currentTime);a.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(a);a.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
// ===== rendering =====
const rr=(x,y,w,h,r)=>{X.beginPath();X.roundRect(x,y,w,h,r)};
function draw(dt){
X.setTransform(DPR,0,0,DPR,0,0);X.clearRect(0,0,S,S);if(!G)return;
const c=S/N,t=trace(G),h=t.hit;
if(shake>0&&!cfg.reduced)X.translate((Math.random()-.5)*10*shake,(Math.random()-.5)*10*shake);
X.fillStyle=col.tile;for(let y=0;y<N;y++)for(let x=0;x<N;x++){rr(x*c+3,y*c+3,c-6,c-6,9);X.fill()}
X.lineCap='round';X.shadowColor=col.beam;X.shadowBlur=14*GLOW;X.strokeStyle=col.beam;X.lineWidth=c*.08;
if(!cfg.reduced){X.setLineDash([c*.3,c*.1]);X.lineDashOffset=-tn*70}
for(const s of t.segs){X.beginPath();X.moveTo((s[0]+.5)*c,(s[1]+.5)*c);X.lineTo((s[2]+.5)*c,(s[3]+.5)*c);X.stroke()}
X.setLineDash([]);X.shadowBlur=0;
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=G[y][x];if(k=='.')continue;
X.save();X.translate((x+.5)*c,(y+.5)*c);const L=h.has(x+','+y);
if(k=='#'){X.fillStyle=col.wall;rr(-c*.4,-c*.4,c*.8,c*.8,6);X.fill()}
else if('RDLU'.includes(k)){X.shadowColor=col.beam;X.shadowBlur=16*GLOW;X.fillStyle=col.beam;X.beginPath();X.arc(0,0,c*.3,0,7);X.fill();X.shadowBlur=0;X.rotate('RDLU'.indexOf(k)*PI/2);X.fillStyle=col.card;X.beginPath();X.moveTo(c*.17,0);X.lineTo(-c*.08,-c*.14);X.lineTo(-c*.08,c*.14);X.fill()}
else if(k=='T'){X.lineWidth=c*.07;X.strokeStyle=L?col.lit:col.fg;X.shadowColor=col.lit;X.shadowBlur=(L?18:0)*GLOW;X.beginPath();X.arc(0,0,c*.3,0,7);X.stroke();X.fillStyle=L?col.lit:col.fg;X.beginPath();X.arc(0,0,L?c*.3:c*.08,0,7);X.fill()}
else if(k=='C'){X.lineWidth=c*.06;X.strokeStyle=L?col.lit:col.fg;X.shadowColor=col.lit;X.shadowBlur=(L?18:0)*GLOW;X.beginPath();X.moveTo(0,-c*.32);X.lineTo(c*.24,0);X.lineTo(0,c*.32);X.lineTo(-c*.24,0);X.closePath();if(L){X.fillStyle=col.lit;X.fill()}X.stroke()}
else if(k=='S'){X.rotate(PI/4);X.fillStyle=col.acc;X.shadowColor=col.acc;X.shadowBlur=10*GLOW;rr(-c*.24,-c*.24,c*.48,c*.48,5);X.fill();X.shadowBlur=0;X.strokeStyle=col.card;X.lineWidth=3;X.beginPath();X.moveTo(-c*.14,0);X.lineTo(c*.14,0);X.moveTo(0,-c*.14);X.lineTo(0,c*.14);X.stroke()}
else{const r=k=='m'||k=='n';X.rotate(r?ang[y][x]:(k=='a'?-PI/4:PI/4));X.strokeStyle=r?col.mir:col.wall;X.lineWidth=c*.11;X.beginPath();X.moveTo(-c*.38,0);X.lineTo(c*.38,0);X.stroke();if(r){X.fillStyle=col.card;X.beginPath();X.arc(0,0,c*.07,0,7);X.fill()}}
X.restore()}
for(const q of parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;X.globalAlpha=Math.max(0,q.t/.6);X.fillStyle=col.lit;X.fillRect(q.x,q.y,4,4)}
X.globalAlpha=1;parts=parts.filter(q=>q.t>0);
if(st=='playing'&&(kb||document.activeElement==cv)){X.strokeStyle=col.fg;X.lineWidth=3;rr(cur.x*c+1,cur.y*c+1,c-2,c-2,10);X.stroke()}
}
function tick(t){const dt=Math.min((t-lastT)/1000,.05);lastT=t;tn=t/1000;
shake=Math.max(0,shake-dt*3);
if(G)for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=G[y][x];if(k=='m'||k=='n'){const tg=k=='m'?-PI/4:PI/4;
ang[y][x]=cfg.reduced?tg:ang[y][x]+(tg-ang[y][x])*Math.min(1,dt*18);
}}
draw(dt);requestAnimationFrame(tick)}
// ===== TASK 3: UI per state =====
function go(s){if(!(T[st]||[]).includes(s))return;st=s;render()}
function render(){const ov=$('ov');if(st=='playing'){ov.hidden=true;cv.focus({preventScroll:true});return}
const b=(a,t,p,i)=>`<button${p?' class="p"':''} data-a="${a}"${i===undefined?'':' data-i="'+i+'"'}>${t}</button>`,star=n=>'★'.repeat(n)+'☆'.repeat(3-n);let h='';
const XM='',XS='';
if(st=='menu')h=`<h1 id="ot">LUMEN</h1><p>Flip mirrors to bend the beam. Light every ring and crystal before your moves run out.</p><p>Mouse/touch: tap a mirror. Keys: arrows, Space, U undo, P pause.</p>${b('sel','Play',1)}${XM}`;
if(st=='select')h=`<h1 id="ot">Levels</h1><div id="lv">${LV.map((l,i)=>{const s=cfg.stars[i]||0,ok=i==0||cfg.stars[i-1];return `<button data-a="lvl" data-i="${i}"${ok?'':' disabled'} aria-label="Level ${i+1}, ${ok?s+' of 3 stars':'locked'}">${ok?(i+1)+'<br>'+star(s):'🔒'}</button>`}).join('')}</div>${b('menu','Back')}${XS}`;
if(st=='paused')h=`<h1 id="ot">Paused</h1>${b('res','Resume',1)}${b('rst','Restart level')}${b('sel','Levels')}`;
if(st=='won')h=`<h1 id="ot">${li==LV.length-1?'All cleared!':'Level cleared!'}</h1><p>${star(moves<=par?3:moves<=par+2?2:1)}<br>${moves} moves (par ${par})</p>${li<LV.length-1?b('next','Next level',1):''}${b('rst','Replay')}${b('sel','Levels')}`;
if(st=='lost')h=`<h1 id="ot">Out of moves</h1><p>The limit was ${limit}; par is ${par}. Plan the beam path first.</p>${b('rst','Retry',1)}${b('sel','Levels')}`;
ov.innerHTML=h;ov.querySelector('button:not([disabled])').focus()}
const act={sel(){go('select')},menu(){go('menu')},lvl(i){load(i);go('playing')},res(){go('playing')},
rst(){if(G&&st!='menu'&&st!='select'){load(li);go('playing')}},next(){load(li+1);go('playing')}};
$('ov').onclick=e=>{const b=e.target.closest('button');if(b&&!b.disabled)act[b.dataset.a](+b.dataset.i)};
$('ub').onclick=undoMove;$('rb').onclick=act.rst;$('pb').onclick=()=>go('paused');$('lb').onclick=()=>go('select');
document.addEventListener('visibilitychange',()=>{if(document.hidden)go('paused')});
// ===== TASK 4: accessibility (keyboard cursor, screen-reader text, mute, reduced motion) =====
$('mu').checked=cfg.mute;$('rm').checked=cfg.reduced;
$('mu').onchange=e=>{cfg.mute=e.target.checked;save()};$('rm').onchange=e=>{cfg.reduced=e.target.checked;save()};
const NM={m:'rotatable mirror /',n:'rotatable mirror \\',a:'fixed mirror /',b:'fixed mirror \\',S:'splitter','#':'wall',T:'target ring',C:'crystal','.':'empty'};
const desc=()=>`Row ${cur.y+1}, column ${cur.x+1}: ${NM[G[cur.y][cur.x]]||'emitter'}`;
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*N),y=Math.floor((e.clientY-r.top)/r.height*N);if(x<0||y<0||x>=N||y>=N)return;
kb=false;cur={x,y};
rotate(x,y)});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();
if(st=='playing'){
const d={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]}[k];
if(d){cur.x=clamp(cur.x+d[0],0,N-1);cur.y=clamp(cur.y+d[1],0,N-1);kb=true;$('msg').textContent=desc();e.preventDefault();return}
if((k==' '||k=='enter')&&document.activeElement==cv){e.preventDefault();kb=true;rotate(cur.x,cur.y);return}
if(k=='u'||k=='z')undoMove();if(k=='r')act.rst();if(k=='p'||k=='escape')go('paused')}
else if(st=='paused'&&(k=='p'||k=='escape'))go('playing');
});
// ===== boot =====
load(0);
go('menu');
requestAnimationFrame(tick);
