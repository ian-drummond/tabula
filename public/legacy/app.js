
"use strict";
/* ---------- constants ---------- */
const SPHERES=["💼 Veracross","🎓 Gordon College","🏕️ Asbury Grove","📚 Core Homeschool Learning","🏠 Personal"];
const DEFAULT_SPHERE="🏠 Personal";
const SPH_KEY={veracross:0,gordon:1,asbury:2,core:3,personal:4,home:4};
const WD=["S","M","T","W","R","F","S"],WDN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],WDL=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FIELDS=[["person","People"],["coll","Collection"],["event","Event"],["sphere","Sphere"],["kind","Kind"],["list","List"],["status","Status"],["star","Priority"],["carried","Migrated"],["month","Month"],["date","Logged"],["due","Due / day"],["source","Source"]];
const SORTS=[["date","Due / day"],["logged","Logged"],["text","Title"],["star","Priority"],["status","Status"],["created","Added"]];
const CAP=3;
/* ---------- interface icons: one 16-pt line set (docs/DESIGN.md: no emoji in the interface) ---------- */
const ICON={
 today:'<rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3"/><circle cx="8" cy="10.2" r="1.3" fill="currentColor" stroke="none"/>',
 inbox:'<path d="M2 9.5 4 3h8l2 6.5V13H2z"/><path d="M2 9.5h3.5l1 1.5h3l1-1.5H14"/>',
 review:'<circle cx="8" cy="8" r="6"/><path d="m5.5 8 1.8 1.8 3.5-3.5"/>',
 tasks:'<path d="M7 4h6.5M7 8h6.5M7 12h6.5"/><path d="m2 4 1 1 1.7-1.9M2 8l1 1 1.7-1.9M2 12l1 1 1.7-1.9"/>',
 next:'<path d="M3 8h9.5M9 4.5 12.5 8 9 11.5"/>',
 waiting:'<circle cx="8" cy="8" r="6"/><path d="M8 4.6V8l2.3 1.5"/>',
 someday:'<path d="M4.3 12a3 3 0 0 1 .3-6A4 4 0 0 1 12 6.4 2.8 2.8 0 0 1 11.8 12z"/>',
 notes:'<path d="M4 2h5.5L13 5.5V14H4z"/><path d="M9.5 2v3.5H13M6.5 8.5h4M6.5 11h4"/>',
 people:'<circle cx="8" cy="5.5" r="2.5"/><path d="M3 14a5 5 0 0 1 10 0"/>',
 events:'<rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3"/><path d="M5.5 9.5h2M5.5 11.5h5"/>',
 colls:'<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>',
 images:'<rect x="2" y="3" width="12" height="10" rx="2"/><circle cx="6" cy="7" r="1.3"/><path d="m2.5 12 3.5-3 2.5 2 2-1.5 3 2.5"/>',
 view:'<path d="M4.5 2h7v12L8 11.2 4.5 14z"/>',
 gear:'<circle cx="8" cy="8" r="2.2"/><path d="M8 1.8v1.7M8 12.5v1.7M1.8 8h1.7M12.5 8h1.7M3.6 3.6l1.2 1.2M11.2 11.2l1.2 1.2M3.6 12.4l1.2-1.2M11.2 4.8l1.2-1.2"/>',
 sidebar:'<rect x="2" y="3" width="12" height="10" rx="2"/><path d="M6.2 3v10"/>',
 chev:'<path d="m6 4 4 4-4 4"/>',
 more:'<circle cx="3.5" cy="8" r="1.2" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/><circle cx="12.5" cy="8" r="1.2" fill="currentColor" stroke="none"/>',
 plus:'<path d="M8 3v10M3 8h10"/>',
 check:'<path d="m3.5 8.5 3 3 6-7"/>',
 menu:'<path d="M2.5 4h11M2.5 8h11M2.5 12h11"/>',
 back:'<path d="M13 8H3M7.5 3.5 3 8l4.5 4.5"/>',
 close:'<path d="M4 4l8 8M12 4l-8 8"/>',
 expand:'<path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"/>',
 fwd:'<path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5"/>'
};
function ic(n,c){return`<svg class="ic${c?" "+c:""}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||""}</svg>`}
function sphName(sp){return String(sp).replace(/^[\p{Extended_Pictographic}️‍\s]+/u,"")||String(sp)}
/* ---------- state ---------- */
const S={imgs:[],assets:null,reveal:{},relTab:"event",orgs:[],items:[],people:[],events:[],colls:[],props:[],views:[],ready:false,db:null,sample:null,mcp:null,dl:null,dict:null,
  view:"daily",ptabs:[],showTr:{},arg:"",date:today(),range:"day",expanded:{},moreOpen:{},detailMode:'auto',mopen:{},prioOpen:false,dgroup:null,filt:{},fq:{},modes:{},groups:{},sorts:{},tabs:{},base:{},fields:{chips:1,detail:1,due:1},
  q:"",busy:"",loadErr:"",collapsed:{},trail:false};
let SEED_TRIED=false,qaTarget=null;
function today(){return ymd(new Date())}
function ymd(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function pd(s){const[a,b,c]=s.split("-").map(Number);return new Date(a,b-1,c)}
function addDays(s,n){const d=pd(s);d.setDate(d.getDate()+n);return ymd(d)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"x"}
function weekStart(s){const d=pd(s);d.setDate(d.getDate()-d.getDay());return ymd(d)}
function weekNo(s){const d=pd(s),j=new Date(d.getFullYear(),0,1);const st=new Date(j);st.setDate(j.getDate()-j.getDay());return Math.floor((d-st)/604800000)+1}
function dlabel(s){return s+" ("+WDN[pd(s).getDay()]+")"}
function longDate(s){const d=pd(s);return WDL[d.getDay()]+", "+MON[d.getMonth()]+" "+d.getDate()}
function shortDate(s){const d=pd(s);return MON[d.getMonth()]+" "+d.getDate()}
function rel(s){if(!s)return"";const t=today(),n=Math.round((pd(s)-pd(t))/86400000);
  if(n===0)return"Today";if(n===1)return"Tomorrow";if(n===-1)return"Yesterday";if(n>1&&n<7)return WDN[pd(s).getDay()];return shortDate(s)}
function toast(m,ms){const t=document.getElementById("toast");t.textContent=m;t.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display="none",ms||2800)}
function hue(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h}
function initials(n){const p=String(n).trim().split(/\s+/);return((p[0]||"?")[0]+(p.length>1?p[p.length-1][0]:"")).toUpperCase()}
function avatar(n,cls){return`<i class="av ${cls||""}" style="background:hsl(${hue(n)} 50% 42%)">${esc(initials(n))}</i>`}
/* ---------- data layer ---------- */
const COLS={caps:"caps",imgs:"imgs",orgs:"orgs",items:"items",people:"people",events:"events",colls:"colls",props:"props",views:"views"};
function ref(c,id){return S.db.doc(c+"/"+id)}
async function save(c,obj){if(!S.db){toast("Database not available");return}try{await ref(c,obj.id).set({...obj})}catch(e){toast("Save failed: "+(e.message||e.code))}}
async function del(c,id){try{await ref(c,id).delete()}catch(e){toast("Delete failed")}}
function upsertLocal(c,obj){if(c==="items")S._m=null;if((c==="people"||c==="colls")){const ak="arch_"+c;S[ak]=(S[ak]||[]).filter(x=>x.id!==obj.id);if(obj.archivedAt){S[c]=S[c].filter(x=>x.id!==obj.id);S[ak].push(obj);return}}const a=S[c];const i=a.findIndex(x=>x.id===obj.id);if(i<0)a.push(obj);else a[i]=obj}
async function saveItem(it){fixTime(it);if(!it.loggedAt&&!it.logged&&it.created&&Date.now()-it.created<60000)it.loggedAt=localIso();it.people=it.people||[];it.events=it.events||[];it.colls=it.colls||[];it.updated=Date.now();upsertLocal("items",it);await save("items",it);render()}
function subscribe(){
  const timer=setTimeout(()=>{if(!S.ready){S.loadErr="Still waiting for the database… your data may be out of date.";render()}},10000);
  let got=new Set();const names=Object.keys(COLS);
  names.forEach(c=>{
    S.db.collection(c).onSnapshot(snap=>{
      if(c==="items")S._m=null;
      S[c]=snap.docs.map(d=>{const o={id:d.id,...d.data()};if(c==="items"){o.people=o.people||[];o.events=o.events||[];o.colls=o.colls||[]}if(c==="people"&&o.fullName!==undefined){if(o.fullName&&o.fullName!==o.name&&o.fullName.split(/\s+/).length>=o.name.split(/\s+/).length){o.akas=[...new Set([...(o.akas||[]),o.name])];o.name=o.fullName}delete o.fullName;o._fix=1}return o});
      if(c==="people"||c==="colls"){S["arch_"+c]=S[c].filter(o=>o.archivedAt);S[c]=S[c].filter(o=>!o.archivedAt)}
      if(c==="people")S.people.filter(x=>x._fix).forEach(x=>{delete x._fix;save("people",x)});
      got.add(c);
      if(got.size>=names.length&&!S.ready){S.ready=true;clearTimeout(timer);S.loadErr="";Promise.resolve(maybeSeed()).then(()=>autoDedupeTasks()).then(()=>sweepTimes()).then(()=>reassignWhose().catch(()=>{})).then(()=>sweepPeople()).then(()=>purgeArchive()).then(()=>loadColors()).then(()=>loadTrust()).then(()=>render()).catch(()=>{})}
      render();
    },err=>{S.loadErr="Database error: "+(err.code||err.message);render()});
  });
}
async function maybeSeed(){
  if(SEED_TRIED)return;SEED_TRIED=true;
  const SEEDV=5;let meta=null;
  try{const m=await S.db.doc("meta/seed").get();meta=m.exists?m.data():null}catch(e){}
  const ver=meta?meta.v:(S.items.length?1:0);
  if(ver>=SEEDV)return;
  try{
    if(window.tabulaApp)return;const r=await fetch("seed.json");if(!r.ok)return;const seed=await r.json();
    if(ver<5){
      const old=S.items.filter(i=>/^ev/.test(i.id));
      const edited=old.filter(i=>i.updated),fresh=old.filter(i=>!i.updated);
      S.busy="Upgrading imported logs (deduped, one task = one record)…";render();
      for(let i=0;i<fresh.length;i+=15)await Promise.all(fresh.slice(i,i+15).map(o=>del("items",o.id)));
      S.items=S.items.filter(i=>!fresh.includes(i));
      for(const c of ["people","events","colls"]){const o=S[c].filter(x=>/^(p|e|c)-/.test(x.id)&&!x.edited);for(let i=0;i<o.length;i+=15)await Promise.all(o.slice(i,i+15).map(x=>del(c,x.id)));S[c]=S[c].filter(x=>!o.includes(x))}
      const am={};(seed.people||[]).forEach(pp=>(pp.akas||[]).forEach(a=>am["p-"+slug(a)]=pp.id));
      for(const it of edited){const np=[...new Set((it.people||[]).map(x=>am[x]||x))];if(np.join()!==(it.people||[]).join()){it.people=np;await save("items",it)}}
      const em=seed.entityMap||{};for(const it of edited){const ne=[...new Set((it.events||[]).map(x=>em[x]||x))];if(ne.join()!==(it.events||[]).join()){it.events=ne;await save("items",it)}}
      for(const sp of seed.people||[]){const ex=S.people.find(x=>x.id===sp.id);if(ex&&ex.edited){let ch=false;for(const f of["email","phone","company","role","rel"])if(!ex[f]&&sp[f]){ex[f]=sp[f];ch=true}if(ch)await save("people",ex)}}
      seed.items=(seed.items||[]).filter(n=>!edited.some(e=>e.date===n.date&&e.kind===n.kind&&sameEv(e.text,n.text)));
      seed.people=(seed.people||[]).filter(pp=>!S.people.some(x=>x.id===pp.id));
      seed.events=(seed.events||[]).filter(pp=>!S.events.some(x=>x.id===pp.id));
      seed.colls=(seed.colls||[]).filter(pp=>!S.colls.some(x=>x.id===pp.id));
    }
    await importBundle(seed,"Seeded from Evernote Bullet Journal");
    await S.db.doc("meta/seed").set({v:SEEDV,at:Date.now()});
  }catch(e){S.busy="";toast("Seeding failed: "+(e.code||e.message))}
}
async function importBundle(b,msg){
  const jobs=[];
  for(const c of Object.keys(COLS)){(b[c]||[]).forEach(o=>{if(!o.id)o.id=uid(c[0]);jobs.push([c,o])})}
  S.busy="Importing "+jobs.length+" records…";render();
  for(let i=0;i<jobs.length;i+=15)await Promise.all(jobs.slice(i,i+15).map(([c,o])=>save(c,o)));
  if(b.meta&&S.db){try{if(Array.isArray(b.meta.spheres)&&b.meta.spheres.length)await S.db.doc("meta/spheres").set({list:b.meta.spheres});if(b.meta.trust){S.trust=b.meta.trust;await saveTrust()}if(b.meta.maint)await S.db.doc("meta/maint").set(b.meta.maint)}catch(e){}}
  S.busy="";toast((msg||"Imported")+": "+jobs.length+" records");render();
}
/* ---------- duplicates & helpers ---------- */
const TPAT="(?:noon|midnight|\\d{1,2}(?::\\d{2})?\\s*(?:[ap]\\.?m\\.?|[ap](?![a-z]))|(?:[01]?\\d|2[0-3]):[0-5]\\d)";
const TIMERE=new RegExp("^\\s*("+TPAT+"(?:\\s*[-–]\\s*"+TPAT+")?)\\s*[-–:]?\\s+(?=\\S)","i");
const TFIND=new RegExp("\\b("+TPAT+")","i");
function normTime(s){s=String(s||"").trim();if(/^all[ -]?day$/i.test(s))return"all day";const m=s.match(new RegExp("^[^\\d\\w]*("+TPAT+")","i"));if(!m)return"";let t=m[1].toLowerCase().replace(/\./g,"");
  if(t==="noon")return"12:00 PM";if(t==="midnight")return"12:00 AM";
  const x=t.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])?m?$/);if(!x)return"";let h=+x[1],mi=x[2]||"00",ap=x[3];
  if(!ap){if(h>23)return"";ap=h>=12?"p":"a";if(h>12)h-=12;if(h===0)h=12}else{if(h<1||h>12)return""}
  return h+":"+mi+" "+(ap==="p"?"PM":"AM")}
function normRange(s){s=String(s||"").trim();const parts=s.split(/\s*[-–]\s*/);if(parts[1]&&/^\d{1,2}(:\d\d)?$/.test(parts[0])){const ap=(parts[1].match(/[ap]\.?m?\.?$/i)||[""])[0];if(ap)parts[0]+=ap}const a=normTime(parts[0]);if(!a)return s;const b=parts[1]?normTime(parts[1]):"";return b?a+" – "+b:a}
function cleanTitle(it){const m=String(it.text||"").match(TIMERE);return{t:m?it.text.replace(TIMERE,""):it.text,time:normRange(it.time||(m?m[1]:""))}}
function evKey(t){return String(t||"").toLowerCase().replace(TIMERE,"").replace(/^\s*ian:\s*/,"").replace(/@.*$/,"").replace(/<>/g," ").replace(/\bwith\b/g,"w").replace(/\bw\/\s*/g,"w ").replace(/[^a-z0-9]+/g," ").trim()}
function sameEv(a,b){const x=evKey(a),y=evKey(b);if(!x||!y)return false;if(x===y)return true;if(x.length>=8&&y.length>=8&&(x.startsWith(y)||y.startsWith(x)))return true;const A=new Set(x.split(" ")),B=new Set(y.split(" "));let c=0;A.forEach(w=>B.has(w)&&c++);return c/Math.max(A.size,B.size)>=0.8&&Math.min(A.size,B.size)>=2}
const richer=(a,b)=>((b.detail||"").length-(a.detail||"").length)||((b.people||[]).length-(a.people||[]).length)||((a.created||0)-(b.created||0));
function dupGroups(list){
  const out=[],byKey=new Map();
  list.filter(i=>i.kind!=="note"||false).forEach(i=>{const k=i.date+"|"+i.kind;if(!byKey.has(k))byKey.set(k,[]);byKey.get(k).push(i)});
  byKey.forEach(arr=>{const used=new Set();arr.forEach(a=>{if(used.has(a.id))return;const g=[a];used.add(a.id);arr.forEach(b=>{if(!used.has(b.id)&&sameEv(a.text,b.text)){g.push(b);used.add(b.id)}});if(g.length>1)out.push(g.sort(richer))})});
  return out;
}
function dedupeShow(list){const drop=new Set();dupGroups(list).forEach(g=>g.slice(1).forEach(i=>drop.add(i.id)));return list.filter(i=>!drop.has(i.id))}
function pendingMerges(){return new Set(S.props.filter(p=>(p.status==="pending"||p.status==="snoozed")&&p.kind==="merge").map(p=>p.keepId))}
function dupCount(){const pm=pendingMerges();return dupGroups(V().filter(i=>i.kind!=="note")).filter(g=>!pm.has(g[0].id)).length}
async function proposeMerges(date){
  const pm=pendingMerges();let n=0;
  for(const g of dupGroups(V().filter(i=>i.kind!=="note"&&(!date||i.date===date)))){
    if(pm.has(g[0].id))continue;
    await addProp({kind:"merge",date:g[0].date,keepId:g[0].id,dropIds:g.slice(1).map(i=>i.id),reason:"Same "+g[0].kind+" appears "+g.length+"× on this day",item:{text:g[0].text}});n++}
  return n;
}
async function applyMerge(p){
  const keep=S.items.find(i=>i.id===p.keepId);if(!keep)return;
  for(const did of p.dropIds||[]){const o=S.items.find(i=>i.id===did);if(!o)continue;
    ["people","events","colls"].forEach(f=>keep[f]=[...new Set([...(keep[f]||[]),...(o[f]||[])])]);
    if(o.detail&&!(keep.detail||"").includes(o.detail))keep.detail=((keep.detail||"")+"\n"+o.detail).trim();
    if(!keep.time&&o.time)keep.time=o.time;
    if(o.star)keep.star=true;
    S.items=S.items.filter(i=>i.id!==did);delete S.expanded[did];await del("items",did)}
  const c=cleanTitle(keep);if(c.t!==keep.text&&keep.kind==="event"){keep.text=c.t;keep.time=c.time}
  await saveItem(keep);
}
function toastUndo(m,fn,editFn){const t=document.getElementById("toast");t.innerHTML=esc(m)+' <button id="tundo" style="margin-left:8px">Undo</button>'+(editFn?' <button id="tedit">Edit</button>':"");t.style.display="block";clearTimeout(toast.t);
  document.getElementById("tundo").onclick=async()=>{t.style.display="none";await fn()};if(editFn)document.getElementById("tedit").onclick=()=>{t.style.display="none";editFn()};toast.t=setTimeout(()=>t.style.display="none",8000)}
function lastName(p){const n=String(p.name).trim().split(/\s+/);return(n.length>1?n[n.length-1]:n[0]).toLowerCase()}
function firstName(p){return String(p.name).trim().split(/\s+/)[0].toLowerCase()}
function personStats(p){
  const its=V().filter(i=>(i.people||[]).includes(p.id));
  const open=its.filter(isOpen).sort((a,b)=>(a.due||a.date).localeCompare(b.due||b.date));
  const last=its.map(i=>i.date).sort().pop();
  return{n:its.length,open,last}
}
function mergeSuggest(){
  const out=[];S.people.forEach(a=>{if(String(a.name).trim().split(/\s+/).length!==1)return;
    const m=S.people.filter(b=>b.id!==a.id&&String(b.name).trim().split(/\s+/).length>1&&firstName(b)===a.name.toLowerCase());
    if(m.length===1)out.push([a,m[0]])});return out;
}
async function mergePeople(fromId,toId){
  const from=S.people.find(p=>p.id===fromId),to=S.people.find(p=>p.id===toId);if(!from||!to||from===to)return;
  for(const it of S.items.filter(i=>(i.people||[]).includes(fromId))){it.people=[...new Set(it.people.map(x=>x===fromId?toId:x))];it.updated=Date.now();await save("items",it)}
  to.akas=[...new Set([...(to.akas||[]),from.name,...(from.akas||[])])];to.edited=true;
  for(const f of["email","phone","company","org","orgRel","role","rel","rels","context","nick","photo","photoImg"])if((!to[f]||(Array.isArray(to[f])&&!to[f].length))&&from[f])to[f]=from[f];
  await save("people",to);S.people=S.people.filter(p=>p.id!==fromId);await del("people",fromId);toast(from.name+" merged into "+to.name);render();
}
function prioAdvice(date){
  const open=V().filter(i=>isOpen(i)&&(i.date===date||i.due===date||(date===today()&&overdue(i))));
  const starred=open.filter(i=>i.star);
  const cand=open.filter(i=>!i.star).map(i=>{let sc=0,why=[];
    if(i.due&&i.due<=date){sc+=4;why.push(i.due<date?"overdue":"due today")}
    const c=carriedN(i);if(c){sc+=Math.min(c,4);why.push("migrated "+c+"×")}
    if(i.monthly){sc-=3}if((i.people||[]).length){sc+=1;why.push("involves "+pname(i.people[0]))}
    if(/\b(send|submit|deadline|call|email|schedule|set mtg|book|pay)\b/i.test(i.text)){sc+=1;why.push("concrete action")}
    return{i,sc,why:why.join(" · ")||"open on this day"}}).sort((a,b)=>b.sc-a.sc).slice(0,5);
  return{starred,cand,room:Math.max(0,CAP-starred.length)};
}
function prioPanel(date){
  const a=prioAdvice(date);
  const line=(i,why,btn)=>`<div class="it" data-id="${esc(i.id)}">${leadIcon(i)}<div class="mid"><div class="ttl"><span data-act="edit">${esc(i.text)}</span></div><div class="dt">${esc(why)}</div></div><button data-act="star" data-id="${esc(i.id)}">${btn}</button></div>`;
  return`<div class="panel"><h2>Priorities for ${esc(shortDate(date))} <span class="c">${a.starred.length} of ${CAP}</span><span class="sp"></span><button class="lnk" data-act="prio">Close</button></h2>
  <p class="mute" style="margin:0 0 6px">Keep ${CAP} or fewer ★ per day so the day stays focused. ${a.starred.length>CAP?"You are over the cap: un-star "+(a.starred.length-CAP)+".":a.room?"Room for "+a.room+" more.":"The cap is full: un-star one to add another."}</p>
  ${a.starred.length?`<div class="sub">Starred now</div>`+a.starred.map(i=>line(i,"keep, or lower if the day is crowded","★ Un-star")).join(""):""}
  ${a.cand.length?`<div class="sub">Suggested to star</div>`+a.cand.map(c=>line(c.i,c.why,"☆ Star")).join(""):`<p class="mute">No other open tasks on this day.</p>`}</div>`;
}
/* ---------- item helpers ---------- */
const fname=id=>{const p=S.people.find(p=>p.id===id)||(S.arch_people||[]).find(p=>p.id===id)||{};return p.name||id};
const pname=id=>{const p=S.people.find(p=>p.id===id)||(S.arch_people||[]).find(p=>p.id===id)||{};return p.name||id};
const ename=id=>{const it=itemById(id);return it?evLabel(it):id};
const cname=id=>(S.colls.find(p=>p.id===id)||{}).name||id;
const monthOf=d=>d?d.slice(0,7):"";
/* A task is ONE record. Carrying it forward moves the record (history keeps the earlier days); legacy "migrated" stubs are hidden everywhere. */
const vis=i=>i.status!=="migrated"&&!i.archivedAt;
const heldDone=i=>!!(S.hold&&S.hold[i.id]>Date.now()&&i.status==="done");
const isOpen=i=>i.kind==="task"&&((i.status||"open")==="open"||heldDone(i))&&i.list!=="someday";
const listOf=i=>i.kind==="task"?(i.list||"next"):"";
const LISTNAMES={next:"Next actions",waiting:"Waiting for",someday:"Someday/Maybe"};
const V=()=>S.items.filter(vis);
function carriedN(i){return(i.history||[]).length}
function fieldVals(it,f){
  switch(f){
    case"kind":return[it.kind||"task"];case"list":return[it.kind==="task"?(LISTNAMES[listOf(it)]||"Next actions"):"—"];case"status":return[it.kind==="task"?(heldDone(it)?"Open":(({open:"Open",done:"Done",dropped:"Dropped"})[it.status||"open"]||"Open")):"—"];
    case"sphere":return[it.sphere||DEFAULT_SPHERE];case"date":return[(it.history&&it.history[0])||it.date||"—"];case"month":return[monthOf(it.date)||"—"];
    case"due":return[tday(it)||"—"];case"star":return[it.star?"⭐ High":"Normal"];
    case"carried":{const n=carriedN(it);return[n===0?"Never":n>=3?"3+ times":n+"×"]}
    case"person":return(it.people&&it.people.length)?it.people.map(pname):["—"];
    case"event":return(it.events&&it.events.length)?it.events.map(ename):["—"];
    case"coll":return(it.colls&&it.colls.length)?it.colls.map(cname):["—"];
    case"source":return[(it.src&&it.src.name)||"—"];
  }return["—"];
}
function matches(it,filt,q){
  for(const[f,v]of Object.entries(filt||{})){if(!v)continue;if(!fieldVals(it,f).includes(v))return false}
  if(q){const h=(it.text+" "+(it.detail||"")+" "+fieldVals(it,"person").join(" ")+" "+fieldVals(it,"event").join(" ")+" "+fieldVals(it,"coll").join(" ")+" "+((it.src&&it.src.name)||"")).toLowerCase();
    if(!q.toLowerCase().split(/\s+/).every(w=>h.includes(w)))return false}
  return true;
}
function sortItems(a,key){
  const s=S.sorts[key]||{f:"date",d:1};const f=s.f,dir=s.d;
  const val=i=>f==="date"||f==="due"?(tday(i)||"9999"):f==="logged"?((i.history&&i.history[0])||i.date||"9999"):f==="text"?i.text.toLowerCase():f==="star"?(i.star?0:1):f==="status"?(i.status||"open"):f==="created"?(i.created||0):(i[f]||"9999");
  return a.sort((x,y)=>{const a1=val(x),b1=val(y);const c=a1<b1?-1:a1>b1?1:0;return(c*dir)||(x.date||"").localeCompare(y.date||"")||(x.order||0)-(y.order||0)||(x.created||0)-(y.created||0)});
}
function spShort(s){return s.replace(/^\S+\s/,"")}
function srcLabel(s){
  if(!s)return"";const n=(s.name||"").toLowerCase(),l=(s.link||"").toLowerCase();
  if(n.startsWith("quick add"))return"";
  if(n.startsWith("evernote")||l.startsWith("evernote:"))return"Evernote";
  if(/google calendar|^calendar/.test(n))return"Calendar";
  return linkLabel(s.link)||(s.name||"").split(/[:(]/)[0].trim().slice(0,16);
}
function linkLabel(u){
  const l=String(u||"").toLowerCase();if(!l)return"";
  if(l.startsWith("evernote:"))return"Evernote";if(l.includes("docs.google.com/document"))return"Google Doc";if(l.includes("docs.google.com/spreadsheets"))return"Google Sheet";
  if(l.includes("docs.google.com/presentation"))return"Google Slides";if(l.includes("drive.google.com"))return"Google Drive";if(l.includes("slack.com"))return"Slack";if(l.includes("mail.google"))return"Gmail";
  if(l.includes("claude.ai"))return"Claude";
  try{if(/^https?:/.test(l))return new URL(u).hostname.replace(/^www\./,"")}catch(e){}return"Link";
}
function srcChip(it){const s=it.src;if(!s||!(s.name||s.link))return"";if(/^(Quick add|Added on event|Added from a linked item)$/.test(s.name||"")&&!s.link)return"";const lab=srcLabel(s);if(!lab)return"";
  const tip=esc((s.name||"")+(s.loc?" · "+s.loc:""));
  return s.link&&/^https?:|^evernote:/.test(s.link)?`<a class="chip src" title="${tip}" href="${esc(s.link)}" target="_blank" rel="noopener">⎘ ${esc(lab)}</a>`:`<span class="chip mu" title="${tip}">⎘ ${esc(lab)}</span>`}
function chips(it){
  let h="";
  (it.people||[]).forEach(p=>h+=`<span class="chip" data-go="person:${esc(p)}">${avatarP(p)}${esc(pname(p))}</span>`);
  (it.events||[]).forEach(p=>h+=`<span class="chip" data-go="event:${esc(p)}">🗓️ ${esc(ename(p))}</span>`);
  (it.colls||[]).forEach(p=>h+=`<span class="chip" data-go="coll:${esc(p)}">📁 ${esc(cname(p))}</span>`);
  (it.links||[]).forEach(l=>h+=`<a class="chip src" href="${esc(l.url)}" target="_blank" rel="noopener">⎘ ${esc(l.label||linkLabel(l.url))}</a>`);
  return h+srcChip(it);
}
function duePill(it){
  if(it.kind!=="task"||!isOpen(it)||!it.due)return"";const d=it.due,late=d<today();
  return`<span class="pill ${late?"late":""}" data-go="day:${esc(d)}">${it.monthly?"Month of "+MON[pd(d).getMonth()]:esc(rel(d))}</span>`;
}
function nextMon(){const d=pd(today());let n=(8-d.getDay())%7;if(n===0)n=7;return addDays(today(),n)}
function expHtml(it,o){
  o=o||{};
  const k=it.kind||"task",st=it.status||"open",id=esc(it.id);
  const seg=(f,opts,cur)=>`<span class="qb">${opts.map(([v,l])=>`<button data-act="setf" data-id="${id}" data-f="${f}" data-v="${v}" class="${cur===v?"on":""}">${l}</button>`).join("")}</span>`;
  const chs=(arr,fn,ent)=>(arr||[]).map(x=>`<span class="ch" data-go="${ent==="person"?"person:"+esc(x):ent==="event"?"event:"+esc(x):ent==="rel"?"item:"+esc(x):"coll:"+esc(x)}" style="cursor:pointer">${ent==="person"?avatarP(x):""}${esc(fn(x))}<b data-act="rment" data-id="${id}" data-ent="${ent}" data-eid="${esc(x)}">×</b></span>`).join("");
  const dl=(ent,arr)=>`<datalist id="dl-${ent}-${id}">${arr.map(x=>`<option value="${esc(x.name)}"></option>`).join("")}</datalist>`;
  const dlv=(ent,vals)=>`<datalist id="dl-${ent}-${id}">${vals.map(x=>`<option value="${esc(x)}"></option>`).join("")}</datalist>`;
  const add=(ent,ph,arr)=>ent==="event"||ent==="rel"||ent==="person"||ent==="coll"?`<span class="pw"><input class="add" data-pick="1" autocomplete="off" data-ent="${ent}" placeholder="${ph}" style="width:${ent==="rel"?260:200}px"></span>`:`<input class="add" list="dl-${ent}-${id}" data-ent="${ent}" placeholder="${ph}">${ent==="event"?dlv(ent,dedupeShow(V().filter(i=>i.kind==="event"&&i.id!==it.id)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,300).map(evLabel)):ent==="rel"?dlv(ent,V().filter(i=>i.id!==it.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,400).map(itemLabel)):dl(ent,arr)}`;
  const back=V().filter(i=>i.id!==it.id&&((i.events||[]).includes(it.id)||(i.related||[]).includes(it.id)));
  const dueQ=[["today","Today"],["tomorrow","Tomorrow"],["nextmon","Next Mon"],["week","This week"],["next","Next week"],["month","Month end"],["clear","Clear"]];
  const lk=[];if(it.src&&(it.src.name||it.src.link)){const sc=srcChip(it);if(sc)lk.push(sc)}
  (it.links||[]).forEach((l,n)=>lk.push(`<span class="ch"><a href="${esc(l.url)}" target="_blank" rel="noopener">⎘ ${esc(l.label||linkLabel(l.url))}</a><b data-act="rment" data-id="${id}" data-ent="link" data-eid="${n}">×</b></span>`));
  const canMig=isOpen(it);
  const isEv=k==="event",tr0=it.transcript||"";
  const isMtg=isEv&&(it.sub==="meeting"||tr0||it.summary||MEETRE.test(String(cleanTitle(it).t||it.text||"")));
  const mOpen=(S.mtgOpen&&S.mtgOpen[it.id]!==undefined)?S.mtgOpen[it.id]:isMtg;
  const mStat=[tr0?tr0.split(/\s+/).length.toLocaleString()+" words":"no transcript",it.summary?"summary ready":""].filter(Boolean).join(" · ");
  const row=(l,c)=>`<label>${l}</label><div>${c}</div>`;
  const meetH=isEv?`<details class="xs xmeet" data-mid="${id}" ${mOpen?"open":""}><summary><span class="xt">Meeting summary</span><span class="mute dsm">${esc(mStat)}</span></summary><div class="xg">${meetingSec(it)}</div></details>`:"";if(o.meetOnly)return meetH;
  return`<div class="exp${o.insp?" in-insp":""}${o.panel?" in-panel":""}" data-xid="${id}">
   <div class="xhead">${o.panel?"":`<div class="xtr"><textarea class="xtitle" data-f="text" rows="1" aria-label="Title">${esc(it.text)}</textarea></div>`}
    <div class="xkind">${seg("kind",[["task","Task"],["event","Event"],["note","Note / idea"]],k)}${seg("star",[["0","Normal"],["1","★ Priority"]],it.star?"1":"0")}${k==="task"?seg("status",[["open","Open"],["done","Done"],["dropped","Dropped"]],st):""}${k==="task"?seg("list",[["next","Next"],["waiting","Waiting for"],["someday","Someday"]],listOf(it)):""}${isEv?seg("sub",[["","Event"],["meeting","Meeting"]],it.sub||""):""}<button data-act="sens" class="xsens ${it.sensitive?"on":""}" data-id="${id}" title="${it.sensitive?sensTip(it):"Mark sensitive (money, religion, conflict, health…). It will be hidden in lists until opened."}">🔒 ${it.sensitive?"Sensitive":"Sensitive?"}</button>${it.sensitive?`<button data-act="unreveal" data-id="${id}" class="xsens">Hide again</button>`:""}</div></div>
   ${o.panel?"":`<div class="xs"><div class="xt">Notes</div><div class="kwrap">${keyHero(it)}<div class="kmain">${noteEditor(it)}</div></div><div class="xg" style="margin-top:8px">${imagesRow(it)}</div></div>`}
   ${o.panel?"":meetH}
   <div class="xs"><div class="xt">When</div><div class="xg">
    ${k==="task"?"":row(isEv?"Date":"Day",`<input type="date" data-f="date" value="${esc(it.date||"")}"> ${isEv?`<input data-f="time" placeholder="time, e.g. 10:00 AM" value="${esc(it.time||"")}" style="width:140px"> <span class="mute">through</span> <input type="date" data-f="end" value="${esc(it.end||"")}">`:""} <span class="mute">${esc(rel(it.date))}</span>`)}
    ${k==="task"?row("Due",`<div class="qb"><input type="date" data-f="due" value="${esc(it.due||"")}"> ${dueQ.map(([v,l])=>`<button data-act="duebtn" data-id="${id}" data-v="${v}">${l}</button>`).join("")}</div>`):""}
    ${k==="task"?row("Repeats",`<select data-f="recur">${["","daily","weekly","monthly","yearly"].map(r=>`<option value="${r}" ${(it.recur||"")===r?"selected":""}>${r||"Doesn't repeat"}</option>`).join("")}</select>`):""}
   </div></div>
   <div class="xs"><div class="xt">Details</div><div class="xg">
    ${row("Sphere",`<select data-f="sphere">${sphereOpts(it.sphere||DEFAULT_SPHERE)}</select>`)}
    ${isEv?row("Type",`<div class="qb">${seg("etype",ETYPES.map(([v,e,l])=>[v,e+" "+l]),it.etype||"")}</div>${it.etypeAuto?`<div class="mute dsm">${it.etypeAI?"AI guess":"guessed"}, tap to confirm</div>`:""}`):""}
    ${isEv?row("Whose",`${seg("whose",[["mine","Mine"],["other","Someone else's"]],whoseOf(it))} ${(it.whoseAuto||!it.whose)?`<span class="mute dsm">auto-set${whoPersonOf(it)?" ("+esc(pname(whoPersonOf(it)))+")":""}, tap to confirm</span>`:""}`):""}
    ${isEv?row("Highlight",seg("main",[["0","Regular"],["1","★ Main event of the day"]],it.main?"1":"0")):""}
    ${isEv?row("Short title",`<input data-f="shortTitle" placeholder="${esc(autoShort(it))}" value="${esc(it.shortTitle||"")}" style="width:min(100%,320px)"> <button data-act="shortregen" data-id="${id}" title="Rebuild from the event title">↻ Regenerate</button><div class="mute dsm">Shown for main events in the monthly log. Blank uses the auto version.</div>`):""}
   </div></div>
   <div class="xs"><div class="xt">Connections</div><div class="xg">
    ${row("People",`${chs(it.people,pname,"person")}${add("person","+ Person…",S.people)}`)}
    ${row("Related",`${chs(it.events,ename,"event")}${chs(it.related,x=>{const o=itemById(x);return o?itemLabel(o):x},"rel")}${add("rel","+ Add related…")}${isEv?` <button data-act="newnote" data-id="${id}" class="xsens">+ New note</button>`:""}${back.length?`<div class="mute dsm" style="margin-top:3px">${isEv?"Notes and items linked here":"Linked from"}: ${back.slice(0,16).map(b=>`<span class="ch" data-go="${b.kind==="event"?"event":"item"}:${esc(b.id)}" style="cursor:pointer">${esc(itemLabel(b))}</span>`).join("")}</div>`:""}`)}
    ${row("Collections",`${chs(it.colls,cname,"coll")}${add("coll","+ Collection…",S.colls)}`)}
    ${row("Links",`${lk.join("")}<input class="add" data-ent="link" placeholder="Paste a link, press Enter" style="width:210px">`)}
   </div></div>
   <div class="xmeta">${k==="task"?`Logged <input type="datetime-local" data-f="loggedAt" value="${esc((it.loggedAt||"").slice(0,16))}" style="width:180px"> <button data-act="lognow" data-id="${id}">Now</button> · <span title="The daily page this task sits on. It moves forward when the task is migrated.">Logged on day <input type="date" data-f="date" value="${esc(it.date||"")}" style="width:128px"></span> · ${it.status==="done"&&it.doneAt?"Completed "+esc(fmtDT(it.doneAt)):"Due "+esc(shortDate(tday(it)))} · Migrated ${nmig(it)}×${(it.migs||[]).length?" ("+(it.migs||[]).map(m=>esc(shortDate(m.from)+"→"+shortDate(m.to))).join(", ")+")":""}`:`Logged <input type="datetime-local" data-f="loggedAt" value="${esc((it.loggedAt||"").slice(0,16))}" style="width:180px"> <button data-act="lognow" data-id="${id}">Now</button>`}</div>
   <div class="ft"><span>Originally logged ${esc(shortDate(carriedN(it)?it.history[0]:it.date))}${carriedN(it)?" · migrated "+carriedN(it)+"× · now on "+esc(shortDate(it.date)):""}</span><span class="sp"></span>
    ${o.insp||o.panel?"":`${canMig?`<button data-act="mig" data-id="${id}">Migrate to…</button><button data-act="drop" data-id="${id}">Drop</button>`:""}<button class="warn" data-act="delitem" data-id="${id}">Archive</button><button data-act="collapse" data-id="${id}">Close</button>`}</div></div>`;
}
function detailHtml(it){
  const d=(it.detail||"").trim();if(!d)return"";const mo=S.moreOpen[it.id],long=d.length>90||d.includes("\n");
  return`<div class="clamp1 ${mo?"open":""}">${mo?'<div class="mkd">'+inlineImgs(mdRender(it,d),1)+'</div>':inlineImgs(linkTerms(it,mdPlain(d).replace(/\s*\n\s*/g," · ")),0)}</div>${long?`<button class="lnk" data-act="moretxt" data-id="${esc(it.id)}">${mo?"show less ▴":"show more ▾"}</button>`:""}`;
}
const SVGI={
 cal:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2.5"/><path d="M3 8.5h14M7 2.8v3M13 2.8v3"/></svg>',
 calMain:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2.5" fill="currentColor"/><path d="M3 8.5h14M7 2.8v3M13 2.8v3" stroke="var(--bg)"/><path d="M7 2.8v3M13 2.8v3"/></svg>',
 ppl:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.5" cy="7" r="2.6"/><circle cx="13.6" cy="8.2" r="2.1"/><path d="M2.8 16c.4-2.8 2.4-4.2 4.7-4.2s4.3 1.4 4.7 4.2M12.6 12.2c2.2-.3 4 .9 4.6 3.4"/></svg>',
 userM:'<svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor" aria-hidden="true"><circle cx="10" cy="6.5" r="3.3"/><path d="M3.5 17c.5-3.6 3-5.4 6.5-5.4s6 1.8 6.5 5.4z"/></svg>',
 userO:'<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.4 2" aria-hidden="true"><circle cx="10" cy="6.5" r="3"/><path d="M3.7 16.6c.5-3.4 2.9-5 6.3-5s5.8 1.6 6.3 5z"/></svg>',
 note:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 2.8h7.2L16 6.6V16a1.4 1.4 0 0 1-1.4 1.4H5A1.4 1.4 0 0 1 3.6 16V4.2A1.4 1.4 0 0 1 5 2.8z"/><path d="M12 2.8v4h4M6.5 10h7M6.5 13h5"/></svg>'
};
function leadIcon(it){
  const k=it.kind||"task",st=it.status||"open";
  if(k==="task"){const dn=st==="done";return`<span class="chk ${st}" data-act="cycle" data-tip="${dn?"Mark not done":"Mark complete"}" role="button" aria-label="${dn?"Mark not done":"Mark complete"}">${dn?"✓":st==="dropped"?"–":""}</span>`}
  if(k==="event")return`<span class="gl ev" data-act="edit" title="${it.sub==="meeting"?"Meeting":"Event"}${it.main?" · main event":""}">${it.main?SVGI.calMain:it.sub==="meeting"?SVGI.ppl:SVGI.cal}</span>`;
  return`<span class="gl nt" data-act="edit" title="Note">${SVGI.note}</span>`}
async function completeTask(it){
  S.hold=S.hold||{};S.holdT=S.holdT||{};S.spawned=S.spawned||{};
  it.status="done";it.doneAt=localIso();S.hold[it.id]=Date.now()+2000;
  clearTimeout(S.holdT[it.id]);
  S.holdT[it.id]=setTimeout(async()=>{delete S.hold[it.id];delete S.holdT[it.id];
    if(it.status==="done"&&it.recur&&!S.spawned[it.id]){try{S.spawned[it.id]=await spawnRecurring(it)}catch(e){}}
    if(typing())S.dirty=true;else paintContent()},2000);
  await saveItem(it);
  const nm=String(it.text||"");toastUndo("Completed: "+(nm.length>40?nm.slice(0,40)+"…":nm),()=>reopenTask(it));
}
async function reopenTask(it){
  S.hold=S.hold||{};S.holdT=S.holdT||{};S.spawned=S.spawned||{};
  clearTimeout(S.holdT[it.id]);delete S.holdT[it.id];delete S.hold[it.id];
  it.status="open";it.doneAt=null;await saveItem(it);
  const sp=S.spawned[it.id];if(sp){delete S.spawned[it.id];S.items=S.items.filter(i=>i.id!==sp);S._m=null;try{await del("items",sp)}catch(e){}paintContent()}
}
function itemRow(it,o){
  o=o||{};const k=it.kind||"task",st=it.status||"open",open=S.expanded[it.id];
  const lead=leadIcon(it);
  const car=carriedN(it)?`<span class="cb" title="Originally logged ${esc(it.history[0])}; migrated ${carriedN(it)}×">↪${carriedN(it)}</span>`:"";
  const left=o.showDate&&k==="task"&&isOpen(it)&&tday(it)<today()?`<span class="cb" title="Due ${esc(tday(it))}; logged ${esc((it.history&&it.history[0])||it.date)}">overdue · was due ${esc(shortDate(tday(it)))}</span>`:(o.showDate&&it.date&&tday(it)!==S.date&&!(k==="task"&&isOpen(it))?`<span class="cb">${esc(shortDate(tday(it)))}</span>`:"");
  const c=k==="event"?cleanTitle(it):{t:it.text,time:it.time};
  const lt=k==="note"&&it.loggedAt&&it.loggedAt.length>10?`<span class="tm" title="Logged ${esc(fmtDT(it.loggedAt))}">${esc(normTime(it.loggedAt.slice(11,16)))}</span>`:"";
  const onEv=k==="note"&&(it.events||[]).length?`<span class="cb" data-go="event:${esc(it.events[0])}" style="cursor:pointer" title="Attached to this event">↳ ${esc(evLabel(itemById(it.events[0])||{text:"event",date:""}))}</span>`:"";
  const full=S.detailMode==="all"&&!open;
  const acs0=`<span class="ac"><button class="lnk" data-act="popout" title="Open full page">⧉</button><button class="lnk" data-act="edit" title="Open">✎</button></span>`;
  if(it.sensitive&&!(open&&S.reveal[it.id]))return maskRow(it,lead,acs0);
  return`<div class="it ${k==="task"?st:""}${S.sel===it.id?" sel":""}" data-id="${esc(it.id)}">${lead}
   <div class="mid"><div class="ttl">${it.sensitive?`<span class="sens" title="${sensTip(it)}">🔒 </span>`:""}${it.star?'<span class="star">★ </span>':""}${c.time&&k==="event"?`<span class="tm">${esc(c.time)}</span>`:lt}<span data-act="edit">${mdTitle(it,c.t)}</span>${left}${car}${lbadge(it)}${onEv}</div>
    ${full?detailHtml(it):""}
    ${full?`<div>${chips(it)}</div>`:""}</div>
   ${keyThumb(it)}<div class="rt">${heldDone(it)?`<button class="lnk undo-i" data-act="undone" data-id="${esc(it.id)}">Undo</button>`:""}${S.fields.due?duePill(it):""}</div>
   <span class="ac"><button class="lnk" data-act="star" title="Priority">★</button><button class="lnk" data-act="popout" title="Open full page">⧉</button>${isOpen(it)?`<button class="lnk" data-act="qmig" title="Migrate to ${tday(it)<today()?"today":"tomorrow"}">↪</button>`:""}<button class="lnk" data-act="edit" title="Open">✎</button></span></div>`;
}
/* ---------- list / table / board with filters ---------- */
function itemsView(items,key,defGroup,opts){
  opts=opts||{};S.base[key]=items;
  const filt=S.filt[key]||(S.filt[key]={}),q=S.fq[key]||"";
  const mode=S.modes[key]||"list",group=S.groups[key]!=null?S.groups[key]:(defGroup||"");
  const sort=S.sorts[key]||{f:"date",d:1};
  const opt=f=>{const set=new Set();items.forEach(i=>fieldVals(i,f).forEach(v=>set.add(v)));return[...set].sort()};
  let h="";
  if(opts.tabs){const tab=S.tabs[key]||"Open";
    h+=`<div class="seg" data-vk="${key}" style="margin:6px 0 8px">${["Open","Done","Dropped"].map(t=>`<button data-act="tab" data-v="${t}" class="${tab===t?"on":""}">${t} <span class="mute">${opts.counts[t]}</span></button>`).join("")}</div>`}
  h+=`<div class="ctlp" data-vk="${key}">${opts.pre?`<div class="ctlr"><div class="ctll">Show</div><div class="ctlc">${opts.pre}</div></div>`:""}<div class="ctlr"><div class="ctll">Filter</div><div class="ctlc"><input data-act="fq" placeholder="Search" value="${esc(q)}" style="width:170px">
    ${FIELDS.map(([f,l])=>{const o=opt(f);return o.length>12?`<input class="pillsel ${filt[f]?"on":""}" list="fl-${key}-${f}" data-act="filtq" data-f="${f}" placeholder="${l}…" value="${esc(filt[f]||"")}" style="width:${filt[f]?150:110}px"><datalist id="fl-${key}-${f}">${o.map(v=>`<option value="${esc(v)}"></option>`).join("")}</datalist>`:`<select class="pillsel ${filt[f]?"on":""}" data-act="filt" data-f="${f}"><option value="">${l}</option>${o.map(v=>`<option ${filt[f]===v?"selected":""}>${esc(v)}</option>`).join("")}</select>`}).join("")}</div></div><div class="ctlr"><div class="ctll">View</div><div class="ctlc"><div class="seg">${["table","list","board"].map(m=>`<button class="${mode===m?"on":""}" data-act="mode" data-v="${m}">${({table:"▦ Table",list:"≡ List",board:"▥ Board"})[m]}</button>`).join("")}</div>
    <span class="mute">${mode==="board"?"Columns":"Group"}</span><select data-act="group"><option value="">${mode==="board"?"Status":"No grouping"}</option>${FIELDS.map(([f,l])=>`<option value="${f}" ${group===f?"selected":""}>${l}</option>`).join("")}</select>
    <span class="mute">Sort</span><select data-act="sortf">${SORTS.map(([f,l])=>`<option value="${f}" ${sort.f===f?"selected":""}>${l}</option>`).join("")}</select><button data-act="sortdir">${sort.d>0?"↑":"↓"}</button>
    <button data-act="fields">Fields</button><span class="sp"></span><span class="mute" id="cnt-${key}"></span><button data-act="more">⋯</button></div></div></div>`;
  h+=`<div id="res-${key}">${itemsBody(applyFilters(items,key),mode,group,key)}</div>`;return h;
}
function applyFilters(items,key){return items.filter(i=>matches(i,S.filt[key],S.fq[key]||""))}
function groupOf(list,group,key){
  if(!group)return[["",list]];const m=new Map();
  list.forEach(it=>fieldVals(it,group).forEach(v=>{if(!m.has(v))m.set(v,[]);m.get(v).push(it)}));
  let ks=[...m.keys()];
  if(group==="status")ks.sort((a,b)=>["Open","Done","Dropped","—"].indexOf(a)-["Open","Done","Dropped","—"].indexOf(b));
  else if(group==="sphere")ks.sort((a,b)=>SPHERES.indexOf(a)-SPHERES.indexOf(b));
  else if(group==="carried")ks.sort().reverse();else ks.sort();
  return ks.map(k=>[k,sortItems(m.get(k),key)]);
}
function itemsBody(list,mode,group,key){
  if(!list.length)return`<p class="mute">Nothing matches.</p>`;
  const gs=groupOf(list,group,key);
  if(mode==="board"){const g=group?gs:groupOf(list,"status",key);
    return`<div class="board">${g.map(([k,a])=>`<div class="col"><h3>${esc(k)} <span class="mute">${a.length}</span></h3>${a.map(i=>itemRow(i,{showDate:1})).join("")}</div>`).join("")}</div>`}
  if(mode==="table"){
    const rows=a=>a.map(i=>`<tr data-id="${esc(i.id)}"><td>${esc(tday(i))}</td><td>${esc(i.kind||"task")}</td><td>${i.kind==="task"?esc(fieldVals(i,"status")[0]):""}</td><td>${keyThumb(i,"tb")}${i.star?"★ ":""}<span data-act="edit" style="cursor:pointer">${esc(i.text)}</span></td><td>${esc(i.sphere||"")}</td><td>${esc(i.due||"")}</td><td>${carriedN(i)||""}</td><td>${chips(i)}</td></tr>`).join("");
    return`<div class="tw"><table><thead><tr><th>Due / day</th><th>Type</th><th>Status</th><th>Title</th><th>Sphere</th><th>Due</th><th>Migrated</th><th>Links</th></tr></thead><tbody>${gs.map(([k,a])=>(group?`<tr><td colspan="8" style="background:var(--soft)"><b>${esc(k)}</b> <span class="mute">${a.length}</span></td></tr>`:"")+rows(sortItems(a,key))).join("")}</tbody></table></div>`}
  return gs.map(([k,a])=>`${group?`<div class="gt">${esc(k)} <span class="c">${a.length}</span></div>`:""}<div>${a.map(i=>itemRow(i,{showDate:!group||group!=="date",sphere:1})).join("")}</div>`).join("");
}
/* ---------- lists (task pages) ---------- */
const LISTS={
 tasks:{title:"All tasks",sub:"Every task. A migrated task lives only on its latest day.",base:i=>i.kind==="task",tabs:1,group:""},
 today:{title:"Due today",sub:"Open tasks sitting on or due today.",base:i=>isOpen(i)&&tday(i)===today()},
 week:{title:"This week",sub:()=>shortDate(weekStart(today()))+" to "+shortDate(addDays(weekStart(today()),6)),base:i=>isOpen(i)&&inRange(i,weekStart(today()),addDays(weekStart(today()),6)),group:"date"},
 next:{title:"Next week",sub:()=>shortDate(addDays(weekStart(today()),7))+" to "+shortDate(addDays(weekStart(today()),13)),base:i=>isOpen(i)&&inRange(i,addDays(weekStart(today()),7),addDays(weekStart(today()),13)),group:"date"},
 prio:{title:"Priorities",sub:"Open tasks marked high priority (cap "+CAP+" per day).",base:i=>isOpen(i)&&i.star},
 notes:{title:"Notes",sub:"Notes and ideas, newest first.",base:i=>i.kind==="note",group:""},
 overdue:{title:"Overdue",sub:"Open tasks left on an earlier day or past their due date.",base:i=>overdue(i)},
 lnext:{title:"Next actions",sub:"Tasks you can do next.",base:i=>isOpen(i)&&listOf(i)==="next",group:"sphere"},
 lwait:{title:"Waiting for",sub:"Things you are waiting on. The due date is when to check back.",base:i=>isOpen(i)&&listOf(i)==="waiting",group:"person"},
 lsome:{title:"Someday/Maybe",sub:"Parked ideas with no day. They stay off your daily log until you make them a next action.",base:i=>i.kind==="task"&&(i.status||"open")==="open"&&i.list==="someday",group:"sphere"}
};
function inRange(i,a,b){const d=tday(i);return d>=a&&d<=b}
function overdue(i){return isOpen(i)&&tday(i)<today()}
function pageList(k){
  const L=LISTS[k];if(!L)return"<p>Unknown list.</p>";
  const all=V().filter(L.base);const key="list-"+k;
  let items=all,opts={};
  if(L.tabs){const c={Open:0,Done:0,Dropped:0};all.forEach(i=>c[({open:"Open",done:"Done",dropped:"Dropped"})[i.status||"open"]]++);
    const tab=S.tabs[key]||"Open";items=all.filter(i=>fieldVals(i,"status")[0]===tab);opts={tabs:1,counts:c}}
  const sub=typeof L.sub==="function"?L.sub():L.sub;
  const tq=k==="notes"?"":[["today","🌞","Due today"],["week","📆","This week"],["next","⏭️","Next week"],["prio","❗","Priorities"],["overdue","⏳","Overdue"],["lnext","🎯","Next actions"],["lwait","🕰️","Waiting for"],["lsome","💭","Someday"],["tasks","☑️","All tasks"]].map(([v,e,l])=>{const n=V().filter(LISTS[v].base).filter(i=>v==="tasks"?isOpen(i):true).length;return`<a href="#list:${v}" class="${k===v?"on":""}">${e} ${l} <span class="mute">${n}</span></a>`}).join("");
  if(tq)opts.pre=`<div class="seg">${tq}</div>`;
  return`<p class="mute" style="margin:0 0 4px">${esc(sub)} · ${items.length} item${items.length===1?"":"s"}</p>`+quickBar()+itemsView(items,key,L.group||"",opts);
}
/* ---------- quick add ---------- */
function quickBar(){return"";
  return`<div class="quick"><input class="qa" placeholder="Add anything: a task, event or note. Just write it naturally (people, dates and times are picked up for you)" autocomplete="off"><button class="pri" data-act="qadd">Add</button></div>`;
}
async function ensureEntity(c,name){
  const hit=S[c].find(x=>x.name.toLowerCase()===name.toLowerCase());if(hit)return hit.id;
  const o={id:slug(name)+"-"+Math.random().toString(36).slice(2,5),name,created:Date.now()};upsertLocal(c,o);await save(c,o);return o.id;
}
/* ---------- effective day, lookups, smart add ---------- */
function tday(i){return i.kind==="task"?(i.due||i.date||""):(i.date||"")}
function itemById(id){if(!S._m){S._m=new Map();S.items.forEach(i=>S._m.set(i.id,i))}return S._m.get(id)}
function evLabel(it){return safeTitle(it)+" · "+shortDate(it.date)}
function itemLabel(it){return(it.kind==="event"?"◯ ":it.kind==="task"?"• ":"– ")+safeTitle(it).slice(0,60)+" · "+shortDate(it.date)}
function nameTerms(){
  const fc={};S.people.filter(p=>!p.isSelf).forEach(p=>{const f=p.name.split(/\s+/)[0].toLowerCase();fc[f]=(fc[f]||0)+1});
  const m=[];S.people.filter(p=>!p.isSelf).forEach(p=>{const names=new Set([p.name,...(p.akas||[]),...nicksOf(p)]);const f=p.name.split(/\s+/)[0];if(f.length>=3&&fc[f.toLowerCase()]===1)names.add(f);names.forEach(n=>{if(!n||n.length<2)return;if(!/\s/.test(n)&&(fc[n.toLowerCase()]||0)>1)return;m.push([n,p.id])})});return m;
}
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const NAMESKIP=/^(text|email|ask|tell|see|ping|thank|help|send|remind|invite|review|plan|prep|follow|schedule|check|talk|chat|pray|bring|get|give|take|about|per|re|dr|mr|mrs|ms|coach|pastor|rev|prof|uncle|aunt|the|and|with|for|from|call|meet|meeting|lunch|dinner|coffee|breakfast|visit|trip|party|pick|drop|doctor|dentist|class|school|church|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|today|tomorrow|tonight|morning|afternoon|evening)$/i;
function nameClash(t,idx,len,p){
  const toks=String(p.name).toLowerCase().split(/\s+/);
  const before=t.slice(0,idx).match(/([A-Z][a-z]{2,})\s+$/),after=t.slice(idx+len).match(/^\s+([A-Z][a-z]{2,})(?![A-Za-z])/);
  const bad=w=>w&&!toks.includes(w.toLowerCase())&&!NAMESKIP.test(w);
  return !!((before&&bad(before[1]))||(after&&bad(after[1])));
}
function findPeople(t,ctx){const ids=[],hits=[];
  nameTerms().forEach(([n,id])=>{const re=new RegExp("(^|[^A-Za-z])("+reEsc(n)+")(?![A-Za-z])","ig");let m;
    while((m=re.exec(t))){const st=m.index+m[1].length,en=st+n.length;
      if(!/\s/.test(n)){const p=S.people.find(x=>x.id===id);if(p&&nameClash(t,st,n.length,p))continue}
      hits.push({st,en,id});if(re.lastIndex<=m.index)re.lastIndex=m.index+1}});
  hits.forEach(h=>{if(ids.includes(h.id))return;if(hits.some(o=>o.id!==h.id&&o.st<=h.st&&o.en>=h.en&&(o.en-o.st)>(h.en-h.st)))return;ids.push(h.id)});
  const am=ambigTokens();Object.keys(am).forEach(tok=>{const re=new RegExp("(^|[^A-Za-z])("+reEsc(tok)+")(?![A-Za-z])","ig");let m,ok=false;while((m=re.exec(t))){const after=t.slice(m.index+m[0].length);if(!/^\s+[A-Z][a-z]{2,}/.test(after)||/^\s+(and|the|but|said|told|asked|wants|called|will|was|is)\b/i.test(after)){ok=true;break}}
    if(ok&&!am[tok].some(id=>ids.includes(id)||((ctx&&ctx.people)||[]).includes(id))){const id=pickPerson(tok,am[tok],t,ctx);if(id&&!ids.includes(id))ids.push(id);else if(!id&&ctx&&ctx.unresolved)ctx.unresolved.push({tok,ids:am[tok]})}});return ids}
function linkTerms(it,raw){
  const terms=new Map();
  (it.people||[]).forEach(id=>{const p=S.people.find(x=>x.id===id);if(!p)return;[p.name,...(p.akas||[]),...nicksOf(p),p.name.split(/\s+/)[0]].forEach(n=>{if(n&&n.length>=3&&!/[&<>"']/.test(n))terms.set(n.toLowerCase(),"person:"+id)})});
  (it.colls||[]).forEach(id=>{const c=S.colls.find(x=>x.id===id);if(c&&!/[&<>"']/.test(c.name))terms.set(c.name.toLowerCase(),"coll:"+id)});
  const h=esc(raw);if(!terms.size)return h;
  const keys=[...terms.keys()].sort((a,b)=>b.length-a.length).map(reEsc);
  return h.replace(new RegExp("(^|[^A-Za-z])("+keys.join("|")+")(?![A-Za-z])","gi"),(m,pre,t)=>pre+`<a class="tl" data-go="${esc(terms.get(t.toLowerCase()))}">${t}</a>`);
}
const WDLOW=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
const MNL3=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
function fmtMin(m){m=((m%1440)+1440)%1440;const h=Math.floor(m/60),mi=m%60;return(h%12||12)+":"+String(mi).padStart(2,"0")+" "+(h>=12?"PM":"AM")}
function parseWhen(t,loose){
  let s=" "+String(t||"")+" ",date=null,time="";
  const lc0=s.toLowerCase();
  const part=/\b(tonight|tomorrow night|this evening|this afternoon|afternoon|evening)\b/.test(lc0)?"pm":/\b(this morning|morning)\b/.test(lc0)?"am":"";
  const apOf=x=>x?(/^p/i.test(x)?"pm":"am"):"";
  const guess=h=>part==="am"?"am":part==="pm"?"pm":(h>=7&&h<=11)?"am":"pm";
  const to24=(h,ap)=>ap==="pm"?(h%12)+12:(h%12);
  const RNG=/(^|[^\d\/:.\-])(?:(from|between|at)\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\s*(-|–|—|to|until|till|and)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?(?![\d\/:\-]|\s*(?:am|pm|a\.m|p\.m)\b)/i;
  const m=s.match(RNG);
  if(m){
    const pre=(m[2]||"").toLowerCase(),sep=m[6].toLowerCase(),H1=+m[3],H2=+m[7],M1=+(m[4]||0),M2=+(m[8]||0);
    let a1=apOf(m[5]),a2=apOf(m[9]);
    const before=s.slice(0,m.index+m[1].length);
    const bare=!a1&&!a2&&!m[4]&&!m[8];
    let ok=H1<=24&&H2<=24&&M1<60&&M2<60&&!(sep==="and"&&pre!=="between")&&!/\b(chapters?|ch|pages?|pp|sections?|lessons?|weeks?|days?|verses?|lines?|vol|no|ex|exercises?|units?|#)\.?\s*$/i.test(before);
    if(ok&&bare&&!(pre||part||loose))ok=false;
    if(ok){
      let st,en;
      if(H1>12||H2>12){st=H1*60+M1;en=H2*60+M2}
      else{
        if(!a1&&a2){a1=a2;if(to24(H1,a1)*60+M1>=to24(H2,a2)*60+M2)a1=a1==="pm"?"am":"pm"}
        if(!a1)a1=guess(H1);
        st=to24(H1,a1)*60+M1;
        if(a2)en=to24(H2,a2)*60+M2;
        else{en=(H2%12)*60+M2+(st>=720?720:0);while(en<=st)en+=720}
      }
      time=fmtMin(st)+" – "+fmtMin(en);
      s=s.replace(RNG,"$1 ");
    }
  }
  if(!time){
    let x;
    const one=(re,fn)=>{if(time)return;const mm=s.match(re);if(mm){const r=fn(mm);if(r){time=r;s=s.replace(re,"$1 ")}}};
    one(/(^|[^\d\/:.\-])(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)(?![a-z])/i,mm=>{const h=+mm[2];if(h<1||h>12)return"";return fmtMin(to24(h,apOf(mm[4]))*60+ +(mm[3]||0))});
    one(/(^|[^\w])(?:at\s+)?(noon|midnight)\b/i,mm=>/noon/i.test(mm[2])?"12:00 PM":"12:00 AM");
    one(/(^|[^\d\/:.\-])(\d{1,2}):(\d{2})(?![\d:])/,mm=>{const h=+mm[2],mi=+mm[3];if(h>23||mi>59)return"";return h>12||h===0?fmtMin(h*60+mi):fmtMin(to24(h,guess(h))*60+mi)});
    one(/(^|[^\d\/:.\-])at\s+(\d{1,2})(?![\d\/:\-])/i,mm=>{const h=+mm[2];if(h<1||h>12)return"";return fmtMin(to24(h,guess(h))*60)});
  }
  const D=(re,fn)=>{if(date)return;const mm=s.match(re);if(mm){const d=fn(mm);if(d){date=d;s=s.replace(re," ")}}};
  D(/\b(?:the )?day after tomorrow\b/i,()=>addDays(today(),2));
  D(/\btomorrow\b/i,()=>addDays(today(),1));
  D(/\byesterday\b/i,()=>addDays(today(),-1));
  D(/\b(?:today|tonight|this (?:morning|afternoon|evening))\b/i,()=>today());
  D(/\bin (\d+) (day|week)s?\b/i,mm=>addDays(today(),+mm[1]*(mm[2].toLowerCase()==="week"?7:1)));
  D(/\b(?:(next|this|on|by|before)\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i,mm=>{const idx=WDLOW.indexOf(mm[2].toLowerCase());let n=(idx-pd(today()).getDay()+7)%7;if(n===0&&/next/i.test(mm[1]||""))n=7;return addDays(today(),n)});
  D(/\b(?:on\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b(?:,?\s*(\d{4}))?/i,mm=>{const mi=MNL3.indexOf(mm[1].slice(0,3).toLowerCase()),dd=+mm[2];if(dd<1||dd>31)return null;const y0=pd(today()).getFullYear();if(mm[3])return ymd(new Date(+mm[3],mi,dd));let d=ymd(new Date(y0,mi,dd));if(d<today())d=ymd(new Date(y0+1,mi,dd));return d});
  D(/\b(?:on\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,mm=>{const mo=+mm[1],dd=+mm[2];if(mo<1||mo>12||dd<1||dd>31)return null;const y0=pd(today()).getFullYear();if(mm[3])return ymd(new Date(mm[3].length===2?2000+ +mm[3]:+mm[3],mo-1,dd));let d=ymd(new Date(y0,mo-1,dd));if(d<today())d=ymd(new Date(y0+1,mo-1,dd));return d});
  if(date||time)s=s.replace(/\b(?:in the |this )?(?:morning|afternoon|evening|tonight)\b/ig," ");
  let clean=s.replace(/\s+,/g,",").replace(/([,;])\s*(?=[,;])/g,"").replace(/,\s*(with|w\/)\b/ig," $1").replace(/\s{2,}/g," ").replace(/^[\s,;:\-–]+|[\s,;:\-–]+$/g,"");
  clean=clean.replace(/\s+\b(?:at|on|from|by|for|this|next|until|till)\s*$/i,"").trim();
  return{date,time,clean:clean||String(t||"").trim()};
}
function smartParse(txt,preset){
  let t=txt.trim().replace(/^[-–•o]\s+/,m=>m),star=false;
  if(/(^|\s)!(\s|$)/.test(t)){star=true;t=t.replace(/(^|\s)!(\s|$)/g," ").trim()}
  if(/\b(urgent|asap|high priority|top priority|important)\b/i.test(t))star=true;
  const people=findPeople(t);
  const taskVerb=/^(call|email|send|buy|get|set|schedule|book|pay|finish|write|review|update|prepare|follow up|check|fix|make|order|renew|submit|draft|plan|pick up|drop off|ask|remind|read|clean|talk to|text|need to|have to|remember to|don't forget|todo|to do|should)\b/i.test(t);
  const evWord=/\b(lunch|dinner|breakfast|coffee|meeting|mtg|appointment|party|game|concert|flight|trip|visit|dentist|doctor|reunion|luncheon|wedding|service|class|practice|rehearsal|show|movie|brunch|date night|interview|call w|call with)\b/i.test(t);
  const noteWord=/^(idea|note|thought|reflection|i (think|realized|noticed|wonder|learned)|remember when|quote)\b|\?\s*$/i.test(t)||(t.length>140&&!taskVerb);
  const when=parseWhen(t,preset==="event"||(evWord&&!taskVerb));
  let kind=preset||(noteWord?"note":(when.time||(evWord&&!taskVerb))?"event":"task");
  const unknown=[];const m=t.matchAll(/\b(?:w\/|with|and)\s+([A-Z][a-z]{2,}(?:\s[A-Z][a-z]+)?)/g);
  for(const x of m){const nm=x[1];if(!S.people.some(p=>p.name.toLowerCase().startsWith(nm.split(" ")[0].toLowerCase())||(p.akas||[]).some(a=>a.toLowerCase()===nm.toLowerCase())))unknown.push(nm)}
  const colls=[];S.colls.forEach(c=>{if(new RegExp("\\b"+reEsc(c.name)+"\\b","i").test(t))colls.push(c.id)});
  if(/\b(watched|watching|episode|season \d|movie|film)\b/i.test(t)&&S.colls.some(c=>c.id==="c-shows")&&!colls.includes("c-shows"))colls.push("c-shows");
  let sphere=null;const ar=people.map(id=>(S.people.find(p=>p.id===id)||{}).area);
  if(ar.includes("Veracross"))sphere=SPHERES[0];else if(ar.includes("Gordon College"))sphere=SPHERES[1];else if(ar.includes("Asbury Grove"))sphere=SPHERES[2];else if(ar.includes("Core Homeschool"))sphere=SPHERES[3];
  if(!sphere){if(/\b(veracross|knowledge base|support team|release notes?|kb article|help center)\b/i.test(t))sphere=SPHERES[0];else if(/\b(gordon|latin|syllabus|students?|quiz|midterm|task force)\b/i.test(t))sphere=SPHERES[1];else if(/\b(asbury|grove)\b/i.test(t))sphere=SPHERES[2];else if(/\b(core homeschool|core board|990)\b/i.test(t))sphere=SPHERES[3]}
  const list=/^\s*(waiting\s+(on|for)\b|wf\s*:)/i.test(t)?"waiting":/^\s*(someday\b|maybe\s*:)/i.test(t)?"someday":"";if(list&&!preset)kind="task";
  return{kind,star,when,people,colls,unknown,sphere,text:(kind==="event"&&(when.date||when.time)&&when.clean)?when.clean:t,list};
}
async function addQuick(txt,date,sphereOverride,preset){
  if(!txt||!txt.trim())return;const p=smartParse(txt,preset);
  const people=[...p.people];
  for(const n of p.unknown){const e={id:slug(n)+"-"+Math.random().toString(36).slice(2,5),name:n,area:"Unsorted",areaGuess:true,created:Date.now()};upsertLocal("people",e);await save("people",e);people.push(e.id)}
  const base=date||(S.view==="daily"?S.date:today());
  const it={id:uid("i"),kind:p.kind,text:p.text,date:base,sphere:sphereOverride||p.sphere||DEFAULT_SPHERE,star:p.star,people,events:[],related:[],colls:p.colls,created:Date.now(),src:{name:"Quick add"},history:[]};
  if(p.kind==="task"){it.status="open";it.due=p.when.date||base;it.logged=base}
  if(it.kind==="task"&&p.list){it.list=p.list;if(p.list==="someday")it.due=null;else if(p.list==="waiting"&&!p.when.date)it.due=addDays(base>today()?base:today(),7)}
  if(it.kind==="event"){it.etype=guessEtype(it);it.etypeAuto=true}
  if(base===today())it.loggedAt=localIso();
  if(p.kind==="event"){it.date=p.when.date||base;if(p.when.time)it.time=p.when.time}
  else if(p.when.date)it.date=p.when.date;
  await saveItem(it);
  if(it.kind==="note")await autoTag(it);else{const c2={sphere:it.sphere,people:it.people,unresolved:[]};findPeople((it.text||"")+"\n"+(it.detail||""),c2);if(c2.unresolved.length)setTimeout(()=>resolveAmbig(it,c2.unresolved),400)}
  const stars=V().filter(i=>isOpen(i)&&i.star&&tday(i)===tday(it)).length;
  const bits=[({task:"Task",event:"Event",note:"Note"})[it.kind],it.sphere.replace(/^\S+\s/,""),shortDate(tday(it))];if(it.kind==="event"&&it.time)bits.push(it.time);
  if(people.length)bits.push(people.map(pname).join(", "));if(p.colls.length)bits.push(p.colls.map(cname).join(", "));if(p.star)bits.push("★"+(stars>CAP?" (over cap)":""));
  toastUndo("Added: "+bits.join(" · "),async()=>{S.items=S.items.filter(i=>i.id!==it.id);S._m=null;await del("items",it.id);render()},()=>openItem(it.id));
}
/* ---------- pages ---------- */
function bySphere(items){const m=new Map();SPHERES.forEach(s=>m.set(s,[]));items.forEach(i=>{const s=i.sphere||DEFAULT_SPHERE;if(!m.has(s))m.set(s,[]);m.get(s).push(i)});return m}
function prioChip(date){const n=V().filter(i=>isOpen(i)&&i.star&&i.date===date).length;return`<button class="chip ${n>CAP?"fl":"mu"}" data-act="prio" title="Show suggestions for what to prioritize" style="cursor:pointer">${n>CAP?"⚠ ":"★ "}${n} of ${CAP} priorities · ${n>CAP?"fix":n<CAP?"pick more":"full"}</button>`}
function timeMin(s){const t=normTime(s);if(t==="all day")return -1;const m=t.match(/^(\d+):(\d\d) (AM|PM)$/);if(!m)return null;let h=+m[1]%12;if(m[3]==="PM")h+=12;return h*60+ +m[2]}
function dayList(range,base){if(range==="day")return[base];const ws=weekStart(base),st=range==="week"?ws:addDays(ws,7);return[0,1,2,3,4,5,6].map(n=>addDays(st,n))}
const ETYPES=[["local","📍","Local"],["milestone","🏆","Milestone"],["trip","✈️","Trip"],["visitor","🏠","Visitor"],["gathering","🎉","Gathering"],["family","👪","Family"],["call","📞","Call / message"],["health","🩺","Health"],["work","💼","Work"],["other","•","Other"]];
const etE=v=>(ETYPES.find(e=>e[0]===v)||[])[1]||"",etL=v=>(ETYPES.find(e=>e[0]===v)||[])[2]||"Untyped";
function guessEtype(it){const t=((it.text||"")+" "+(it.detail||"").slice(0,200)).toLowerCase();
  if(/\b(voicemail|phone call|call with|called|zoom call|facetime|text from)\b/.test(t))return"call";
  if(/\b(graduat|ordain|ordination|belt test|black belt|karate|promotion|award|achiev|certificat|diploma|marathon|triathlon|accepted|offer letter|retire|first day|first time)\b/.test(t))return"milestone";
  if(/\b(trip|flight|flying|airport|train to|road trip|vacation|cruise|drive to|driving to|travel|hotel|fly to|ferry)\b/.test(t))return"trip";
  if(/\b(visit(?:s|ing|ors?)?|in from|house ?guests?|staying with us|come to town|coming to town)\b/.test(t)&&!/\b(visit the|visit to)\b/.test(t))return"visitor";
  if(/\b(birthday|party|wedding|memorial|funeral|reunion|christmas|thanksgiving|thanksmas|brunch|celebration|holiday|easter|bbq|cookout)\b/.test(t))return"gathering";
  if(/\b(doctor|dentist|physical|blood|orthodont|surgery|x-?ray|appointment|vet\b|therapy|checkup|clinic)\b/.test(t))return"health";
  if(it.sub==="meeting"||/veracross|gordon/i.test(it.sphere||""))return"work";
  if(/\b(kids?|david|catherine|penny|school|recital|curriculum night|iep)\b/.test(t))return"family";
  return"local"}
function evTtl(it,c,dl,o){
  const wo=whoseOf(it)==="other",wp=whoPersonOf(it);
  const sensH=it.sensitive?`<span class="sens" title="${sensTip(it)}">🔒 </span>`:"";
  const etbH=it.etype?`<span class="etb ${it.etypeAuto?"g":""}" title="${esc(etL(it.etype))}${it.etypeAuto?" (guessed)":""}">${etE(it.etype)} ${dl==="compact"?"":esc(etL(it.etype))}</span>`:"";
  const notesH=!o.nonotes&&evNotes(it).length?`<span class="cb" data-act="edit" title="Notes attached to this event">✎ ${evNotes(it).length}</span>`:"";
  const dateH=o.showDate?` <span class="mute dsm">${esc(rel(it.date))}</span>`:"";
  const sphH=it.sphere?`<span class="etb" title="${esc(it.sphere)}">${esc(it.sphere)}</span>`:"";
  const whoH=`<span class="wb ${wo?"o":"m"}" data-act="togwhose" role="button" aria-label="Toggle mine / not mine" title="${wo?"Not mine"+(it.whose?"":" (guessed from the title)")+" — click to mark as mine":"Mine"+(it.whose?"":" (assumed)")+" — click to mark as not mine"}">${wo?SVGI.userO:SVGI.userM}</span>`;
  const ttl=`<span data-act="edit">${mdTitle(it,c.t)}</span>`;
  if(o.grid)return`<div class="ttl eg"><span class="tm">${c.time?esc(c.time):""}</span><span class="tc">${sensH}${ttl}${notesH}${dateH}</span><span class="bd"><span class="wcol">${whoH}</span><span class="tcol">${o.sph?sphH:o.notype?"":etbH}</span></span></div>`;
  return`<div class="ttl">${sensH}${c.time?`<span class="tm">${esc(c.time)}</span>`:""}${ttl}${etbH}${whoH}${notesH}${dateH}</div>`;
}
function evRow(it,o){o=o||{};
  const open=S.expanded[it.id],has=it.detail&&it.detail.trim(),c=cleanTitle(it),dl=o.detail||"normal";
  const show=has&&!open&&!o.nonotes&&dl!=="compact"&&S.detailMode!=="none";
  const glyph=leadIcon(it);
  const acs=`<span class="ac"><button class="lnk" data-act="popout" title="Open full page">⧉</button><button class="lnk" data-act="edit" title="Open">✎</button></span>`;
  if(it.sensitive&&!(open&&S.reveal[it.id]))return maskRow(it,glyph,acs);
  const ims=o.imgs?imgsOf(it.id):[],th=ims.length?(ims.find(m=>m.id===it.thumb)||ims[0]):null;
  const full=dl==="full"&&!open;
  return`<div class="it ${it.main?"ismain":""} ${whoseOf(it)==="other"?"other":""}" data-id="${esc(it.id)}">${glyph}
   <div class="mid">${evTtl(it,c,dl,o)}
    ${show?detailHtml(it):""}${full?`<div>${chips(it)}</div>`:""}</div>
   ${th?`<img class="evthumb" data-act="imgview" data-iid="${esc(th.id)}" src="${esc(imgSrc(th))}" alt="" title="${esc(th.desc||"")}">`:""}${acs}</div>`;
}
function attentionItems(){
  const a=[],td=today(),open=V().filter(isOpen),pn=inboxNew(),od=open.filter(overdue).sort((x,y)=>tday(x).localeCompare(tday(y))),stale=open.filter(i=>carriedN(i)>=3);
  const over=[...new Set(open.filter(i=>i.star).map(i=>i.date))].filter(d=>open.filter(i=>i.star&&i.date===d).length>CAP).length;
  const dyn=S.colls.filter(c=>c.dynamic&&(!c.lastRun||Date.now()-c.lastRun>30*864e5)).length;
  const chase=open.filter(i=>listOf(i)==='waiting'&&tday(i)<=td).sort((x,y)=>tday(x).localeCompare(tday(y)));
  const dc=dupCount(),cu=cuQueue().length,pl=p=>p.item?p.item.text:(p.kind==='merge'?'Merge duplicates':propLabel(p));
  if(pn.length)a.push({em:'📥',n:pn.length,chip:pn.length+' in Inbox',title:'Inbox to sort',sub:pl(pn[0]),hot:1,go:'review',daily:1});
  if(!V().some(i=>i.date===td))a.push({em:'📓',chip:"Today isn't set up",title:"Today isn't set up",sub:'Pull in calendar items and review the day.',hot:1,act:'setup',d:td,daily:S.date===td});
  if(dc)a.push({em:'🧹',n:dc,chip:dc+' duplicate'+(dc>1?'s':'')+' to merge',title:'Duplicates to merge',sub:'Same item logged more than once.',hot:1,act:'dupes',daily:1});
  if(od.length)a.push({em:'⏳',n:od.length,chip:od.length+' overdue',title:'Overdue',sub:od[0].text,act:'triage',k:'overdue',daily:1});
  if(chase.length)a.push({em:'📨',n:chase.length,chip:chase.length+' waiting to chase',title:'Waiting for: time to chase',sub:chase[0].text,act:'triage',k:'chase',daily:1});
  if(stale.length)a.push({em:'🔁',n:stale.length,chip:stale.length+' migrated 3+ times',title:'Migrated 3+ times',sub:'Do it, move it to Waiting or Someday, or drop it.',act:'triage',k:'stale',daily:1});
  if(over)a.push({em:'❗',n:over,chip:'over '+CAP+' priorities',title:'Over the priority cap',sub:over+' day'+(over>1?'s have':' has')+' more than '+CAP+' starred.',hot:1,act:'triage',k:'prio',daily:1});
  if(wkDue())a.push({em:'🧭',chip:'Weekly review due',title:'Weekly review due',sub:S.lastWeekly?'Last done '+shortDate(ymd(new Date(S.lastWeekly.at))):'Not done yet',go:'weekly',daily:1});
  if(dyn)a.push({em:'✨',n:dyn,chip:dyn+' collection'+(dyn>1?'s':'')+' to refresh',title:'Collections to refresh',sub:'Dynamic collections not swept in 30+ days.',go:'colls',daily:1});
  const ck=cuQueue().filter(p=>!p.name.trim().includes(' ')||!relList(p).length).length;if(ck)a.push({em:'👥',n:ck,chip:ck+' people need a name or relationship',title:'People missing a full name or relationship',sub:'These two are the key details.',go:'cleanup',daily:0});
  return a;
}
function attTile(x){return `<div class='tile ${x.hot?'hot':''}' ${x.go?`data-go='${esc(x.go)}'`:`data-act='${x.act}'${x.d?` data-d='${x.d}'`:''}${x.k?` data-k='${x.k}'`:''}`}><span class='em'>${x.em}</span><div style='min-width:0'><b>${esc(x.title)}</b><div class='mute' style='overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>${esc(x.sub||'')}</div></div>${x.n!=null?`<span class='num'>${x.n}</span>`:''}</div>`}
function attStripV1(){
  const a=attentionItems().filter(x=>!(x.act==='setup'&&!x.daily));if(!a.length)return '';const o=S.attOpen;
  return `<div class='panel tint' style='--tc:#f59e0b'><h2 data-act='attt' style='cursor:pointer;margin:0'><span>${o?'▾':'▸'}</span> Needs your attention <span class='c'>${a.length}</span></h2>${o?`<div class='tiles' style='margin-top:8px'>${a.map(attTile).join('')}</div>`:''}</div>`;
}
function attStripChips(){const a=attentionItems().filter(x=>x.daily);return a.length?`<div class='strip'>${a.map(x=>`<span class='sg${x.hot?' hot':''}' ${x.go?`data-go='${esc(x.go)}'`:`data-act='${x.act}'${x.d?` data-d='${x.d}'`:''}${x.k?` data-k='${x.k}'`:''}`}>${x.em} ${esc(x.chip)}</span>`).join('')}</div>`:''}
function agoDays(s){return s?Math.max(0,Math.round((pd(today())-pd(String(s).slice(0,10)))/86400000)):0}
const wkDue=()=>!S.lastWeekly||agoDays(ymd(new Date(S.lastWeekly.at)))>=7;
const lbadge=i=>i.kind==='task'&&i.list==='waiting'?`<span class='cb' title='Waiting for'>⏳ waiting</span>`:i.kind==='task'&&i.list==='someday'?`<span class='cb'>💭 someday</span>`:'';
function setList(it,v){
  const was=listOf(it);
  if(v==='next')delete it.list;else it.list=v;
  if(v==='someday')it.due=null;
  else if(v==='waiting'){if(!it.due||it.due<=today())it.due=addDays(today(),7);toast('Check back '+shortDate(it.due))}
  else if(was==='someday'&&!it.due)it.due=it.date>=today()?it.date:today();
}
function clar(p,tab){
  if(tab!=='New'||p.kind!=='add'||!p.item)return '';
  const it=p.item,k=it.kind||'note';
  return `<div class='row' style='margin:6px 0 0 24px;gap:6px'>`+
   `<select data-act='pfield' data-f='kind'>${['task','event','note'].map(x=>`<option ${k===x?'selected':''}>${x}</option>`).join('')}</select>`+
   (k==='task'?`<select data-act='pfield' data-f='list'>${[['next','Next action'],['waiting','Waiting for'],['someday','Someday/Maybe']].map(([v,l])=>`<option value='${v}' ${(it.list||'next')===v?'selected':''}>${l}</option>`).join('')}</select>`:'')+
   `<input type='date' data-act='pfield' data-f='date' value='${esc(it.date||p.date||'')}'>`+
   `<select data-act='pfield' data-f='sphere'>${sphereOpts(it.sphere||DEFAULT_SPHERE)}</select></div>`;
}
function wrRow(i,btns,meta){return `<div class='it' data-id='${esc(i.id)}'><span class='chk' data-act='cycle' data-tip='Mark complete'></span><div class='mid'><div class='ttl'><span data-act='edit'>${esc(i.text)}</span>${i.star?"<span class='star'> ★</span>":''}</div><div class='dt'>${meta}</div><div class='row' style='gap:4px;margin-top:4px'>${btns}</div></div></div>`}
function pageWeekly(){
  const td=today(),open=V().filter(isOpen),nb=(v,l,c)=>`<button data-act='wr' data-v='${v}' ${c?`class='${c}'`:''}>${l}</button>`;
  const inbox=inboxNew().length;
  const loose=open.filter(i=>listOf(i)==='next'&&(overdue(i)||carriedN(i)>=3)).sort((a,b)=>carriedN(b)-carriedN(a)||tday(a).localeCompare(tday(b)));
  const wait=open.filter(i=>listOf(i)==='waiting').sort((a,b)=>loggedOf(a).localeCompare(loggedOf(b)));
  const some=V().filter(i=>i.kind==='task'&&(i.status||'open')==='open'&&i.list==='someday').sort((a,b)=>(a.created||0)-(b.created||0));
  const a1=addDays(td,1),a2=addDays(td,7);
  const aT=open.filter(i=>{const d=tday(i);return d>=a1&&d<=a2}).length,aE=V().filter(i=>i.kind==='event'&&i.date>=a1&&i.date<=a2).length;
  const hd=(n,t,c,ok)=>`<h2>${ok?'✅':n+'.'} ${t} <span class='c'>${c}</span></h2>`;
  const more=(arr,k,go)=>arr.length>k?`<p class='mute'>+${arr.length-k} more · <a data-go='${go}' style='cursor:pointer;color:var(--acc)'>see all</a></p>`:'';
  const lw=S.lastWeekly?ymd(new Date(S.lastWeekly.at)):'';
  let h=`<p class='mute' style='margin:0 0 6px'>${lw?'Last review '+esc(shortDate(lw))+' ('+agoDays(lw)+' days ago).':'No review recorded yet.'} Work top to bottom. Each step ticks itself off as you clear it.</p>`;
  h+=`<div class='panel'>${hd(1,'Clear the Inbox',inbox,!inbox)}${inbox?`<p class='mute'>${inbox} item${inbox>1?'s':''} waiting to be confirmed, snoozed or dismissed.</p><button class='pri' data-go='review'>Open Inbox</button>`:`<p class='mute'>Inbox is clear.</p>`}</div>`;
  h+=`<div class='panel'>${hd(2,'Loose ends: overdue or migrated 3+ times',loose.length,!loose.length)}<p class='mute' style='margin:0 0 4px'>For each one: do it, move it to Waiting for, park it as Someday, or drop it.</p>${loose.slice(0,12).map(i=>wrRow(i,nb('today','Do today')+nb('wait','Waiting')+nb('some','Someday')+nb('drop','Drop','warn'),(overdue(i)?'was due '+esc(shortDate(tday(i))):'')+(carriedN(i)>=3?(overdue(i)?' · ':'')+'migrated '+carriedN(i)+'×':''))).join('')||`<p class='mute'>Nothing stuck.</p>`}${more(loose,12,'list:overdue')}</div>`;
  h+=`<div class='panel'>${hd(3,'Waiting for: chase or close',wait.length,!wait.length)}${wait.slice(0,15).map(i=>wrRow(i,nb('chase','Chased, check in 1 week')+nb('done','Got it')+nb('next','Back to Next')+nb('drop','Drop','warn'),'waiting '+agoDays(loggedOf(i))+' days'+((i.people||[]).length?' · '+esc((i.people||[]).map(pname).join(', ')):'')+' · check back '+esc(shortDate(tday(i))))).join('')||`<p class='mute'>Nothing waiting.</p>`}${more(wait,15,'list:lwait')}</div>`;
  h+=`<div class='panel'>${hd(4,'Skim Someday/Maybe',some.length,!some.length)}${some.length?`<p class='mute' style='margin:0 0 4px'>Oldest first. Make one a next action if it is time, or drop it.</p>`:''}${some.slice(0,8).map(i=>wrRow(i,nb('next','Make next action')+nb('drop','Drop','warn'),'parked '+agoDays(i.created?ymd(new Date(i.created)):i.date)+' days')).join('')||`<p class='mute'>Nothing parked.</p>`}${more(some,8,'list:lsome')}</div>`;
  h+=`<div class='panel'>${hd(5,'Look ahead','',false)}<p class='mute'>Next 7 days: ${aT} task${aT===1?'':'s'} and ${aE} event${aE===1?'':'s'}.</p><button data-act='wrahead'>See next week</button></div>`;
  h+=`<div class='panel'><h2>Finish</h2><p class='mute'>Mark the review done so the reminder resets for a week.</p><button class='pri' data-act='wrdone'>Finish review</button></div>`;
  return h;
}
function attStripOld(){
  const t=[],pn=inboxNew().length,od=V().filter(overdue).length,stale=V().filter(i=>isOpen(i)&&carriedN(i)>=3).length;
  const over=[...new Set(V().filter(i=>isOpen(i)&&i.star).map(i=>i.date))].filter(d=>V().filter(i=>isOpen(i)&&i.star&&i.date===d).length>CAP).length;
  const dyn=S.colls.filter(c=>c.dynamic&&(!c.lastRun||Date.now()-c.lastRun>30*864e5)).length;
  if(pn)t.push(`<span class="sg hot" data-go="review">📥 ${pn} in Inbox</span>`);
  if(!V().some(i=>i.date===today())&&S.date===today())t.push(`<span class="sg hot" data-act="setup" data-d="${today()}">📓 Today isn't set up</span>`);
  const dc=dupCount();if(dc)t.push(`<span class="sg hot" data-act="dupes">🧹 ${dc} duplicate${dc>1?"s":""} to merge</span>`);
  if(od)t.push(`<span class="sg" data-act="triage" data-k="overdue">⏳ ${od} overdue</span>`);
  if(stale)t.push(`<span class="sg" data-act="triage" data-k="stale">🔁 ${stale} migrated 3+ times</span>`);
  if(over)t.push(`<span class="sg hot" data-act="triage" data-k="prio">❗ over ${CAP} priorities</span>`);
  if(dyn)t.push(`<span class="sg" data-go="colls">✨ ${dyn} collection${dyn>1?"s":""} to refresh</span>`);
  return t.length?`<div class="strip">${t.join("")}</div>`:"";
}
const TRI={chase:{t:"Waiting for: time to chase",d:"Nudge the person, then push the check-back date.",f:()=>V().filter(i=>isOpen(i)&&listOf(i)==="waiting"&&tday(i)<=today())},
 overdue:{t:"Overdue tasks",d:"Decide what happens to each one.",f:()=>V().filter(overdue)},
 stale:{t:"Migrated 3+ times",d:"These keep getting carried. Do it, re-date it, or drop it.",f:()=>V().filter(i=>isOpen(i)&&carriedN(i)>=3)},
 prio:{t:"Too many priorities",d:"More than "+CAP+" starred on a day. Un-star, move or finish some.",f:()=>{const days=[...new Set(V().filter(i=>isOpen(i)&&i.star).map(i=>i.date))].filter(d=>V().filter(i=>isOpen(i)&&i.star&&i.date===d).length>CAP);return V().filter(i=>isOpen(i)&&i.star&&days.includes(i.date))}}};
function openTriage(k){const T=TRI[k];if(!T)return;S.triK=k;
  const list=T.f().sort((a,b)=>(tday(a)).localeCompare(tday(b)));
  openModal(`<h3 style="margin-top:0">${T.t} <span class="mute">${list.length}</span></h3><p class="mute" style="margin:0 0 8px">${T.d}</p>
   <div id="trl" style="max-height:60vh;overflow:auto">${list.length?list.map(i=>`<div class="trr" data-id="${esc(i.id)}"><div class="trt"><b>${i.star?"★ ":""}${esc(safeTitle(i))}</b><div class="mute dsm">${esc(shortDate(tday(i)))}${carriedN(i)?" · migrated "+carriedN(i)+"×":""} · ${esc((i.sphere||"").replace(/^\S+\s/,""))}</div></div>
    <div class="tra"><button data-tz="done" title="Mark done">✓ Done</button><button data-tz="today" title="Move to today">↪ Today</button><button data-tz="tmr" title="Move to tomorrow">→ Tomorrow</button><input type="date" data-tz="date" title="Pick a new date">${k==="chase"?`<button data-tz="chase" title="Chased; check back in a week">📨 Chased, +7d</button>`:""}${k==="stale"?`<button data-tz="someday">💭 Someday</button><button data-tz="waiting">⏳ Waiting</button>`:""}<button data-tz="star" title="Toggle priority">${i.star?"☆ Un-star":"★ Star"}</button><button data-tz="drop" class="warn" title="Drop this task">✕ Drop</button><button class="lnk" data-tz="open" title="Open it">Open</button></div></div>`).join(""):`<p>All clear. 🎉</p>`}</div>
   <div class="row" style="margin-top:10px">${list.length?`<button data-tz="alltoday">↪ Move all to today</button>`:""}<span class="sp"></span><button class="pri" data-tz="close">Close</button></div>`);
  const box=g("mbox");
  const act=async(btn)=>{const k2=btn.dataset.tz,row=btn.closest(".trr"),it=row&&S.items.find(i=>i.id===row.dataset.id);
    if(k2==="close"){closeModal();return}
    if(k2==="alltoday"){for(const i of T.f())await migrate(i,today(),true);openTriage(k);return}
    if(!it)return;
    if(k2==="open"){closeModal();openItem(it.id);return}
    if(k2==="done"){it.status="done";it.doneAt=localIso();await saveItem(it)}
    else if(k2==="today")await migrate(it,today(),true);
    else if(k2==="tmr")await migrate(it,addDays(today(),1),true);
    else if(k2==="star"){it.star=!it.star;await saveItem(it)}
    else if(k2==="chase"){it.due=addDays(today(),7);await saveItem(it)}
    else if(k2==="someday"){setList(it,"someday");await saveItem(it)}
    else if(k2==="waiting"){setList(it,"waiting");await saveItem(it)}
    else if(k2==="drop"){it.status="dropped";it.doneAt=localIso();await saveItem(it)}
    openTriage(k)};
  box.onclick=e=>{const b=e.target.closest("button[data-tz]");if(b)act(b)};
  box.onchange=async e=>{const t=e.target;if(t.dataset.tz==="date"&&t.value){const it=S.items.find(i=>i.id===t.closest(".trr").dataset.id);if(it){await migrate(it,t.value,true);openTriage(k)}}}}
const GROUPS=[["","None"],["sphere","Sphere"],["list","List"],["due","Due date"],["date","Logged"],["star","Priority"],["person","Person"],["event","Event"],["coll","Collection"],["carried","Migrated"]];
function taskGroups(tasks,days,range,doneList){
  const tail=doneList&&doneList.length?`<div class="sub">Done · ${doneList.length}</div>`+sortItems(doneList.slice(),"daily").map(i=>itemRow(i,{showDate:1})).join(""):"";
  if(!tasks.length)return`<p class="mute">Nothing open.</p>`+tail;
  const grp=S.dgroup!=null?S.dgroup:(range==="day"?"sphere":"due");
  S.sorts.daily=S.sorts.daily||{f:"star",d:1};
  const lab=k=>/^\d{4}-\d\d-\d\d$/.test(k)?longDate(k):k,nw=k=>k===today()?" now":"";
  if(!grp)return sortItems(tasks.slice(),"daily").map(i=>itemRow(i,{showDate:1})).join("")+tail;
  return groupOf(tasks,grp,"daily").map(([k,a])=>`<div class="sub${nw(k)}">${esc(lab(k))} · ${a.length}</div>`+a.map(i=>itemRow(i,{showDate:grp!=="due"})).join("")).join("")+tail;
}
function pageDaily(){
  const d=S.date,days=dayList(S.range,d),a=days[0],b=days[days.length-1];
  const inR=i=>i.date>=a&&i.date<=b,inT=i=>{const x=tday(i);return x>=a&&x<=b};
  const evsAll=dedupeShow(V().filter(i=>i.kind==="event"&&inR(i))).sort((x,y)=>x.date.localeCompare(y.date)||((timeMin(cleanTitle(x).time||x.time)??9999)-(timeMin(cleanTitle(y).time||y.time)??9999))||x.text.localeCompare(y.text));
  const evs=evsAll.filter(evfPass);
  const tasks=V().filter(i=>isOpen(i)&&(inT(i)||(S.range==="day"&&d===today()&&overdue(i))));
  const done=V().filter(i=>i.kind==="task"&&i.status==="done"&&!heldDone(i)&&inT(i));
  const notes=V().filter(i=>i.kind==="note"&&inR(i));
  const props=S.props.filter(p=>p.status==="pending"&&p.date>=a&&p.date<=b);
  const trail=S.range==="day"?V().filter(i=>i.kind==="task"&&(i.history||[]).includes(d)&&tday(i)!==d):[];
  const title=S.range==="day"?dlabel(d):shortDate(a)+" – "+shortDate(b);
  let h=`<div class="row">${S.range==="day"?"":`<div class="seg">${[["week","This week"],["next","Next week"]].map(([k,l])=>`<button data-act="range" data-v="${k}" class="${S.range===k?"on":""}">${l}</button>`).join("")}</div>`}
   <button data-act="day" data-n="-1">‹</button>${S.range==="day"?"":`<b style="font-size:1.05rem">${esc(title)}</b>`}<button data-act="day" data-n="1">›</button><input type="date" value="${d}" data-act="pickday"><button data-act="day" data-n="0">Today</button>${d===today()&&S.range!=="next"?`<span class="chip dsk" style="background:var(--accbg);color:var(--acc)">Today</span>`:""}
   <span class="mute">Week ${weekNo(d)} · <a href="#month:${monthOf(d)}">${monthLog(d)}</a></span><span class="sp"></span>${S.range==="day"?prioChip(d):""}</div>
   <div class="row" style="margin:8px 0"><button class="pri" data-act="setup" data-d="${d}">${V().some(i=>i.date===d)?"Review "+(d===today()?"today":shortDate(d)):"Set up "+(d===today()?"today":shortDate(d))}</button><button data-act="backfill">Add or import info</button>${S.busy?`<span class="mute">⏳ ${esc(S.busy)}</span>`:""}</div>`;
  h+=attStrip()+(S.prioOpen&&S.range==="day"?prioPanel(d):"");
  if(props.length)h+=`<div class="strip"><span class="sg hot" data-go="review">📥 ${props.length} proposed for ${S.range==="day"?"this day":"this range"}</span></div>`;
  const lb=layoutBody({evs,evsAll,tasks,done,notes,days});
  h+=`<div class="row dlay ${S.mctl?"mopen":""}" style="margin:4px 0 8px"><span class="mute dsk">Layout</span><div class="seg">${[["cols","▥ Columns"],["sphere","◧ By sphere"],["flow","⋮ Timeline"]].map(([k,l])=>`<button data-act="layout" data-v="${k}" class="${(S.layout||"cols")===k?"on":""}">${l}</button>`).join("")}</div>${S.layout==="flow"?"":`<button class="mob mtog" data-act="mctl">${S.mctl?"Hide ▴":"Sort ▾"}</button><span class="dctl">${S._ctl}</span>`}</div>`;
  h+=lb;
  if(trail.length)h+=`<label class="mute"><input type="checkbox" data-act="trail" ${S.trail?"checked":""}> Show ${trail.length} task${trail.length>1?"s":""} migrated away from this day (history only) (not counted)</label>`+(S.trail?`<div class="panel">${trail.map(i=>`<div class="it"><span class="gl">↪</span><div class="mid"><div class="ttl" style="color:var(--mute)">${esc(i.text)}</div><div class="dt">now on <a href="#day:${esc(i.date)}">${esc(i.date)}</a></div></div></div>`).join("")}</div>`:"");
  return h;
}
function pageMonthOld(){
  const ym=S.arg||monthOf(today()),[y,m]=ym.split("-").map(Number),days=new Date(y,m,0).getDate(),last=ym+"-"+String(days).padStart(2,"0");
  const prev=ymd(new Date(y,m-2,1)).slice(0,7),next=ymd(new Date(y,m,1)).slice(0,7);
  let h=`<div class="row"><a href="#month:${prev}"><button>‹</button></a><b style="font-size:1.15rem">${MON[m-1]} ${y}</b>${ym===monthOf(today())?`<span class="chip" style="background:var(--accbg);color:var(--acc)">This month</span>`:""}<a href="#month:${next}"><button>›</button></a><a href="#year:${y}">${y} Yearly Log</a><span class="sp"></span><button data-act="mall">${S.mallOpen?"Collapse all days":"Expand all days"}</button></div>
  <h2 style="margin:14px 0 4px;font-size:1rem">📅 Calendar</h2>`;
  for(let d=1;d<=days;d++){
    const ds=ym+"-"+String(d).padStart(2,"0"),dow=new Date(y,m-1,d).getDay();
    if(dow===0&&d>1)h+=`<div class="mwk">Week ${weekNo(ds)}</div>`;
    const its=dedupeShow(V().filter(i=>i.date===ds)),evs=its.filter(i=>i.kind==="event"),rest=its.filter(i=>i.kind!=="event");
    const nOpen=rest.filter(isOpen).length,isOpenDay=S.mallOpen||S.mopen[ds];
    const mains=evs.filter(e=>e.main).slice(0,2),others=evs.filter(e=>!mains.includes(e));
    const evl=e=>`<span class="kev" data-go="event:${esc(e.id)}" title="${esc(mdStrip(cleanTitle(e).t))}">${e.etype?etE(e.etype)+" ":""}${mdTitle(null,cleanTitle(e).t)}</span>`;
    const keys=mains.map(e=>`<span class="kev mainev" data-go="event:${esc(e.id)}" title="Main event">★ ${mdTitle(null,cleanTitle(e).t)}</span>`).join(" ")+(others.length?`<div class="kother">${others.slice(0,6).map(evl).join(" ")}${others.length>6?` <span class="mute">+${others.length-6}</span>`:""}</div>`:"");
    h+=`<div class="mrow ${ds===today()?"t":""} ${its.length?"":"emp"}"><div class="md"><b>${d}</b><span>${WDN[dow]}</span></div><div class="mb"><span class="mq">${[["task","＋ Task"],["event","＋ Event"],["note","＋ Note"]].map(([k,l])=>`<button class="lnk" data-act="mq" data-d="${ds}" data-k="${k}">${l}</button>`).join("")}</span>`;
    if(!its.length)h+=`<span class="mute">—</span>`;
    else{
      h+=`<div class="mh"><a class="dl" href="#day:${ds}">Daily Log</a><div class="mkeys">${keys}</div><span class="sp"></span><span class="mute">${evs.length?evs.length+" event"+(evs.length>1?"s":"")+" · ":""}${nOpen} open task${nOpen===1?"":"s"} · ${its.length} item${its.length===1?"":"s"}</span><button class="lnk" data-act="mday" data-d="${ds}">${isOpenDay?"▴":"▾"}</button></div>`;
      if(isOpenDay)h+=`<div style="margin-top:6px">${[...evs,...rest].map(i=>i.kind==="event"?evRow(i):itemRow(i)).join("")}</div>`;
    }
    h+=`</div></div>`;
  }
  const mt=V().filter(i=>i.kind==="task"&&i.monthly&&monthOf(i.due)===ym);
  h+=`<div class="panel" style="margin-top:16px"><h2>✅ Tasks <span class="c">${mt.length}</span></h2>${mt.length?sortItems(mt,"mt").map(i=>itemRow(i)).join(""):`<p class="mute">No tasks parked on this month.</p>`}</div>`;
  const fut=V().filter(i=>i.kind!=="note"&&((i.date>last&&i.date<addDays(last,400))||(i.kind==="task"&&isOpen(i)&&i.due>last&&i.date<=last))).sort((a,b)=>(a.date).localeCompare(b.date));
  h+=`<div class="panel"><h2>🗓️ Future Log <span class="c">${fut.length}</span></h2>${fut.length?dedupeShow(fut).map(i=>itemRow(i,{showDate:1})).join(""):`<p class="mute">Nothing logged beyond this month.</p>`}</div>`;
  const sh=V().filter(i=>(i.colls||[]).includes("c-shows")&&monthOf(i.date)===ym);
  h+=`<div class="panel"><h2>📺 Shows &amp; Movies <span class="c">${sh.length}</span></h2>${sh.length?sh.map(i=>itemRow(i)).join(""):`<p class="mute">None logged.</p>`}</div>`;
  return h;
}
/* ---------- monthly log: main events | all events ---------- */
const MAIN_CAP=2,MAIN_MIN=3,MAIN_MIN2=5;
function evSortList(a){return a.slice().sort((x,y)=>((timeMin(cleanTitle(x).time||x.time)??9999)-(timeMin(cleanTitle(y).time||y.time)??9999))||String(x.text).localeCompare(String(y.text)))}
function mainScore(e,rc){
  let s=0;const c=cleanTitle(e),t=String(c.t||"").toLowerCase();
  const W={milestone:5,trip:4,gathering:3,visitor:3,family:2,health:1,local:1,work:0,call:-1,other:0};
  s+=W[e.etype||guessEtype(e)]??0;
  if(e.detail&&e.detail.trim().length>20)s+=1;
  s+=Math.min(2,evNotes(e).length);
  if(imgsOf(e.id).length)s+=2;
  s+=Math.min(1.5,(e.people||[]).length*0.5);
  if(e.end&&e.end>e.date)s+=2;
  s+=whoseOf(e)==="other"?-1.5:0.5;
  if(e.sub==="meeting"||MEETRE.test(t))s-=2;
  if((rc.get(evKey(c.t))||0)>=4)s-=3;
  if(/\b(birthday|anniversary|wedding|graduation|funeral|memorial|recital|concert|game|party|reunion|ordination|baptism|christening)\b/.test(t))s+=2;
  if(/\b(standup|stand-up|1:1|sync|check-in|office hours)\b/.test(t))s-=1;
  return s;
}
async function saveMany(arr){
  arr.forEach(it=>{it.updated=Date.now();upsertLocal("items",it)});
  for(let i=0;i<arr.length;i+=15)await Promise.all(arr.slice(i,i+15).map(it=>save("items",it)));
  render();
}
async function bulkMain(items,fn,msg){
  const snap=items.map(it=>({it,main:it.main,mainGuess:it.mainGuess,mainNo:it.mainNo,shortTitle:it.shortTitle}));
  items.forEach(fn);
  items.forEach(e=>{if(e.main&&e.kind==="event"&&!(e.shortTitle||"").trim())e.shortTitle=autoShort(e)});
  await saveMany(items);
  toastUndo(msg,async()=>{snap.forEach(s=>{["main","mainGuess","mainNo","shortTitle"].forEach(k=>{if(s[k]===undefined)delete s.it[k];else s.it[k]=s[k]})});await saveMany(snap.map(s=>s.it))});
}
async function mainAct(it,mode){
  if(mode==="on"||mode==="ok"){
    const n=V().filter(i=>i.kind==="event"&&i.date===it.date&&i.main&&i.id!==it.id).length;
    if(n>=MAIN_CAP){toast("A day can have two main events at most. Remove one first.");return}
  }
  const msg={on:"Main event set",ok:"Main event confirmed",off:"Removed from main events",no:"Guess dismissed"}[mode]||"Updated";
  await bulkMain([it],e=>{
    if(mode==="on"||mode==="ok"){e.main=true;e.mainGuess=false;delete e.mainNo}
    else if(mode==="off"){e.main=false;e.mainGuess=false}
    else{e.main=false;e.mainGuess=false;e.mainNo=true}
  },msg+": "+safeTitle(it).slice(0,34));
}
async function guessMains(ym){
  const rc=new Map();
  V().filter(i=>i.kind==="event").forEach(e=>{const k=evKey(cleanTitle(e).t);if(k)rc.set(k,(rc.get(k)||0)+1)});
  const evs=dedupeShow(V().filter(i=>i.kind==="event"&&monthOf(i.date)===ym));
  const byDay=new Map();
  evs.forEach(e=>{if(!byDay.has(e.date))byDay.set(e.date,[]);byDay.get(e.date).push(e)});
  const plan=new Map();let days=0;
  byDay.forEach(list=>{
    if(list.some(e=>e.main))return;
    list.forEach(e=>{if(e.mainGuess)plan.set(e,false)});
    const sc=list.filter(e=>!e.mainNo).map(e=>[mainScore(e,rc),e]).sort((a,b)=>b[0]-a[0]);
    const pick=[];
    if(sc[0]&&sc[0][0]>=MAIN_MIN)pick.push(sc[0][1]);
    if(pick.length&&sc[1]&&sc[1][0]>=MAIN_MIN2)pick.push(sc[1][1]);
    pick.forEach(e=>plan.set(e,true));
    if(pick.length)days++;
  });
  const items=[...plan.keys()].filter(e=>plan.get(e)!==!!e.mainGuess);
  if(!items.length){toast(days?"Guesses are already up to date.":"Nothing stood out this month.");return}
  await bulkMain(items,e=>{e.mainGuess=plan.get(e)},days?"Guessed main events for "+days+" day"+(days===1?"":"s")+". Confirm or dismiss each ✨.":"Cleared old guesses. Nothing else stood out.");
}
async function confirmGuesses(ym){
  const cnt={};V().filter(i=>i.kind==="event"&&i.main).forEach(i=>cnt[i.date]=(cnt[i.date]||0)+1);
  const gs=dedupeShow(V().filter(i=>i.kind==="event"&&i.mainGuess&&!i.main&&monthOf(i.date)===ym)).filter(e=>{if((cnt[e.date]||0)>=MAIN_CAP)return false;cnt[e.date]=(cnt[e.date]||0)+1;return true});
  if(!gs.length)return;
  await bulkMain(gs,e=>{e.main=true;e.mainGuess=false;delete e.mainNo},"Confirmed "+gs.length+" main event"+(gs.length>1?"s":""));
}
async function clearGuesses(ym){
  const gs=V().filter(i=>i.kind==="event"&&i.mainGuess&&!i.main&&monthOf(i.date)===ym);
  if(!gs.length)return;
  await bulkMain(gs,e=>{e.mainGuess=false},"Cleared "+gs.length+" guess"+(gs.length>1?"es":""));
}
function autoShort(it){
  let t=String(cleanTitle(it).t||"").trim();
  if(it.sensitive)return safeTitle(it);
  t=t.replace(/^\s*ian\s*:\s*/i,"").replace(/\([^)]*\)/g,"").replace(/\bw\/\s*/gi,"with ");
  t=t.split(/\s+(?:at|@)\s+|\s[-–—]\s|\s*\|\s*/i)[0];
  const m=t.match(/^(.*?\bwith\s+)(.+)$/i);
  if(m){const names=m[2].split(/\s*(?:,|&|\+|\band\b)\s*/i).map(x=>x.trim()).filter(Boolean);
    if(names.length)t=m[1]+(names.length>1?names.slice(0,-1).join(", ")+" and "+names[names.length-1]:names[0])}
  t=t.replace(/\s{2,}/g," ").replace(/[\s,;:]+$/,"").trim();
  if(t.length>44){const c=t.slice(0,44),i=c.lastIndexOf(" ");t=(i>16?c.slice(0,i):c).replace(/[\s,;:]+$/,"")+"…"}
  return t||String(cleanTitle(it).t||"").trim();
}
const shortOf=it=>it.sensitive?safeTitle(it):((it.shortTitle||"").trim()||autoShort(it));
function mevChip(e,zone){
  const c=cleanTitle(e),t=safeTitle(e),tm=(c.time||"").split(" – ")[0];
  const st=e.main?"main":e.mainGuess?"guess":"none",oth=whoseOf(e)==="other";
  if(zone==="main")return`<div class="mev mm ${st==="guess"?"guess":""} ${oth?"oth":""}" draggable="true" data-id="${esc(e.id)}">${keyThumb(e,"mkt")}<span class="mt" data-go="event:${esc(e.id)}">${st==="guess"?"✨":"★"} ${esc(shortOf(e))}</span>${st==="guess"?`<span class="mbt"><button data-act="mshort" title="Edit short title">✎</button><button class="mok" data-act="mainOk" title="Confirm as a main event">✓</button><button class="mno" data-act="mainNo" title="Not a main event">✕</button></span>`:`<span class="mbt"><button data-act="mshort" title="Edit short title">✎</button><button class="mno" data-act="mainTog" title="Remove from main events">×</button></span>`}</div>`;
  const star=st==="main"?`<button class="mst on" data-act="mainTog" title="Main event. Click to remove">★</button>`:st==="guess"?`<button class="mst gs" data-act="mainOk" title="Guessed main event. Click to confirm">✨</button>`:`<button class="mst" data-act="mainTog" title="Set as a main event">☆</button>`;
  return`<div class="mev ${st==="main"?"ism":""} ${st==="guess"?"guess":""} ${oth?"oth":""}" draggable="true" data-id="${esc(e.id)}">${star}${keyThumb(e,"mkt")}<span class="mt" data-go="event:${esc(e.id)}">${tm?`<span class="mtm">${esc(tm)}</span> `:""}${e.etype?etE(e.etype)+" ":""}${esc(t)}</span></div>`;
}
function monthRow(ds,d,dow,its,openDay){
  const evs=evSortList(its.filter(i=>i.kind==="event")),rest=its.filter(i=>i.kind!=="event");
  const mains=evs.filter(e=>e.main||e.mainGuess);
  const nOpen=rest.filter(isOpen).length;
  const cnt=[evs.length?evs.length+" event"+(evs.length>1?"s":""):"",nOpen?nOpen+" open task"+(nOpen>1?"s":""):"",its.length?its.length+" item"+(its.length>1?"s":""):""].filter(Boolean);
  return`<div class="mg ${ds===today()?"t":""} ${its.length?"":"emp"}" data-d="${ds}">
   <div class="mgd"><a href="#day:${ds}" title="Open this day's log"><b>${d}</b><span>${WDN[dow]}</span></a>${its.length?`<button class="lnk" data-act="mday" data-d="${ds}" title="${openDay?"Hide":"Show"} everything on this day">${openDay?"▴":"▾"}</button>`:""}</div>
   <div class="mzone mmain" data-zone="main" data-d="${ds}">${mains.map(e=>mevChip(e,"main")).join("")||`<span class="mph">—</span>`}</div>
   <div class="mzone mall2" data-zone="all" data-d="${ds}">${mevCell(ds,evs)}</div>
   <div class="mcn">${cnt.map(x=>`<div>${x}</div>`).join("")}<span class="mq">＋ ${["task","event","note"].map(k=>`<button class="lnk" data-act="mq" data-d="${ds}" data-k="${k}">${k}</button>`).join(" ")}</span></div>
   ${openDay&&its.length?`<div class="mgx">${[...evs,...rest].map(i=>i.kind==="event"?evRow(i):itemRow(i)).join("")}</div>`:""}
  </div>`;
}
function pageMonth(){
  const ym=S.arg||monthOf(today()),[y,m]=ym.split("-").map(Number),days=new Date(y,m,0).getDate(),last=ym+"-"+String(days).padStart(2,"0");
  const prev=ymd(new Date(y,m-2,1)).slice(0,7),next=ymd(new Date(y,m,1)).slice(0,7);
  const mi=dedupeShow(V().filter(i=>monthOf(i.date)===ym)),byD=new Map();
  mi.forEach(i=>{if(!byD.has(i.date))byD.set(i.date,[]);byD.get(i.date).push(i)});
  const evM=mi.filter(i=>i.kind==="event"),mC=evM.filter(i=>i.main),mG=evM.filter(i=>!i.main&&i.mainGuess);
  const nOpen=mi.filter(i=>i.kind==="task"&&isOpen(i)).length,nDone=mi.filter(i=>i.kind==="task"&&i.status==="done"&&!heldDone(i)).length,nNote=mi.filter(i=>i.kind==="note").length;
  const box=(n,l)=>`<div class="msb"><b>${n}</b><span>${l}</span></div>`;
  let h=`<div class="row"><a href="#month:${prev}"><button>‹</button></a><b style="font-size:1.15rem">${MON[m-1]} ${y}</b>${ym===monthOf(today())?`<span class="chip" style="background:var(--accbg);color:var(--acc)">This month</span>`:""}<a href="#month:${next}"><button>›</button></a><a href="#year:${y}">${y} Yearly Log</a><span class="sp"></span><button data-act="mevall" title="Show or hide the full list of events for every day">${S.mevAll?"Collapse all events":"Expand all events"}</button><button data-act="mall" title="Show or hide every item (tasks, notes) under each day">${S.mallOpen?"Hide day details":"Show day details"}</button></div>`;
  h+=`<div class="msum">${box(evM.length,"events")}${box(mC.length,"main events"+(mG.length?" · "+mG.length+" ✨ guessed":""))}${box(nOpen,"open tasks")}${box(nDone,"tasks done")}${box(nNote,"notes")}${box(mi.length,"items in all")}<span class="sp"></span><div class="act"><button class="pri" data-act="mguess" data-ym="${ym}" title="Suggest one or two main events per day, only where something stands out">✨ Guess main events</button>${mG.length?`<button data-act="mconfall" data-ym="${ym}">✓ Confirm ${mG.length} guessed</button><button data-act="mclr" data-ym="${ym}">Clear guesses</button>`:""}</div></div>`;
  h+=`<p class="mute" style="margin:2px 0 8px">Main events are the one or two things that define a day. Click ☆ on an event, right-click it, or drag it between the Main and All columns. A ✨ is a guess until you confirm it.</p>`;
  h+=`<div class="mg mgh"><div></div><div>★ Main event(s)</div><div>All events</div><div style="text-align:right">Day summary</div></div>`;
  for(let d=1;d<=days;d++){
    const ds=ym+"-"+String(d).padStart(2,"0"),dow=new Date(y,m-1,d).getDay();
    if(dow===0||d===1)h+=`<div class="mwk">Week ${weekNo(ds)}</div>`;
    h+=monthRow(ds,d,dow,byD.get(ds)||[],!!(S.mallOpen||S.mopen[ds]));
  }
  const mt=V().filter(i=>i.kind==="task"&&i.monthly&&monthOf(i.due)===ym);
  h+=`<div class="panel" style="margin-top:16px"><h2>✅ Tasks <span class="c">${mt.length}</span></h2>${mt.length?sortItems(mt,"mt").map(i=>itemRow(i)).join(""):`<p class="mute">No tasks parked on this month.</p>`}</div>`;
  const fut=V().filter(i=>i.kind!=="note"&&((i.date>last&&i.date<addDays(last,400))||(i.kind==="task"&&isOpen(i)&&i.due>last&&i.date<=last))).sort((a,b)=>(a.date).localeCompare(b.date));
  h+=`<div class="panel"><h2>🗓️ Future Log <span class="c">${fut.length}</span></h2>${fut.length?dedupeShow(fut).map(i=>itemRow(i,{showDate:1})).join(""):`<p class="mute">Nothing logged beyond this month.</p>`}</div>`;
  const sh=V().filter(i=>(i.colls||[]).includes("c-shows")&&monthOf(i.date)===ym);
  h+=`<div class="panel"><h2>📺 Shows &amp; Movies <span class="c">${sh.length}</span></h2>${sh.length?sh.map(i=>itemRow(i)).join(""):`<p class="mute">None logged.</p>`}</div>`;
  return h;
}
/* drag an event between the Main and All columns (same day only) */
(function(){
  let dragId=null;
  const clear=()=>document.querySelectorAll(".mev.dragging,.mzone.can,.mzone.over").forEach(x=>x.classList.remove("dragging","can","over"));
  document.addEventListener("dragstart",e=>{const c=e.target.closest&&e.target.closest(".mev");if(!c)return;dragId=c.dataset.id;const it=itemById(dragId);e.dataTransfer.effectAllowed="move";try{e.dataTransfer.setData("text/plain",dragId)}catch(x){}c.classList.add("dragging");if(it)document.querySelectorAll('.mzone[data-d="'+it.date+'"]').forEach(z=>z.classList.add("can"))});
  document.addEventListener("dragend",()=>{dragId=null;clear()});
  document.addEventListener("dragover",e=>{const z=e.target.closest&&e.target.closest(".mzone.can");if(!z||!dragId)return;e.preventDefault();document.querySelectorAll(".mzone.over").forEach(x=>x.classList.remove("over"));z.classList.add("over")});
  document.addEventListener("drop",e=>{const z=e.target.closest&&e.target.closest(".mzone.can");if(!z||!dragId)return;e.preventDefault();const it=itemById(dragId);dragId=null;clear();if(!it)return;
    if(z.dataset.zone==="main"){if(!it.main)mainAct(it,it.mainGuess?"ok":"on")}
    else{if(it.main)mainAct(it,"off");else if(it.mainGuess)mainAct(it,"no")}});
})();
/* right-click an event to set or clear main */
function closeCtx(){const m=document.getElementById("ctxm");if(m)m.remove()}
function ctxMenu(id,x,y){
  closeCtx();const it=itemById(id);if(!it)return;
  const rows=[];
  if(it.main)rows.push(["off","☆ Remove from main events"]);
  else if(it.mainGuess){rows.push(["ok","✓ Confirm as main event"]);rows.push(["no","✕ Not a main event"])}
  else rows.push(["on","★ Set as main event"]);
  rows.push(["open","Open event"],["day","Open "+shortDate(it.date)+" daily log"]);
  const m=document.createElement("div");m.id="ctxm";m.className="selmenu";
  m.innerHTML=`<div class="opts">${rows.map(([k,l])=>`<div class="opt" data-m="${k}">${l}</div>`).join("")}</div>`;
  m.style.left=x+"px";m.style.top=y+"px";document.body.appendChild(m);
  const r=m.getBoundingClientRect();
  if(r.right>innerWidth)m.style.left=Math.max(4,innerWidth-r.width-6)+"px";
  if(r.bottom>innerHeight)m.style.top=Math.max(4,innerHeight-r.height-6)+"px";
  m.addEventListener("click",ev=>{const o=ev.target.closest("[data-m]");if(!o)return;closeCtx();const k=o.dataset.m;
    if(k==="open")location.hash="#event:"+id;else if(k==="day")location.hash="#day:"+it.date;else mainAct(it,k)});
}
document.addEventListener("contextmenu",e=>{const c=e.target.closest&&e.target.closest(".mev");if(!c){closeCtx();return}e.preventDefault();ctxMenu(c.dataset.id,e.clientX,e.clientY)});
document.addEventListener("mousedown",e=>{if(!(e.target.closest&&e.target.closest("#ctxm")))closeCtx()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCtx()});
window.addEventListener("scroll",closeCtx,true);window.addEventListener("resize",closeCtx);
/* header: back/forward enabled only when there is somewhere to go */
function updHist(){try{const n=window.navigation;if(!n)return;const b=document.querySelector('#top [data-act="back"]'),f=document.querySelector('#top [data-act="fwd"]');if(b)b.disabled=!n.canGoBack;if(f)f.disabled=!n.canGoForward}catch(e){}}
function paintTop(){paintTop0();updHist()}
try{if(window.navigation)navigation.addEventListener("currententrychange",updHist)}catch(e){}
/* ---------- images field: drop, downsize, key image, thumbnails ---------- */
const MAXIMG=12;
async function shrink(file,max){
  const lim=S.assets?1900000:640000;max=max||(S.assets?1600:1100);
  try{const bmp=await createImageBitmap(file);let sc=Math.min(1,max/Math.max(bmp.width,bmp.height)),q=.84,w=0,h=0,blob=null;
    for(let n=0;n<7;n++){w=Math.max(1,Math.round(bmp.width*sc));h=Math.max(1,Math.round(bmp.height*sc));
      const cv=document.createElement("canvas");cv.width=w;cv.height=h;const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,w,h);g.drawImage(bmp,0,0,w,h);
      blob=await new Promise(r=>cv.toBlob(r,"image/jpeg",q));if(blob&&blob.size<=lim)break;sc*=.8;q=Math.max(.6,q-.06)}
    return{blob:blob||file,w,h}}catch(e){return{blob:file,w:0,h:0}}}
function keyImg(it){if(!it||!S.imgs.length)return null;const ms=imgsOf(it.id);if(!ms.length)return null;return ms.find(m=>m.id===it.thumb)||ms.slice().sort((a,b)=>(a.created||0)-(b.created||0))[0]}
function keyHero(it){if(!it||it.sensitive)return"";const m=keyImg(it);return m?`<div class="khero"><img src="${esc(imgSrc(m))}" alt="${esc(m.desc||"")}" data-act="imgview" data-iid="${esc(m.id)}" title="${esc(m.desc||"Key image")} (click to enlarge)"></div>`:""}
function keyThumb(it,cls){if(!it||it.sensitive)return"";const m=keyImg(it);return m?`<img class="ktm ${cls||""}" src="${esc(imgSrc(m))}" alt="" draggable="false" loading="lazy" data-act="imgview" data-iid="${esc(m.id)}" title="${esc((m.desc||"Key image")+" (click to open)")}">`:""}
function imagesRow(it){
  const ms=imgsOf(it.id).slice().sort((a,b)=>(a.created||0)-(b.created||0)),k=keyImg(it),id=esc(it.id);
  const th=ms.map(m=>{const isK=k&&k.id===m.id;return`<div class="kth ${isK?"key":""}"><img src="${esc(imgSrc(m))}" alt="${esc(m.desc||"")}" draggable="false" data-act="imgview" data-iid="${esc(m.id)}" title="${esc(m.desc||"Open details, tags and description")}">${isK?`<span class="kb">★ Key</span>`:""}<button class="kx" data-act="kimgdet" data-id="${id}" data-iid="${esc(m.id)}" title="Detach from this item (the image stays in Images)">×</button>${isK?"":`<button class="kk lnk" data-act="kimgkey" data-id="${id}" data-iid="${esc(m.id)}">☆ Make key</button>`}</div>`}).join("");
  return`<label>Images</label><div><div class="kdz" data-kdz="${id}" tabindex="0" title="Drag images here, or paste with ⌘V">${ms.length?`<div class="kst">${th}</div>`:""}<div class="row" style="margin-top:${ms.length?8:0}px"><button data-act="imgpick" data-id="${id}">Add Images</button><button type="button" data-act="kimgpaste" data-id="${id}" title="Paste an image from the clipboard">Paste Image</button><input type="file" accept="image/*" multiple hidden data-act="imgfile" data-id="${id}">${SRCDL}<span class="mute dsm">${ms.length?ms.length+" of "+MAXIMG+" · ":""}Drag images here (or onto this item), or paste with Ctrl/⌘+V. Each is shrunk to under 2 MB. The first is the key image; it shows in lists and the monthly log.</span></div></div></div>`}
async function pasteImgs(id,zone){
  try{
    if(!navigator.clipboard||!navigator.clipboard.read)throw 0;
    const items=await navigator.clipboard.read(),files=[];
    for(const c of items){const t=c.types.find(x=>x.startsWith("image/"));if(t){const b=await c.getType(t);files.push(new File([b],"pasted-"+Date.now()+"."+t.split("/")[1],{type:t}))}}
    if(!files.length){toast("No image on the clipboard");return}
    await addMany(files,id,"Pasted");return;
  }catch(e){}
  if(zone){zone.focus();zone.classList.add("dropping");zone.addEventListener("blur",()=>zone.classList.remove("dropping"),{once:true})}
  toast("Press Ctrl/⌘+V now to paste the image",6000);
}
document.addEventListener("paste",e=>{const z=e.target.closest&&e.target.closest("[data-kdz]");if(!z)return;const fs=[...(e.clipboardData&&e.clipboardData.files||[])].filter(f=>/^image\//.test(f.type));if(!fs.length)return;e.preventDefault();e.stopPropagation();z.classList.remove("dropping");addMany(fs,z.dataset.kdz,"Pasted")},true);
async function addMany(files,id,src){
  const list=[...files].filter(f=>/^image\//.test(f.type||"")||/\.(jpe?g|png|gif|webp|heic|heif|bmp|avif)$/i.test(f.name||""));
  if(!list.length){toast("Those aren't image files");return}
  const room=MAXIMG-imgsOf(id).length;
  if(room<=0){toast("This item already has "+MAXIMG+" images");return}
  const take=list.slice(0,room);toast("Adding "+take.length+" image"+(take.length>1?"s":"")+"…",30000);
  let n=0;for(const f of take){const m=await addImage(f,id,{src:src||"Dropped"});if(m)n++}
  toast(n?"Added "+n+" image"+(n>1?"s":"")+(list.length>take.length?" (limit "+MAXIMG+" per item)":""):"Couldn't add the image");
  render();
}
(function(){
  const hasF=e=>{const t=e.dataTransfer&&e.dataTransfer.types;return !!t&&[...t].includes("Files")};
  const zone=t=>t&&t.closest?(t.closest("[data-kdz]")||t.closest(".it[data-id]")):null;
  const idOf=z=>z.dataset.kdz||z.dataset.id;
  let cur=null;const clr=()=>{if(cur){cur.classList.remove("dropping");cur=null}};
  document.addEventListener("dragover",e=>{if(!hasF(e))return;e.preventDefault();const z=zone(e.target);
    if(z&&itemById(idOf(z))){e.stopPropagation();try{e.dataTransfer.dropEffect="copy"}catch(_){}if(cur!==z){clr();cur=z;z.classList.add("dropping")}}else clr()},true);
  document.addEventListener("dragleave",e=>{if(cur&&(!e.relatedTarget||!cur.contains(e.relatedTarget)))clr()},true);
  document.addEventListener("drop",e=>{if(!hasF(e))return;e.preventDefault();const z=zone(e.target);clr();if(!z)return;const id=idOf(z);if(!itemById(id))return;e.stopPropagation();addMany(e.dataTransfer.files,id)},true);
})();
document.addEventListener("click",async e=>{
  const b=e.target.closest&&e.target.closest("[data-act^='kimg']");if(!b)return;
  const a=b.dataset.act;
  if(a==="kimgtog"){S.kimgOff=!S.kimgOff;try{localStorage.setItem("bj_kimgoff",S.kimgOff?"1":"0")}catch(_){}document.body.classList.toggle("nokimg",!!S.kimgOff);paintTop();return}
  if(a==="kimgpaste"){pasteImgs(b.dataset.id,b.closest("[data-kdz]"));return}
  const id=b.dataset.id,it=itemById(id),m=S.imgs.find(x=>x.id===b.dataset.iid);if(!it||!m)return;
  if(a==="kimgkey"){it.thumb=m.id;await saveItem(it);toast("Key image set")}
  else if(a==="kimgdet"){
    const snap={parent:m.parent,links:[...(m.links||[])],thumb:it.thumb};
    const rest=[m.parent,...(m.links||[])].filter(x=>x&&x!==id);m.parent=rest[0]||"";m.links=rest.slice(1);
    if(it.thumb===m.id)delete it.thumb;
    upsertLocal("imgs",m);await save("imgs",m);await saveItem(it);
    toastUndo("Detached (the image stays in Images)",async()=>{m.parent=snap.parent;m.links=snap.links;upsertLocal("imgs",m);await save("imgs",m);if(snap.thumb===m.id)it.thumb=m.id;await saveItem(it)})}
});
try{S.kimgOff=localStorage.getItem("bj_kimgoff")==="1"}catch(_){}
document.body.classList.toggle("nokimg",!!S.kimgOff);
/* ---------- spheres: quick add and edit from any sphere picker ---------- */
const SPH_BASE=5,SPH_MAX=12;
const spParts=s=>{const m=String(s).match(/^(\S+)\s+([\s\S]*)$/);return m?[m[1],m[2]]:["🔹",String(s)]};
function isSphSel(sel){if(!sel||sel.tagName!=="SELECT")return false;if(sel.dataset.f==="sphere"||sel.dataset.k==="sphere"||sel.dataset.sphere)return true;const v=[...sel.options].map(o=>o.value).filter(Boolean);return v.length>=2&&v.every(x=>SPHERES.includes(x))}
async function saveSpheres(){try{await S.db.doc("meta/spheres").set({list:SPHERES.slice(),at:Date.now()})}catch(e){toast("Couldn't save spheres: "+(e.code||e.message))}}
async function loadSpheres(){
  try{if(typeof SPH_PAL!=="undefined"&&SPH_PAL.length<SPH_MAX)SPH_PAL.push("#e11d48","#0891b2","#65a30d","#9333ea","#d97706","#475569","#be185d")}catch(e){}
  try{const d=await S.db.doc("meta/spheres").get();if(d.exists){const l=(d.data()||{}).list;if(Array.isArray(l)&&l.length>=SPH_BASE&&l.every(x=>typeof x==="string")){SPHERES.splice(0,SPHERES.length,...l);if(S.ready)render()}}}catch(e){}}
(function w(n){if(S.db){loadSpheres();return}if(n<80)setTimeout(()=>w(n+1),500)})(0);
async function saveItemsBatch(arr){for(let i=0;i<arr.length;i+=15)await Promise.all(arr.slice(i,i+15).map(x=>save("items",x)))}
function sphereModal(mode,sel){
  const old=document.getElementById("sphm");if(old)old.remove();
  const filterish=!sel||["filt","evfsel","evsel","pfsel","cf"].includes(sel.dataset.act);
  const o=document.createElement("div");o.id="sphm";o.className="cropm";
  const rowsHtml=()=>SPHERES.map((s,i)=>{const[e,n]=spParts(s),cnt=S.items.filter(x=>(x.sphere||DEFAULT_SPHERE)===s).length;
    return`<div class="sphr" data-i="${i}"><input class="sphe" value="${esc(e)}" maxlength="4" aria-label="Emoji"><input class="sphn" value="${esc(n)}" aria-label="Name">${i>=SPH_BASE?`<button type="button" class="lnk warn sphd" title="Delete (its items move to ${esc(spShort(DEFAULT_SPHERE))})">✕</button>`:`<span class="mute dsm" style="width:22px;text-align:center" title="Built-in">·</span>`}<span class="mute dsm" style="width:34px;text-align:right" title="Items in this sphere">${cnt}</span></div>`}).join("");
  o.innerHTML=`<div class="cropbox sphbox" style="width:min(94vw,460px);max-height:90vh;overflow:auto;align-items:stretch"><b>${mode==="edit"?"Edit spheres":"New sphere"}</b>
   <div class="sphr sphnew"><input class="sphe" id="sphne" value="🔹" maxlength="4" aria-label="Emoji"><input class="sphn" id="sphnn" placeholder="New sphere name" autocomplete="off" aria-label="Name"><button type="button" class="pri" id="sphadd">Add</button></div>
   <div class="mute dsm" id="sphmsg">Pick an emoji and a name. Renaming updates every item in that sphere.</div>
   ${mode==="edit"?`<div class="sub" style="margin-top:8px">Your spheres <span class="mute dsm">· items</span></div><div id="sphrows">${rowsHtml()}</div><div class="row" style="margin-top:8px"><button type="button" class="pri" id="sphsave">Save changes</button><button type="button" id="sphx">Close</button></div>`:`<div class="row" style="margin-top:6px"><button type="button" id="sphx">Close</button><span class="sp"></span><button type="button" class="lnk" id="sphedit">Edit all spheres…</button></div>`}</div>`;
  document.body.appendChild(o);
  const q=s=>o.querySelector(s),msg=t=>{const m=q("#sphmsg");if(m)m.textContent=t};
  o.onclick=e=>{if(e.target===o)o.remove()};
  o.addEventListener("keydown",e=>{if(e.key==="Escape"){e.stopPropagation();o.remove()}else if(e.key==="Enter"&&e.target.id==="sphnn"){e.preventDefault();add()}},true);
  q("#sphx").onclick=()=>o.remove();
  const ed=q("#sphedit");if(ed)ed.onclick=()=>{o.remove();sphereModal("edit",sel)};
  const dupe=(nm,except)=>SPHERES.some((s,i)=>i!==except&&spParts(s)[1].trim().toLowerCase()===nm.trim().toLowerCase());
  async function add(){
    const e=(q("#sphne").value.trim()||"🔹").split(/\s+/)[0],n=q("#sphnn").value.trim();
    if(!n){msg("Type a name first.");q("#sphnn").focus();return}
    if(dupe(n,-1)){msg("There's already a sphere called “"+n+"”.");return}
    if(SPHERES.length>=SPH_MAX){msg("That's the limit ("+SPH_MAX+" spheres).");return}
    const full=e+" "+n;SPHERES.push(full);await saveSpheres();
    if(sel&&!filterish){const op=document.createElement("option");op.value=full;op.textContent=full;sel.appendChild(op);sel.value=full;sel.dispatchEvent(new Event("change",{bubbles:true}))}
    toast("Added sphere: "+full);
    if(mode==="edit"){q("#sphrows").innerHTML=rowsHtml();q("#sphnn").value="";q("#sphnn").focus()}else o.remove();
    render();
  }
  q("#sphadd").onclick=add;
  const sv=q("#sphsave");
  if(sv){
    o.addEventListener("click",e=>{const d=e.target.closest&&e.target.closest(".sphd");if(d){const r=d.closest(".sphr");r.classList.toggle("del");r.style.opacity=r.classList.contains("del")?.4:1;r.style.textDecoration=r.classList.contains("del")?"line-through":""}});
    sv.onclick=async()=>{
      const rows=[...o.querySelectorAll("#sphrows .sphr")];const next=[],map=new Map(),gone=new Set();
      for(const r of rows){const i=+r.dataset.i,cur=SPHERES[i];
        if(r.classList.contains("del")&&i>=SPH_BASE){gone.add(cur);continue}
        const e=(r.querySelector(".sphe").value.trim()||"🔹").split(/\s+/)[0],n=r.querySelector(".sphn").value.trim();
        if(!n){msg("Every sphere needs a name.");return}
        const nv=e+" "+n;if(next.some(x=>spParts(x)[1].toLowerCase()===n.toLowerCase())){msg("Two spheres are both called “"+n+"”.");return}
        next.push(nv);if(nv!==cur)map.set(cur,nv)}
      sv.disabled=true;msg("Saving…");
      const items=[];
      S.items.forEach(it=>{const s=it.sphere;if(!s)return;if(gone.has(s)){it.sphere=DEFAULT_SPHERE;items.push(it)}else if(map.has(s)){it.sphere=map.get(s);items.push(it)}});
      items.forEach(it=>{it.updated=Date.now()});
      SPHERES.splice(0,SPHERES.length,...next);
      await saveSpheres();
      await saveItemsBatch(items);
      for(const p of S.props){if(p.item&&p.item.sphere&&(gone.has(p.item.sphere)||map.has(p.item.sphere))){p.item.sphere=gone.has(p.item.sphere)?DEFAULT_SPHERE:map.get(p.item.sphere);save("props",p)}}
      for(const v of S.views){const f=v.filt&&v.filt.sphere;if(f&&(gone.has(f)||map.has(f))){v.filt.sphere=gone.has(f)?"":map.get(f);save("views",v)}}
      S._m=null;o.remove();toast("Spheres saved"+(items.length?" · "+items.length+" item"+(items.length>1?"s":"")+" updated":""));render();
    };
  }
  setTimeout(()=>{const f=q("#sphnn");if(f)f.focus()},30);
}
/* ---------- dashboard: Needs your attention vs Needs review (maintenance sweeps) ---------- */
S.maint=S.maint||{snz:{},ign:{}};
S.dpan={att:true,rev:false};try{const x=JSON.parse(localStorage.getItem("bj_dpan")||"null");if(x)S.dpan={...S.dpan,...x}}catch(e){}
const MN_SNZ=14*864e5;
const mIgn=k=>!!S.maint.ign[k];
const mSnoozed=c=>!!S.maint.snz[c]&&Date.now()-S.maint.snz[c]<MN_SNZ;
async function saveMaint(){S._mm=null;try{await S.db.doc("meta/maint").set({snz:S.maint.snz,ign:S.maint.ign,at:Date.now()})}catch(e){}}
async function loadMaint(){try{const d=await S.db.doc("meta/maint").get();if(d.exists){const x=d.data()||{};S.maint={snz:x.snz||{},ign:x.ign||{}};S._mm=null;if(S.ready)render()}}catch(e){}}
(function w(n){if(S.db){loadMaint();return}if(n<80)setTimeout(()=>w(n+1),500)})(0);
const sphType=s=>/veracross|gordon/i.test(s||"")?"Work":"Personal";
const personTypes=p=>{const t=ptList(p);return t.length?t:guessPtype(p)};
const mLinked=(a,b)=>(a.events||[]).includes(b.id)||(b.events||[]).includes(a.id)||(a.related||[]).includes(b.id)||(b.related||[]).includes(a.id);
const MSTOP=new Set("this that with from have they them then than were been will would could should about after before into over under your their there here what when where which while also just like some more most only very much many such each other another again still back down even well need needs make made going went come came take took want wants call called talk talked meeting meet email text send sent follow check update review plan prepare finish write work week today tomorrow yesterday morning afternoon evening night".split(" "));
const mtok=s=>(String(s||"").toLowerCase().match(/[a-z][a-z'’-]{3,}/g)||[]).filter(w=>!MSTOP.has(w));
/* 1. wrong person (person x sphere matrix) */
function mmFind(){
  const td=today(),pool=V().filter(i=>(i.people||[]).length&&!i.sensitive&&i.date>=addDays(td,-500)),stat={};
  pool.forEach(i=>{const s=i.sphere||DEFAULT_SPHERE,t=sphType(s);(i.people||[]).forEach(id=>{const o=stat[id]=stat[id]||{Work:0,Personal:0,n:0,sph:{}};o[t]++;o.n++;o.sph[s]=(o.sph[s]||0)+1})});
  const rows=[];
  pool.forEach(i=>{const s=i.sphere||DEFAULT_SPHERE,t=sphType(s),o=t==="Work"?"Personal":"Work";
    (i.people||[]).forEach(id=>{const p=S.people.find(x=>x.id===id);if(!p||p.isSelf)return;const key="pm|"+i.id+"|"+id;if(mIgn(key))return;
      const st=stat[id],pt=personTypes(p),sole=pt.length===1?pt[0]:"";
      if(!((sole&&sole!==t)||(st.n>=5&&st[t]/st.n<=.1&&st[o]/st.n>=.85)))return;
      const home=sole||o,fn=p.name.split(/\s+/)[0];
      const alt=S.people.find(x=>x.id!==id&&!x.isSelf&&firstName(x)===firstName(p)&&((personTypes(x).length===1&&personTypes(x)[0]===t)||(stat[x.id]&&stat[x.id][t]>stat[x.id][o])));
      const acts=[];
      if(alt)acts.push({id:"swap",label:"Swap to "+alt.name+(alt.rel?" ("+alt.rel+")":""),cls:"pri",run:async()=>{i.people=[...new Set(i.people.map(x=>x===id?alt.id:x))];await saveItem(i)}});
      acts.push({id:"rm",label:"Remove "+fn,run:async()=>{i.people=i.people.filter(x=>x!==id);await saveItem(i)}});
      rows.push({key,alt:alt?1:0,go:(i.kind==="event"?"event:":"item:")+i.id,title:p.name+" on “"+shortOf(i)+"”",sub:spShort(s)+" "+i.kind+" · "+shortDate(i.date)+" · "+p.name+" usually appears in "+home.toLowerCase()+" items"+(alt?" · did you mean "+alt.name+"?":""),acts})})});
  rows.sort((a,b)=>b.alt-a.alt);
  const mx=Object.entries(stat).filter(([id,o])=>o.n>=3&&Object.keys(o.sph).length>=2&&S.people.some(p=>p.id===id&&!p.isSelf)).sort((a,b)=>Math.min(b[1].Work,b[1].Personal)-Math.min(a[1].Work,a[1].Personal)||b[1].n-a[1].n).slice(0,14);
  const extra=mx.length?`<details style="margin-top:10px"><summary class="mute">Person × sphere matrix (${mx.length} people who span spheres)</summary><table class="mxt"><tr><th>Person</th>${SPHERES.map(s=>`<th title="${esc(s)}">${esc(s.split(" ")[0])}</th>`).join("")}</tr>${mx.map(([id,o])=>`<tr><td>${esc(pname(id))}</td>${SPHERES.map(s=>{const n=o.sph[s]||0,top=Math.max(...Object.values(o.sph));return`<td class="${n&&n<=top*.15?"lo":""}">${n||"·"}</td>`}).join("")}</tr>`).join("")}</table><div class="mute dsm">Red = rare for that person. Counts are tagged items over the last ~16 months.</div></details>`:"";
  return{rows:rows.slice(0,60),extra};
}
/* 2. event times and days */
const WDIX={sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};
function tmFind(){
  const td=today(),recent=addDays(td,-14),rows=[];
  const TIMED=/\b(lunch|dinner|breakfast|brunch|coffee|meeting|mtg|appointment|appt|call|zoom|interview|dentist|doctor|checkup|class|practice|rehearsal|game|recital|concert|service|flight|haircut|lesson|session|office hours|standup|1:1|sync|check-?in)\b/i;
  const ALLDAY=/\b(birthday|holiday|trip|vacation|visit|conference|retreat|camp|day off|ooo|out of office|anniversary|wedding|funeral|reunion|deadline|due)\b/i;
  dedupeShow(V().filter(i=>i.kind==="event"&&!i.sensitive)).forEach(e=>{
    const c=cleanTitle(e);
    if(!e.time&&!c.time){
      const m=String(e.detail||"").slice(0,400).match(TFIND)||String(e.text||"").match(TFIND),t=m&&normTime(m[1]);
      if(t&&t!=="all day"){const key="tm|"+e.id+"|text";if(!mIgn(key))rows.push({key,go:"event:"+e.id,title:"“"+shortOf(e)+"” · "+shortDate(e.date),sub:"The text mentions "+t+" but the event has no time.",acts:[{id:"set",label:"Set time to "+t,cls:"pri",run:async()=>{e.time=t;await saveItem(e)}}]});return}
      if(e.date>=recent&&TIMED.test(c.t||"")&&!ALLDAY.test(c.t||"")&&!e.end&&!["trip","visitor","milestone"].includes(e.etype)){const key="tm|"+e.id+"|none";
        if(!mIgn(key))rows.push({key,go:"event:"+e.id,input:"e.g. 10:00 AM",dl:"No time needed",title:"“"+shortOf(e)+"” · "+shortDate(e.date),sub:"Looks like it has a time, but none is set.",acts:[{id:"set",label:"Set time",cls:"pri",run:async v=>{const t=normRange(v);if(!t||!/\d/.test(t)){toast("Enter a time like 10:00 AM");return false}e.time=t;await saveItem(e)}}]})}
    }
    if(e.date>=addDays(td,-30)){
      const m=String(c.t||"").match(/(?:^|\bon\s+)(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/i);
      if(m){const ix=WDIX[m[1].toLowerCase()],d0=pd(e.date);if(d0.getDay()!==ix){let off=0;for(let k=-3;k<=3;k++){const d=new Date(d0);d.setDate(d.getDate()+k);if(d.getDay()===ix){off=k;break}}
        const nd=addDays(e.date,off),key="tm|"+e.id+"|day";
        if(!mIgn(key))rows.push({key,go:"event:"+e.id,dl:"Date is right",title:"“"+shortOf(e)+"” · "+longDate(e.date),sub:"The title says "+m[1]+", but the day is a "+WDL[d0.getDay()]+".",acts:[{id:"mv",label:"Move to "+longDate(nd),cls:"pri",run:async()=>{e.date=nd;await saveItem(e)}}]})}}
    }
  });
  return{rows:rows.sort((a,b)=>a.key.localeCompare(b.key)).slice(0,60)};
}
/* 3. related items */
async function linkItems(a,b){
  const ev=a.kind==="event"&&b.kind!=="event"?a:b.kind==="event"&&a.kind!=="event"?b:null;
  if(ev){const o=ev===a?b:a;o.events=[...new Set([...(o.events||[]),ev.id])];await saveItem(o)}
  else{a.related=[...new Set([...(a.related||[]),b.id])];b.related=[...new Set([...(b.related||[]),a.id])];await saveItem(a);await saveItem(b)}
}
function lkFind(){
  const td=today(),lo=addDays(td,-120),pool=V().filter(i=>!i.sensitive&&i.date>=lo),info=new Map(),df={};
  pool.forEach(i=>{const tt=new Set(mtok(cleanTitle(i).t||i.text)),dt=new Set(mtok((i.detail||"").slice(0,600)));info.set(i.id,{tt,dt,pp:new Set(i.people||[])});new Set([...tt,...dt]).forEach(w=>df[w]=(df[w]||0)+1)});
  const idx=new Map();pool.forEach(i=>{const f=info.get(i.id);new Set([...f.tt,...f.dt]).forEach(w=>{if(df[w]<=12){if(!idx.has(w))idx.set(w,[]);idx.get(w).push(i)}})});
  const sc=new Map();
  idx.forEach((arr,w)=>{for(let a=0;a<arr.length;a++)for(let b=a+1;b<arr.length;b++){const x=arr[a],y=arr[b];if(x.kind==="event"&&y.kind==="event")continue;const k=x.id<y.id?x.id+"|"+y.id:y.id+"|"+x.id;sc.set(k,(sc.get(k)||0)+(info.get(x.id).tt.has(w)&&info.get(y.id).tt.has(w)?2:1))}});
  const out=[];
  sc.forEach((s,k)=>{if(s<4)return;const[ia,ib]=k.split("|"),a=itemById(ia),b=itemById(ib);if(!a||!b||mLinked(a,b)||sameEv(a.text,b.text))return;
    const key="lk|"+k;if(mIgn(key))return;const fa=info.get(ia),fb=info.get(ib);
    const sp=[...fa.pp].filter(p=>fb.pp.has(p)).length,gap=Math.abs((pd(a.date)-pd(b.date))/864e5);
    let t=s+sp*2+(gap<=3?2:gap<=14?1:0);const ev=a.kind==="event"||b.kind==="event";
    if(t<(ev&&gap<=3?6:8))return;
    const sh=[...new Set([...fa.tt,...fa.dt])].filter(w=>fb.tt.has(w)||fb.dt.has(w)).slice(0,4);
    out.push({t,key,a,b,sh,sp})});
  out.sort((x,y)=>y.t-x.t);
  const lab=i=>({event:"Event",task:"Task",note:"Note"})[i.kind]+" “"+shortOf(i).slice(0,48)+"” ("+shortDate(i.date)+")";
  return{rows:out.slice(0,40).map(o=>({key:o.key,go:"item:"+o.a.id,title:lab(o.a)+"  ↔  "+lab(o.b),sub:"Shared: "+o.sh.join(", ")+(o.sp?" · same "+(o.sp>1?"people":"person"):""),acts:[{id:"link",label:"Link them",cls:"pri",run:()=>linkItems(o.a,o.b)}],dl:"Not related"}))};
}
/* 4. names that look like people but aren't in People */
function npFind(){
  const lo=addDays(today(),-240),cnt={},known=new Set();
  S.people.forEach(p=>{[p.name,...(p.akas||[]),...nicksOf(p)].forEach(n=>n&&known.add(String(n).toLowerCase()));String(p.name).split(/\s+/).forEach(w=>known.add(w.toLowerCase()))});
  V().filter(i=>!i.sensitive&&i.date>=lo&&i.kind!=="note").forEach(i=>{const t=String(cleanTitle(i).t||i.text);for(const m of t.matchAll(/\b(?:w\/|with)\s+([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?)/g)){const nm=m[1].trim(),f=nm.split(" ")[0];if(NAMESKIP.test(f)||known.has(nm.toLowerCase())||known.has(f.toLowerCase()))continue;(cnt[nm]=cnt[nm]||[]).push(i)}});
  const rows=Object.entries(cnt).filter(([,a])=>a.length>=2).sort((a,b)=>b[1].length-a[1].length).slice(0,30).map(([nm,a])=>({key:"np|"+nm.toLowerCase(),title:nm,sub:"“with "+nm+"” appears on "+a.length+" items, e.g. “"+shortOf(a[0]).slice(0,50)+"”",dl:"Not a person",
    acts:[{id:"add",label:"Add as a person",cls:"pri",run:async()=>{const p={id:slug(nm)+"-"+Math.random().toString(36).slice(2,5),name:nm,area:"Unsorted",areaGuess:true,created:Date.now()};upsertLocal("people",p);await save("people",p);for(const i of a){i.people=[...new Set([...(i.people||[]),p.id])];upsertLocal("items",i);await save("items",i)}toast(nm+" added to People and tagged on "+a.length+" items. Add their full name and relationship.")}}]})).filter(r=>!mIgn(r.key));
  return{rows};
}
/* 5. people with key info present but other details missing */
function pdFind(){
  const n={};V().forEach(i=>(i.people||[]).forEach(p=>n[p]=(n[p]||0)+1));
  const rows=[];
  S.people.forEach(p=>{if(p.isSelf||(n[p.id]||0)<3)return;if(String(p.name).trim().split(/\s+/).length<2||!(p.rel||relList(p).length))return;
    const work=personTypes(p).includes("Work"),miss=[];if(!p.email)miss.push("email");if(!p.phone)miss.push("phone");if(work&&!p.company)miss.push("company");if(work&&!p.role)miss.push("role");
    const key="pd|"+p.id;if(!miss.length||mIgn(key))return;rows.push({key,n:n[p.id],go:"person:"+p.id,dl:"Skip",title:p.name,sub:"Missing "+miss.join(", ")+" · on "+n[p.id]+" items",acts:[]})});
  return{rows:rows.sort((a,b)=>b.n-a.n).slice(0,40)};
}
const MAINT={
 pm:{em:"🧑‍🤝‍🧑",title:"Possible wrong person",sub:"A tagged person doesn't usually fit this sphere (work vs personal).",intro:"Each person has a work or personal “home” from their area, relationship and history. These items tag someone outside it, often two people who share a first name.",run:mmFind},
 tm:{em:"🕐",title:"Event times and days",sub:"Missing times, or a title that disagrees with the day.",intro:"Only recent and upcoming events are checked for a missing time. Older events are flagged only when their own text mentions a time. Nothing changes until you press a button.",run:tmFind},
 lk:{em:"🔗",title:"Items that look related",sub:"Notes, tasks and events sharing people and rare words.",intro:"Linking attaches a note or task to an event, or two items to each other. Skip pairs that only look alike.",run:lkFind},
 np:{em:"🆕",title:"Names not in People yet",sub:"Names after “with” that appear on several items.",intro:"Adding creates a person and tags them on those items. You'll then need their full name and relationship.",run:npFind},
 pd:{em:"🪪",title:"People missing details",sub:"Name and relationship are set; contact details aren't.",intro:"Lower priority. These people already have a full name and relationship.",run:pdFind}
};
/* ---------- more sweeps ---------- */
const PEOPLE_KEY=p=>!String(p.name).trim().includes(" ")||!relList(p).length;
function pcFind(){
  const rows=cuQueue().filter(p=>!PEOPLE_KEY(p)).map(p=>({key:"pc|"+p.id,n:0,go:"person:"+p.id,dl:"Skip",title:p.name,sub:"Still to confirm: "+cuNeeds(p).filter(x=>!/full name|relationship/.test(x)).join(", "),acts:[]})).filter(r=>!mIgn(r.key));
  return{rows:rows.slice(0,60)};
}
function xrFind(){
  const td=today(),lo=addDays(td,-180),hi=addDays(td,120),evs=dedupeShow(V().filter(e=>e.kind==="event"&&!e.sensitive&&e.date>=lo&&e.date<=hi)).map(e=>({e,t:shortOf(e).toLowerCase().trim()})).filter(x=>x.t.length>=10&&x.t.includes(" "));
  const its=V().filter(i=>i.kind!=="event"&&!i.sensitive&&i.date>=lo&&i.date<=hi&&(i.detail||"").length>10),out=[];
  its.forEach(i=>{const tx=((i.text||"")+" "+(i.detail||"")).toLowerCase();evs.forEach(({e,t})=>{if(out.length>200||!tx.includes(t)||mLinked(i,e))return;const key="xr|"+i.id+"|"+e.id;if(mIgn(key))return;
    out.push({key,go:"item:"+i.id,title:"“"+shortOf(i).slice(0,50)+"” mentions “"+shortOf(e)+"”",sub:({note:"Note",task:"Task"})[i.kind]+" · "+shortDate(i.date)+" · event on "+shortDate(e.date),acts:[{id:"link",label:"Link to event",cls:"pri",run:()=>linkItems(i,e)}],dl:"Not related"})})});
  return{rows:out.slice(0,40)};
}
function sdFind(){
  const lo=addDays(today(),-90);
  const rows=V().filter(i=>i.kind==="task"&&i.list==="someday"&&(i.status||"open")==="open"&&i.date<lo&&!mIgn("sd|"+i.id)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,40).map(i=>({key:"sd|"+i.id,go:"item:"+i.id,dl:"Keep",title:"“"+shortOf(i).slice(0,70)+"”",sub:"Parked as Someday since "+shortDate(i.date),acts:[{id:"next",label:"Move to Next",cls:"pri",run:async()=>{setList(i,"next");await saveItem(i)}},{id:"drop",label:"Drop",run:async()=>{i.status="dropped";await saveItem(i)}}]}));
  return{rows};
}
function onFind(){
  const lo=addDays(today(),-365);
  const rows=V().filter(i=>i.kind==="note"&&!i.sensitive&&i.date>=lo&&!(i.people||[]).length&&!(i.events||[]).length&&!(i.colls||[]).length&&String(i.detail||i.text).length>60&&!mIgn("on|"+i.id)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,40).map(i=>({key:"on|"+i.id,go:"item:"+i.id,dl:"Fine as is",title:"“"+shortOf(i).slice(0,70)+"”",sub:"Note · "+shortDate(i.date)+" · no person, event or collection attached",acts:[]}));
  return{rows};
}
function imFind(){
  const rows=S.imgs.filter(m=>!m.desc&&!/profile photo/i.test(m.src||"")&&!mIgn("im|"+m.id)).sort((a,b)=>(b.created||0)-(a.created||0)).slice(0,40).map(m=>({key:"im|"+m.id,img:imgSrc(m),input:"Describe it",dl:"No description needed",title:m.name||m.src||"Image",sub:"Added "+(m.at?String(m.at).slice(0,10):"")+" · no description"+((m.people||[]).length?"":" or people tagged"),acts:[{id:"desc",label:"Save description",cls:"pri",run:async v=>{if(!String(v).trim()){toast("Type a short description first");return false}m.desc=String(v).trim();upsertLocal("imgs",m);await save("imgs",m)}}]}));
  return{rows};
}
function ptFind(){
  const td=today(),lo=addDays(td,-180),last={},n={};
  V().forEach(i=>(i.people||[]).forEach(p=>{n[p]=(n[p]||0)+1;if(i.date<=td&&(!last[p]||i.date>last[p]))last[p]=i.date}));
  const rows=S.people.filter(p=>!p.isSelf&&p.kind!=="group"&&(n[p.id]||0)>=5&&last[p.id]&&last[p.id]<lo&&!mIgn("pt|"+p.id)).sort((a,b)=>last[a.id].localeCompare(last[b.id])).slice(0,40).map(p=>({key:"pt|"+p.id,go:"person:"+p.id,dl:"Fine",title:p.name,sub:"Last in your log "+shortDate(last[p.id])+" · "+n[p.id]+" items in all",acts:[]}));
  return{rows};
}
function sxFind(){
  const rows=V().filter(i=>i.sensitive===undefined&&!i.sensSet&&sensWhy(i)&&!mIgn("sx|"+i.id)).slice(0,40).map(i=>{const w=sensWhy(i);return{key:"sx|"+i.id,go:"item:"+i.id,dl:"Not sensitive",title:"“"+String(i.text||"").slice(0,70)+"”",sub:({event:"Event",task:"Task",note:"Note"})[i.kind]+" · "+shortDate(i.date)+" · the text mentions "+w,acts:[{id:"mark",label:"Mark sensitive",cls:"pri",run:async()=>{i.sensitive=true;i.sensSet=true;i.sensWhy="the text mentions "+w;await saveItem(i)}}]}});
  return{rows};
}
function mgFind(){
  const rows=V().filter(e=>e.kind==="event"&&e.mainGuess&&!e.main&&!mIgn("mg|"+e.id)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,60).map(e=>({key:"mg|"+e.id,go:"event:"+e.id,dl:"Decide later",title:"“"+shortOf(e)+"” · "+shortDate(e.date),sub:"Guessed as a main event for the day.",acts:[{id:"ok",label:"Make main",cls:"pri",run:async()=>{e.main=true;e.mainGuess=false;delete e.mainNo;await saveItem(e)}},{id:"no",label:"Not main",run:async()=>{e.main=false;e.mainGuess=false;e.mainNo=true;await saveItem(e)}}]}));
  return{rows};
}
Object.assign(MAINT,{
 pc:{em:"👥",title:"People: other details to confirm",sub:"Full name and relationship are set; how you know them or Work/Personal isn't confirmed.",intro:"Opens the people cleanup page. Full name and relationship are handled under Needs your attention.",run:pcFind},
 xr:{em:"🔎",title:"Notes that mention an event",sub:"A note or task names an event but isn't linked to it.",intro:"Linking attaches the note or task to that event so it shows with it. Or update the event's own notes by hand from Open.",run:xrFind},
 sd:{em:"💭",title:"Someday items gone stale",sub:"Parked 90+ days ago.",intro:"Move it back to Next, drop it, or keep it.",run:sdFind},
 on:{em:"🏝️",title:"Notes with nothing attached",sub:"No person, event or collection.",intro:"Attach people, an event or a collection from Open so these can be found later.",run:onFind},
 im:{em:"🖼️",title:"Images with no description",sub:"Add a line so they can be found.",intro:"Type a short description and save. Nothing else changes.",run:imFind},
 pt:{em:"💤",title:"People not seen in a while",sub:"Regulars with nothing logged in 6+ months.",intro:"Maybe time to reach out, or they simply drifted. Open a person to see their history.",run:ptFind},
 sx:{em:"🔒",title:"Possibly sensitive, not marked",sub:"The text mentions health, money or similar.",intro:"Marking hides the item's text and images from lists until you reveal it.",run:sxFind},
 mg:{em:"✨",title:"Main-event guesses to confirm",sub:"Guessed from the month; not yet decided.",intro:"Make main, or say it isn't. A \"not main\" is never guessed again.",run:mgFind}
});
function maintRun(){const now=Date.now();if(S._mm&&now-S._mm.t<30000)return S._mm.r;const r={};Object.keys(MAINT).forEach(k=>{try{r[k]=MAINT[k].run()}catch(e){r[k]={rows:[],err:k+": "+(e&&e.message||e)}}});S._mm={t:now,r};return r}
function maintCats(){
  if(!S.ready)return[];
  const R=maintRun(),L=[],dc=dupCount(),stale=V().filter(i=>isOpen(i)&&carriedN(i)>=3).length,dyn=S.colls.filter(c=>c.dynamic&&(!c.lastRun||Date.now()-c.lastRun>30*864e5)).length;
  const add=k=>{const n=(R[k]&&R[k].rows.length)||0;if(n)L.push({id:k,em:MAINT[k].em,title:MAINT[k].title,sub:MAINT[k].sub,n,...(k==="pc"?{go:"cleanup"}:{mrev:k})})};
  add("pm");add("tm");
  if(dc)L.push({id:"dupes",em:"🧹",title:"Duplicates to merge",sub:"Same item logged more than once.",n:dc,act:"dupes"});
  add("lk");add("xr");add("mg");add("np");add("sx");add("im");add("on");add("sd");add("pt");add("pd");add("pc");const bad=Object.values(R).filter(x=>x.err);if(bad.length)L.push({id:"err",err:1,em:"⚠️",title:bad.length+" check"+(bad.length>1?"s":"")+" failed to run",sub:bad.map(x=>x.err).join(" | ").slice(0,200),n:bad.length});
  if(stale)L.push({id:"stale",em:"🔁",title:"Migrated 3+ times",sub:"Do it, park it as Someday, or drop it.",n:stale,act:"triage",k:"stale"});
  if(dyn)L.push({id:"colls",em:"✨",title:"Collections to refresh",sub:"Dynamic collections not swept in 30+ days.",n:dyn,go:"colls"});
  return L;
}
function revRow(c){if(c.err)return`<div class="nrow"><span class="nem">${c.em}</span><div class="nmid"><b>${esc(c.title)}</b><div class="mute" style="white-space:normal">${esc(c.sub)}</div></div></div>`;const tgt=c.go?`data-go="${esc(c.go)}"`:c.mrev?`data-act="mrev" data-c="${c.mrev}"`:`data-act="${c.act}"${c.k?` data-k="${c.k}"`:""}`;
  return`<div class="nrow"><span class="nem">${c.em}</span><div class="nmid"><b>${esc(c.title)}</b><div class="mute">${esc(c.sub)}</div></div><span class="nnum">${c.n}</span><button ${tgt}>Review</button><button class="lnk" data-act="mign" data-c="${c.id}" title="Hide this for 14 days">Ignore</button></div>`}
function attStrip(){
  const att=attentionItems().filter(x=>!(x.act==="setup"&&!x.daily)&&x.act!=="dupes"&&!(x.act==="triage"&&x.k==="stale")&&x.go!=="colls");
  const all=maintCats(),rev=all.filter(c=>!mSnoozed(c.id)),snz=all.length-rev.length,o=S.dpan;
  const head=(k,t,n)=>`<h2 data-act="dpan" data-k="${k}"><span class="tg">${o[k]?"▾":"▸"}</span>${t} <span class="c">${n}</span></h2>`;
  return`<div class="dpair"><div class="panel tint dp" style="--tc:#f59e0b">${head("att","Needs your attention",att.length)}${o.att?`<div class="dpb">${att.length?`<div class="tiles">${att.map(attTile).join("")}</div>`:`<div class="dpok">✓ Nothing needs you right now.</div>`}</div>`:""}</div>
   <div class="panel tint dp" style="--tc:#3b5ba5">${head("rev","Needs review",rev.length)}${o.rev?`<div class="dpb">${rev.length?rev.map(revRow).join(""):`<div class="dpok">✓ Nothing to review.</div>`}${snz?`<div class="mute dsm" style="margin-top:6px">${snz} hidden for now · <button class="lnk" data-act="mrestore">show</button></div>`:""}</div>`:""}</div></div>`;
}
function openMaint(id){
  const M=MAINT[id];if(!M)return;S._mm=null;const res=maintRun()[id]||{rows:[]};S._mf={};res.rows.forEach(r=>S._mf[r.key]=r);
  const row=r=>`<div class="trr">${r.img?`<img src="${esc(r.img)}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;margin-right:10px;flex:none">`:""}<div class="trt"><b>${esc(r.title)}</b><div class="mute dsm">${esc(r.sub)}</div></div><div class="tra">${r.input?`<input data-mi placeholder="${esc(r.input)}" style="width:110px">`:""}${r.acts.map(a=>`<button data-mk="${esc(r.key)}" data-ma="${a.id}" class="${a.cls||""}">${esc(a.label)}</button>`).join("")}${r.go?`<button class="lnk" data-mk="${esc(r.key)}" data-ma="open">Open</button>`:""}<button class="lnk" data-mk="${esc(r.key)}" data-ma="dismiss">${esc(r.dl||"Not an issue")}</button></div></div>`;
  openModal(`<h3 style="margin-top:0">${M.em} ${esc(M.title)} <span class="mute" id="mcnt">${res.rows.length}</span></h3><p class="mute" style="margin:0 0 8px">${esc(M.intro)}</p><div id="mrl" style="max-height:58vh;overflow:auto">${res.rows.map(row).join("")||"<p>All clear. 🎉</p>"}</div>${res.extra||""}<div class="row" style="margin-top:10px"><span class="sp"></span><button class="pri" id="mclose">Close</button></div>`);
  const box=document.getElementById("mbox");
  box.onclick=async e=>{
    if(e.target.id==="mclose"){closeModal();return}
    const b=e.target.closest&&e.target.closest("button[data-ma]");if(!b)return;const r=S._mf[b.dataset.mk];if(!r)return;const ma=b.dataset.ma;
    if(ma==="open"){closeModal();location.hash="#"+r.go;return}
    if(ma==="dismiss"){S.maint.ign[r.key]=Date.now();await saveMaint()}
    else{const a=r.acts.find(x=>x.id===ma);if(!a)return;const inp=b.closest(".trr").querySelector("input[data-mi]");b.disabled=true;const ok=await a.run(inp?inp.value:"");if(ok===false){b.disabled=false;return}S._mm=null}
    const tr=b.closest(".trr");if(tr)tr.remove();const left=box.querySelectorAll(".trr").length,c=box.querySelector("#mcnt");if(c)c.textContent=left;if(!left)box.querySelector("#mrl").innerHTML="<p>All clear. 🎉</p>";
    render();
  };
}
document.addEventListener("click",async e=>{
  const b=e.target.closest&&e.target.closest("[data-act='dpan'],[data-act='mign'],[data-act='mrestore'],[data-act='mrev']");if(!b)return;
  const a=b.dataset.act;
  if(a==="dpan"){const k=b.dataset.k;S.dpan[k]=!S.dpan[k];try{localStorage.setItem("bj_dpan",JSON.stringify(S.dpan))}catch(_){}paintContent();return}
  if(a==="mign"){S.maint.snz[b.dataset.c]=Date.now();await saveMaint();paintContent();toast("Hidden for 14 days");return}
  if(a==="mrestore"){S.maint.snz={};await saveMaint();paintContent();return}
  if(a==="mrev")openMaint(b.dataset.c);
});
function mevCell(ds,evs){
  if(!evs.length)return`<span class="mph">—</span>`;
  const o=S.mevOne&&ds in S.mevOne?S.mevOne[ds]:!!S.mevAll,nm=evs.filter(e=>e.main).length,s=evs.length>1?"s":"";
  if(o)return`<button class="mcol on" data-act="mevtog" data-d="${ds}" title="Collapse this day's events">▾ ${evs.length} event${s}</button>`+evs.map(e=>mevChip(e,"all")).join("");
  return`<button class="mcol" data-act="mevtog" data-d="${ds}" title="Show all events for this day">▸ ${evs.length} event${s}${nm?` <span class="mute">· ${nm} main</span>`:""}</button>`;
}
document.addEventListener("click",e=>{
  const b=e.target.closest&&e.target.closest("[data-act='mevtog'],[data-act='mevall'],[data-act='yall']");if(!b)return;
  if(b.dataset.act==="yall"){S.yAll=!S.yAll;paintContent();return}
  S.mevOne=S.mevOne||{};
  if(b.dataset.act==="mevall"){S.mevAll=!S.mevAll;S.mevOne={}}
  else{const d=b.dataset.d,cur=d in S.mevOne?S.mevOne[d]:!!S.mevAll;S.mevOne[d]=!cur}
  paintContent();
});
function pageYear(){
  const y=S.arg||String(new Date().getFullYear()),yn=+y,curM=monthOf(today());
  const all=dedupeShow(V().filter(i=>(i.date||"").startsWith(y)));
  const evs=all.filter(i=>i.kind==="event"),tks=all.filter(i=>i.kind==="task"),nts=all.filter(i=>i.kind==="note");
  const mains=evs.filter(e=>e.main).sort((a,b)=>a.date.localeCompare(b.date)),done=tks.filter(i=>i.status==="done");
  const openY=V().filter(i=>isOpen(i)&&String(tday(i)).startsWith(y)).sort((a,b)=>tday(a).localeCompare(tday(b)));
  const byM={};all.forEach(i=>{const k=monthOf(i.date);(byM[k]=byM[k]||[]).push(i)});
  const maxN=Math.max(1,...Object.values(byM).map(a=>a.length));
  const box=(n,l)=>`<div class="msb"><b>${n}</b><span>${l}</span></div>`,pl=(n,w)=>n+" "+w+(n===1?"":"s");
  let h=`<div class="row"><a href="#year:${yn-1}"><button>‹</button></a><b style="font-size:1.15rem">${y} Yearly Log</b>${String(yn)===today().slice(0,4)?`<span class="chip" style="background:var(--accbg);color:var(--acc)">This year</span>`:""}<a href="#year:${yn+1}"><button>›</button></a></div>`;
  h+=`<div class="msum">${box(evs.length,"events")}${box(mains.length,"main events")}${box(done.length,"tasks done")}${box(openY.length,"open tasks")}${box(nts.length,"notes")}${box(all.length,"items in all")}</div>`;
  if(!all.length)return h+`<p class="mute">Nothing logged in ${esc(y)} yet.</p>`;
  const card=m=>{const ym=y+"-"+String(m).padStart(2,"0"),a=byM[ym]||[],e=a.filter(i=>i.kind==="event"),t=a.filter(i=>i.kind==="task"),n=a.filter(i=>i.kind==="note"),
      mn=e.filter(x=>x.main).sort((p,q)=>p.date.localeCompare(q.date)),dn=t.filter(i=>i.status==="done").length;
    return`<div class="ymc ${ym===curM?"now":""} ${a.length?"":"emp"}" data-go="month:${ym}"><h3>${MON[m-1]}<span class="mute">${a.length||""}</span></h3><div class="yb"><i style="width:${Math.round(a.length/maxN*100)}%"></i></div>${a.length?`<div class="ym">${pl(e.length,"event")} · ${pl(t.length,"task")}${dn?` (${dn} done)`:""} · ${pl(n.length,"note")}</div>`:`<div class="ym">Nothing logged</div>`}${mn.slice(0,3).map(x=>`<div class="yl" data-go="event:${esc(x.id)}" title="${esc(shortOf(x))}"><span class="mute">${+x.date.slice(8)}</span> ★ ${esc(shortOf(x))}</div>`).join("")}${mn.length>3?`<div class="ym">+${mn.length-3} more main</div>`:""}</div>`};
  h+=`<div class="panel"><h2>🗓️ Year at a glance <span class="sp"></span><span class="mute dsm">Click a month to open its log</span></h2><div class="ygrid">${[1,2,3,4,5,6,7,8,9,10,11,12].map(card).join("")}</div></div>`;
  const hm=[...new Set(mains.map(e=>monthOf(e.date)))].sort();
  h+=`<div class="panel"><h2>★ Highlights <span class="c">${mains.length}</span></h2>${hm.length?hm.map(ym=>`<div class="yh"><a class="yhm" href="#month:${ym}">${MON[+ym.slice(5)-1]}</a><div>${mains.filter(e=>monthOf(e.date)===ym).map(e=>`<div class="yl2" data-go="event:${esc(e.id)}">${keyThumb(e,"mkt")}<span class="mute">${shortDate(e.date)}</span> ${esc(shortOf(e))}</div>`).join("")}</div></div>`).join(""):`<p class="mute">No main events yet. Use “✨ Guess main events” on a monthly log, or star events there.</p>`}</div>`;
  const mt=evs.filter(e=>["milestone","trip","visitor"].includes(e.etype));
  if(mt.length)h+=`<div class="panel"><h2>🏆 Milestones, trips &amp; visitors <span class="c">${mt.length}</span></h2>${["milestone","trip","visitor"].map(t=>{const a=mt.filter(e=>e.etype===t).sort((p,q)=>p.date.localeCompare(q.date));return a.length?`<div class="yh"><span class="yhm">${etE(t)} ${esc(etL(t))}</span><div>${a.map(e=>`<div class="yl2" data-go="event:${esc(e.id)}"><span class="mute">${shortDate(e.date)}</span> ${esc(shortOf(e))}</div>`).join("")}</div></div>`:""}).join("")}</div>`;
  const sph=[...new Set([...SPHERES,...all.map(i=>i.sphere||DEFAULT_SPHERE)])].map(s=>[s,all.filter(i=>(i.sphere||DEFAULT_SPHERE)===s)]).filter(([,a])=>a.length),mx=Math.max(1,...sph.map(([,a])=>a.length));
  h+=`<div class="panel"><h2>🧭 By sphere</h2>${sph.map(([s,a])=>`<div class="ysp"><span>${esc(s)}</span><span class="yb"><i style="width:${Math.round(a.length/mx*100)}%"></i></span><span class="mute dsm">${pl(a.filter(i=>i.kind==="event").length,"event")} · ${pl(a.filter(i=>i.kind==="task").length,"task")} · ${pl(a.filter(i=>i.kind==="note").length,"note")}</span></div>`).join("")}</div>`;
  const pc={};all.forEach(i=>(i.people||[]).forEach(p=>{const o=S.people.find(x=>x.id===p);if(o&&!o.isSelf)pc[p]=(pc[p]||0)+1}));
  const tp=Object.entries(pc).sort((a,b)=>b[1]-a[1]).slice(0,14);
  if(tp.length)h+=`<div class="panel"><h2>👥 Most-seen people</h2><div class="row" style="flex-wrap:wrap">${tp.map(([id,n])=>`<span class="chip" data-go="person:${esc(id)}">${avatarP(id)}${esc(pname(id))} <span class="mute">${n}</span></span>`).join("")}</div></div>`;
  if(openY.length)h+=`<div class="panel"><h2>☑️ Open tasks <span class="c">${openY.length}</span><span class="sp"></span><button class="lnk" data-go="list:tasks">All tasks</button></h2>${openY.slice(0,10).map(i=>itemRow(i,{showDate:1})).join("")}${openY.length>10?`<p class="mute dsm">+${openY.length-10} more, soonest first shown.</p>`:""}</div>`;
  h+=`<div class="panel"><h2>📚 Browse everything <span class="c">${all.length}</span><span class="sp"></span><button data-act="yall">${S.yAll?"Hide full list":"Show full list"}</button></h2>${S.yAll?itemsView(V().filter(i=>(i.date||"").startsWith(y)||(i.due||"").startsWith(y)),"year-"+y,"month"):`<p class="mute dsm">The complete list, with filters, table and board views.</p>`}</div>`;
  return h;
}
function pageYearOld(){
  const y=S.arg||String(new Date().getFullYear());
  let h=`<div class="row"><b style="font-size:1.05rem">${y} Yearly Log</b></div><div class="panel"><h2>🗓️ Months</h2><div class="row">`;
  for(let m=1;m<=12;m++){const ym=y+"-"+String(m).padStart(2,"0");const c=V().filter(i=>monthOf(i.date)===ym).length;h+=`<a href="#month:${ym}"><button class="${ym===monthOf(today())?"pillsel on":""}">${MON[m-1]} <span class="mute">${c}</span></button></a>`}
  h+=`</div><div class="row" style="margin-top:8px"><a href="#year:${y-1}">‹ ${y-1}</a><a href="#year:${+y+1}">${+y+1} ›</a></div></div>`;
  h+=itemsView(V().filter(i=>(i.date||"").startsWith(y)||(i.due||"").startsWith(y)),"year-"+y,"month");return h;
}
function cntFor(kind,id){const f=kind==="person"?"people":kind==="event"?"events":"colls";return V().filter(i=>(i[f]||[]).includes(id)).length}
function entityList(kind){
  if(kind==='event')return eventsPage();
  if(kind==='person')return personList();
  let arr=kind==="person"?S.people:kind==="event"?S.events:S.colls;
  const label=kind==="person"?"People":kind==="event"?"Events":"Collections";
  const CF=S.cf=S.cf||{q:"",sort:"count",rev:false};const arr0=arr;arr=arr0.filter(x=>!CF.q||(x.name+" "+(x.def||x.description||"")).toLowerCase().includes(CF.q.toLowerCase()));arr=arr.slice().sort((a,b)=>CF.sort==="name"?a.name.localeCompare(b.name):CF.sort==="new"?(b.created||0)-(a.created||0):cntFor(kind,b.id)-cntFor(kind,a.id)||a.name.localeCompare(b.name));if(CF.rev)arr.reverse();
  let h=`<div class="ctlp"><div class="ctlr"><div class="ctll">Filter</div><div class="ctlc"><input data-act="cf" data-k="q" placeholder="Search ${label.toLowerCase()}" value="${esc(CF.q)}" style="width:220px"></div></div><div class="ctlr"><div class="ctll">View</div><div class="ctlc"><span class="mute">Sort</span><select data-act="cf" data-k="sort">${[["count","Most items"],["name","Name"],["new","Newest"]].map(([v,l])=>`<option value="${v}" ${CF.sort===v?"selected":""}>${l}</option>`).join("")}</select><button data-act="cfdir">${CF.rev?"↓":"↑"}</button><span class="sp"></span><span class="mute">${arr.length} of ${arr0.length}</span></div></div></div>
  <div class="row"><span class="mute">${arr.length} ${label.toLowerCase()}</span><span class="sp"></span><button class="pri" data-act="newent" data-k="${kind}">+ New ${kind==="coll"?"collection":kind}</button></div>`;
  if(kind==="coll")h+=`<p class="mute">Dynamic collections use a plain-language definition. Refresh sweeps your items with AI and proposes additions for review.</p>`;
  h+=`<div class="row" style="margin-top:10px;align-items:stretch">`+arr.slice().sort((a,b)=>cntFor(kind,b.id)-cntFor(kind,a.id)||a.name.localeCompare(b.name)).map(x=>`<div class="ecard" data-go="${kind}:${esc(x.id)}">${kind==="person"?`<span class="avatar" style="background:hsl(${hue(x.name)} 50% 42%)">${esc(initials(x.name))}</span>`:`<span style="font-size:1.4rem">${kind==="event"?"🗓️":"📁"}</span>`}<div><b>${esc(x.name)}</b> <span class="mute">${cntFor(kind,x.id)}</span>${x.dynamic?`<div class="mute">✨ ${esc(x.definition||"")}</div>`:""}${x.rel?`<div class="mute">${esc(x.rel)}</div>`:""}${x.start?`<div class="mute">${esc(x.start)}${x.end?" → "+esc(x.end):""}</div>`:""}</div></div>`).join("")+`</div>`;
  if(!arr.length)h+=`<p class="mute">None yet.</p>`;return h;
}
const PTYPES=["Work","Personal"];
const ptList=p=>Array.isArray(p&&p.ptype)?p.ptype:[];
function guessPtype(p){const w=new Set(),pe=new Set(),a=p.area||"";
  if(["Veracross","Gordon College"].includes(a))w.add("Work");if(["Family","Friends","Church","Asbury Grove","Core Homeschool"].includes(a))pe.add("Personal");
  const t=[p.company,relList(p).join(" "),p.context,p.role].join(" ").toLowerCase();
  if(/veracross|gordon|colleague|coworker|co-worker|client|manager|boss|my team|works? (with|at)|student|professor/.test(t))w.add("Work");
  if(/family|spouse|wife|husband|\bson\b|daughter|parent|sibling|friend|neighbor|church|cousin|aunt|uncle|grand/.test(t))pe.add("Personal");
  if(!w.size&&!pe.size){let wc=0,pc=0;V().filter(i=>(i.people||[]).includes(p.id)).forEach(i=>{if(/veracross|gordon/i.test(i.sphere||""))wc++;else pc++});if(wc>pc)w.add("Work");else if(pc)pe.add("Personal")}
  return[...(w.size?["Work"]:[]),...(pe.size?["Personal"]:[])]}
const ptVals=id=>[...document.querySelectorAll("#"+id+" button.on")].map(b=>b.dataset.v);
const ptypeMulti=(id,vals)=>`<span class="qb ptsel" id="${id}">${PTYPES.map(v=>`<button type="button" data-act="ptog" data-v="${v}" class="${vals.includes(v)?"on":""}">${v}</button>`).join("")}</span>`;
const PAREAS=["Family","Veracross","Gordon College","Asbury Grove","Core Homeschool","Friends","Church","Other","Unsorted"];
function pav(p,big){const sz=big?64:32;return photoUrl(p)?`<span class="avatar" style="width:${sz}px;height:${sz}px"><img src="${esc(photoUrl(p))}" alt="" referrerpolicy="no-referrer"></span>`:`<span class="avatar" style="width:${sz}px;height:${sz}px;font-size:${big?22:13}px;background:hsl(${hue(p.name)} 50% 42%)">${esc(initials(p.name))}</span>`}
/* ---------- task model: logged / due / completed, one record ---------- */
function localIso(){const d=new Date(Date.now()-new Date().getTimezoneOffset()*60000);return d.toISOString().slice(0,19)}
function loggedOf(i){return(i.loggedAt&&i.loggedAt.slice(0,10))||i.logged||(i.history&&i.history[0])||i.date||""}
function nmig(i){return Math.max((i.migs||[]).length,(i.history||[]).length)}
function reschedule(it,d){
  if(!d){it.due=null;return false}
  if(d===tday(it))return false;
  if(it.kind==="task"&&isOpen(it)){
    if(!it.loggedAt&&!it.logged)it.logged=loggedOf(it);
    it.migs=[...(it.migs||[]),{from:tday(it),to:d,at:localIso()}];
    it.history=[...new Set([...(it.history||[]),it.date])];
    delete it.ord;
  }
  it.date=d;it.due=d;return true;
}
function fmtDT(s){if(!s)return"";const d=new Date(s);return d.toLocaleDateString("en-US",{month:"short",day:"numeric"})+(s.length>10?", "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}):"")}
function mergeTasks(keep,others){
  const all=[keep,...others];
  keep.logged=all.map(loggedOf).filter(Boolean).sort()[0];
  const la=all.map(x=>x.loggedAt).filter(Boolean).sort()[0];if(la)keep.loggedAt=la;
  keep.history=[...new Set(all.flatMap(x=>[...(x.history||[]),...(x===keep?[]:[x.date])]))].filter(d=>d&&d!==keep.date).sort();
  keep.migs=all.flatMap(x=>x.migs||[]).sort((a,b)=>(a.at||"").localeCompare(b.at||""));
  keep.star=all.some(x=>x.star);
  ["people","events","related","colls"].forEach(f=>keep[f]=[...new Set(all.flatMap(x=>x[f]||[]))]);
  const ds=[...new Set(all.map(x=>(x.detail||"").trim()).filter(Boolean))];keep.detail=ds.join("\n");
}
async function autoDedupeTasks(){
  const groups=new Map();
  V().filter(i=>i.kind==="task"&&isOpen(i)).forEach(i=>{const k=evKey(i.text);if(k.length>=6){if(!groups.has(k))groups.set(k,[]);groups.get(k).push(i)}});
  let n=0;
  for(const g of groups.values()){if(g.length<2)continue;
    g.sort((a,b)=>tday(b).localeCompare(tday(a))||((b.detail||"").length-(a.detail||"").length));
    const keep=g[0],others=g.slice(1);mergeTasks(keep,others);
    for(const o of others){S.items=S.items.filter(i=>i.id!==o.id);await del("items",o.id);n++}
    S._m=null;await saveItem(keep)}
  if(n){toast("Merged "+n+" duplicate task"+(n>1?"s":"")+" into single records (history kept)",5000);render()}
}
const _wc=new Map();
function whoGuess(it){if(it.kind!=="event"||!S.people||!S.people.length)return{whose:"mine"};const k=it.id+"|"+it.text+"|"+S.people.length;let g=_wc.get(k);if(!g){g=ownerGuess(it);_wc.set(k,g)}return g}
function setWhose(it,v){it.whose=v;it.whoseAuto=false}
const whoseOf=it=>it.whose||whoGuess(it).whose;
const whoPersonOf=it=>it.whose?it.whoPerson:whoGuess(it).who;
function ownerGuess(it){
  const ps=(S.people||[]).filter(p=>!p.isSelf&&p.kind!=="group");
  const t=String(cleanTitle(it).t||"").trim();
  const find=nm=>{nm=String(nm).toLowerCase();return ps.find(p=>{const names=[p.name,...(p.akas||[]),...nicksOf(p)].map(x=>String(x).toLowerCase());const f=String(p.name).split(/\s+/)[0].toLowerCase();return names.includes(nm)||(f===nm&&ps.filter(q=>String(q.name).split(/\s+/)[0].toLowerCase()===f).length===1)})};
  let m=t.match(/^([A-Z][\w'.-]*(?:\s[A-Z][\w'.-]*)?)\s*:\s*\S/);
  if(m){const p=find(m[1]);if(p)return{whose:"other",who:p.id}}
  m=t.match(/^([A-Z][\w.-]*)['’]s\s/);
  if(m){const p=find(m[1]);if(p)return{whose:"other",who:p.id}}
  /* family member named anywhere in the title, and Ian not named and not a shared event */
  const shared=/\b(we|our|us|family|everyone|all of us|date night|ian|ian’s|ian's)\b/i.test(t);
  if(!shared){const fam=ps.filter(p=>p.area==="Family"||/family|spouse|wife|son|daughter|child|kid/i.test([p.rel,...(p.rels||[])].join(" ")));
    const hit=fam.find(p=>[p.name.split(/\s+/)[0],...(p.akas||[]),...nicksOf(p)].some(n=>n&&n.length>=3&&new RegExp("(^|[^A-Za-z])"+reEsc(n)+"($|[^A-Za-z])","i").test(t)));
    if(hit)return{whose:"other",who:hit.id}}
  return{whose:"mine"};
}
const EVF_KEY="bj-evf";
function evf(){if(!S.evf){let o={};try{o=JSON.parse(localStorage.getItem(EVF_KEY)||"{}")}catch(e){}S.evf={whose:o.whose||"",sphere:o.sphere||""}}return S.evf}
function setEvf(k,v){const f=evf();if(k==="clear"){f.whose="";f.sphere=""}else f[k]=v;try{localStorage.setItem(EVF_KEY,JSON.stringify(f))}catch(e){}paintContent()}
function evfPass(i){const f=evf();if(f.whose&&whoseOf(i)!==f.whose)return false;if(f.sphere&&(i.sphere||DEFAULT_SPHERE)!==f.sphere)return false;return true}
function evfBar(all){
  if(!all.length)return"";const f=evf();
  const sph=SPHERES.filter(x=>all.some(i=>(i.sphere||DEFAULT_SPHERE)===x)||x===f.sphere);
  const sg=(k,opts)=>`<span class="seg">${opts.map(([v,l])=>`<button data-act="evfset" data-k="${k}" data-v="${v}" class="${f[k]===v?"on":""}">${l}</button>`).join("")}</span>`;
  const on=f.whose||f.sphere;
  return`<div class="evf">${sg("whose",[["","All"],["mine",SVGI.userM+"Mine"],["other",SVGI.userO+"Others'"]])}<select class="pillsel ${f.sphere?"on":""}" data-act="evfsel" data-k="sphere"><option value="">All spheres</option>${sph.map(x=>`<option value="${esc(x)}" ${f.sphere===x?"selected":""}>${esc(x)}</option>`).join("")}</select>${on?`<button class="lnk" data-act="evfset" data-k="clear" data-v="">Clear</button>`:""}</div>`}
function fixTime(it){
  if(it.kind!=="event")return false;let ch=false;
  if(it.whose===undefined&&S.people&&S.people.length){const g=ownerGuess(it);it.whose=g.whose;it.whoseAuto=true;if(g.who){it.whoPerson=g.who;it.people=it.people||[];if(!it.people.includes(g.who))it.people.push(g.who)}ch=true}
  if(it.sub===undefined){it.sub=MEETRE.test(it.text||"")?"meeting":"event";ch=true}
  if(it.etype===undefined){it.etype=guessEtype(it);it.etypeAuto=true;ch=true}
  if(it.time){const n=normRange(it.time);if(n&&n!==it.time){it.time=n;ch=true}}
  else if(it.detail){const d=it.detail.trim();if(d.length<=24&&(/^all[ -]?day$/i.test(d)||new RegExp("^"+TPAT+"(?:\\s*[-–]\\s*"+TPAT+")?$","i").test(d))){it.time=normRange(d);it.detail="";ch=true}}
  if(!it.time){const m=String(it.text||"").match(TIMERE);if(m){it.time=normRange(m[1]);it.text=it.text.replace(TIMERE,"");ch=true}}
  return ch}
async function sweepTimes(){let n=0;for(const i of S.items.slice()){if(fixTime(i)){upsertLocal("items",i);await save("items",i);n++}}if(n){S._m=null;render()}}
/* ---------- notes on events, editor, auto-tagging ---------- */
const evNotes=ev=>V().filter(i=>i.kind==="note"&&(i.events||[]).includes(ev.id)).sort((a,b)=>(a.loggedAt||"").localeCompare(b.loggedAt||"")||(a.created||0)-(b.created||0));
function noteEditor(it){const big=it.kind!=="task",pv=mdStart(it.id,it.detail,S.mdPrev);return`<div class="nedit mdwrap ${big?"":"sm"}"><div class="tb"><button data-act="ed" data-v="bullet" title="Bulleted list for the selected lines">• List</button><button data-act="ed" data-v="num" title="Numbered list for the selected lines">1. List</button><button data-act="ed" data-v="indent" title="Indent (makes a sub-list)">⇥</button><button data-act="ed" data-v="outdent" title="Outdent">⇤</button><button data-act="ed" data-v="head" title="Make the line a heading">H</button><button data-act="ed" data-v="bold" title="Bold the selection"><b>B</b></button><button data-act="ed" data-v="time" title="Insert the current time">Time</button><button data-act="edimg" title="Insert an image here">Image</button><input type="file" accept="image/*" hidden data-act="edimgfile"><span class="mute" style="font-size:.78em">Markdown. People, events and collections are tagged when you click out.</span><button type="button" class="mdtog" data-act="mdtog" title="Switch between the Markdown text and the formatted view">${pv?"Markdown":"Formatted"}</button></div><textarea data-f="detail" ${pv?"hidden":""} placeholder="${it.kind==="note"?"Write your note…":"Notes"}">${esc(it.detail||"")}</textarea><div class="mdp mkd" ${pv?"":"hidden"}>${pv?(inlineImgs(mdRender(it,it.detail||""),1)||'<span class="mute">Nothing yet.</span>'):""}</div></div>`}
function growTa(t){t.style.height="auto";t.style.height=Math.max(t.scrollHeight+2,t.closest(".nedit.sm")?80:170)+"px"}
function edCmd(ta,c){
  const v=ta.value;let a=ta.selectionStart,b=ta.selectionEnd;const ls=v.lastIndexOf("\n",a-1)+1;let le=v.indexOf("\n",b);if(le<0)le=v.length;
  if(c==="time"){const t=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});ta.setRangeText(t+" ",a,b,"end")}
  else if(c==="bold"){const sel=v.slice(a,b);if(/^\*\*[\s\S]*\*\*$/.test(sel)&&sel.length>4)ta.setRangeText(sel.slice(2,-2),a,b,"select");else if(sel)ta.setRangeText("**"+sel+"**",a,b,"select");else{ta.setRangeText("****",a,b,"end");ta.setSelectionRange(a+2,a+2)}}
  else{const lines=v.slice(ls,le).split("\n");let k=0;
    const num=lines.every(l=>!l.trim()||/^\s*\d+[.)] /.test(l));
    const hd=lines.every(l=>!l.trim()||/^#{1,4} /.test(l));
    const block=lines.map(l=>{
      if(c==="bullet")return/^\s*[•\-*] /.test(l)?l.replace(/^(\s*)[•\-*] /,"$1"):l.replace(/^(\s*)(\d+[.)] )?/,"$1- ");
      if(c==="num")return num?l.replace(/^(\s*)\d+[.)] /,"$1"):(l.trim()?l.replace(/^(\s*)([•\-*] |\d+[.)] )?/,(m0,sp)=>sp+(++k)+". "):l);
      if(c==="head")return hd?l.replace(/^#{1,4} /,""):(l.trim()?"## "+l.replace(/^#{1,4} /,""):l);
      return c==="indent"?"  "+l:l.replace(/^ {1,2}/,"")}).join("\n");
    ta.setRangeText(block,ls,le,"select")}
  ta.focus();growTa(ta);ta.dispatchEvent(new Event("change",{bubbles:true}));
}
function evNotesSec(ev){const ns=evNotes(ev);return`<label>Notes on this event</label><div><div class="evn">${ns.length?ns.map(n=>itemRow(n,{})).join(""):`<span class="mute">None yet.</span>`}</div><button data-act="newnote" data-id="${esc(ev.id)}">+ Add note to this event</button></div>`}
async function newNoteFor(ev){
  const c=cleanTitle(ev),now=localIso();
  const n={id:uid("i"),kind:"note",text:"Notes: "+c.t,detail:"",date:ev.date,sphere:ev.sphere||DEFAULT_SPHERE,people:[...(ev.people||[])],events:[ev.id],related:[],colls:[...(ev.colls||[])],created:Date.now(),loggedAt:now,history:[],src:{name:"Added on event"}};
  await saveItem(n);return n}
const EVSTOP=new Set("with from that this have will your about into over under after before event meeting lunch dinner call".split(" "));
async function autoTag(it){
  if(!it||it.kind==="event"&&false)return;
  const txt=(it.text||"")+"\n"+(it.detail||"");const added=[];
  const NOT=new Set([...WDL,...MON,"Today","Tomorrow","And","The","But","Said","Told","Asked","Wants","Called","Mentioned"].map(x=>x.toLowerCase()));
  const pctx={sphere:it.sphere,people:it.people,unresolved:[]};findPeople(txt,pctx).filter(id=>{const p=S.people.find(x=>x.id===id);if(!p||p.name.trim().includes(" "))return true;const m=txt.match(new RegExp("\\b"+reEsc(p.name)+"\\s+([A-Z][a-z]{2,})\\b"));return !(m&&!NOT.has(m[1].toLowerCase()))}).forEach(id=>{if(!(it.people||[]).includes(id)){it.people=[...(it.people||[]),id];added.push(pname(id))}});
  S.colls.forEach(c=>{if(new RegExp("\\b"+reEsc(c.name)+"\\b","i").test(txt)&&!(it.colls||[]).includes(c.id)){it.colls=[...(it.colls||[]),c.id];added.push("#"+c.name)}});
  if(it.kind!=="event"){
    const lc=txt.toLowerCase(),tms=[...txt.matchAll(new RegExp("\\b("+TPAT+")","gi"))].map(m=>normTime(m[1])).filter(Boolean);
    V().filter(e=>e.kind==="event"&&e.id!==it.id&&Math.abs((pd(e.date)-pd(it.date||today()))/864e5)<=1&&!(it.events||[]).includes(e.id)).forEach(e=>{
      const c=cleanTitle(e),words=evKey(c.t).split(" ").filter(w=>w.length>=4&&!EVSTOP.has(w));
      const hit=words.filter(w=>lc.includes(w)).length;
      const byWords=words.length&&hit>=Math.max(1,Math.ceil(words.length/2))&&(hit>=2||words.length===1||e.date===it.date);
      const byTime=c.time&&tms.includes(normTime(c.time))&&e.date===it.date;
      const byPeople=e.date===it.date&&(e.people||[]).length&&(e.people||[]).some(p=>(it.people||[]).includes(p))&&hit>=1;
      if(byWords||byTime||byPeople){it.events=[...(it.events||[]),e.id];added.push(evLabel(e))}});
  }
  if(it.sensitive===undefined&&!it.sensSet&&it.kind==="note"){const w=sensWhy(it);if(w){it.sensitive=true;it.sensWhy="the text mentions "+w+" (flagged automatically)";added.push("🔒 sensitive")}}
  if(pctx.unresolved.length)setTimeout(()=>resolveAmbig(it,pctx.unresolved),400);
  if(added.length){await saveItem(it);toast("Tagged: "+added.slice(0,4).join(", ")+(added.length>4?" +"+(added.length-4):""),4000);paintContent()}
}
/* ---------- archive, confirm, tabs, tint, sensitivity, picker, people review ---------- */
const MONTHS_L=["January","February","March","April","May","June","July","August","September","October","November","December"];
function monthLog(d){const[y,m]=String(d).split("-").map(Number);return MONTHS_L[m-1]+(y!==pd(today()).getFullYear()?" "+y:"")+" Log"}
function ask(msg,ok){return new Promise(res=>{let b=document.getElementById("ask");if(b)b.remove();b=document.createElement("div");b.id="ask";b.className="askbar";b.innerHTML=`<div style="margin-bottom:8px">${esc(msg)}</div><div class="row"><button class="pri" id="ask_ok">${ok||"OK"}</button><button id="ask_no">Cancel</button></div>`;document.body.appendChild(b);const done=v=>{b.remove();res(v)};b.querySelector("#ask_ok").onclick=()=>done(true);b.querySelector("#ask_no").onclick=()=>done(false)})}
function askText(msg,val){return new Promise(res=>{let b=document.getElementById("ask");if(b)b.remove();b=document.createElement("div");b.id="ask";b.className="askbar";b.innerHTML=`<div style="margin-bottom:6px">${esc(msg)}</div><input id="ask_in" value="${esc(val||"")}" style="width:100%;margin-bottom:8px"><div class="row"><button class="pri" id="ask_ok">Save</button><button id="ask_no">Cancel</button></div>`;document.body.appendChild(b);const i=b.querySelector("#ask_in");i.focus();i.select();const done=v=>{b.remove();res(v)};b.querySelector("#ask_ok").onclick=()=>done(i.value);b.querySelector("#ask_no").onclick=()=>done(null);i.onkeydown=e=>{if(e.key==="Enter")done(i.value)}})}
const ARCH_MSG="Archived items are kept for 30 days, then deleted for good. You can restore them from Archived in the sidebar.";
async function archiveItem(it){it.archivedAt=Date.now();delete S.expanded[it.id];if(S.sel===it.id)S.sel=null;await saveItem(it);toastUndo("Archived (kept 30 days).",async()=>{delete it.archivedAt;await saveItem(it)});render()}
async function archiveEnt(c,x){x.archivedAt=Date.now();upsertLocal(c,x);await save(c,x);toast("Archived. Restore it from Archived in the sidebar.",4000);render()}
function archCount(){return S.items.filter(i=>i.archivedAt).length+(S.arch_people||[]).length+(S.arch_colls||[]).length}
async function purgeArchive(){const lim=Date.now()-30*864e5;let n=0;
  for(const i of S.items.filter(i=>i.archivedAt&&i.archivedAt<lim)){S.items=S.items.filter(x=>x.id!==i.id);await del("items",i.id);n++}
  for(const c of["people","colls"]){const a=S["arch_"+c]||[];for(const x of a.filter(x=>x.archivedAt<lim)){S["arch_"+c]=S["arch_"+c].filter(y=>y.id!==x.id);await del(c,x.id);n++}}
  if(n){S._m=null;render()}}
function pageArchived(){
  const its=S.items.filter(i=>i.archivedAt).sort((a,b)=>b.archivedAt-a.archivedAt),pp=S.arch_people||[],cc=S.arch_colls||[];
  const left=t=>Math.max(0,30-Math.floor((Date.now()-t)/864e5))+" days left";
  const row=(c,id,label,t)=>`<div class="it"><span class="gl">🗄</span><div class="mid"><div class="ttl">${label}</div><div class="mute dsm">Archived ${esc(shortDate(ymd(new Date(t))))} · ${left(t)}</div></div><span class="ac" style="opacity:1"><button data-act="restore" data-c="${c}" data-id="${esc(id)}">↩ Restore</button><button class="warn" data-act="purgeone" data-c="${c}" data-id="${esc(id)}">Delete now</button></span></div>`;
  return`<p class="mute">${ARCH_MSG}</p>`+(!its.length&&!pp.length&&!cc.length?`<p class="mute">Nothing archived.</p>`:"")+
   (its.length?`<h2 style="font-size:1rem">Items <span class="c">${its.length}</span></h2>`+its.map(i=>row("items",i.id,(i.sensitive?"🔒 Sensitive "+i.kind:esc(cleanTitle(i).t))+` <span class="mute">${esc(i.kind)} · ${esc(shortDate(i.date))}</span>`,i.archivedAt)).join(""):"")+
   (pp.length?`<h2 style="font-size:1rem">People <span class="c">${pp.length}</span></h2>`+pp.map(p=>row("people",p.id,esc(p.name),p.archivedAt)).join(""):"")+
   (cc.length?`<h2 style="font-size:1rem">Collections <span class="c">${cc.length}</span></h2>`+cc.map(p=>row("colls",p.id,esc(p.name),p.archivedAt)).join(""):"");
}
async function restoreOne(c,id){
  if(c==="items"){const i=S.items.find(x=>x.id===id);if(i){delete i.archivedAt;await saveItem(i)}}
  else{const x=(S["arch_"+c]||[]).find(y=>y.id===id);if(x){delete x.archivedAt;S["arch_"+c]=S["arch_"+c].filter(y=>y.id!==id);upsertLocal(c,x);await save(c,x)}}
  toast("Restored");render()}
async function purgeOne(c,id){if(!await ask("Delete this for good? This can't be undone.","Delete now"))return;
  if(c==="items")S.items=S.items.filter(x=>x.id!==id);else S["arch_"+c]=(S["arch_"+c]||[]).filter(x=>x.id!==id);
  S._m=null;await del(c,id);render()}
/* ---------- tabs ---------- */
function hashTitle(h){const x=h.slice(1),i=x.indexOf(":"),v=i<0?x:x.slice(0,i),a=i<0?"":x.slice(i+1);
  if(v==="obj"||v==="event"||v==="item"){const it=itemById(a);return it?(it.sensitive?"🔒 Sensitive":cleanTitle(it).t.slice(0,28)):"Item"}
  if(v==="img")return"Image";if(v==="images")return"Images";
  if(v==="person"){const p=S.people.find(p=>p.id===a);return p?p.name:"Person"}
  if(v==="day")return a===today()?"Today":shortDate(a);if(v==="month")return a?monthLog(a+"-01"):"Month";
  return TITLES[v]||"Daily log"}
function tabBar(){return""} /* pop-out tabs retired (docs/DESIGN.md: where things open) */
function popOut(id){openFull(id)}
function saveTabs(){try{localStorage.setItem("bj-tabs",JSON.stringify(S.ptabs))}catch(e){}}
function loadPw(){try{if(localStorage.getItem("bj-sbc"))document.body.classList.add("sbc")}catch(e){}try{S.pw=localStorage.getItem("bj-pw")||"m"}catch(e){S.pw="m"}}
function loadTabs(){try{S.ptabs=(JSON.parse(localStorage.getItem("bj-tabs")||"[]")||[]).filter(t=>t&&t.h)}catch(e){S.ptabs=[]}}
function pageObj(){
  const x=itemById(S.arg);if(!x)return`<p>Item not found.</p>`;
  if(x.sensitive&&!S.reveal[x.id])return`<div class="panel"><p><b>Sensitive ${esc(x.kind)}</b> · ${esc(shortDate(x.date))}</p><p class="mute">${sensTip(x)}</p><button class="pri" data-act="reveal" data-id="${esc(x.id)}">Reveal</button></div>`;
  return docPage(x);
}
/* ---------- tint colours ---------- */
const TINT0={events:"#3b82f6",tasks:"#22c55e",notes:"#f59e0b"},SPH_PAL=["#6366f1","#0ea5e9","#84cc16","#f97316","#ec4899","#14b8a6","#a855f7"];
function tintFor(k){if(S.colors&&S.colors[k])return S.colors[k];if(TINT0[k])return TINT0[k];const n=k.replace(/^sphere:/,"");const i=SPHERES.indexOf(n);return SPH_PAL[(i<0?hue(n)%SPH_PAL.length:i)%SPH_PAL.length]}
const tintSw=k=>`<input type="color" class="swatch" data-act="tint" data-k="${esc(k)}" value="${tintFor(k)}" title="Change this box's background colour">`;
async function loadColors(){try{const wk=await S.db.doc("meta/weekly").get();S.lastWeekly=wk.exists?wk.data():null}catch(e){}try{const sw=await S.db.doc("meta/sweep").get();S.lastSweep=sw.exists?sw.data():null}catch(e){}try{const m=await S.db.doc("meta/colors").get();S.colors=m.exists?(m.data().c||{}):{}}catch(e){S.colors={}}}
async function setTint(k,v){S.colors=S.colors||{};S.colors[k]=v;try{await S.db.doc("meta/colors").set({c:S.colors})}catch(e){}paintContent()}
/* ---------- sensitive ---------- */
const SENSW=[["money",/\b(salary|paycheck|\$\s?\d|loan|mortgage|debt|owes?|owed|taxes|tax return|invoice|bonus|severance|credit card|tithe|net worth|savings|settlement)\b/i],["religion",/\b(prayer|prayed|praying|my faith|pastor|sermon|baptis|confession|spiritual direction|theolog)/i],["conflict",/\b(argument|argued|fight|fought|furious|resent|upset with|conflict|complained|complaint|fired|laid off|layoff|lawsuit|divorce|confront|betray)/i],["health",/\b(diagnos|therapy|therapist|medication|surgery|cancer|anxiety|depress)/i]];
function sensWhy(it){const t=(it.text||"")+"\n"+(it.detail||"");const r=SENSW.find(([k,re])=>re.test(t));return r?r[0]:""}
const sensTip=it=>esc((it.sensWhy?"Marked sensitive: "+it.sensWhy+". ":"You marked this sensitive. ")+"It stays hidden in lists until you open it. Click the lock in the open view to unmark.");
function maskRow(it,lead,ac){const k=it.kind==="event"?"event":it.kind==="task"?"task":"note";return`<div class="it" data-id="${esc(it.id)}">${lead}<div class="mid"><div class="ttl"><span class="sensx" data-act="reveal" title="${sensTip(it)}">🔒 Sensitive ${k}</span> <span class="mute dsm">${esc(shortDate(it.date))}</span></div></div>${ac}</div>`}
/* ---------- picker ---------- */
function closePick(){document.querySelectorAll(".pickmenu").forEach(m=>m.remove())}
/* ---------- meeting section ---------- */
const MEETRE=/\b(mtg|meeting|1:1|1-1|sync|stand-?up|huddle|zoom|teams call|webinar|call w|call with|interview|office hours|check-?in|kickoff|retro|demo)\b/i;
function meetingSec(it){
  const tr=it.transcript||"",open=S.showTr&&S.showTr[it.id],id=esc(it.id),work=S.trWork&&S.trWork[it.id];
  const evb=S.mcp?`<button data-act="trevernote" data-id="${id}" title="Search Evernote for this meeting's notes">🐘 ${tr?"Replace from":"Find in"} Evernote</button>`:"";
  const ai=tr?`<div class="mute" style="margin-top:4px">${work?"Pulling action items…":it.trSig?`Action items: ${it.trCount||0} sent to your Inbox.`:"No action items pulled yet."} ${S.sample&&!work?`<button data-act="trextract" data-id="${id}">${it.trSig?"Pull again":"Pull action items"}</button>`:""}</div>`:"";
  const sw=S.sumWork&&S.sumWork[it.id],sf=it.sumFmt||"para";
  const sumHd=S.sample?`<div class="sumhd"><span class="mute dsm">${sw?"Writing summary…":it.summary&&it.summaryAuto?"AI summary: "+esc((SUMFMT.find(x=>x[0]===sf)||SUMFMT[0])[1]).toLowerCase():""}</span><span class="sp"></span><button data-act="summenu" data-id="${id}" title="${tr?"Generate or regenerate the summary in a different format":"Add a transcript first"}" ${sw?"disabled":""}>✨ Summary ▾</button>${S.sumMenu===it.id?`<div class="summenu">${SUMFMT.map(([k,l])=>`<button data-act="sumgen" data-id="${id}" data-fmt="${k}" class="${sf===k&&it.summary&&it.summaryAuto?"on":""}">${l}${sf===k&&it.summary&&it.summaryAuto?" ✓":""}</button>`).join("")}</div>`:""}</div>`:"";
  return`<label>Summary</label><div class="sumw">${sumHd}${(()=>{const fv=S.sumEdit&&S.sumEdit[it.id]!==undefined?!S.sumEdit[it.id]&&!!it.summary:mdStart(null,it.summary);return`<div class="nedit sm mdwrap"><div class="mdbar"><span class="mute dsm">Markdown</span><button type="button" class="mdtog" data-act="mdtog" title="Switch between the Markdown text and the formatted view">${fv?"Markdown":"Formatted"}</button></div><textarea data-f="summary" ${fv?"hidden":""} placeholder="Summary: decisions, takeaways, next steps. Generated from the transcript, or type your own. Markdown works.">${esc(it.summary||"")}</textarea><div class="mdp mkd" ${fv?"":"hidden"}>${fv?mdRender(it,it.summary):""}</div></div>`})()}</div>
   <label>Transcript</label><div>${tr?`<button data-act="trtoggle" data-id="${id}">${open?"Hide transcript":"Show transcript"} <span class="mute">· ${tr.split(/\s+/).length.toLocaleString()} words</span></button> <button data-act="trclear" data-id="${id}" class="warn">Remove</button> ${S.sample?`<button data-act="trsum" data-id="${id}" ${sw?"disabled":""}>✨ ${it.summary?"Regenerate":"Generate"} summary</button> `:""}${evb}${open?`<pre class="trbox">${esc(tr)}</pre>`:`<span class="mute"> Hidden until you open it.</span>`}${ai}`:`<input type="file" accept=".txt,.vtt,.srt,.md" data-act="trfile" data-id="${id}"> <span class="mute">or</span> <button data-act="trpaste" data-id="${id}">Paste transcript</button> ${evb}${S.trPaste===it.id?`<textarea id="trta" style="min-height:240px;margin-top:4px" placeholder="Paste the transcript"></textarea><button class="pri" data-act="trsave" data-id="${id}">Save transcript and pull action items</button>`:""}`}</div>
   <label>Source link</label><div><input data-f="tlink" placeholder="Link to the recording, Zoom page, or Evernote note" value="${esc(it.tlink||"")}" style="width:min(100%,440px)"> ${it.tlink?`<a class="chip src" href="${esc(it.tlink)}" target="_blank" rel="noopener">⎘ Open</a>`:""}${it.tname?` <span class="mute dsm">${esc(it.tname)}</span>`:""}</div>`}
/* ---------- people: intelligence ---------- */
const RELS=["Spouse","Child","Parent","Sibling","Extended family","Friend","Neighbor","Church","Colleague","Manager","Direct report","Student","Client / partner","Acquaintance","Other"];
const AREA_OF_SPH={0:["Veracross"],1:["Gordon College"],2:["Asbury Grove","Church","Friends","Family"],3:["Core Homeschool"]};
const WORKW=/\b(meeting|mtg|deck|release|customer|kb|support|project|standup|review|roadmap|jira|ticket|agenda|sync|client|webinar|article|onboarding)\b/i,SOCW=/\b(get-?together|party|dinner|dessert|barbecue|bbq|church|game night|hang(ing)? out|visit|weekend|vacation|camp|kids|cookout|brunch|birthday|neighbors?|fire|campfire|porch)\b/i;
function pickPerson(tok,ids,t,ctx){
  ctx=ctx||{};const lt=tok.toLowerCase();const sc=[];
  const cands=ids.map(id=>S.people.find(p=>p.id===id)).filter(Boolean);
  const hasNick=p=>nicksOf(p).some(n=>n.toLowerCase()===lt);const nickHolders=cands.filter(hasNick).length;
  cands.forEach(p=>{let s=0;const a=p.area||"Unsorted";
    if(hasNick(p)&&nickHolders===1)s+=3;
    if(p.name.toLowerCase()===lt)s+=2;
    const sph=ctx.sphere?SPHERES.indexOf(ctx.sphere):-1;
    if(sph>=0&&sph<4){if(AREA_OF_SPH[sph].includes(a))s+=3;else s-=2}
    if(sph===SPHERES.length-1||sph===4){if(["Family","Friends","Church","Asbury Grove"].includes(a))s+=2;if(a==="Veracross")s-=2}
    if(WORKW.test(t)&&["Veracross","Gordon College"].includes(a))s+=2;
    if(SOCW.test(t)&&["Friends","Family","Church","Asbury Grove"].includes(a))s+=2;
    const co=(ctx.people||[]).map(id=>(S.people.find(x=>x.id===id)||{}).area).filter(x=>x&&x===a).length;s+=Math.min(2,co);
    const cw=(p.context||"").toLowerCase().split(/[^a-z0-9’']+/).filter(w=>w.length>=5&&!["works","with","from","們"].includes(w));if(cw.some(w=>t.toLowerCase().includes(w)))s+=2;
    if(p.company&&t.toLowerCase().includes(p.company.toLowerCase()))s+=2;
    s+=Math.min(2,cntFor("person",p.id)/10);sc.push([s,p])});
  sc.sort((a,b)=>b[0]-a[0]);
  if(sc.length&&sc[0][0]>=2&&(sc.length<2||sc[0][0]-sc[1][0]>=2))return sc[0][1].id;return null}
function ambigTokens(){const m={};S.people.filter(p=>!p.isSelf).forEach(p=>{const f=p.name.split(/\s+/)[0].toLowerCase();(m[f]=m[f]||[]).push(p.id);nicksOf(p).forEach(nk=>{if(nk.toLowerCase()!==f)(m[nk.toLowerCase()]=m[nk.toLowerCase()]||[]).push(p.id)})});Object.keys(m).forEach(k=>{m[k]=[...new Set(m[k])];if(m[k].length<2||k.length<3)delete m[k]});return m}
/* ---------- people review ---------- */
function cuNeeds(p){const n=[];if(!p.name.trim().includes(" "))n.push("a full name");if(!relList(p).length)n.push("relationship");if(!p.context)n.push("how you know them");if(!ptList(p).length)n.push("Work / Personal type");else if(p.ptypeAuto)n.push("confirm Work / Personal (I guessed)");return n}
function cuQueue(){return S.people.filter(p=>p.kind!=="group"&&!p.isSelf&&!p.reviewed&&(!p.name.trim().includes(" ")||!relList(p).length||!p.context||!ptList(p).length||p.ptypeAuto)&&!(S.cuSkip||[]).includes(p.id))}
function whyRow(i,a,b){const ppl=(i.people||[]).filter(x=>x===a||x===b||!b);return`<div class="panel" style="margin:6px 0"><div class="mute">${esc(shortDate(i.date))} · ${esc(i.kind)}</div><div>${i.sensitive?"🔒 Sensitive entry":esc(cleanTitle(i).t.slice(0,160))}</div><div style="margin-top:4px">Tagged: ${(i.people||[]).map(x=>`<span class="chip">${esc(fname(x))} <button data-act="whyun" data-id="${esc(i.id)}" data-p="${esc(x)}" data-a="${esc(a)}" ${b?`data-b="${esc(b)}"`:""} title="Remove ${esc(fname(x))} from this entry" style="padding:0 4px">✕</button></span>`).join(" ")||"nobody"}</div></div>`}
function whyCo(a,b){const its=V().filter(i=>(i.people||[]).includes(a)&&(i.people||[]).includes(b)).sort((x,y)=>y.date.localeCompare(x.date));
  openModal(`<h3 style="margin-top:0">Why “${esc(fname(a))}” is often with “${esc(fname(b))}”</h3><p class="mute">Only because ${its.length} ${its.length===1?"entry has":"entries have"} both of them tagged. Nothing else is inferred. If a tag is wrong, press ✕ on it; the list and the count update. The date and text are unchanged.</p>${its.map(i=>whyRow(i,a,b)).join("")||`<p>No shared entries any more. That link is gone.</p>`}<div class="row" style="margin-top:8px"><span class="sp"></span><button data-act="mclose">Done</button></div>`)}
function whyIt(id,a){const i=S.items.find(x=>x.id===id);if(!i)return;openModal(`<h3 style="margin-top:0">Who is tagged on this entry</h3><p class="mute">Press ✕ to remove a wrong tag. To change the text, date or add people, open the entry from its day.</p>${whyRow(i,a,"")}<div class="row" style="margin-top:8px"><button data-act="whygo" data-k="day" data-id="${esc(i.date)}">Open day</button><span class="sp"></span><button data-act="mclose">Done</button></div>`)}
function pageCleanup(){
  const q=cuQueue();S.cuTotal=S.cuTotal||q.length;
  if(!q.length&&!S.cuCur)return`<h2 style="font-size:1.05rem">All caught up</h2><p class="mute">Everyone has a full name, relationship and type, or you skipped them. <button data-act="curesetskip">Review skipped again</button> <a href="#people">Back to people</a></p>`;
  const p=(S.cuCur&&S.people.find(x=>x.id===S.cuCur&&!x.isSelf))||q[0];S.cuCur=p.id;const inQ=q.includes(p),nd0=cuNeeds(p),nd={name:!p.name.trim().includes(" "),rel:!relList(p).length,ctx:!p.context,type:!ptList(p).length||!!p.ptypeAuto},rv=k=>nd[k]?"rv":"";
  const mine=V().filter(i=>(i.people||[]).includes(p.id)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const co={};V().filter(i=>(i.people||[]).includes(p.id)).forEach(i=>(i.people||[]).forEach(x=>{if(x!==p.id)co[x]=(co[x]||0)+1}));
  const seen=Object.entries(co).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const rels=[...new Set([...(p.rel&&!RELS.includes(p.rel)?[p.rel]:[]),...RELS])];
  const same=S.people.filter(x=>x.id!==p.id&&x.name.split(/\s+/)[0].toLowerCase()===p.name.split(/\s+/)[0].toLowerCase());
  const need=nd0;
  return`<div class="panel tint" style="--tc:#3b5ba5"><b>What this review is for</b><p class="mute" style="margin:4px 0 0">I use these details to tell people apart (two Chrises, for example) and to guess who you mean when you write a first name. For each person, check the fields below, fix anything wrong, then press <b>Confirm and next</b>. Fields I filled in by guessing are marked. <span class="rvl">Highlighted</span> fields are the ones I think need a look; anything not highlighted looks complete. Skip anyone you can’t place right now.</p></div>
  <p class="mute">${S.cuTotal-q.length+1} of ${S.cuTotal} to review${inQ?"":" · reviewed earlier ✓"}${need.length?" · this one still needs: <b>"+esc(need.join(", "))+"</b>":""}</p>
  <div class="panel" data-cu="${esc(p.id)}"><div class="row" style="align-items:center">${pav(p,1)}<div style="flex:1"><b style="font-size:1.15rem">${esc(p.name)}</b><div class="mute">${esc([p.rel,p.role,p.company].filter(Boolean).join(" · ")||"Nothing recorded yet")}</div></div></div>
   <div class="f" style="margin-top:8px"><label class="${rv("name")}">Full name</label><input class="${rv("name")}" id="cu_name" value="${esc(p.name)}" placeholder="First Last"><label>Nicknames</label><input id="cu_nick" value="${esc(p.nick||"")}" placeholder="Several allowed, separated by commas"><label class="${rv("rel")}">Relationship</label><div class="${rv("rel")}">${relMulti("cu_rel",relList(p))}</div><label class="${rv("type")}">Type</label><div class="${rv("type")}">${ptypeMulti("cu_type",ptList(p).length?ptList(p):guessPtype(p))}</div><label class="${rv("ctx")}">How I know them</label><textarea class="${rv("ctx")}" id="cu_ctx" style="min-height:50px" placeholder="e.g. I work with them at Veracross">${esc(p.context||"")}</textarea>${!p.context&&ctxSuggest(p)?`<span></span><span class="mute">Suggested: ${esc(ctxSuggest(p))} <button data-act="cuuse" data-v="${esc(ctxSuggest(p))}">Use</button></span>`:""}<label>Organization</label><div class="row"><select id="cu_co" data-addnew="organization"><option value="">—</option>${[...new Set([...(p.company?[p.company]:[]),...S.orgs.map(o=>o.name)])].sort().map(n=>`<option ${p.company===n?"selected":""}>${esc(n)}</option>`).join("")}</select><input id="cu_role" placeholder="Role / title there" value="${esc(p.role||"")}" style="flex:1;min-width:140px"></div><label>Email</label><input id="cu_email" value="${esc(p.email||"")}"></div>
   <div class="mute" style="margin:6px 0 2px">Context${seen.length?" · often with "+seen.map(([id,n])=>`<a href="javascript:void 0" data-act="whyco" data-a="${esc(p.id)}" data-b="${esc(id)}" title="Why? See the ${n} shared entries">${esc(pname(id))} (${n})</a>`).join(", "):""}${p.email?" · "+esc(p.email):""}</div>${mine.length?mine.map(i=>`<div class="mute" style="font-size:.88em;cursor:pointer" data-act="whyit" data-id="${esc(i.id)}" data-a="${esc(p.id)}" title="Open this entry to see or fix who is tagged">${esc(shortDate(i.date))} · ${i.sensitive?"🔒 Sensitive":esc(cleanTitle(i).t.slice(0,90))}</div>`).join(""):`<div class="mute" style="font-size:.88em">Not in any entries yet.</div>`}
   ${same.length?`<div class="mute" style="margin-top:6px">Others with this first name: ${same.map(x=>esc(x.name)).join(", ")}. If this is one of them, use Merge into.</div>`:""}
   <div class="row" style="margin-top:10px"><button data-act="cuback" ${(S.cuStack||[]).length?"":"disabled"}>← Back</button><button class="pri" data-act="cusave" data-id="${esc(p.id)}">Confirm and next</button><button data-act="cuskip" data-id="${esc(p.id)}">Skip</button><button data-act="mergeinto2" data-id="${esc(p.id)}">Merge into…</button><span class="sp"></span><button class="warn" data-act="cuarch" data-id="${esc(p.id)}">🗄 Archive</button></div></div>`}
const orgByName=n=>S.orgs.find(o=>o.name.toLowerCase()===String(n||"").trim().toLowerCase());
async function ensureOrg(name){name=String(name||"").trim();if(!name)return null;let o=orgByName(name);if(!o){o={id:"o-"+slug(name)+"-"+Math.random().toString(36).slice(2,5),name,created:Date.now()};upsertLocal("orgs",o);await save("orgs",o)}return o.id}
const orgLink=p=>p.company?(p.org&&S.orgs.some(o=>o.id===p.org)?`<a class="tl" data-go="org:${esc(p.org)}">${esc(p.company)}</a>`:esc(p.company)):"";
function pageOrg(){
  const o=S.orgs.find(x=>x.id===S.arg);if(!o)return`<p>Organization not found. <a href="#people">Back to people</a></p>`;
  const ppl=S.people.filter(p=>p.org===o.id).sort((a,b)=>lastName(a).localeCompare(lastName(b)));
  return`<div class="row" style="align-items:center"><b style="font-size:1.2rem">${esc(o.name)}</b><span class="sp"></span><button data-act="orgrename" data-id="${esc(o.id)}">Rename</button></div><p class="mute">${ppl.length} ${ppl.length===1?"person":"people"}</p>`+ppl.map(p=>`<div class="pcard" data-go="person:${esc(p.id)}">${pav(p)}<div style="min-width:0"><b>${esc(p.name)}</b><div class="mute">${esc(p.context||[p.rel,p.role].filter(Boolean).join(" · "))}</div></div></div>`).join("")}
function ctxSuggest(p){const b=[];if(p.company&&(p.area==="Veracross"||/veracross/i.test(p.company)))b.push("Works with me at "+p.company+(p.role?" ("+p.role+")":""));else if(p.company)b.push("Connected through "+p.company+(p.role?" ("+p.role+")":""));
  else if(p.area==="Gordon College")b.push("Gordon College");else if(p.area==="Asbury Grove")b.push("Asbury Grove neighbor or community");else if(p.area==="Church")b.push("From church");return b[0]||""}
async function sweepPeople(){
  for(const p of S.people){if(!p.photoImg)continue;const m=S.imgs.find(x=>x.id===p.photoImg);if(m&&!(m.people||[]).includes(p.id)){m.people=[...(m.people||[]),p.id];upsertLocal("imgs",m);save("imgs",m)}}
  for(const p of S.people){let ch=false;
    if(p.isSelf===undefined&&/^(ian drummond|self|me|myself|ian)$/i.test(String(p.name).trim())){p.isSelf=true;ch=true}
    if(!Array.isArray(p.ptype)||(p.ptypeAuto&&!p.ptype.length)){p.ptype=guessPtype(p);p.ptypeAuto=true;ch=true}
    if(!Array.isArray(p.rels)){const r=String(p.rel||"").trim();if(r&&RELS.includes(r))p.rels=[r];else{p.rels=[];if(r&&!p.context)p.context=r;p.rel=""}ch=true}
    if(!p.org&&p.email){const dm=(p.email.split("@")[1]||"").split(".")[0].toLowerCase();const o=dm.length>=4&&S.orgs.find(o=>o.name.toLowerCase().replace(/[^a-z0-9]/g,"").includes(dm));if(o){p.org=o.id;p.company=o.name;ch=true}}
    if(p.company&&!p.org){const id=await ensureOrg(p.company);if(id){p.org=id;p.company=S.orgs.find(o=>o.id===id).name;ch=true}}
    if(ch){upsertLocal("people",p);await save("people",p)}}
  const c=S.people.find(p=>p.id==="p-chris"&&p.name==="Chris");
  if(c){c.name="Chris Westrate";c.akas=[...new Set([...(c.akas||[]),"Chris"])];c.nick="Chris";upsertLocal("people",c);await save("people",c)}
}

/* ---------- type-to-filter for dropdowns with 5+ options ---------- */
(function(){
  let menu=null;const close=()=>{if(menu){menu.remove();menu=null}};
  function open(sel){
    close();const r=sel.getBoundingClientRect();menu=document.createElement("div");menu.className="selmenu";
    menu.style.left=Math.max(4,Math.min(r.left,innerWidth-250))+"px";menu.style.top=Math.min(r.bottom+2,innerHeight-200)+"px";if(r.width>220)menu.style.minWidth=r.width+"px";
    menu.innerHTML='<input placeholder="Type to filter…" autocomplete="off"><div class="opts"></div>'+(isSphSel(sel)?'<div class="sphft"><button type="button" data-sph="new">＋ New sphere…</button><button type="button" data-sph="edit">✎ Edit spheres…</button></div>':"");
    const inp=menu.querySelector("input"),box=menu.querySelector(".opts");let hl=0,shown=[];
    const paint=()=>{const raw=inp.value.trim(),q=raw.toLowerCase();shown=[...sel.options].filter(o=>!o.disabled&&(!q||o.textContent.toLowerCase().includes(q)));
      if(sel.dataset.addnew&&raw&&![...sel.options].some(o=>o.textContent.trim().toLowerCase()===q))shown.push({add:raw});
      if(hl>=shown.length)hl=0;
      box.innerHTML=shown.map((o,i)=>o.add?`<div class="opt${i===hl?" hl":""}" data-i="${i}"><span style="color:var(--mute)">＋ Add new ${esc(sel.dataset.addnew)}</span> “${esc(o.add)}”</div>`:`<div class="opt${o.value===sel.value?" cur":""}${i===hl?" hl":""}" data-i="${i}">${esc(o.textContent)||"—"}</div>`).join("")||'<div class="opt" style="color:var(--mute)">No match</div>'};
    const pick=o=>{close();if(o&&o.add){const op=document.createElement("option");op.textContent=o.add;op.value=o.add;sel.appendChild(op);sel.value=o.add;sel.dispatchEvent(new Event("change",{bubbles:true}));sel.focus();return}if(o&&sel.value!==o.value){sel.value=o.value;sel.dispatchEvent(new Event("change",{bubbles:true}))}sel.focus()};
    inp.oninput=()=>{hl=0;paint()};
    inp.onkeydown=e=>{if(e.key==="Escape"){close();sel.focus()}else if(e.key==="Enter"){e.preventDefault();pick(shown[hl])}else if(e.key==="ArrowDown"){e.preventDefault();hl=Math.min(shown.length-1,hl+1);paint()}else if(e.key==="ArrowUp"){e.preventDefault();hl=Math.max(0,hl-1);paint()}};
    box.onmousedown=e=>{const d=e.target.closest(".opt[data-i]");if(d){e.preventDefault();pick(shown[+d.dataset.i])}};
    const ft=menu.querySelector(".sphft");if(ft)ft.onmousedown=e=>{const b=e.target.closest("button[data-sph]");if(!b)return;e.preventDefault();close();sphereModal(b.dataset.sph,sel)};
    document.body.appendChild(menu);paint();inp.focus();
    const cur=box.querySelector(".cur");if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:"nearest"});
  }
  document.addEventListener("mousedown",e=>{
    if(menu&&!e.target.closest(".selmenu"))close();
    const sel=e.target.closest&&e.target.closest("select");
    if(!sel||(sel.options.length<5&&!sel.dataset.addnew&&!isSphSel(sel))||sel.disabled||sel.multiple)return;
    e.preventDefault();open(sel);
  });
  window.addEventListener("scroll",e=>{if(menu&&!(e.target.closest&&e.target.closest(".selmenu")))close()},true);
})();
/* ---------- nicknames, hover info, org relations, images, ask-which ---------- */
const nicksOf=p=>String(p&&p.nick||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean);
const ORGRELS=["Works at","Attends church at","Attended school at","Teaches at","Studies at","Volunteers at","Board member of","Client or partner of","Member of","Neighbor of"];
const safeTitle=i=>i.sensitive?"🔒 Sensitive "+(i.kind||"item"):cleanTitle(i).t;
const orgOfP=p=>p&&p.org?S.orgs.find(o=>o.id===p.org):null;
function personLine(p){return[(p.role&&p.company?p.role+", "+p.company:p.company||p.role),p.rel].filter(Boolean).join(" · ")}
function tipGo(go){
  const i=go.indexOf(":"),t=go.slice(0,i),id=go.slice(i+1);
  if(t==="person"){const p=S.people.find(x=>x.id===id);if(!p)return"";return[p.name+(nicksOf(p).length?" (“"+nicksOf(p).join("”, “")+"”)":""),personLine(p),p.context,p.area&&p.area!=="Unsorted"?p.area:""].filter(Boolean).join("\n")}
  if(t==="event"||t==="item"||t==="obj"){const x=itemById(id);if(!x)return"";if(x.sensitive)return"🔒 Sensitive "+x.kind+" · hidden until opened";const c=cleanTitle(x);return[c.t,longDate(x.date)+(c.time?" · "+c.time:""),(x.sub==="meeting"?"Meeting · ":x.kind[0].toUpperCase()+x.kind.slice(1)+" · ")+(x.sphere||""),(x.people||[]).length?"With "+x.people.map(pname).join(", "):""].filter(Boolean).join("\n")}
  if(t==="coll"){const c=S.colls.find(x=>x.id===id);return c?c.name+(c.definition?"\n"+c.definition:""):""}
  if(t==="org"){const o=S.orgs.find(x=>x.id===id);return o?o.name+"\n"+S.people.filter(p=>p.org===id).length+" people":""}
  return""}
document.addEventListener("mouseover",e=>{const g=e.target.closest&&e.target.closest("[data-go]");if(g&&!g.title){const t=tipGo(g.dataset.go);if(t)g.title=t}});
function photoUrl(p){if(p&&p.photoImg){const m=S.imgs.find(x=>x.id===p.photoImg);if(m)return imgSrc(m)}return p&&p.photo||""}
function avatarP(id,cls){const p=S.people.find(x=>x.id===id)||(S.arch_people||[]).find(x=>x.id===id);if(!p)return avatar(id,cls);const u=photoUrl(p);return u?`<i class="av ${cls||""}"><img src="${esc(u)}" alt=""></i>`:avatar(p.name,cls)}
/* ---------- images ---------- */
const imgsOf=id=>S.imgs.filter(m=>m.parent===id||(m.links||[]).includes(id));
const imgLinks=m=>[...new Set([m.parent,...(m.links||[])])].filter(id=>id&&itemById(id));
const imgSrc=m=>m.data||(window.tabulaAssetUrl?window.tabulaAssetUrl(m.aid):"");
const b2d=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.onerror=()=>r("");f.readAsDataURL(b)});
async function storeBlob(blob){if(S.assets){try{const up=await S.assets.upload(blob);return{aid:up.id}}catch(e){}}const d=await b2d(blob);return d&&d.length<700000?{data:d}:null}
async function shrinkOld(file,max){max=max||900;try{const bmp=await createImageBitmap(file),sc=Math.min(1,max/Math.max(bmp.width,bmp.height)),w=Math.round(bmp.width*sc),h=Math.round(bmp.height*sc),cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(bmp,0,0,w,h);const blob=await new Promise(r=>cv.toBlob(r,"image/jpeg",.82));return{blob:blob||file,w,h}}catch(e){return{blob:file,w:0,h:0}}}
async function addImage(file,parentId,o){
  o=o||{};
  {const host=parentId&&itemById(parentId);if(host&&imgsOf(parentId).length>=MAXIMG){toast("Limit is "+MAXIMG+" images per item");return null}}
  const{blob,w,h}=await shrink(file);if(blob.size>2000000){toast("Couldn't shrink "+(file.name||"that image")+" under 2 MB");return null}const up=await storeBlob(blob);if(!up){toast("Image too large to store");return null}
  const m={id:"im-"+Math.random().toString(36).slice(2,9),aid:up.aid,data:up.data,parent:parentId,src:o.src||(file.name?"Computer upload":"Pasted"),name:file.name||"",desc:"",people:[...(o.people||[])],w,h,at:localIso(),created:Date.now()};
  upsertLocal("imgs",m);await save("imgs",m);
  {const host=parentId&&itemById(parentId);if(host&&!host.thumb&&imgsOf(parentId).filter(x=>x.id!==m.id).length===0){host.thumb=m.id;host.updated=Date.now();upsertLocal("items",host);await save("items",host)}}
  describeImage(m,blob);return m}
async function describeImage(m,blob){if(!S.sample)return;try{const lim=await S.sample.limits();if(!lim||!lim.images)return;const r=await S.sample("Describe this image in one or two plain sentences for a personal journal archive: the setting, the activity, notable objects and any visible text. Do not identify real people from their faces or guess names; just say how many people there are and what they are doing. Reply with the description only.",{images:[blob],modelTier:"quick"});m.desc=(r.text||"").trim();upsertLocal("imgs",m);await save("imgs",m);paintContent()}catch(e){}}

function cropModal(pid){
  const p=S.people.find(x=>x.id===pid),u=p&&photoUrl(p);if(!u){toast("Add a photo first");return}
  const old=document.getElementById("cropm");if(old)old.remove();
  const V=240,o=document.createElement("div");o.id="cropm";o.className="cropm";
  o.innerHTML=`<div class="cropbox"><b>Crop profile photo</b><div class="cropv" style="width:${V}px;height:${V}px"><img src="${esc(u)}" alt="" draggable="false"></div>
   <label class="mute dsm">Zoom <input type="range" min="1" max="4" step="0.01" value="1" id="cropz"></label>
   <div class="mute dsm">Drag to move, slide to zoom.</div><div class="row"><button class="pri" id="cropok">Save</button><button id="cropno">Cancel</button></div></div>`;
  document.body.appendChild(o);
  const im=o.querySelector("img"),z=o.querySelector("#cropz");let z0=1,x=0,y=0,nw=1,nh=1,base=1;
  const clamp=()=>{const w=nw*base*z0,h=nh*base*z0;x=Math.min(0,Math.max(V-w,x));y=Math.min(0,Math.max(V-h,y))};
  const paint=()=>{clamp();im.style.cssText=`position:absolute;left:0;top:0;width:${nw*base*z0}px;height:${nh*base*z0}px;transform:translate(${x}px,${y}px);max-width:none`};
  const init=()=>{nw=im.naturalWidth||V;nh=im.naturalHeight||V;base=Math.max(V/nw,V/nh);x=(V-nw*base)/2;y=(V-nh*base)/2;paint()};
  if(im.complete&&im.naturalWidth)init();else im.onload=init;
  z.oninput=()=>{const cx=(V/2-x)/(nw*base*z0),cy=(V/2-y)/(nh*base*z0);z0=+z.value;x=V/2-cx*nw*base*z0;y=V/2-cy*nh*base*z0;paint()};
  let dr=null;const vp=o.querySelector(".cropv");
  vp.onpointerdown=e=>{dr={px:e.clientX,py:e.clientY,x,y};try{vp.setPointerCapture(e.pointerId)}catch(_){}};
  vp.onpointermove=e=>{if(!dr)return;x=dr.x+e.clientX-dr.px;y=dr.y+e.clientY-dr.py;paint()};
  vp.onpointerup=()=>{dr=null};
  o.querySelector("#cropno").onclick=()=>o.remove();
  o.querySelector("#cropok").onclick=async()=>{
    try{const OUT=400,c=document.createElement("canvas");c.width=c.height=OUT;const k=OUT/V,g=c.getContext("2d");g.drawImage(im,x*k,y*k,nw*base*z0*k,nh*base*z0*k);
      const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.88));if(!blob)throw 0;const up=await storeBlob(blob);if(!up)throw 0;
      const m={id:"im-"+Math.random().toString(36).slice(2,9),aid:up.aid,data:up.data,parent:pid,src:"Cropped profile photo",name:"",desc:(S.imgs.find(i=>i.id===p.photoImg)||{}).desc||"",people:[pid],w:OUT,h:OUT,at:localIso(),created:Date.now()};
      upsertLocal("imgs",m);await save("imgs",m);p.photoImg=m.id;upsertLocal("people",p);await save("people",p);o.remove();paintContent();paintSide()}
    catch(e){toast("Couldn't crop this image")}}
}

function imgViewer(iid){const m=S.imgs.find(x=>x.id===iid);if(!m)return;const old=document.getElementById("imgv");if(old)old.remove();
  const o=document.createElement("div");o.id="imgv";o.className="cropm";
  o.innerHTML=`<div class="cropbox" style="max-width:min(94vw,820px);max-height:92vh;overflow:auto;align-items:stretch"><img src="${esc(imgSrc(m))}" alt="" style="max-width:100%;max-height:58vh;object-fit:contain;align-self:center"><div class="imc" data-iid="${esc(m.id)}" style="border:0;padding:0">${imgCard(m).replace(/^<div class="imc"[^>]*>/,"").replace(/<img [^>]*>/,"").replace(/<\/div>$/,"")}</div><div class="row"><button data-act="imgdl" data-iid="${esc(m.id)}">Download</button><button id="imgvx" class="pri">Close</button></div></div>`;
  document.body.appendChild(o);o.onclick=e=>{if(e.target===o)o.remove()};o.querySelector("#imgvx").onclick=()=>o.remove()}
async function imgDownload(m){const nm=(m.name||("image-"+m.id))+(/\.\w{3,4}$/.test(m.name||"")?"":".jpg");try{const b=await (await fetch(imgSrc(m))).blob();if(S.dl){try{await S.dl.save({filename:nm,data:b});toast("Saved");return}catch(e){if(e&&e.code==="declined")return}}const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=nm;a.click()}catch(e){toast("Download failed")}}
const SRCOPTS=["Computer upload","Photos","Email","Screenshot","Camera","Web","Pasted"];
function imgCard(m){
  return`<div class="imc imcs" data-iid="${esc(m.id)}"><img data-act="imgview" data-iid="${esc(m.id)}" src="${esc(imgSrc(m))}" alt="${esc(m.desc||"")}" title="Open image details"><div class="imb"><div class="dsm">${m.desc?esc(m.desc.slice(0,140)):"<span class='mute'>No description yet</span>"}</div>
   <div>${(m.people||[]).map(id=>`<span class="ch" data-go="person:${esc(id)}">${avatarP(id)}${esc(fname(id))}${(S.people.find(p=>p.id===id)||{}).photoImg===m.id?" ★":""}</span>`).join("")}</div>
   <button class="lnk" data-act="imgview" data-iid="${esc(m.id)}">Open · tag · describe</button></div></div>`}
function pageImg(){const m=S.imgs.find(x=>x.id===S.arg);if(!m)return`<p>Image not found. <a href="#images">All images</a></p>`;
  const row=(l,h)=>`<div class="imr"><div class="iml">${l}</div><div>${h}</div></div>`;
  const chip=(h,lab,rm)=>`<span class="ch" data-go="${esc(h)}">${lab}<b data-act="${rm[0]}" data-iid="${esc(m.id)}" data-eid="${esc(rm[1])}" title="Remove">×</b></span>`;
  const ppl=(m.people||[]).map(id=>{const p=S.people.find(x=>x.id===id);if(!p)return"";const isP=p.photoImg===m.id;
    return`<div class="imp">${chip("person:"+id,avatarP(id)+esc(p.name),["imgunperson",id])} ${isP?`<span class="chip">★ Profile photo</span>`:`<button class="lnk" data-act="imgprofile" data-iid="${esc(m.id)}" data-eid="${esc(id)}">Use as ${esc(p.name.split(" ")[0])}’s profile photo</button>`}</div>`}).join("");
  const lnk=imgLinks(m).map(id=>{const i=itemById(id);return chip((i.kind==="event"?"event:":"obj:")+id,`<span class="mute">${esc(i.kind)}</span> ${esc(safeTitle(i).slice(0,40))} <span class="mute">${esc(shortDate(i.date||tday(i)))}</span>`,["imglinkrm",id])}).join("");
  return`<p class="mute" style="margin:0 0 8px"><a href="#images">← All images</a></p><div class="imc imgpage" data-iid="${esc(m.id)}">
   <div class="imgbig"><img src="${esc(imgSrc(m))}" alt="${esc(m.desc||"")}"></div>
   <div class="imeta">
    ${row("Description",`${(()=>{const on=mdStart("img:"+m.id,m.desc,S.mdPrev);return`<div class="mdwrap" data-mdkey="img:${esc(m.id)}">${mdBar(on)}<textarea data-imgf="desc" ${on?"hidden":""} placeholder="What is in this image? (AI-written, editable; used for search; Markdown works)" style="min-height:70px;width:100%">${esc(m.desc||"")}</textarea><div class="mdp mkd" ${on?"":"hidden"}>${on?mdRender(null,m.desc):""}</div></div>`})()}<div><button class="lnk" data-act="imgredesc" data-iid="${esc(m.id)}">↻ Generate description with AI</button></div>`)}
    ${row("People in photo",(ppl||`<div class="mute dsm">Nobody tagged yet.</div>`)+`<span class="pw"><input class="add" data-pick="1" data-ent="imgperson" autocomplete="off" placeholder="+ Tag a person…"></span><div class="mute dsm">Tagging is manual; I don’t identify people from faces. A person’s profile photo is tagged with them automatically.</div>`)}
    ${row("Attached to",(lnk||`<div class="mute dsm">Not attached to any event, task or note.</div>`)+`<span class="pw"><input class="add" data-pick="1" data-ent="imglink" autocomplete="off" placeholder="+ Attach to event, task or note…"></span>`)}
    ${row("Source",`<input data-imgf="src" list="srcl" value="${esc(m.src||"")}" style="width:220px">${SRCDL}`)}
    ${row("Added",`${esc(fmtDT(m.at))}${m.w?` · ${m.w}×${m.h}px`:""}`)}
    ${row("File",`<button data-act="imgdl" data-iid="${esc(m.id)}">Download</button> <button class="lnk warn" data-act="imgrm" data-iid="${esc(m.id)}">Remove image</button>`)}
   </div></div>`}
function pageImages(){const F=S.imf=S.imf||{q:"",sort:"new",group:"",person:"",src:"",flt:"",size:"m"};
  const q=(F.q||"").toLowerCase();
  const txt=m=>[m.desc,m.src,m.name,...(m.people||[]).map(fname),...imgLinks(m).map(id=>safeTitle(itemById(id)))].join(" ").toLowerCase();
  const isProf=m=>S.people.some(p=>p.photoImg===m.id);
  let ms=S.imgs.filter(m=>(!q||txt(m).includes(q))&&(!F.person||(m.people||[]).includes(F.person))&&(!F.src||m.src===F.src)&&(F.flt===""||(F.flt==="untagged"&&!(m.people||[]).length)||(F.flt==="nodesc"&&!m.desc)||(F.flt==="unattached"&&!imgLinks(m).length)||(F.flt==="profile"&&isProf(m))));
  const so={new:(a,b)=>(b.created||0)-(a.created||0),old:(a,b)=>(a.created||0)-(b.created||0),desc:(a,b)=>(a.desc||"~").localeCompare(b.desc||"~"),src:(a,b)=>(a.src||"~").localeCompare(b.src||"~")};
  ms.sort(so[F.sort]||so.new);if(F.rev)ms.reverse();
  const gk=m=>F.group==="person"?((m.people||[]).length?(m.people||[]).map(fname):["Untagged"]):F.group==="src"?[m.src||"Unknown source"]:F.group==="month"?[(m.at||"").slice(0,7)||"Unknown"]:F.group==="attached"?[imgLinks(m).length?"Attached":"Not attached"]:[""];
  const groups={};ms.forEach(m=>gk(m).forEach(g=>(groups[g]=groups[g]||[]).push(m)));
  const sel=(k,opts)=>`<select data-act="imf" data-k="${k}">${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(F[k])===String(v)?"selected":""}>${esc(l)}</option>`).join("")}</select>`;
  const ppl=[...new Set(S.imgs.flatMap(m=>m.people||[]))].sort((a,b)=>fname(a).localeCompare(fname(b)));
  const srcs=[...new Set(S.imgs.map(m=>m.src).filter(Boolean))].sort();
  const card=m=>`<div class="imt" data-act="imgview" data-iid="${esc(m.id)}"><img src="${esc(imgSrc(m))}" alt=""><div class="imd">${esc((m.desc||"No description yet").slice(0,90))}</div><div class="mute dsm">${esc((m.people||[]).map(fname).join(", ")||"Nobody tagged")}</div>${isProf(m)?`<div class="dsm">★ Profile photo</div>`:""}</div>`;
  const body=ms.length?Object.keys(groups).sort((a,b)=>F.group?a.localeCompare(b):0).map(g=>(g?`<h2 class="imgh">${esc(g)} <span class="c">${groups[g].length}</span></h2>`:"")+`<div class="imgrid big ${esc(F.size)}">${groups[g].map(card).join("")}</div>`).join(""):`<p class="mute">No images${q||F.person||F.src||F.flt?" match these filters":" yet"}.</p>`;
  return`<div class="ctlp"><div class="ctlr"><div class="ctll">Filter</div><div class="ctlc"><input data-act="imf" data-k="q" placeholder="Search description, people, source, attached items…" value="${esc(F.q)}" style="width:300px">${sel("flt",[["","Show: all"],["untagged","Untagged"],["nodesc","No description"],["unattached","Not attached"],["profile","Profile photos"]])}${sel("person",[["","Anyone"],...ppl.map(id=>[id,fname(id)])])}${sel("src",[["","Any source"],...srcs.map(x=>[x,x])])}</div></div><div class="ctlr"><div class="ctll">View</div><div class="ctlc"><span class="mute">Group</span>${sel("group",[["","None"],["person","Person"],["src","Source"],["month","Month added"],["attached","Attached or not"]])}<span class="mute">Sort</span>${sel("sort",[["new","Newest"],["old","Oldest"],["desc","Description"],["src","Source"]])}<button data-act="imdir">${F.rev?"↓":"↑"}</button><span class="mute">Size</span>${sel("size",[["s","Small"],["m","Medium"],["l","Large"]])}<span class="sp"></span><span class="mute">${ms.length} of ${S.imgs.length}</span><button class="pri" data-act="imgpick" data-id="">+ Add images</button><input type="file" accept="image/*" multiple hidden data-act="imgfile" data-id="">${SRCDL}</div></div></div>${body}`}
const SRCDL=`<datalist id="srcl">${SRCOPTS.map(x=>`<option value="${x}"></option>`).join("")}</datalist>`;
function imagesRowOld(it){const ms=imgsOf(it.id);return`<label>Images</label><div>${ms.map(m=>imgCard(m)+(it.kind==="event"&&ms.length>1?`<div style="margin:-2px 0 8px 120px"><button class="lnk" data-act="setthumb" data-id="${esc(it.id)}" data-iid="${esc(m.id)}">${(it.thumb||ms[0].id)===m.id?"★ Event thumbnail":"Use as event thumbnail"}</button></div>`:"")).join("")}<button data-act="imgpick" data-id="${esc(it.id)}">+ Add image</button><input type="file" accept="image/*" multiple hidden data-act="imgfile" data-id="${esc(it.id)}">${SRCDL}<span class="mute dsm"> Shrunk to a small size automatically.</span></div>`}
function personPhotos(x){const ms=S.imgs.filter(m=>(m.people||[]).includes(x.id));
  return`<div class="panel"><h2>Photos <span class="c">${ms.length}</span><span class="sp"></span><button class="lnk" data-act="imgpick" data-id="${esc(x.id)}" data-person="1">+ Add photo</button><input type="file" accept="image/*" multiple hidden data-act="imgfile" data-id="${esc(x.id)}" data-person="1">${SRCDL}</h2>${ms.length?`<div class="imgrid">${ms.map(m=>`<div class="imt"><a data-act="imgview" data-iid="${esc(m.id)}" style="cursor:zoom-in"><img src="${esc(imgSrc(m))}" alt="${esc(m.desc||"")}" title="${esc(m.desc||"")}"></a><div class="mute dsm">${esc(m.src||"")}</div>${x.photoImg===m.id?`<span class="mute dsm">★ Profile photo</span>`:`<button class="lnk" data-act="imgprofile" data-iid="${esc(m.id)}" data-eid="${esc(x.id)}">Use as profile photo</button>`}</div>`).join("")}</div>`:`<p class="mute">No photos yet. Add one here, or tag them in a photo on any note or event.</p>`}</div>`}
function inlineImgs(html,full){return html.replace(/\[img:([\w-]+)\]/g,(m,id)=>{const g=S.imgs.find(x=>x.id===id);if(!g)return"";return full?`<a data-act="imgview" data-iid="${esc(g.id)}" style="cursor:zoom-in"><img class="inl" src="${esc(imgSrc(g))}" alt="${esc(g.desc||"")}" title="${esc(g.desc||"")}"></a>`:"🖼"})}
/* ---------- ask which person ---------- */
function askWhich(tok,ids){return new Promise(res=>{let b=document.getElementById("ask");if(b)b.remove();b=document.createElement("div");b.id="ask";b.className="askbar";
  b.innerHTML=`<div style="margin-bottom:8px">Which “${esc(tok)}” do you mean?</div><div class="row" style="flex-wrap:wrap">${ids.map(id=>{const p=S.people.find(x=>x.id===id);return p?`<button data-i="${esc(id)}">${esc(p.name)} <span class="mute">${esc(personLine(p)||p.context||"")}</span></button>`:""}).join("")}<button data-i="">Neither</button></div>`;
  document.body.appendChild(b);b.querySelectorAll("button").forEach(x=>x.onclick=()=>{b.remove();res(x.dataset.i||null)})})}
async function resolveAmbig(it,unres){for(const u of unres){if((it.ambigSeen||[]).includes(u.tok))continue;const id=await askWhich(u.tok,u.ids);it.ambigSeen=[...(it.ambigSeen||[]),u.tok];if(id)it.people=[...new Set([...(it.people||[]),id])];await saveItem(it)}paintContent()}
/* ---------- picker (tabs, quick filter, add new) ---------- */
const KLAB={event:"event",person:"person",task:"task",note:"note",coll:"collection"};
function ppHas(inp){const k=inp.dataset.kind==="colls"?"colls":"people";const box=inp.closest("#pe_ppl,#pe_cl");if(box)return(k==="colls"?S.peColls:S.peNames)||[];const c=inp.closest("[data-pid]");const pr=c&&S.props.find(x=>x.id===c.dataset.pid);return(pr&&(k==="colls"?pr.tagColls:pr.tagPeople))||[]}
function ppMenu(inp){
  const q=inp.value.trim().toLowerCase(),have=new Set(ppHas(inp).map(x=>String(x).toLowerCase()));
  if(inp.dataset.kind==="colls"){
    let rows=S.colls.filter(x=>!have.has(x.name.toLowerCase())&&(!q||x.name.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name)).slice(0,50).map(x=>`<div data-act="ppadd" data-k="colls" data-n="${esc(x.name)}">${esc(x.name)}</div>`).join("");
    if(q&&!S.colls.some(x=>x.name.toLowerCase()===q))rows+=`<div data-act="ppadd" data-k="colls" data-n="${esc(inp.value.trim())}"><span class="mute">＋ Add new collection</span> “${esc(inp.value.trim())}”</div>`;
    if(!rows)rows=`<div class="hd">No other collections. Type a name to add one.</div>`;
    let m=inp.parentNode.querySelector(".pickmenu");if(!m){m=document.createElement("div");m.className="pickmenu";inp.parentNode.appendChild(m)}m.innerHTML=rows;return}
  const pool=S.people.filter(x=>!have.has(x.name.toLowerCase())&&(!q||[x.name,nicksOf(x).join(" "),x.rel,x.company,x.context].join(" ").toLowerCase().includes(q))).sort((a,b)=>lastName(a).localeCompare(lastName(b))).slice(0,50);
  let rows=pool.map(x=>`<div data-act="ppadd" data-k="people" data-n="${esc(x.name)}"><span style="min-width:150px">${esc(x.name)}</span><span class="mute">${esc(personLine(x)||x.context||"")}</span></div>`).join("");
  const exact=S.people.some(x=>x.name.toLowerCase()===q);
  if(q&&!exact)rows+=`<div data-act="ppadd" data-k="people" data-n="${esc(inp.value.trim())}" data-new="1"><span class="mute">＋ Add new person</span> “${esc(inp.value.trim())}”</div>`;
  if(!rows)rows=`<div class="hd">No other people. Type a name to add one.</div>`;
  let m=inp.parentNode.querySelector(".pickmenu");if(!m){m=document.createElement("div");m.className="pickmenu";inp.parentNode.appendChild(m)}m.innerHTML=rows}
function ppChips(names,editable,kind){const k=kind==="colls"?"colls":"people";return(names||[]).map((n,i)=>{const known=(k==="colls"?S.colls:S.people).some(x=>x.name===n);return`<span class="chip ${known?"":"newp"}">${k==="colls"?"📁 ":""}${esc(n)}${known?"":' <span class="mute">new</span>'}${editable?` <a data-act="ppdel" data-k="${k}" data-i="${i}" title="Remove" style="cursor:pointer;margin-left:2px">×</a>`:""}</span>`}).join("")}
function ppAddBox(kind){return`<span class="pw"><input class="add" data-pick="1" autocomplete="off" data-ent="pprop" data-kind="${kind==="colls"?"colls":"people"}" placeholder="${kind==="colls"?"＋ collection":"＋ person"}" style="width:130px"></span>`}
function pickMenu(inp){
  if(inp.dataset.ent==="pprop")return ppMenu(inp);
  if(inp.dataset.ent==="relopt")return relMenu(inp);
  const ent=inp.dataset.ent,ce=inp.closest(".imc")||inp.closest(".exp");if(!ce)return;
  const img=inp.closest(".imc")?S.imgs.find(m=>m.id===ce.dataset.iid):null,it=img?null:S.items.find(i=>i.id===ce.dataset.xid);if(!img&&!it)return;
  const ref=it||{id:img.id,date:(img.at||"").slice(0,10)||today(),kind:"note"};
  const kind=ent==="imglink"?(["event","task","note"].includes(S.relTab)?S.relTab:"event"):ent==="rel"?(S.relTab||"event"):ent==="person"||ent==="imgperson"?"person":ent==="coll"?"coll":"event";
  const q=inp.value.trim().toLowerCase(),base=pd((it&&tday(it))||ref.date),dist=i=>Math.abs((pd(i.date||today())-base)/864e5);
  const have=new Set(img?(kind==="person"?img.people:imgLinks(img)):kind==="person"?it.people||[]:kind==="event"?it.events||[]:kind==="coll"?it.colls||[]:it.related||[]);
  let rows="",hd="";
  if(kind==="person"){
    const near=new Set(V().filter(i=>it&&i.date===it.date).flatMap(i=>i.people||[]));
    let pool=S.people.filter(p=>!have.has(p.id)&&(!q||[p.name,nicksOf(p).join(" "),p.rel,p.company,p.context].join(" ").toLowerCase().includes(q)));
    pool.sort((a,b)=>(near.has(b.id)-near.has(a.id))||lastName(a).localeCompare(lastName(b)));
    rows=pool.slice(0,60).map(p=>`<div data-act="pick" data-t="person" data-eid="${esc(p.id)}"><span style="min-width:150px">${esc(p.name)}</span><span class="mute">${esc(personLine(p)||p.context||"")}</span></div>`).join("")}
  else if(kind==="coll"){rows=S.colls.filter(c=>!have.has(c.id)&&(!q||c.name.toLowerCase().includes(q))).map(c=>`<div data-act="pick" data-t="coll" data-eid="${esc(c.id)}">${esc(c.name)}</div>`).join("")}
  else{
    let pool=V().filter(i=>i.id!==ref.id&&!have.has(i.id)&&(kind==="event"?i.kind==="event":i.kind===kind));if(kind==="event")pool=dedupeShow(pool);
    if(q)pool=pool.filter(i=>(safeTitle(i)+" "+i.date).toLowerCase().includes(q));
    pool.sort((a,b)=>dist(a)-dist(b)||(timeMin(cleanTitle(a).time)??9999)-(timeMin(cleanTitle(b).time)??9999));
    const near=pool.filter(i=>dist(i)<=3),far=pool.filter(i=>dist(i)>3).slice(0,25);
    const r=i=>`<div data-act="pick" data-t="${kind}" data-eid="${esc(i.id)}"><span class="mute" style="min-width:118px">${esc(longDate(i.date))}</span><span class="mute" style="min-width:64px">${esc(cleanTitle(i).time||"")}</span><span>${esc(safeTitle(i))}</span></div>`;
    rows=(near.length?`<div class="hd">Around ${esc(shortDate(it?tday(it):ref.date))}</div>`+near.slice(0,30).map(r).join(""):"")+(far.length?`<div class="hd">${near.length?"Other dates":"Matches"}</div>`+far.map(r).join(""):"")}
  if(q&&!img)rows+=`<div data-act="picknew" data-t="${kind}"><span class="mute">＋ Add new ${KLAB[kind]}</span> “${esc(inp.value.trim())}”</div>`;
  else if(q&&img&&kind==="person")rows+=`<div data-act="picknew" data-t="person"><span class="mute">＋ Add new person</span> “${esc(inp.value.trim())}”</div>`;
  const tabs=(ent==="rel"||ent==="imglink")?`<div class="hd tabs2">${(ent==="imglink"?["event","task","note"]:["event","person","task","note"]).map(t=>`<button data-act="reltab" data-v="${t}" class="${kind===t?"on":""}">${t==="event"?"Events":t==="person"?"People":t==="task"?"Tasks":"Notes"}</button>`).join("")}</div>`:"";
  let m=inp.parentNode.querySelector(".pickmenu");if(!m){m=document.createElement("div");m.className="pickmenu";inp.parentNode.appendChild(m)}
  m.innerHTML=tabs+(rows||`<div class="hd">Nothing matches. Type to add it.</div>`)}
async function createFromPick(inp,t){
  const v=inp.value.trim();if(!v)return;const img=inp.closest(".imc")?S.imgs.find(m=>m.id===inp.closest(".imc").dataset.iid):null,it=img?null:S.items.find(i=>i.id===inp.closest(".exp").dataset.xid);inp.value="";closePick();
  const mk=async(c,o)=>{upsertLocal(c,o);await save(c,o);return o};
  if(t==="person"){const p=await mk("people",{id:slug(v)+"-"+Math.random().toString(36).slice(2,5),name:v,area:"Unsorted",created:Date.now()});if(img){img.people=[...new Set([...img.people,p.id])];upsertLocal("imgs",img);await save("imgs",img)}else{it.people=[...new Set([...(it.people||[]),p.id])];await saveItem(it)}paintContent();return}
  if(!it)return;
  if(t==="coll"){const c=await mk("colls",{id:slug(v)+"-"+Math.random().toString(36).slice(2,5),name:v,created:Date.now()});it.colls=[...new Set([...(it.colls||[]),c.id])];await saveItem(it);return}
  const day=it.kind==="event"?it.date:tday(it)||today();
  const sp=smartParse(v,t),wd=sp.when.date||day;
  const n={id:uid("i"),kind:t,status:t==="task"?"open":undefined,text:sp.text,date:wd,due:t==="task"?wd:undefined,sphere:it.sphere||DEFAULT_SPHERE,people:[...sp.people],events:[],related:t==="event"?[]:[it.id],colls:[],created:Date.now(),loggedAt:localIso(),history:[],src:{name:"Added from a linked item"}};if(t==="event"&&sp.when.time)n.time=sp.when.time;
  await saveItem(n);const f=t==="event"?"events":"related";it[f]=[...new Set([...(it[f]||[]),n.id])];await saveItem(it)}
/* ---------- multi-select relationship ---------- */
const relList=p=>(Array.isArray(p&&p.rels)?p.rels:String(p&&p.rel||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean));
const allRels=()=>[...new Set([...RELS,...S.people.flatMap(relList)])];
function relMulti(id,vals){return`<div class="mchips" id="${id}" data-vals="${esc(vals.join("|"))}">${relChips(vals)}<span class="pw"><input class="add" data-pick="1" data-ent="relopt" autocomplete="off" placeholder="+ Relationship…" style="width:170px"></span></div>`}
const relChips=vals=>vals.map(v=>`<span class="ch">${esc(v)}<b data-act="relrm" data-v="${esc(v)}">×</b></span>`).join("");
function relVals(id){const e=document.getElementById(id);return e?e.dataset.vals.split("|").filter(Boolean):[]}
function relSet(box,vals){box.dataset.vals=vals.join("|");const pw=box.querySelector(".pw");box.querySelectorAll(".ch").forEach(c=>c.remove());pw.insertAdjacentHTML("beforebegin",relChips(vals))}
function relMenu(inp){const box=inp.closest(".mchips"),have=new Set(relVals(box.id)),q=inp.value.trim().toLowerCase();
  let rows=allRels().filter(r=>!have.has(r)&&(!q||r.toLowerCase().includes(q))).map(r=>`<div data-act="relopt" data-v="${esc(r)}">${esc(r)}</div>`).join("");
  if(q&&!allRels().some(r=>r.toLowerCase()===q)&&!have.has(inp.value.trim()))rows+=`<div data-act="relopt" data-v="${esc(inp.value.trim())}"><span class="mute">＋ Add new relationship</span> “${esc(inp.value.trim())}”</div>`;
  let m=inp.parentNode.querySelector(".pickmenu");if(!m){m=document.createElement("div");m.className="pickmenu";inp.parentNode.appendChild(m)}m.innerHTML=rows||`<div class="hd">Nothing left to add</div>`}

/* ---------- natural dates ---------- */
function natDay(d){const r=rel(d);const w=longDate(d);return(r==="Today"||r==="Tomorrow"||r==="Yesterday")?r+" · "+w:w}
function weekLabel(d){const ws=weekStart(d),we=addDays(ws,6),t=weekStart(today());return(ws===t?"This week · ":ws===addDays(t,7)?"Next week · ":ws===addDays(t,-7)?"Last week · ":"Week of ")+shortDate(ws)+" – "+shortDate(we)}
/* ---------- events page ---------- */
function eventsPage(){
  const E=S.ev=S.ev||{};Object.assign(E,{q:E.q||"",range:E.range||"upcoming",group:E.group===undefined?"day":E.group,person:E.person||"",coll:E.coll||"",sphere:E.sphere||"",dir:E.dir||1,mode:E.mode||"list",imgs:!!E.imgs,detail:E.detail||"normal",type:E.type||"",main:!!E.main});
  const all=dedupeShow(V().filter(i=>i.kind==="event"));
  const t=today();
  const cnt={upcoming:all.filter(i=>i.date>=t).length,past:all.filter(i=>i.date<t).length,all:all.length};
  const pid=E.person?(S.people.find(p=>p.name.toLowerCase()===E.person.toLowerCase())||{}).id:null;
  let list=all.filter(i=>(E.range==="all"||(E.range==="upcoming"?i.date>=t:i.date<t))&&(!E.q||(i.text+" "+(i.detail||"")).toLowerCase().includes(E.q.toLowerCase()))&&(!E.person||(pid&&(i.people||[]).includes(pid)))&&(!E.coll||(i.colls||[]).some(c=>cname(c).toLowerCase()===E.coll.toLowerCase()))&&(!E.sphere||i.sphere===E.sphere)&&(!E.type||(E.type==="_guess"?i.etypeAuto:(i.etype||"")===E.type))&&(!E.main||i.main)&&(!E.whose||whoseOf(i)===E.whose));
  const dir=E.range==="past"?-E.dir:E.dir;
  list.sort((a,b)=>dir*(a.date.localeCompare(b.date)||((timeMin(cleanTitle(a).time)??9999)-(timeMin(cleanTitle(b).time)??9999))));
  const gk={day:i=>i.date,week:i=>weekStart(i.date),month:i=>monthOf(i.date),sphere:i=>i.sphere||DEFAULT_SPHERE,type:i=>i.etype||"",person:null};
  const lab={day:k=>natDay(k),week:k=>weekLabel(k),month:k=>{const[y,m]=k.split("-");return MON[+m-1]+" "+y},sphere:k=>k,type:k=>k?etE(k)+" "+etL(k):"Untyped"};
  let G=E.group;if(E.mode==="board"&&["day","week","month",""].includes(G))G="type";
  let groups;
  if(G==="person"){const m=new Map();list.forEach(i=>{const ps=(i.people||[]).length?i.people:["—"];ps.forEach(p=>{if(!m.has(p))m.set(p,[]);m.get(p).push(i)})});groups=[...m].sort((a,b)=>a[0]==="—"?1:b[0]==="—"?-1:fname(a[0]).localeCompare(fname(b[0]))).map(([k,a])=>[k==="—"?"No one tagged":fname(k),a])}
  else if(!G)groups=[["",list]];
  else{const m=new Map();list.forEach(i=>{const k=gk[G](i);if(!m.has(k))m.set(k,[]);m.get(k).push(i)});groups=[...m].map(([k,a])=>[lab[G](k),a,k])}
  const collNames=[...new Set(all.flatMap(i=>(i.colls||[]).map(cname)))].sort(),pplNames=[...new Set(all.flatMap(i=>(i.people||[]).map(fname)))].sort();
  const guessN=all.filter(i=>i.etypeAuto||i.etype===undefined).length;
  const sel=(k,opts)=>`<select data-act="evsel" data-k="${k}">${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(E[k])===String(v)?"selected":""}>${esc(l)}</option>`).join("")}</select>`;
  let h=`<div class="ctlp"><div class="ctlr"><div class="ctll">Show</div><div class="ctlc"><div class="seg">${[["upcoming","Upcoming"],["past","Past"],["all","All"]].map(([k,l])=>`<button data-act="evset" data-k="range" data-v="${k}" class="${E.range===k?"on":""}">${l} <span class="mute">${cnt[k]}</span></button>`).join("")}</div>
   <button class="pillsel ${E.main?"on":""}" data-act="evset" data-k="main" data-v="${E.main?"":"1"}">★ Main events only</button></div></div>
  <div class="ctlr"><div class="ctll">Filter</div><div class="ctlc"><input data-act="evq" placeholder="Search events" value="${esc(E.q)}" style="width:170px">
   <select class="pillsel ${E.type?"on":""}" data-act="evsel" data-k="type"><option value="">Type</option>${ETYPES.map(([v,e,l])=>`<option value="${v}" ${E.type===v?"selected":""}>${e} ${l}</option>`).join("")}<option value="_guess" ${E.type==="_guess"?"selected":""}>Guessed, not confirmed</option></select>
   <input class="pillsel ${E.person?"on":""}" list="ev-pl" data-act="evin" data-k="person" placeholder="Person…" value="${esc(E.person)}" style="width:120px"><datalist id="ev-pl">${pplNames.map(n=>`<option value="${esc(n)}"></option>`).join("")}</datalist>
   ${collNames.length?`<input class="pillsel ${E.coll?"on":""}" list="ev-cl" data-act="evin" data-k="coll" placeholder="Collection…" value="${esc(E.coll)}" style="width:120px"><datalist id="ev-cl">${collNames.map(n=>`<option value="${esc(n)}"></option>`).join("")}</datalist>`:""}
   <select class="pillsel ${E.sphere?"on":""}" data-act="evsel" data-k="sphere"><option value="">Sphere</option>${SPHERES.map(x=>`<option ${E.sphere===x?"selected":""}>${esc(x)}</option>`).join("")}</select>
   <select class="pillsel ${E.whose?"on":""}" data-act="evsel" data-k="whose"><option value="">Whose</option><option value="mine" ${E.whose==="mine"?"selected":""}>Mine</option><option value="other" ${E.whose==="other"?"selected":""}>Others'</option></select></div></div>
  <div class="ctlr"><div class="ctll">View</div><div class="ctlc"><div class="seg">${["list","table","board"].map(m=>`<button class="${E.mode===m?"on":""}" data-act="evset" data-k="mode" data-v="${m}">${({table:"▦ Table",list:"≡ List",board:"▥ Board"})[m]}</button>`).join("")}</div>
   <span class="mute">Group</span>${sel("group",[["day","Day"],["week","Week"],["month","Month"],["type","Type"],["sphere","Sphere"],["person","Person"],["","None"]])}
   <button data-act="evdir">${E.dir>0?"Earliest first":"Latest first"}</button>
   <span class="mute">Detail</span>${sel("detail",[["compact","Less"],["normal","Normal"],["full","More"]])}
   <button class="pillsel ${E.imgs?"on":""}" data-act="evset" data-k="imgs" data-v="${E.imgs?"":"1"}" title="Show an image card on events that have images">🖼 Images</button>
   <span class="sp"></span><span class="mute">${list.length} events</span>${guessN?`<button data-act="evai" title="Let AI categorize events that are untyped or only guessed">✨ Categorize ${guessN} with AI</button>`:""}</div></div></div>`;
  if(!list.length)return h+`<p class="mute">No events match.</p>`;
  const o={showDate:G!=="day",detail:E.detail,imgs:E.imgs,grid:E.mode==="list"};
  const hd=(l,a,k)=>l?`<div class="dh${k&&G==="day"&&k===t?" now":""}">${esc(l)} <span class="c">${a.length}</span></div>`:"";
  if(E.mode==="table"){
    const row=i=>{const c=cleanTitle(i);return`<tr data-id="${esc(i.id)}"><td>${esc(shortDate(i.date))}</td><td>${esc(c.time||"")}</td><td>${i.main?"★ ":""}<span data-act="edit" style="cursor:pointer">${esc(c.t)}</span></td><td>${i.etype?esc(etE(i.etype)+" "+etL(i.etype)):""}${i.etypeAuto?" <span class='mute'>·guess</span>":""}</td><td>${esc((i.people||[]).map(fname).join(", "))}</td><td>${esc(i.sphere||"")}</td>${E.imgs?`<td>${(()=>{const ms=imgsOf(i.id),m=ms.find(x=>x.id===i.thumb)||ms[0];return m?`<img class="evthumb" style="margin:0" data-act="imgview" data-iid="${esc(m.id)}" src="${esc(imgSrc(m))}">`:""})()}</td>`:""}</tr>`};
    h+=`<div class="tw"><table><thead><tr><th>Date</th><th>Time</th><th>Event</th><th>Type</th><th>People</th><th>Sphere</th>${E.imgs?"<th>Image</th>":""}</tr></thead><tbody>${groups.map(([l,a,k])=>(l?`<tr><td colspan="${E.imgs?7:6}" class="dh" style="display:table-cell">${esc(l)} <span class="c">${a.length}</span></td></tr>`:"")+a.map(row).join("")).join("")}</tbody></table></div>`;
    return h}
  if(E.mode==="board"){h+=`<div class="board">${groups.map(([l,a])=>`<div class="col"><h3>${esc(l||"Events")} <span class="mute">${a.length}</span></h3>${a.map(i=>evRow(i,{...o,showDate:true})).join("")}</div>`).join("")}</div>`;return h}
  h+=groups.map(([l,a,k])=>hd(l,a,k)+a.map(i=>evRow(i,o)).join("")).join("");
  return h;
}
function aiTypes(){return(async()=>{
  if(!S.sample){toast("AI isn't available in this view");return}
  const list=V().filter(i=>i.kind==="event"&&(i.etype===undefined||i.etypeAuto)).slice(0,300);
  if(!list.length){toast("Nothing to categorize");return}
  toast("Categorizing "+list.length+" events…",4000);let n=0;
  for(let k=0;k<list.length;k+=30){const ch=list.slice(k,k+30);
    const prompt="Classify each journal event into exactly one type. Types: local (everyday outings, coffee with friends, the office, classes, hikes, walks), milestone (graduations, achievements, belt tests, races finished, ordinations, firsts, retirements), trip (travel away from home by plane, car or train), visitor (people visiting from out of town), gathering (parties, birthdays, holidays, weddings, memorials, reunions), family (home life, kids, pets, school events), call (calls, voicemails, video calls), health (medical, dental, vet, checkups), work (work meetings and projects), other. Reply with ONLY a JSON object mapping each id to its type, for these events:\n"+ch.map(i=>i.id+" | "+i.date+" | "+i.text+" | "+(i.detail||"").slice(0,80).replace(/\n/g," ")).join("\n");
    try{const r=await S.sample(prompt,{modelTier:"quick"});const m=(r.text||"").match(/\{[\s\S]*\}/);const o=m?JSON.parse(m[0]):{};
      for(const i of ch){const v=o[i.id];if(ETYPES.some(e=>e[0]===v)){i.etype=v;i.etypeAuto=true;i.etypeAI=true;await saveItem(i);n++}}}catch(e){}}
  toast("AI categorized "+n+" events. They stay marked as guesses until you confirm.",5000);paintContent()})()}
/* ---------- daily layouts ---------- */
function defOrd(i,day){
  if(i.kind==="event"){const m=timeMin(cleanTitle(i).time);if(m!=null)return m}
  if(i.created){const d=new Date(i.created),ds=ymd(d);if(ds===day)return d.getHours()*60+d.getMinutes()+0.5}
  return 1441+((i.created||0)%1000)/1000;
}
const effOrd=(i,day)=>i.ord!=null?i.ord:defOrd(i,day);
function flowList(items,day){
  const arr=items.slice().sort((a,b)=>effOrd(a,day)-effOrd(b,day)||(a.created||0)-(b.created||0));
  return`<div class="flowlist" data-day="${day}">`+arr.map(i=>`<div class="flowrow" draggable="true" data-fid="${esc(i.id)}"><span class="grip" title="Drag to reorder">⋮⋮</span><div class="fr">${i.kind==="event"?evRow(i,{noDetail:0}):itemRow(i)}</div></div>`).join("")+`</div>`;
}
function layoutBody(c){
  const{evs,evsAll,tasks,done,notes,days}=c;const addBtn=k=>`<button class="lnk" data-act="addin" data-k="${k}">+ Add</button>`;
  const addRow=(k,ph)=>S.addIn===k?`<div class="quick"><input class="qa" data-kind="${k}" data-autofocus placeholder="${ph}" autocomplete="off"><button class="pri" data-act="qadd">Add</button><button data-act="addin" data-k="${k}">Cancel</button></div>`:"";
  const nowc=x=>x===today()?" now":"";
  const ctl=`<span class="mute" style="margin-left:6px">Group</span><select data-act="dgroup">${GROUPS.filter(([v])=>S.layout!=="sphere"||v!=="sphere").map(([v,l])=>`<option value="${v}" ${(S.layout==="sphere"?((S.dgroup&&S.dgroup!=="sphere")?S.dgroup:""):(S.dgroup!=null?S.dgroup:(S.range==="day"?"sphere":"due")))===v?"selected":""}>${l}</option>`).join("")}</select><span class="mute">Sort</span><select data-act="dsort">${SORTS.map(([f,l])=>`<option value="${f}" ${((S.sorts.daily||{f:"star"}).f)===f?"selected":""}>${l}</option>`).join("")}</select><button data-act="dsortdir">${(S.sorts.daily||{d:1}).d>0?"↑":"↓"}</button><button class="${S.doneBottom?"pillsel on":""}" data-act="donebot" title="Move completed tasks to the bottom">✕ Done at bottom</button>`;
  S._ctl=ctl;
  const evTimeSort=a=>a.slice().sort((x,y)=>x.date.localeCompare(y.date)||((timeMin(cleanTitle(x).time)??9999)-(timeMin(cleanTitle(y).time)??9999)));
  if(S.layout==="flow"){
    let h=`<div class="panel"><h2>Timeline <span class="c">${evs.length+tasks.length+done.length+notes.length}</span><span class="sp"></span>${addBtn("task")}</h2>${addRow("task","Add anything: task, event or note")}<p class="mute" style="margin:0 0 6px">Everything in one running list, like a rapid-logged page. Events sit at their time, other things in the order you wrote them. Drag the ⋮⋮ handle to reorder.</p>`;
    const dl=S.range==="day"?[days[0]]:days;
    dl.forEach(x=>{const its=[...evs,...tasks,...done,...notes].filter(i=>S.range==="day"||(i.kind==="task"?tday(i)===x:i.date===x));
      const seen=new Set(),uniq=its.filter(i=>!seen.has(i.id)&&seen.add(i.id));
      if(S.range!=="day")h+=`<div class="sub${nowc(x)}">${esc(longDate(x))}</div>`;
      h+=uniq.length?flowList(uniq,x):`<p class="mute">Nothing logged.</p>`});
    return h+`</div>`;
  }
  if(S.layout==="sphere"){
    let h=evfBar(evsAll);
    const grp=(S.dgroup&&S.dgroup!=="sphere")?S.dgroup:"";
    SPHERES.forEach(sp=>{
      const e=evs.filter(i=>(i.sphere||DEFAULT_SPHERE)===sp),t=tasks.filter(i=>(i.sphere||DEFAULT_SPHERE)===sp),d=done.filter(i=>(i.sphere||DEFAULT_SPHERE)===sp),n=notes.filter(i=>(i.sphere||DEFAULT_SPHERE)===sp);
      const tot=e.length+t.length+d.length+n.length;
      const adding=S.addIn&&S.addIn.startsWith("sph|"+sp+"|");
      if(!tot&&!adding)return;
      h+=`<div class="panel tint" style="--tc:${tintFor("sphere:"+sp)}"><h2>${esc(sp)} <span class="c">${tot}</span><span class="sp"></span>${["task","event","note"].map(k=>`<button class="lnk" data-act="sphadd" data-s="${esc(sp)}" data-k="${k}">+ ${k[0].toUpperCase()+k.slice(1)}</button>`).join("")}${tintSw("sphere:"+sp)}</h2>${adding?`<div class="quick"><input class="qa" data-kind="${S.addIn.split("|")[2]}" data-sphere="${esc(sp)}" data-autofocus placeholder="Add a ${S.addIn.split("|")[2]} to ${esc(sp)}" autocomplete="off"><button class="pri" data-act="qadd">Add</button><button data-act="sphadd" data-s="${esc(sp)}" data-k="${S.addIn.split("|")[2]}">Cancel</button></div>`:""}`;
      if(e.length)h+=`<div class="sub">Events · ${e.length}</div>`+evTimeSort(e).map(i=>evRow(i,{showDate:S.range!=="day",grid:1,notype:1,nonotes:1})).join("");
      if(t.length||d.length){h+=`<div class="sub">Tasks · ${t.length}${d.length?" · "+d.length+" done":""}</div>`;
        const old=S.dgroup;S.dgroup=grp;h+=taskGroups(S.doneBottom?t:[...t,...d],days,S.range,S.doneBottom?d:[]).replace('<p class="mute">Nothing open.</p>','');S.dgroup=old}
      if(n.length)h+=`<div class="sub">Notes &amp; ideas · ${n.length}</div>`+n.map(i=>itemRow(i,{showDate:S.range!=="day"})).join("");
      h+=`</div>`});
    return h;
  }
  const evHtml=evs.length?(S.range==="day"?evs.map(i=>evRow(i,{grid:1,sph:1,nonotes:1})).join(""):days.map(x=>{const q=evs.filter(e=>e.date===x);return q.length?`<div class="sub${nowc(x)}">${esc(longDate(x))}</div>`+q.map(i=>evRow(i,{grid:1,sph:1,nonotes:1})).join(""):""}).join("")):`<p class="mute">${evsAll.length?"No events match these filters.":"No events logged. Add one, or set up the day from your calendars."}</p>`;
  const wideEv=evs.some(e=>S.expanded[e.id]),wideTk=[...tasks,...done].some(e=>S.expanded[e.id]);
  let h=`<div class="cols2"><div class="panel tint" style="--tc:${tintFor("events")}${wideEv?";grid-column:1/-1":""}"><h2>Events <span class="c">${evs.length}${evs.length!==evsAll.length?" of "+evsAll.length:""}</span><span class="sp"></span>${addBtn("event")}${tintSw("events")}</h2>${evfBar(evsAll)}${addRow("event","e.g. Lunch with Chris tomorrow at noon")}${evHtml}</div>
   <div class="panel tint" style="--tc:${tintFor("tasks")}${wideTk?";grid-column:1/-1":""}"><h2>Tasks <span class="c">${tasks.length}</span>${done.length?` <span class="mute" style="font-size:.8em;font-weight:400">${done.length} done</span>`:""}<span class="sp"></span>${addBtn("task")}<button class="lnk" data-go="list:tasks">All tasks</button>${tintSw("tasks")}</h2>${addRow("task","e.g. Send the Hackett follow-up by Friday")}${taskGroups(S.doneBottom?tasks:[...tasks,...done],days,S.range,S.doneBottom?done:[])}</div></div>`;
  let nh="";if(notes.length){bySphere(notes).forEach((arr,s)=>{if(arr.length)nh+=`<div class="sub">${esc(s)} · ${arr.length}</div>`+arr.map(i=>itemRow(i,{showDate:S.range!=="day"})).join("")})}
  return h+`<div class="panel tint" style="--tc:${tintFor("notes")}"><h2>Notes &amp; ideas <span class="c">${notes.length}</span><span class="sp"></span>${addBtn("note")}${tintSw("notes")}</h2>${addRow("note","A thought, idea or reflection")}${nh||`<p class="mute">No notes or ideas for this ${S.range==="day"?"day":"range"} yet.</p>`}</div>`;
}
/* drag to reorder in the timeline */
(function(){
  let dragId=null;
  document.addEventListener("dragstart",e=>{const r=e.target.closest&&e.target.closest(".flowrow");if(!r)return;dragId=r.dataset.fid;e.dataTransfer.effectAllowed="move";try{e.dataTransfer.setData("text/plain",dragId)}catch(x){}r.classList.add("dragging")});
  document.addEventListener("dragend",()=>{dragId=null;document.querySelectorAll(".flowrow.dragging,.flowrow.over").forEach(x=>x.classList.remove("dragging","over"))});
  document.addEventListener("dragover",e=>{const r=e.target.closest&&e.target.closest(".flowrow");if(!r||!dragId)return;e.preventDefault();document.querySelectorAll(".flowrow.over").forEach(x=>x.classList.remove("over"));r.classList.add("over")});
  document.addEventListener("drop",async e=>{const r=e.target.closest&&e.target.closest(".flowrow");if(!r||!dragId)return;e.preventDefault();
    const list=r.closest(".flowlist"),day=list.dataset.day,tid=r.dataset.fid;if(tid===dragId)return;
    const rows=[...list.querySelectorAll(".flowrow")].map(x=>x.dataset.fid).filter(x=>x!==dragId);
    const rect=r.getBoundingClientRect(),after=e.clientY>rect.top+rect.height/2;let idx=rows.indexOf(tid)+(after?1:0);
    const val=id=>effOrd(itemById(id),day),prev=idx>0?val(rows[idx-1]):null,next=idx<rows.length?val(rows[idx]):null;
    const it=itemById(dragId);if(!it)return;
    it.ord=prev==null?(next==null?0:next-1):next==null?prev+1:(prev+next)/2;
    dragId=null;await saveItem(it);
  });
})();
/* ---------- report ---------- */
function pageReport(){
  const T=V().filter(i=>i.kind==="task"),done=T.filter(i=>i.status==="done"),open=T.filter(isOpen);
  const days=(a,b)=>Math.max(0,Math.round((pd(b.slice(0,10))-pd(a.slice(0,10)))/86400000));
  const dur=done.filter(i=>i.doneAt).map(i=>days(loggedOf(i),i.doneAt));
  const avg=dur.length?(dur.reduce((a,b)=>a+b,0)/dur.length).toFixed(1):"—";
  const same=dur.filter(x=>x===0).length;
  const migd=T.filter(i=>nmig(i)>0);
  const top=open.filter(i=>nmig(i)>0).sort((a,b)=>nmig(b)-nmig(a)||loggedOf(a).localeCompare(loggedOf(b))).slice(0,15);
  const tile=(n,l)=>`<div class="panel" style="flex:1;min-width:140px;margin:0"><div style="font-size:1.6rem;font-weight:700">${n}</div><div class="mute">${l}</div></div>`;
  let h=`<p class="mute">One record per task. Each keeps when it was logged, its due date, when it was completed, and every time it was migrated, so you can see what you do versus what you keep pushing.</p>
  <div class="row" style="gap:10px;align-items:stretch">${tile(T.length,"tasks logged")}${tile(done.length,"completed")}${tile(open.length,"open")}${tile(same,"done the day they were logged")}${tile(avg,"avg days, logged to done")}${tile(migd.length,"migrated at least once")}</div>
  <div class="panel"><h2>Most-migrated open tasks <span class="c">${top.length}</span></h2>${top.length?top.map(i=>`<div class="it" data-id="${esc(i.id)}"><span class="chk" data-act="cycle" data-tip="Mark complete"></span><div class="mid"><div class="ttl"><span data-act="edit">${esc(i.text)}</span></div><div class="dt">Logged ${esc(shortDate(loggedOf(i)))} · due ${esc(shortDate(tday(i)))} · migrated ${nmig(i)}×</div></div></div>`).join(""):`<p class="mute">No open task has been migrated yet.</p>`}</div>
  <div class="panel"><h2>By sphere</h2><table><thead><tr><th>Sphere</th><th>Logged</th><th>Done</th><th>Open</th><th>Migrations</th></tr></thead><tbody>${SPHERES.map(sp=>{const t=T.filter(i=>(i.sphere||DEFAULT_SPHERE)===sp);return`<tr><td>${esc(sp)}</td><td>${t.length}</td><td>${t.filter(i=>i.status==="done").length}</td><td>${t.filter(isOpen).length}</td><td>${t.reduce((a,i)=>a+nmig(i),0)}</td></tr>`}).join("")}</tbody></table></div>`;
  return h;
}

function pageEvent(){
  const x=itemById(S.arg);if(!x||x.kind!=="event")return`<p>Event not found. <a href="#events">Back to events</a></p>`;
  return docPage(x);
}
function personList(){
  const P=S.pf=S.pf||{area:"",q:"",sort:"name",mode:"list",group:""};
  const GK={type:p=>ptList(p).join(" + ")||"Untyped",rel:p=>relList(p)[0]||"—",company:p=>p.company||"—",letter:p=>(lastName(p)[0]||"#").toUpperCase(),open:p=>personStats(p).open.length?"Has open tasks":"No open tasks"};
  const gkeys=(a,gf)=>{const m=new Map();a.forEach(p=>{const k=gf(p);if(!m.has(k))m.set(k,[]);m.get(k).push(p)});return[...m].sort((x,y)=>x[0]==="—"?1:y[0]==="—"?-1:x[0].localeCompare(y[0]))};
  let arr=S.people.filter(p=>(!P.ptype||(P.ptype==="_none"?!ptList(p).length:ptList(p).includes(P.ptype)))&&(!P.rel||relList(p).includes(P.rel))&&(!P.org||p.company===P.org)&&(!P.q||[p.name,p.rel,p.company,p.role,p.email].join(" ").toLowerCase().includes(P.q.toLowerCase())));
  const n=p=>cntFor("person",p.id);
  const sorters={name:(a,b)=>lastName(a).localeCompare(lastName(b))||firstName(a).localeCompare(firstName(b)),type:(a,b)=>ptList(a).join().localeCompare(ptList(b).join())||a.name.localeCompare(b.name),items:(a,b)=>n(b)-n(a)||a.name.localeCompare(b.name),company:(a,b)=>(a.company||"~").localeCompare(b.company||"~")||a.name.localeCompare(b.name)};
  arr.sort(sorters[P.sort]||sorters.name);if(P.dir<0)arr.reverse();
  const counts={Work:0,Personal:0,_none:0};S.people.forEach(p=>{const l=ptList(p);if(!l.length)counts._none++;l.forEach(a=>counts[a]++)});
  let h=`<div class="row"><span class="mute">${arr.length} of ${S.people.length} people</span><span class="sp"></span><button data-go="cleanup">🧹 Clean up / review</button><button class="pri" data-act="newent" data-k="person">+ New person</button></div>
  <div class="ctlp"><div class="ctlr"><div class="ctll">Show</div><div class="ctlc"><button class="pillsel ${P.ptype?"":"on"}" data-act="ptfilt" data-v="">All <span class="mute">${S.people.length}</span></button>${[["Work","💼 Work"],["Personal","🏠 Personal"],["_none","Untyped"]].filter(([v])=>counts[v]).map(([v,l])=>`<button class="pillsel ${P.ptype===v?"on":""}" data-act="ptfilt" data-v="${v}">${l} <span class="mute">${counts[v]}</span></button>`).join("")}</div></div><div class="ctlr"><div class="ctll">Filter</div><div class="ctlc"><input data-act="pq" placeholder="Search people" value="${esc(P.q)}" style="width:190px"><select class="pillsel ${P.rel?"on":""}" data-act="pfsel" data-k="rel"><option value="">Relationship</option>${allRels().map(x=>`<option ${P.rel===x?"selected":""}>${esc(x)}</option>`).join("")}</select><select class="pillsel ${P.org?"on":""}" data-act="pfsel" data-k="org"><option value="">Organization</option>${[...new Set(S.people.map(p=>p.company).filter(Boolean))].sort().map(x=>`<option ${P.org===x?"selected":""}>${esc(x)}</option>`).join("")}</select></div></div><div class="ctlr"><div class="ctll">View</div><div class="ctlc"><div class="seg">${["list","table","board"].map(m=>`<button class="${P.mode===m?"on":""}" data-act="pmode" data-v="${m}">${({table:"▦ Table",list:"≡ List",board:"▥ Board"})[m]}</button>`).join("")}</div>
   <span class="mute">Group</span><select data-act="pgroup">${[["","None"],["type","Type"],["rel","Relationship"],["company","Organization"],["letter","Last-name letter"],["open","Open tasks"]].map(([v,l])=>`<option value="${v}" ${(P.group||"")===v?"selected":""}>${l}</option>`).join("")}</select><span class="mute">Sort</span><select data-act="psort">${[["name","Last name"],["type","Type"],["items","Most mentioned"],["company","Organization"]].map(([v,l])=>`<option value="${v}" ${P.sort===v?"selected":""}>${l}</option>`).join("")}</select><button data-act="pdir">${P.dir<0?"↓":"↑"}</button><span class="sp"></span><span class="mute">${arr.length} of ${S.people.length}</span></div></div></div>`;
  const ms=mergeSuggest();
  if(ms.length&&!P.q)h+=`<div class="panel"><h2>Possible duplicates <span class="c">${ms.length}</span></h2>${ms.map(([a,b])=>`<div class="row" style="margin:3px 0"><span>${esc(a.name)} <span class="mute">→</span> <b>${esc(b.name)}</b></span><span class="sp"></span><button data-act="pmerge" data-from="${esc(a.id)}" data-to="${esc(b.id)}">Merge</button></div>`).join("")}</div>`;
  if(!arr.length)return h+`<p class="mute">No one matches.</p>`;
  const sub=p=>p.context?p.context:[p.rel,p.role,p.company].filter(Boolean).join(" · ");
  const info=p=>{const st=personStats(p);const bits=[];if(st.open.length)bits.push(st.open.length+" open");if(st.last)bits.push("last "+shortDate(st.last));if(st.open[0])bits.push("next: "+st.open[0].text.slice(0,40));return bits.join(" · ")};
  const card=p=>`<div class="pcard" data-go="person:${esc(p.id)}">${pav(p)}<div style="min-width:0"><b>${esc(p.name)}</b> <span class="mute">${n(p)}</span>${p.kind==="group"?` <span class="chip mu">group</span>`:""}<div class="mute" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(sub(p))||"&nbsp;"}${p.areaGuess&&p.area!=="Unsorted"?" <span title='Area guessed from where they appear'>~</span>":""}</div><div class="x">${esc(info(p))}</div></div></div>`;
  if(P.mode==="board"){const gf=GK[P.group||"type"];P.group=P.group||"type";return h+`<div class="board">${gkeys(arr,gf).map(([k,a])=>`<div class="col"><h3>${esc(k)} <span class="mute">${a.length}</span></h3>${a.map(card).join("")}</div>`).join("")}</div>`}
  if(P.mode==="table"){const row=p=>`<tr data-go="person:${esc(p.id)}" style="cursor:pointer"><td>${avatar(p.name)} ${esc(p.name)}</td><td>${esc(ptList(p).join(" + "))}</td><td>${esc(p.rel||"")}</td><td>${esc(p.company||"")}${p.role?` <span class='mute'>· ${esc(p.role)}</span>`:""}</td><td>${esc(p.email||"")}</td><td>${personStats(p).open.length||""}</td><td>${personStats(p).n}</td></tr>`;
    const body=P.group&&GK[P.group]?gkeys(arr,GK[P.group]).map(([k,a])=>`<tr><td colspan="8" style="background:var(--soft)"><b>${esc(k)}</b> <span class="mute">${a.length}</span></td></tr>`+a.map(row).join("")).join(""):arr.map(row).join("");
    return h+`<div class="tw"><table><thead><tr><th>Name</th><th>Type</th><th>Relationship</th><th>Org · role</th><th>Email</th><th>Open</th><th>Items</th></tr></thead><tbody>${body}</tbody></table></div>`}
  if(P.group&&GK[P.group])return h+gkeys(arr,GK[P.group]).map(([k,a])=>`<div class="gt">${esc(k)} <span class="c">${a.length}</span></div>`+a.map(card).join("")).join("");
  return h+arr.map(card).join("");
}
function personHead(x){
  const fl=[["How I know them",x.context],["Type",ptList(x).join(", ")],["Relationship",relList(x).join(", ")],["Organization",x.company?orgLink(x)+(x.role?" · "+esc(x.role):""):""],["Email",x.email?`<a href="mailto:${esc(x.email)}">${esc(x.email)}</a>`:""],["Phone",x.phone]];
  return`<div class="row" style="align-items:center"><span data-act="cropphoto" data-id="${esc(x.id)}" title="Click to crop or zoom" style="cursor:pointer">${pav(x,1)}</span><div style="flex:1"><b style="font-size:1.2rem">${esc(x.name)}</b><div class="mute">${esc(x.context||[relList(x).join(", "),x.role,x.company].filter(Boolean).join(" · "))}</div></div><button data-act="editent">Edit</button><button data-act="mergeinto">Merge into…</button></div>
  <div class="panel"><div class="pf">${fl.filter(f=>f[1]).map(([l,v])=>`<span class="mute">${l}</span><span>${l==="Email"||l==="Organization"?v:esc(v)}</span>`).join("")}${(x.links||[]).length?`<span class="mute">Links</span><span>${x.links.map(l=>`<a href="${esc(l)}" target="_blank" rel="noopener">${esc(linkLabel(l))}</a>`).join(" · ")}</span>`:""}${(x.akas||[]).length?`<span class="mute">Also appears as</span><span>${esc(x.akas.join(", "))}</span>`:""}</div></div>`;
}
function pageEntity(kind){
  if(kind==='event')return pageEvent();
  const arr=kind==="person"?S.people:kind==="event"?S.events:S.colls;const x=arr.find(a=>a.id===S.arg);
  if(!x)return`<p>Not found. <a href="#${kind==="person"?"people":kind==="event"?"events":"colls"}">Back</a></p>`;
  const f=kind==="person"?"people":kind==="event"?"events":"colls";const items=V().filter(i=>(i[f]||[]).includes(x.id));
  let h=kind==="person"?personHead(x)+personPhotos(x)+`<div class="row"><span class="mute">${items.length} items</span></div>`:`<div class="row"><button data-act="editent">Edit</button>${kind==="coll"&&x.dynamic?`<button class="pri" data-act="sweep">✨ Refresh with AI</button>`:""}<span class="mute">${items.length} items</span><span class="sp"></span></div>`;
  if(x.definition)h+=`<p class="mute">Definition: ${esc(x.definition)}${x.lastRun?" · last refreshed "+new Date(x.lastRun).toLocaleDateString():""}</p>`;
  if(x.start)h+=`<p class="mute">${esc(x.start)}${x.end?" → "+esc(x.end):""}</p>`;
  if(x.note)h+=`<div class="panel mkd">${inlineImgs(mdRender(null,x.note),1)}</div>`;
  if(S.busy)h+=`<p class="mute">⏳ ${esc(S.busy)}</p>`;
  h+=itemsView(items,kind+x.id,"month");return h;
}
function propLabel(p){return({merge:"Merge",add:"Add",migrate:"Migrate to this day",collAdd:"Add to 📁 "+(p.collName||""),tag:"Tag"})[p.kind]||p.kind}
const isNew=p=>p.status==="pending"||(p.status==="snoozed"&&(p.snoozeUntil||"")<=today());
const inboxNew=()=>S.props.filter(isNew);
function propBody(p){
  const tgt=p.targetId&&S.items.find(i=>i.id===p.targetId);
  let body;
  if(p.kind==="merge"){const keep=S.items.find(i=>i.id===p.keepId);body=`<div><b>Merge duplicates</b> · ${esc(keep?cleanTitle(keep).t:p.item.text)}</div><div class="mute">Keeps the fullest copy and folds people, notes and tags from ${(p.dropIds||[]).length} other${(p.dropIds||[]).length>1?"s":""}: ${(p.dropIds||[]).map(x=>{const o=S.items.find(i=>i.id===x);return o?esc(o.text):""}).join(" · ")}</div>`}
  else body=`<div><b>${esc(propLabel(p))}</b> ${p.item?`<span class="chip mu">${esc(p.item.kind||"note")}</span> ${esc(p.item.text)}`:""}</div>${p.item&&p.item.detail?`<div class="mute" style="white-space:pre-wrap">${esc(p.item.detail.slice(0,400))}${p.item.detail.length>400?"…":""}</div>`:""}${p.kind==="add"&&p.item&&p.status==="pending"?`<div class="row" style="gap:4px;flex-wrap:wrap"><span class="mute">People</span>${ppChips(p.tagPeople,true)}${ppAddBox()}${(p.tagEvents||[]).map(x=>`<span class="chip">🗓️ ${esc(x)}</span>`).join("")}</div><div class="row" style="gap:4px;flex-wrap:wrap"><span class="mute">Collections</span>${ppChips(p.tagColls,true,"colls")}${ppAddBox("colls")}</div>`:(p.tagPeople||[]).length||(p.tagColls||[]).length||(p.tagEvents||[]).length?`<div>${(p.tagPeople||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join("")}${(p.tagEvents||[]).map(x=>`<span class="chip">🗓️ ${esc(x)}</span>`).join("")}${(p.tagColls||[]).map(x=>`<span class="chip">📁 ${esc(x)}</span>`).join("")}</div>`:""}`;
  const lk=p.src&&/^(https:|evernote:)/.test(p.src.link||"")?` <a class="chip src" href="${esc(p.src.link)}" target="_blank" rel="noopener">⎘ Source</a>`:"";
  body+=(p.item&&p.item.kind==="task"&&p.item.due?`<div class="mute dsm">Due ${esc(shortDate(p.item.due))}${p.dueGuess?` <span class="chip mu" title="The AI guessed this date">guess</span>`:""}${p.item.list==="waiting"?" · waiting for":""}</div>`:"")+(p.quote?`<div class="pquote">“${esc(p.quote)}”${lk}</div>`:lk?`<div>${lk}</div>`:"");
  return body+`<div class="mute">${p.kind==="migrate"&&tgt?"Moves the existing task from "+esc(tgt.date)+" (no copy). ":""}${esc(p.reason||"")}${p.src&&p.src.name?` · source: ${esc(p.src.name)}${p.src.loc?" · "+esc(p.src.loc):""}`:""}</div>`;
}
function pageReview(){
  const tab=S.inboxTab||"New",sel=S.inboxSel=S.inboxSel||{},td=today();
  const sets={New:inboxNew(),Snoozed:S.props.filter(p=>p.status==="snoozed"&&(p.snoozeUntil||"")>td),Dismissed:S.props.filter(p=>p.status==="rejected"),Confirmed:S.props.filter(p=>p.status==="accepted"&&!p.auto),"Filed for you":S.props.filter(p=>p.status==="accepted"&&p.auto)};
  const grouped=tab==="New"||tab==="Snoozed";
  const ps=sets[tab].slice().sort(grouped?(a,b)=>(a.date||"").localeCompare(b.date||""):(a,b)=>(b.created||0)-(a.created||0)).slice(0,grouped?9999:60);
  const ls=S.lastSweep?"Last sweep "+fmtDT(new Date(S.lastSweep.at).toISOString())+(S.lastSweep.n!=null?" · "+S.lastSweep.n+" new":""):"Not swept yet";
  let h=`<div class="ctlp"><div class="ctlr"><div class="ctll">Show</div><div class="ctlc"><div class="seg">${["New","Snoozed","Dismissed","Confirmed","Filed for you"].map(t=>`<button data-act="itab" data-v="${t}" class="${tab===t?"on":""}">${t} <span class="mute">${sets[t].length}</span></button>`).join("")}</div></div></div>
   <div class="ctlr"><div class="ctll">Sweeps</div><div class="ctlc"><button data-act="isweep" ${S.busy?"disabled":""}>🔄 Sweep now</button><span class="mute">${S.busy?"⏳ "+esc(S.busy):esc(ls)}</span><span class="sp"></span><button class="lnk" data-go="data">Pull from Evernote…</button></div></div></div>
  <p class="mute" style="margin:4px 0 8px">Nothing the AI, calendars or imports propose is written to your journal until you confirm it, unless you turned on an auto-file rule below. Dismiss remembers your no. Snooze brings it back later.</p>`+trustPanel();
  if(tab==="New"&&ps.length){const n=ps.filter(p=>sel[p.id]).length;h+=`<div class="panel" style="padding:8px 12px"><div class="row"><label><input type="checkbox" data-act="iall" ${n===ps.length?"checked":""}> Select all</label><span class="mute">${n?n+" selected":ps.length+" waiting"}</span><span class="sp"></span>${n?`<button class="pri" data-act="ibulk" data-v="confirm">Confirm ${n}</button><button data-act="ibulk" data-v="snooze">Snooze ${n}</button><button class="warn" data-act="ibulk" data-v="dismiss">Dismiss ${n}</button>`:""}</div></div>`}
  if(!ps.length)return h+`<p class="mute">${tab==="New"?"Inbox is clear.":"Nothing here."}</p>`;
  const card=p=>{
    let btns="";
    if(tab==="New")btns=`<button class="pri" data-act="pacc">Confirm</button>${p.item&&p.kind==="add"?`<button data-act="pedit">Edit</button>`:""}<button data-act="psnz">Snooze</button><button class="warn" data-act="prej">Dismiss</button>`+(S.snzFor===p.id?`<span class="row" style="gap:4px"><span class="mute">until</span><button data-act="psnzgo" data-v="tom">Tomorrow</button><button data-act="psnzgo" data-v="mon">Next Mon</button><button data-act="psnzgo" data-v="wk">In a week</button></span>`:"");
    else if(tab==="Snoozed")btns=`<span class="mute">Back ${esc(shortDate(p.snoozeUntil))}</span><button data-act="prest">Move to New now</button><button class="warn" data-act="prej">Dismiss</button>`;
    else if(tab==="Dismissed")btns=`<button data-act="prest">Restore to New</button>`;
    else if(tab==="Filed for you")btns=`<span class="mute">Auto-filed ${esc(engKeyLabel(p.ruleKey||"").toLowerCase())}</span>${p.createdId&&S.items.some(i=>i.id===p.createdId)?`<button data-act="pundo">Undo</button>`:`<span class="mute">(removed)</span>`}`;
    else btns=`<span class="mute">Added to your journal</span>`;
    return`<div class="panel prop" data-pid="${esc(p.id)}"><div style="display:flex;gap:10px;align-items:flex-start">${tab==="New"?`<input type="checkbox" data-act="isel" ${sel[p.id]?"checked":""} style="margin-top:4px">`:""}<div style="flex:1;min-width:0">${propBody(p)}</div></div>${clar(p,tab)}<div class="row" style="margin-top:6px">${btns}</div></div>`};
  if(grouped){const byd=new Map();ps.forEach(p=>{const k=p.date||"—";if(!byd.has(k))byd.set(k,[]);byd.get(k).push(p)});byd.forEach((a,d)=>{h+=`<div class="gt">${esc(d==="—"?d:dlabel(d))} <span class="c">${a.length}</span></div>`+a.map(card).join("")})}
  else h+=ps.map(card).join("");
  return h;
}
async function reassignWhose(){
  let n=0;
  const _t0=Date.parse(today());const _dd=x=>Math.abs((Date.parse(x.date)||0)-_t0);
  for(const i of S.items.filter(x=>x.kind==="event"&&x.whoseAuto!==false).sort((a,b)=>_dd(a)-_dd(b))){
    const g=ownerGuess(i);const w=g.whose,who=g.who||null;
    if(i.whose===w&&(i.whoPerson||null)===who&&i.whoseAuto===true)continue;
    i.whose=w;i.whoseAuto=true;
    if(w==="other"){i.whoPerson=who;if(who){i.people=i.people||[];if(!i.people.includes(who))i.people.push(who)}}else delete i.whoPerson;
    upsertLocal("items",i);await save("items",i);n++}
  if(n){S._m=null;toast(n+" event"+(n>1?"s":"")+" re-assigned mine / others'")}
  return n}
async function runSweep(){
  if(S.busy)return;
  const before=inboxNew().length;
  await reassignWhose();
  await setupDay(today());await setupDay(addDays(today(),1));
  try{await proposeMerges()}catch(e){}
  const n=Math.max(0,inboxNew().length-before);
  S.lastSweep={at:Date.now(),n};try{await S.db.doc("meta/sweep").set(S.lastSweep)}catch(e){}
  toast(n?n+" new in Inbox":"Sweep done. Nothing new.");render();
}
async function inboxBulk(v){
  const ids=Object.keys(S.inboxSel||{}).filter(k=>S.inboxSel[k]&&S.props.some(p=>p.id===k&&isNew(p)));if(!ids.length)return;
  S.busy=(v==="confirm"?"Confirming ":v==="snooze"?"Snoozing ":"Dismissing ")+ids.length+"…";render();
  for(const id of ids){const p=S.props.find(x=>x.id===id);if(!p)continue;
    if(v==="confirm")await acceptProp(id,1);else if(v==="dismiss")await rejectProp(id,1);else{p.status="snoozed";p.snoozeUntil=addDays(today(),1);await save("props",p)}}
  S.busy="";S.inboxSel={};toast(ids.length+(v==="confirm"?" confirmed":v==="snooze"?" snoozed until tomorrow":" dismissed"));render();
}
function pageReviewOld(){
  const ps=S.props.filter(p=>p.status==="pending").sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  let h=`<div class="row"><span class="mute">Nothing the AI, calendars or imports propose is written to your journal until you accept it.</span><span class="sp"></span>${ps.length?`<button class="pri" data-act="acceptall">Accept all ${ps.length}</button><button data-act="rejectall">Reject all</button><button data-act="dismissall">Dismiss all</button>`:""}</div>
  <p class="mute" style="margin:4px 0">Accept writes it. Reject remembers your no, so it is not proposed again. Dismiss just clears it from the queue.</p>`;
  if(!ps.length)return h+`<p>Queue is empty.</p>`;
  const byd=new Map();ps.forEach(p=>{const k=p.date||"—";if(!byd.has(k))byd.set(k,[]);byd.get(k).push(p)});
  byd.forEach((a,d)=>{h+=`<div class="gt">${esc(d==="—"?d:dlabel(d))} <span class="c">${a.length}</span></div>`+a.map(p=>{
    const tgt=p.targetId&&S.items.find(i=>i.id===p.targetId);
    let body;
    if(p.kind==="merge"){const keep=S.items.find(i=>i.id===p.keepId);body=`<div><b>Merge duplicates</b> · ${esc(keep?cleanTitle(keep).t:p.item.text)}</div><div class="mute">Keeps the fullest copy and folds people, notes and tags from ${(p.dropIds||[]).length} other${(p.dropIds||[]).length>1?"s":""}: ${(p.dropIds||[]).map(x=>{const o=S.items.find(i=>i.id===x);return o?esc(o.text):""}).join(" · ")}</div>`}
    else body=`<div><b>${esc(propLabel(p))}</b> ${p.item?`<span class="chip mu">${esc(p.item.kind||"note")}</span> ${esc(p.item.text)}`:""}</div>${p.item&&p.item.detail?`<div class="mute" style="white-space:pre-wrap">${esc(p.item.detail.slice(0,400))}${p.item.detail.length>400?"…":""}</div>`:""}
      ${(p.tagPeople||[]).length||(p.tagColls||[]).length||(p.tagEvents||[]).length?`<div>${(p.tagPeople||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join("")}${(p.tagEvents||[]).map(x=>`<span class="chip">🗓️ ${esc(x)}</span>`).join("")}${(p.tagColls||[]).map(x=>`<span class="chip">📁 ${esc(x)}</span>`).join("")}</div>`:""}`;
    return`<div class="panel prop" data-pid="${esc(p.id)}">${body}
    <div class="mute">${p.kind==="migrate"&&tgt?"Moves the existing task from "+esc(tgt.date)+" (no copy). ":""}${esc(p.reason||"")}${p.src&&p.src.name?` · source: ${esc(p.src.name)}${p.src.loc?" · "+esc(p.src.loc):""}`:""}</div>
    <div class="row" style="margin-top:6px"><button class="pri" data-act="pacc">Accept</button>${p.item&&p.kind==="add"?`<button data-act="pedit">Edit</button>`:""}<button class="warn" data-act="prej">Reject</button><button data-act="pdismiss">Dismiss</button></div></div>`}).join("")});
  return h;
}
function pageSearch(){return`<p class="mute">Results for “${esc(S.q)}”</p>`+itemsView(V().filter(i=>matches(i,{},S.q)),"search","month")}
function pageData(){
  let le=0;try{le=+localStorage.getItem("tabula_lastexport")||0}catch(e){}
  return`<div class="panel"><h2>Export everything</h2><div class="row"><button class="pri" data-act="exportzip">⬇ Download all (Markdown files + images, .zip)</button><button data-act="exportzipt">Without images</button></div>
  <p class="mute">A folder you can open as an Obsidian vault or read in any editor: one Markdown file per day, task, event, note, person and collection, each with YAML frontmatter and [[links]], plus your images, the original text of every import, and a complete backup file for restoring. ${le?"Last full export: "+esc(fmtDT(new Date(le).toISOString()))+".":"No full export yet."}</p>
  <div class="row"><button data-act="exportmd">One Markdown file</button><button data-act="exportjson">Full backup (.json)</button></div></div>
  <div class="panel"><h2>Evernote (manual, optional)</h2><p class="mute">The journal keeps its own data and never writes to Evernote on its own. Use these only when you want to.</p>
  <div class="row"><input id="evq" placeholder="Search Evernote notes to pull in" style="flex:1;min-width:180px"><button data-act="evsearch">Search</button></div><div id="evres"></div>
  <div class="row" style="margin-top:10px"><b>Push a month:</b><input id="snapm" placeholder="YYYY-MM" value="${monthOf(today())}" style="width:100px"><button data-act="snap">Create one Evernote note for that month</button></div></div>
  <div class="panel"><h2>Import</h2><p class="mute">Restore a full backup: the “Download all” .zip (includes images) or a .json backup. Records with the same id are overwritten; nothing else is deleted.</p><input type="file" id="jsonf" accept=".json,.zip"></div>
  <div class="panel"><h2>Status</h2><p class="mute">${S.items.length} items · ${S.people.length} people · ${S.events.length} events · ${S.colls.length} collections · AI ${S.sample?"on":"off"} · connectors ${S.mcp?"on":"off"} · dictation ${S.dict?"on":"off"}</p></div>`;
}
/* ---------- shell: sidebar, header, router ---------- */
const TITLES={img:"Image",images:"Images",daily:"Daily log",month:"Monthly log",year:"Yearly log",people:"People",person:"Person",events:"Events",event:"Event",colls:"Collections",coll:"Collection",review:"Inbox",weekly:"Weekly review",data:"Data",search:"Search",report:"Task report",obj:"Item",archived:"Archived",cleanup:"Review people",org:"Organization"};
function pageTitle(){
  if(S.view==="list")return(LISTS[S.arg]||{}).title||"Tasks";
  if(S.view==="person")return pname(S.arg);if(S.view==="event"||S.view==="obj"){const x=itemById(S.arg);return x?kindName(x):"Item"}if(S.view==="coll")return cname(S.arg);
  if(S.view==="daily")return longDate(S.date);return TITLES[S.view]||"";
}
function gh(key,label,extra){const c=S.collapsed[key];return`<div class="gh${c?" shut":""}" data-act="coll" data-k="${key}" role="button" aria-expanded="${!c}"><span class="ghl">${label}</span>${ic("chev","ghc")}${extra||""}</div>`}
function paintSide(){
  /* Four fixed sections (docs/DESIGN.md): Today, Lists, Library, Spheres. Utilities sit in the Settings menu. */
  const el=document.getElementById("side");if(document.activeElement&&document.activeElement.id==="sq")return;
  const T=V(),open=T.filter(isOpen),td=today(),pend=inboxNew().length;
  const on=(v,a)=>S.view===v&&(a==null||S.arg===a)?"on":"";
  const sphF=(S.filt["list-tasks"]||{}).sphere||"";
  const lk=(h,icon,l,n,cls,attrs)=>`<a href="${h}" class="${cls}"${attrs||""}>${icon}<span class="lbl">${l}</span>${n!=null&&n!==0?`<span class="n">${n}</span>`:""}</a>`;
  let h=`<div class="brand"><svg class="tlogo" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><rect x="3" y="5" width="26" height="22" rx="4" fill="#7a4a1e"/><rect x="6.5" y="8.5" width="19" height="15" rx="1.5" fill="#e9c46a"/><path d="M9.5 13h13M9.5 16.5h9M9.5 20h11" stroke="#7a4a1e" stroke-width="1.6" stroke-linecap="round"/></svg><span class="tword">Tabula</span><button class="sbtn" data-act="burger" title="Hide sidebar" aria-label="Hide sidebar">${ic("sidebar")}</button></div><input id="sq" type="search" placeholder="Search" aria-label="Search everything" value="${esc(S.q)}"><div class="nav">`;
  h+=lk("#day:"+td,ic("today"),"Today",open.filter(i=>tday(i)===td).length,["daily","month","year"].includes(S.view)?"on":"")
    +lk("#review",ic("inbox"),"Inbox",pend,on("review"))
    +lk("#weekly",ic("review"),"Review",wkDue()?"due":null,on("weekly"));
  h+=gh("lists","Lists",`<span class="pl" data-act="saveview" title="Save the current view as a list" aria-label="Save the current view as a list">${ic("plus")}</span>`);
  if(!S.collapsed.lists){
    h+=lk("#list:today",ic("tasks"),"Tasks",open.length,S.view==="list"&&!["notes","lnext","lwait","lsome"].includes(S.arg)&&!(S.arg==="tasks"&&sphF)?"on":"")
      +lk("#list:lnext",ic("next"),"Next actions",open.filter(i=>listOf(i)==="next").length,on("list","lnext"))
      +lk("#list:lwait",ic("waiting"),"Waiting for",open.filter(i=>listOf(i)==="waiting").length,on("list","lwait"))
      +lk("#list:lsome",ic("someday"),"Someday",T.filter(i=>i.kind==="task"&&(i.status||"open")==="open"&&i.list==="someday").length,on("list","lsome"))
      +S.views.map(v=>`<a href="#view:${esc(v.id)}" class="${on("view",v.id)}">${ic("view")}<span class="lbl">${esc(v.name)}</span><span class="n x" data-act="delview" data-id="${esc(v.id)}" title="Remove this list" aria-label="Remove this list">×</span></a>`).join("");
  }
  h+=gh("library","Library");
  if(!S.collapsed.library){
    h+=lk("#list:notes",ic("notes"),"Notes",T.filter(i=>i.kind==="note").length,on("list","notes"))
      +lk("#people",ic("people"),"People",S.people.length,S.view==="people"||S.view==="person"?"on":"")
      +lk("#events",ic("events"),"Events",T.filter(i=>i.kind==="event").length,S.view==="events"||S.view==="event"?"on":"")
      +lk("#colls",ic("colls"),"Collections",S.colls.length,S.view==="colls"||S.view==="coll"?"on":"")
      +lk("#images",ic("images"),"Images",S.imgs.length||null,on("images"));
  }
  h+=gh("spheres","Spheres");
  if(!S.collapsed.spheres){
    h+=SPHERES.map(sp=>lk("#list:tasks",`<i class="dot" style="background:${tintFor("sphere:"+sp)}"></i>`,esc(sphName(sp)),open.filter(i=>i.kind==="task"&&(i.sphere||DEFAULT_SPHERE)===sp).length,S.view==="list"&&S.arg==="tasks"&&sphF===sp?"on":"",` data-act="sphere" data-sp="${esc(sp)}"`)).join("");
  }
  h+=`</div><div class="sfoot"><button class="sfb" data-act="smenu" aria-haspopup="menu">${ic("gear")}<span>Settings</span></button><div id="smenu" class="menu" role="menu">
    <button data-act="theme" role="menuitem">Appearance…</button>
    ${window.tabulaAccount?`<button data-act="account" role="menuitem">Account…</button>`:""}
    <a href="#data" role="menuitem">Data &amp; export</a>
    <a href="#archived" role="menuitem">Archived${archCount()?` <span class="n">${archCount()}</span>`:""}</a>
    <a href="#report" role="menuitem">Task report</a></div></div>`;
  el.innerHTML=h;
}
/* row density is remembered per list (src/appearance.ts) */
function densKey(){return S.view==="list"||S.view==="view"?"list:"+S.arg:S.view}
function dens(){const A=window.tabulaAppearance;return A?A.density(densKey()):"comfy"}
function calSeg(){
  if(!["daily","month","year"].includes(S.view))return"";
  const cur=S.view==="month"?"month":S.view==="year"?"year":(S.range==="day"?"day":"week");
  return`<span class="seg calseg" role="radiogroup" aria-label="Calendar">${[["day","Day"],["week","Week"],["month","Month"],["year","Year"]].map(([v,l])=>`<button data-act="cal" data-v="${v}" role="radio" aria-checked="${cur===v}" class="${cur===v?"on":""}">${l}</button>`).join("")}</span>`;
}
function mi(act,label,checked,extra){return`<button data-act="${act}"${extra||""} role="${checked==null?"menuitem":"menuitemcheckbox"}"${checked==null?"":` aria-checked="${!!checked}"`}>${ic("check","mic")}<span>${label}</span></button>`}

/* ---------- where items open (docs/DESIGN.md): tasks in the side panel, notes/events/meetings full page ---------- */
const isDocView=()=>S.view==="obj"||S.view==="event";
function openFull(id){const it=itemById(id);if(!it)return;S.sel=null;location.hash=(it.kind==="event"?"#event:":"#obj:")+id}
function openItem(id){const it=itemById(id);if(!it)return;
  if(it.kind==="task"){S.sel=id;S.panel=null;paintInsp(true);document.querySelectorAll("#content .it.sel").forEach(r=>r.classList.remove("sel"));document.querySelectorAll(`#content .it[data-id="${CSS.escape(id)}"]`).forEach(r=>r.classList.add("sel"));return}
  openFull(id)}
function closeInsp(){S.sel=null;document.querySelectorAll("#content .it.sel").forEach(r=>r.classList.remove("sel"));paintInsp(true)}
function togglePP(){if(!isDocView())return;S.pp=!S.pp;try{localStorage.setItem("tabula-pp",S.pp?"1":"0")}catch(e){}paintContent()}
function openPanel(html){S.panel="entity";S.sel=null;const p=document.getElementById("insp");if(!p)return openModal(html);
  p.dataset.mode="entity";p.innerHTML=`<div class="insp-h"><span class="insp-k">Edit</span><span class="sp"></span><button class="tbi" data-act="panelclose" title="Close (Esc)" aria-label="Close">${ic("close")}</button></div><div class="insp-b pform">${html}</div>`;
  p.hidden=false;document.body.classList.add("insp-on")}
function closePanel(){S.panel=null;paintInsp(true)}
function itemMenu(x){const id=esc(x.id),open=isOpen(x);
  return`<span class="mwrap"><button class="tbi" data-act="imenu" title="More" aria-label="More actions" aria-haspopup="menu">${ic("more")}</button><div class="menu imenu" role="menu">
   ${x.kind==="task"&&!isDocView()?`<button data-act="openfull" data-id="${id}" role="menuitem">Open Full Page<kbd>⌘↩</kbd></button>`:""}
   ${open?`<button data-act="mig" data-id="${id}" role="menuitem">Migrate To…</button><button data-act="drop" data-id="${id}" role="menuitem">Drop</button>`:""}
   <button data-act="sens" data-id="${id}" role="menuitem">${x.sensitive?"Not Sensitive":"Mark as Sensitive"}</button>
   <hr><button data-act="delitem" data-id="${id}" role="menuitem" class="red">Archive</button></div></span>`}
const kindName=x=>x.kind==="event"?(x.sub==="meeting"||x.transcript||x.summary?"Meeting":"Event"):x.kind==="note"?"Note":"Task";
function paintInsp(force){
  const p=document.getElementById("insp");if(!p)return;
  if(S.panel==="entity"&&p.dataset.mode==="entity"&&!force)return;
  if(S.panel==="entity"&&force){S.panel=null}
  const a=document.activeElement;if(!force&&a&&p.contains(a)&&(a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&!["checkbox","date","file"].includes(a.type)))){S.dirty=true;return}
  let html="",mode="";
  if(isDocView()&&S.pp){const x=itemById(S.arg);if(x&&!(x.sensitive&&!S.reveal[x.id])){mode="props";html=`<div class="insp-h"><span class="insp-k">Details</span><span class="sp"></span><button class="tbi" data-act="pp" title="Hide details (⌘I)" aria-label="Hide details">${ic("close")}</button></div><div class="insp-b">${expHtml(x,{panel:1})}</div>`}}
  else if(S.sel){const x=itemById(S.sel);if(x&&!x.archivedAt){mode="task";html=`<div class="insp-h"><span class="insp-k">${ic("tasks")}${kindName(x)}</span><span class="sp"></span><button class="tbi" data-act="openfull" data-id="${esc(x.id)}" title="Open full page (⌘↩)" aria-label="Open full page">${ic("expand")}</button>${itemMenu(x)}<button class="tbi" data-act="inspclose" title="Close (Esc)" aria-label="Close">${ic("close")}</button></div><div class="insp-b">${expHtml(x,{insp:1})}</div>`}else S.sel=null}
  p.dataset.mode=mode;
  if(!html){p.innerHTML="";p.hidden=true;document.body.classList.remove("insp-on");return}
  const st=p.scrollTop;p.innerHTML=html;p.hidden=false;document.body.classList.add("insp-on");p.scrollTop=st;growTitles(p);
}
function growTitles(root){(root||document).querySelectorAll("textarea.xtitle").forEach(t=>{t.style.height="auto";t.style.height=t.scrollHeight+"px"})}
function docTokens(x){
  const k=x.kind||"task",t=[],ct=k==="event"?cleanTitle(x):null;
  const when=k==="event"?longDate(x.date)+(x.end?" – "+longDate(x.end):"")+(ct&&ct.time?" · "+ct.time:""):k==="task"?(x.due?"Due "+longDate(x.due):"No due date"):longDate(x.date);
  t.push(`<button class="tok" data-act="pp">${esc(when)}</button>`);
  t.push(`<a class="tok" href="#list:tasks" data-act="sphere" data-sp="${esc(x.sphere||DEFAULT_SPHERE)}"><i class="dot" style="background:${tintFor("sphere:"+(x.sphere||DEFAULT_SPHERE))}"></i>${esc(sphName(x.sphere||DEFAULT_SPHERE))}</a>`);
  (x.people||[]).forEach(pid=>t.push(`<a class="tok" href="#person:${esc(pid)}">${avatarP(pid)}${esc(pname(pid))}</a>`));
  (x.events||[]).forEach(eid=>t.push(`<a class="tok" href="#event:${esc(eid)}">${esc(ename(eid))}</a>`));
  (x.colls||[]).forEach(cid=>t.push(`<a class="tok" href="#coll:${esc(cid)}">${esc(cname(cid))}</a>`));
  if(x.star)t.push(`<span class="tok star">★ Priority</span>`);
  return t.join('<span class="tsep">·</span>');
}
function docPage(x){
  const k=x.kind||"task",id=esc(x.id),open=isOpen(x);
  const linked=V().filter(i=>i.id!==x.id&&((i.events||[]).includes(x.id)||(x.events||[]).includes(i.id)||(x.related||[]).includes(i.id)||(i.related||[]).includes(x.id)));
  const icon=k==="event"?"events":k==="note"?"notes":"tasks";
  const chk=k==="task"?`<button class="doc-chk ${x.status||"open"}" data-act="cycle" data-id="${id}" title="${open?"Mark done":"Mark not done"}" aria-label="${open?"Mark done":"Mark not done"}">${x.status==="done"?ic("check"):""}</button>`:"";
  return`<article class="doc">
   <div class="doc-top"><span class="doc-kind">${ic(icon)}${kindName(x)} · <a href="#day:${esc(tday(x))}">${esc(longDate(tday(x)))}</a></span><span class="sp"></span>
    <button class="tbtn ${S.pp?"on":""}" data-act="pp" aria-pressed="${!!S.pp}" title="Show every property (⌘I)">Details</button>${itemMenu(x)}</div>
   <div class="exp doc-exp" data-xid="${id}">
    <div class="doc-h">${chk}<textarea class="xtitle doc-t" data-f="text" rows="1" aria-label="Title">${esc(x.text)}</textarea></div>
    <div class="toks">${docTokens(x)}</div>
    <div class="doc-body">${keyHero(x)}${noteEditor(x)}<div class="doc-imgs">${imagesRow(x)}</div></div>
    ${k==="event"?expHtml(x,{meetOnly:1}):""}
   </div>
   <section class="doc-linked"><h2>${k==="event"?"Notes and items for this event":"Linked here"} <span class="c">${linked.length}</span>${k==="event"?`<button class="lnk" data-act="newnote" data-id="${id}">New Note</button>`:""}</h2>
    ${linked.length?(k==="event"?itemsView(linked,"evl-"+x.id,""):linked.map(i=>i.kind==="event"?evRow(i):itemRow(i)).join("")):`<p class="mute">Nothing linked yet. Add people, events or related items in Details.</p>`}</section>
  </article>`;
}
document.addEventListener("keydown",e=>{
  if(document.querySelector("dialog[open]")||document.getElementById("modal").classList.contains("on"))return;
  const t=e.target,inField=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable);
  if((e.metaKey||e.ctrlKey)&&e.key==="Enter"&&S.sel&&!isDocView()){e.preventDefault();openFull(S.sel);return}
  if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&(e.key==="i"||e.key==="I")&&isDocView()){e.preventDefault();togglePP();return}
  if(t&&t.classList&&t.classList.contains("xtitle")&&e.key==="Enter"&&!e.shiftKey){e.preventDefault();t.blur();return}
  if(e.key!=="Escape"||inField)return;
  if(S.panel){closePanel();return}
  if(S.sel){closeInsp();return}
  if(isDocView()&&S.pp){togglePP();return}
  if(isDocView())history.back();
});
document.addEventListener("input",e=>{if(e.target.classList&&e.target.classList.contains("xtitle"))growTitles(e.target.parentNode)});
document.addEventListener("click",e=>{if(window.innerWidth<=860&&document.body.classList.contains("insp-on")&&(e.target===document.body||e.target===document.documentElement)){if(S.panel)closePanel();else if(S.sel)closeInsp();else if(S.pp)togglePP()}});
new MutationObserver(()=>growTitles(document.getElementById("content"))).observe(document.getElementById("content"),{childList:true});
try{S.pp=localStorage.getItem("tabula-pp")==="1"}catch(e){S.pp=false}
function paintTop0(){
  /* Toolbar order (docs/DESIGN.md): back/forward, title, calendar range, density, More, New. */
  {const c=document.getElementById("content");if(c){c.dataset.w=S.pw||"m";c.dataset.density=dens()}}
  const pw=S.pw||"m",dc=dens()==="compact";
  document.getElementById("top").innerHTML=`<button id="sbx" data-act="burger" title="Show sidebar" aria-label="Show sidebar">${ic("sidebar")}</button><span class="hnav dsk"><button data-act="back" title="Back" aria-label="Back">${ic("back")}</button><button data-act="fwd" title="Forward" aria-label="Forward">${ic("fwd")}</button></span><h1>${esc(pageTitle())}</h1>${calSeg()}<span class="seg dens dsk" role="radiogroup" aria-label="Row density"><button data-act="density" data-v="comfy" role="radio" aria-checked="${!dc}" class="${dc?"":"on"}" title="Comfortable rows" aria-label="Comfortable rows"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h11"/></svg></button><button data-act="density" data-v="compact" role="radio" aria-checked="${dc}" class="${dc?"on":""}" title="Compact rows" aria-label="Compact rows"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2.5 3h11M2.5 6h11M2.5 9h11M2.5 12h11"/></svg></button></span><button class="tbi" data-act="mmore" title="More" aria-label="More" aria-haspopup="menu">${ic("more")}</button><button class="pri" data-act="newitem">${newSpec().label}</button><div id="mmenu" class="menu" role="menu">`
    +mi("kimgtog","Show key images",!S.kimgOff)
    +mi("detmode","Show details in every row",S.detailMode!=="none")
    +mi("mdmode","Show raw Markdown",S.mdMode==="markdown")
    +`<hr class="dsk">`+[["n","Narrow page"],["m","Medium page"],["w","Wide page"]].map(([v,l])=>mi("pw",l,pw===v,` data-v="${v}" class="dsk"`)).join("")
    +`<hr class="mob">`+mi("density","Compact rows",dc,` data-v="toggle" class="mob"`)
    +`<hr>`+mi("exportmd","Export…")+`</div>`;
  paintBnav();
}
function route(){
  S.reveal={};S.sel=null;S.panel=null;S.items.forEach(i=>{if(i.sensitive)delete S.expanded[i.id]});
  {const hh=location.hash||"";if(!S.ptabs.some(t=>t.h===hh))S.mainHash=hh||"#day:"+today()}
  const h=location.hash.slice(1);const i=h.indexOf(":");const v=i<0?h:h.slice(0,i),a=i<0?"":h.slice(i+1);
  S.arg=a;
  if(v==="day"){S.view="daily";S.date=a||today()}
  else if(v==="item"){const it=itemById(a);if(it){if(it.kind==="event"){S.view="event"}else if(it.kind==="task"){S.sel=a;S.view="daily";S.date=tday(it);S.range="day"}else{S.view="obj"}}else S.view="daily"}
  else if(v==="view"){const sv=S.views.find(x=>x.id===a);if(sv){const key="list-"+(sv.list||"tasks");S.filt[key]={...(sv.filt||{})};S.fq[key]=sv.fq||"";S.groups[key]=sv.group||"";S.modes[key]=sv.mode||"list";S.sorts[key]=sv.sort||{f:"date",d:1};S.view="list";S.arg=sv.list||"tasks"}else S.view="daily";S.date=today()}
  else if(!v||v==="dash"){S.view="daily";S.date=S.date||today()}else S.view=v;
  document.getElementById("side").classList.remove("open");
  paintTop();paintSide();paintContent(true);window.scrollTo(0,0);
}
function typing(){const a=document.activeElement;if(a&&a.classList&&a.classList.contains("qa")&&!a.value)return false;return a&&a.closest&&a.closest("#content,#insp")&&(a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&!["checkbox","date","file"].includes(a.type)))}
function render(){
  if(typing()){S.dirty=true;return}
  paintSide();paintContent();
}
function paintContent(){
  const c=document.getElementById("content");
  let body="";
  if(!S.ready&&!S.loadErr)body=`<p class="mute">Loading journal…</p>`;
  else{
    switch(S.view){case"daily":body=pageDaily();break;case"month":body=pageMonth();break;case"year":body=pageYear();break;
      case"list":body=pageList(S.arg);break;case"people":body=entityList("person");break;case"events":body=entityList("event");break;case"colls":body=entityList("coll");break;
      case"person":case"event":case"coll":body=pageEntity(S.view);break;case"review":body=pageReview();break;case"weekly":body=pageWeekly();break;case"search":body=pageSearch();break;case"data":body=pageData();break;case"report":body=pageReport();break;case"obj":body=pageObj();break;case"img":body=pageImg();break;case"images":body=pageImages();break;case"archived":body=pageArchived();break;case"cleanup":body=pageCleanup();break;case"org":body=pageOrg();break;default:body=pageDaily()}
  }
  const st=window.scrollY;
  {const tb=document.getElementById("tabbar");if(tb)tb.innerHTML=tabBar()}
  c.innerHTML=(S.loadErr?`<p class="mute">${esc(S.loadErr)}</p>`:"")+(S.busy&&S.view!=="daily"&&S.view!=="coll"?`<p class="mute">⏳ ${esc(S.busy)}</p>`:"")+body;
  if(arguments.length===0)window.scrollTo(0,st);
  const af=c.querySelector("[data-autofocus]");if(af&&!af.value)af.focus();
  paintTop();paintInsp();
}
loadTabs();loadPw();
window.addEventListener("hashchange",route);
document.addEventListener("focusout",()=>{if(S.dirty){setTimeout(()=>{if(!typing()&&S.dirty){S.dirty=false;render()}},80)}});
/* ---------- events ---------- */
document.addEventListener("paste",e=>{const ta=e.target;if(!ta||ta.tagName!=="TEXTAREA"||!ta.closest||!ta.closest(".nedit"))return;const xp=ta.closest(".exp");const f=[...(e.clipboardData&&e.clipboardData.items||[])].find(i=>i.type&&i.type.startsWith("image/"));if(!f||!xp)return;e.preventDefault();const file=f.getAsFile();(async()=>{const m=await addImage(file,xp.dataset.xid,{src:"Pasted"});if(m){ta.setRangeText("[img:"+m.id+"]\n",ta.selectionStart,ta.selectionEnd,"end");ta.dispatchEvent(new Event("change",{bubbles:true}))}})()});
document.addEventListener("toggle",e=>{const d=e.target;if(d&&d.classList&&d.classList.contains("xmeet")&&d.dataset.mid){S.mtgOpen=S.mtgOpen||{};S.mtgOpen[d.dataset.mid]=d.open}},true);
const PICKSEL="[data-act=pick],[data-act=relopt],[data-act=ppadd],[data-act=picknew]";
function pickRows(m){return m?[...m.querySelectorAll(PICKSEL)]:[]}
function hlRow(m,i){const rows=pickRows(m);rows.forEach(r=>r.classList.remove("hl"));if(!rows.length)return;i=Math.max(0,Math.min(rows.length-1,i));rows[i].classList.add("hl");try{rows[i].scrollIntoView({block:"nearest"})}catch(e){}}
new MutationObserver(ms=>{for(const mu of ms){for(const n of mu.addedNodes){const m=n.nodeType===1&&(n.matches&&n.matches(".pickmenu")?n:n.querySelector&&n.querySelector(".pickmenu"));if(m)hlRow(m,0)}const t=mu.target;if(t&&t.classList&&t.classList.contains("pickmenu")&&!t.querySelector(".hl"))hlRow(t,0)}}).observe(document.body,{childList:true,subtree:true});
document.addEventListener("keydown",e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.pick)return;
  const m=t.parentNode.querySelector(".pickmenu"),rows=pickRows(m);
  if(e.key==="Escape"){closePick();return}
  if((e.key==="ArrowDown"||e.key==="ArrowUp")&&rows.length){e.preventDefault();e.stopImmediatePropagation();const cur=rows.findIndex(r=>r.classList.contains("hl"));hlRow(m,e.key==="ArrowDown"?(cur+1)%rows.length:(cur<=0?rows.length-1:cur-1));return}
  const want=e.key==="Enter"||(e.key==="Tab"&&!e.shiftKey&&t.value.trim());
  if(want&&rows.length){e.preventDefault();e.stopImmediatePropagation();
    const row=rows.find(r=>r.classList.contains("hl"))||rows[0];
    const cont=t.closest("[data-pid],.exp,.imc,#pe_ppl,#pe_cl");let sel=null;
    if(cont){sel=cont.dataset.pid?`[data-pid="${cont.dataset.pid}"]`:cont.classList.contains("exp")&&cont.dataset.xid?`.exp[data-xid="${cont.dataset.xid}"]`:cont.classList.contains("imc")&&cont.dataset.iid?`.imc[data-iid="${cont.dataset.iid}"]`:"#"+cont.id}
    const ent=t.dataset.ent,kind=t.dataset.kind;
    row.click();
    if(sel&&e.key==="Tab"||sel&&e.key==="Enter"){let n=0;const tryFocus=()=>{const q=document.querySelector(`${sel} input[data-pick][data-ent="${ent}"]${kind?`[data-kind="${kind}"]`:""}`);if(q&&q!==t||(q&&!document.contains(t))){q.focus();return}if(++n<8)setTimeout(tryFocus,80)};setTimeout(tryFocus,60)}
  }},true);
document.addEventListener("focusin",e=>{if(e.target.dataset&&e.target.dataset.pick)pickMenu(e.target)});
document.addEventListener("mousedown",e=>{if(!e.target.closest(".pw"))closePick()});
document.addEventListener("input",e=>{if(e.target.dataset&&e.target.dataset.pick)pickMenu(e.target);
  const t=e.target;
  if(t.id==="sq"){clearTimeout(S.qt);S.qt=setTimeout(()=>{S.q=t.value.trim();if(S.q){if(S.view!=="search")S.prev=location.hash;if(location.hash!=="#search")location.hash="#search";else paintContent()}else{if(S.view==="search")location.hash=S.prev||"#dash"}},300)}
  if(t.dataset.act==="pq"){S.pf=S.pf||{};S.pf.q=t.value;clearTimeout(S.pqt);S.pqt=setTimeout(()=>{const pos=t.selectionStart;paintContent();const n=document.querySelector("[data-act=pq]");if(n){n.focus();n.setSelectionRange(pos,pos)}},200);return}
  if(t.dataset.act==="evq"){S.ev=S.ev||{};S.ev.q=t.value;paintContent();const n=document.querySelector('[data-act="evq"]');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length)}return}
  if(t.dataset.act==="fq"){const key=t.closest("[data-vk]").dataset.vk;S.fq[key]=t.value;refreshBody(key)}
});
function refreshBody(key){
  const el=document.getElementById("res-"+key);if(!el)return paintContent();
  const mode=S.modes[key]||"list",group=S.groups[key]!=null?S.groups[key]:"";
  el.innerHTML=itemsBody(applyFilters(S.base[key]||[],key),mode,group,key);
}
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("qa")){const v=e.target.value,k=e.target.dataset.kind;e.target.value="";if(k){S.addIn=null;e.target.blur()}addQuick(v,undefined,e.target.dataset.sphere||undefined,k||undefined)}
  const ti=e.target;
  if(e.key==="Enter"&&ti.classList&&ti.classList.contains("add")){e.preventDefault();addToItem(ti)}
  if(e.key==="Enter"&&ti.tagName==="TEXTAREA"&&ti.closest&&ti.closest(".nedit")&&!e.shiftKey&&!e.isComposing){const v=ti.value,p=ti.selectionStart,ls=v.lastIndexOf("\n",p-1)+1,line=v.slice(ls,p),m=line.match(/^(\s*)([•\-*]) /),nm=line.match(/^(\s*)(\d+)([.)]) /);if(m){e.preventDefault();if(line.trim()===m[2]){ti.setRangeText("",ls,p,"end")}else{ti.setRangeText("\n"+m[1]+m[2]+" ",p,p,"end")}growTa(ti)}else if(nm){e.preventDefault();if(line.trim()===nm[2]+nm[3]){ti.setRangeText("",ls,p,"end")}else{ti.setRangeText("\n"+nm[1]+(+nm[2]+1)+nm[3]+" ",p,p,"end")}growTa(ti)}}
  if(e.key==="Escape")closeModal();
});
document.addEventListener("input",e=>{if(e.target.tagName==="TEXTAREA"&&e.target.closest&&e.target.closest(".nedit"))growTa(e.target)});
document.addEventListener("change",e=>{
  const t=e.target,a=t.dataset.act;
  if(t.id==="jsonf"&&t.files[0]&&/\.zip$/i.test(t.files[0].name)&&window.tabulaImportZip){const f=t.files[0];t.value="";window.tabulaImportZip(f);return}
  if(t.id==="jsonf"&&t.files[0]){t.files[0].text().then(tx=>{try{importBundle(JSON.parse(tx),"Imported")}catch(x){toast("Not valid JSON")}});return}
  const xp=t.closest&&t.closest(".exp");
  if(t.classList&&t.classList.contains("add")&&t.dataset.ent!=="link"&&t.value.trim().length>2){addToItem(t);return}
  if(xp&&t.dataset.f){const it=S.items.find(i=>i.id===xp.dataset.xid);if(it){const f=t.dataset.f,v=t.value;
    if(f==="due"&&it.kind==="task"&&v&&isOpen(it)&&v!==tday(it)){reschedule(it,v);saveItem(it);return}
    if(f==="date"&&!v)return;if(f==="end"&&!v){delete it.end;saveItem(it);return}
    if(f==="time"){it.time=normRange(v)||null;saveItem(it);return}
    if(f==="loggedAt"){it.loggedAt=v?v+":00":null;if(v)it.logged=v.slice(0,10);saveItem(it);return}
    if(f==="summary")it.summaryAuto=false;
    it[f]=(f==="due"||f==="recur"||f==="end")?(v||null):f==="text"?(v.trim()||it.text):v;Promise.resolve(saveItem(it)).then(()=>{if(f==="detail"||f==="text")return autoTag(it)})}return}
  if(t.dataset.act==="filtq"){const key=t.closest("[data-vk]").dataset.vk,v=t.value.trim();const opts=[...new Set(S.base[key].flatMap(i=>fieldVals(i,t.dataset.f)))];const hit=!v?"":(opts.find(o=>o.toLowerCase()===v.toLowerCase())||opts.find(o=>o.toLowerCase().includes(v.toLowerCase()))||"");(S.filt[key]=S.filt[key]||{})[t.dataset.f]=hit;paintContent();return}
  if(t.dataset.act==="imf"){S.imf=S.imf||{};S.imf[t.dataset.k]=t.value;paintContent();return}
  if(t.dataset.act==="imgfile"){const files=[...t.files],pid=t.dataset.id,isP=!!t.dataset.person;t.value="";(async()=>{for(const f of files){const m=await addImage(f,pid,isP?{people:[pid]}:{people:[]});if(m&&isP){const p=S.people.find(x=>x.id===pid);if(p&&!p.photoImg){p.photoImg=m.id;upsertLocal("people",p);await save("people",p)}}}paintContent()})();return}
  if(t.dataset.act==="edimgfile"){const f=t.files[0],box=t.closest(".nedit"),ta=box.querySelector("textarea"),xp=t.closest(".exp");t.value="";if(f&&xp){(async()=>{const m=await addImage(f,xp.dataset.xid,{});if(m){ta.setRangeText("[img:"+m.id+"]\n",ta.selectionStart,ta.selectionEnd,"end");ta.dispatchEvent(new Event("change",{bubbles:true}))}})()}return}
  if(t.dataset.imgf){const c=t.closest(".imc"),m=c&&S.imgs.find(x=>x.id===c.dataset.iid);if(m){m[t.dataset.imgf]=t.value;upsertLocal("imgs",m);save("imgs",m)}return}
  if(t.dataset.act==="tint"){setTint(t.dataset.k,t.value);return}
  if(t.dataset.act==="trfile"){const f=t.files[0],m=S.items.find(i=>i.id===t.dataset.id);if(f&&m){f.text().then(async x=>{m.transcript=cleanTr(x);if(!m.tname)m.tname=f.name;m.trSig=null;S.showTr[m.id]=false;await saveItem(m);toast("Transcript saved.");extractActions(m,{force:1})})}return}
  if(t.dataset.act==="evfsel"){setEvf(t.dataset.k,t.value);return}
  if(t.dataset.act==="evsel"||t.dataset.act==="evin"){S.ev=S.ev||{};S.ev[t.dataset.k]=t.value.trim();paintContent();return}
  if(t.dataset.act==="dgroup"){S.dgroup=t.value;paintContent();return}
  if(t.dataset.act==="dsort"){S.sorts.daily={f:t.value,d:(S.sorts.daily||{d:1}).d};paintContent();return}
  if(t.dataset.act==="pgroup"){S.pf=S.pf||{};S.pf.group=t.value;paintContent();return}
  if(t.dataset.act==="pfsel"){S.pf=S.pf||{};S.pf[t.dataset.k]=t.value;paintContent();return}
  if(t.dataset.act==="cf"){S.cf=S.cf||{};S.cf[t.dataset.k]=t.value;paintContent();return}
  if(t.dataset.act==="psort"){S.pf=S.pf||{};S.pf.sort=t.value;paintContent();return}
  if(!a)return;
  const vk=t.closest("[data-vk]"),key=vk&&vk.dataset.vk;
  if(a==='pfield'){const pid=t.closest('[data-pid]').dataset.pid,p=S.props.find(x=>x.id===pid);if(p&&p.item){const f=t.dataset.f;p.item[f]=t.value;p.edited=true;if(f==='date')p.date=t.value||p.date;if(f==='kind'&&t.value==='task'&&!p.item.status)p.item.status='open';save('props',p);paintContent()}return}
  if(a==="isel"){const pid=t.closest("[data-pid]").dataset.pid;(S.inboxSel=S.inboxSel||{})[pid]=t.checked;paintContent();return}
  if(a==="iall"){S.inboxSel={};if(t.checked)inboxNew().forEach(p=>S.inboxSel[p.id]=true);paintContent();return}
  if(a==="pickday")location.hash="#day:"+t.value;
  if(a==="group"){S.groups[key]=t.value;paintContent()}
  if(a==="filt"){(S.filt[key]=S.filt[key]||{})[t.dataset.f]=t.value;paintContent()}
  if(a==="sortf"){S.sorts[key]={f:t.value,d:(S.sorts[key]||{d:1}).d};paintContent()}
  if(a==="trail"){S.trail=t.checked;paintContent()}
});
document.addEventListener("focusin",e=>{if(e.target.classList&&e.target.classList.contains("qa"))qaTarget=e.target});
document.addEventListener("click",async e=>{
  const go=e.target.closest("[data-go]");
  const acn=e.target.closest("[data-act]");
  if(go&&(!acn||acn.contains(go))&&!e.target.closest("a[href]")){e.preventDefault();e.stopPropagation();const v=go.dataset.go;location.hash="#"+v;return}
  const pvEl=e.target.closest(".mdp");if(pvEl&&!e.target.closest("a,[data-act],[data-go]")){const w0=pvEl.closest(".mdwrap"),b0=w0&&w0.querySelector("[data-act=mdtog]");if(b0){b0.click();return}}
  const el=e.target.closest("[data-act]");if(!el||el.tagName==="INPUT"||el.tagName==="SELECT")return;
  const act=el.dataset.act,row=el.closest("[data-id]"),id=(row&&row.dataset.id)||el.dataset.id;
  const vk=el.closest("[data-vk]"),key=vk&&vk.dataset.vk;
  const it=id&&S.items.find(i=>i.id===id);
  switch(act){
    case"mdtog":mdToggle(el);break;
    case"capture":e.preventDefault();openNew(undefined,S.view==="daily"?S.date:today());break;
    case"day":{const n=+el.dataset.n;location.hash="#day:"+(n===0?today():addDays(S.date,n));break}
    case"range":S.range=el.dataset.v;paintContent();break;
    case"tab":S.tabs[key]=el.dataset.v;paintContent();break;
    case"mode":S.modes[key]=el.dataset.v;paintContent();break;
    case"sortdir":{const s=S.sorts[key]||{f:"date",d:1};S.sorts[key]={f:s.f,d:-s.d};paintContent();break}
    case"cycle":if(it&&it.kind==="task"){if(it.status==="done")await reopenTask(it);else await completeTask(it)}break;
    case"undone":if(it)await reopenTask(it);break;
    case"star":if(it){it.star=!it.star;await saveItem(it);if(it.star){const n=V().filter(i=>isOpen(i)&&i.star&&i.date===it.date).length;if(n>CAP)toast(n+" priorities on "+it.date+" (cap "+CAP+")")}}break;
    case"edit":if(it)openItem(it.id);break;
    case"qmig":if(it){const prev={date:it.date,history:[...(it.history||[])],due:it.due,status:it.status,migs:[...(it.migs||[])],ord:it.ord,logged:it.logged},to=tday(it)<today()?today():addDays(tday(it),1);await migrate(it,to,true);toastUndo("Migrated to "+shortDate(to),async()=>{Object.assign(it,prev);await saveItem(it)})}break;
    case"layout":S.layout=el.dataset.v;paintContent();break;
    case"evset":S.ev=S.ev||{};S.ev[el.dataset.k]=el.dataset.v;paintContent();break;
    case"evdir":S.ev=S.ev||{};S.ev.dir=-(S.ev.dir||1);paintContent();break;
    case"donebot":S.doneBottom=!S.doneBottom;paintContent();break;
    case"prio":S.prioOpen=!S.prioOpen;paintContent();break;
    case"pw":S.pw=el.dataset.v;try{localStorage.setItem("bj-pw",S.pw)}catch(x){}paintTop();break;
    case"signout":if(window.tabulaSignOut)window.tabulaSignOut();break;
    case"account":if(window.tabulaAccount)window.tabulaAccount.open();break;
    case"mdmode":S.mdMode=S.mdMode==="markdown"?"formatted":"markdown";try{localStorage.setItem("tabula_mdmode",S.mdMode)}catch(e){}S.mdPrev={};S.sumEdit={};paintContent();paintTop();toast(S.mdMode==="markdown"?"Raw Markdown everywhere: fields open as Markdown and titles show their symbols.":"Formatted view: filled fields and titles show formatted. Click any text to edit it.",5000);break;
    case"detmode":S.detailMode=S.detailMode==="none"?"auto":"none";paintContent();paintTop();break;
    case"mday":S.mopen[el.dataset.d]=!S.mopen[el.dataset.d];paintContent();break;
    case"mall":S.mallOpen=!S.mallOpen;S.mopen={};paintContent();break;
    case"mainTog":if(it)mainAct(it,it.main?"off":"on");break;
    case"mainOk":if(it)mainAct(it,"ok");break;
    case"mainNo":if(it)mainAct(it,"no");break;
    case"mguess":guessMains(el.dataset.ym);break;
    case"mconfall":confirmGuesses(el.dataset.ym);break;
    case"mclr":clearGuesses(el.dataset.ym);break;
    case"mshort":if(it){const v=await askText("Short title for the monthly log",shortOf(it));if(v!==null){it.shortTitle=v.trim();await saveItem(it)}}break;
    case"shortregen":if(it){it.shortTitle=autoShort(it);await saveItem(it)}break;
    case"triage":openTriage(el.dataset.k);break;
    case"dupes":{S.busy="Finding duplicates…";render();const n=await proposeMerges();S.busy="";toast(n?n+" merge proposals ready":"No new duplicates");render();if(n)location.hash="#review";break}
    case"dsortdir":{const s0=S.sorts.daily||{f:"star",d:1};S.sorts.daily={f:s0.f,d:-s0.d};paintContent();break}
    case"pdismiss":{const pid=el.closest("[data-pid]").dataset.pid;S.props=S.props.filter(x=>x.id!==pid);await del("props",pid);render();break}
    case"dismissall":{const ps=S.props.filter(p=>p.status==="pending");for(const p of ps)await del("props",p.id);S.props=S.props.filter(p=>p.status!=="pending");toast("Dismissed "+ps.length);render();break}
    case"pmerge":mergePeople(el.dataset.from,el.dataset.to);break;
    case"mergeinto":openMergeInto(S.arg);break;
    case"newnote":if(it){const n=await newNoteFor(it);openFull(n.id);setTimeout(()=>{const ta=document.querySelector('.doc .nedit textarea');if(ta)ta.focus()},300)}break;
    case"ed":{const box=el.closest(".nedit"),ta=box.querySelector("textarea");edCmd(ta,el.dataset.v);break}
    case"popout":if(id)popOut(id);break;
    case"poph":{const h=location.hash||"#day:"+today();if(!S.ptabs.some(t=>t.h===h))S.ptabs.push({h});saveTabs();toast("Opened in its own tab",2000);render();break}
    case"gotab":location.hash=el.dataset.h;break;
    case"closetab":{e.stopPropagation();const n=+el.dataset.n,t=S.ptabs[n];S.ptabs.splice(n,1);saveTabs();if(t&&t.h===location.hash)location.hash=S.mainHash||"#day:"+today();else paintContent();break}
    case"restore":restoreOne(el.dataset.c,el.dataset.id);break;
    case"purgeone":purgeOne(el.dataset.c,el.dataset.id);break;
    case"pick":{const pw=el.closest(".pw"),inp=pw.querySelector("input"),imc=inp.closest(".imc");closePick();
      if(imc){const m=S.imgs.find(x=>x.id===imc.dataset.iid);if(m){if(el.dataset.t==="person")m.people=[...new Set([...m.people,el.dataset.eid])];else m.links=[...new Set([...(m.links||[]),el.dataset.eid])];upsertLocal("imgs",m);await save("imgs",m);paintContent()}break}
      const itm=S.items.find(i=>i.id===inp.closest(".exp").dataset.xid);if(itm){const t=el.dataset.t,f=t==="person"?"people":t==="event"?"events":t==="coll"?"colls":"related";itm[f]=[...new Set([...(itm[f]||[]),el.dataset.eid])];inp.value="";await saveItem(itm);paintContent()}break}
    case"picknew":{const inp=el.closest(".pw").querySelector("input");createFromPick(inp,el.dataset.t);break}
    case"reltab":{S.relTab=el.dataset.v;const inp=el.closest(".pw").querySelector("input");pickMenu(inp);inp.focus();break}
    case"relopt":{const inp=el.closest(".pw").querySelector("input"),box=inp.closest(".mchips");relSet(box,[...new Set([...relVals(box.id),el.dataset.v])]);inp.value="";closePick();break}
    case"relrm":{const box=el.closest(".mchips");relSet(box,relVals(box.id).filter(v=>v!==el.dataset.v));break}
    case"imgpick":{const inp=el.parentNode.querySelector('input[type=file][data-act="imgfile"]');if(inp)inp.click();break}
    case"edimg":{const inp=el.closest(".nedit").querySelector('input[data-act="edimgfile"]');if(inp)inp.click();break}
    case"imgtag":{const m=S.imgs.find(x=>x.id===el.dataset.iid);if(m){m.people=[...new Set([...m.people,el.dataset.eid])];upsertLocal("imgs",m);await save("imgs",m);paintContent()}break}
    case"imgunperson":{e.stopPropagation();const m=S.imgs.find(x=>x.id===el.dataset.iid);if(m){m.people=m.people.filter(p=>p!==el.dataset.eid);upsertLocal("imgs",m);await save("imgs",m);paintContent()}break}
    case"imgview":location.hash="#img:"+el.dataset.iid;break;
    case"imglinkrm":{e.stopPropagation();const m=S.imgs.find(x=>x.id===el.dataset.iid);if(m){m.links=(m.links||[]).filter(x=>x!==el.dataset.eid);if(m.parent===el.dataset.eid)m.parent="";upsertLocal("imgs",m);await save("imgs",m);paintContent()}break}
    case"imgredesc":{const m=S.imgs.find(x=>x.id===el.dataset.iid);if(m){toast("Describing…");try{const b=await (await fetch(imgSrc(m))).blob();m.desc="";await describeImage(m,b)}catch(x){}paintContent()}break}
    case"imgdl":{const m=S.imgs.find(x=>x.id===el.dataset.iid);if(m)imgDownload(m);break}
    case"cropphoto":cropModal(el.dataset.id);break;
    case"imgprofile":{const m=S.imgs.find(x=>x.id===el.dataset.iid),p=S.people.find(x=>x.id===el.dataset.eid);if(m&&p){p.photoImg=m.id;if(!m.people.includes(p.id)){m.people.push(p.id);upsertLocal("imgs",m);await save("imgs",m)}upsertLocal("people",p);await save("people",p);toast(p.name+": profile photo set");paintContent()}break}
    case"imgrm":{const m=S.imgs.find(x=>x.id===el.dataset.iid);if(m&&await ask("Remove this image? It will be deleted for good.","Remove")){S.imgs=S.imgs.filter(x=>x.id!==m.id);S.people.filter(p=>p.photoImg===m.id).forEach(p=>{delete p.photoImg;save("people",p)});await del("imgs",m.id);try{S.assets&&S.assets.delete&&S.assets.delete(m.aid)}catch(x){}paintContent()}break}
    case"reveal":{const rid=el.dataset.id||id;if(rid){S.reveal[rid]=true;S.expanded[rid]=true;paintContent()}break}
    case"unreveal":{const m=S.items.find(i=>i.id===el.dataset.id);if(m){delete S.reveal[m.id];delete S.expanded[m.id];paintContent()}break}
    case"trtoggle":if(it){S.showTr[id]=!S.showTr[id];paintContent()}break;
    case"trclear":if(it&&await ask("Remove the transcript from this meeting?","Remove")){delete it.transcript;delete it.trSig;delete it.trCount;await saveItem(it)}break;
    case"trpaste":S.trPaste=el.dataset.id;paintContent();break;
    case"trsave":{const ta=document.getElementById("trta"),m=S.items.find(i=>i.id===el.dataset.id);if(m&&ta&&ta.value.trim()){m.transcript=cleanTr(ta.value);m.trSig=null;S.trPaste=null;await saveItem(m);extractActions(m,{force:1})}break}
    case"trextract":if(it)extractActions(it,{force:1,reuse:1});break;
    case"trsum":if(it)summarizeMeeting(it,it.sumFmt||"para");break;
    case"summenu":S.sumMenu=S.sumMenu===id?null:id;paintContent();break;
    case"sumgen":S.sumMenu=null;if(it)summarizeMeeting(it,el.dataset.fmt);break;
    case"trevernote":if(it)openEvFind(it.id);break;
    case"evmuse":{const ev=S.items.find(i=>i.id===S.evmFor);if(!ev)break;const nid=el.dataset.nid,tt=el.dataset.t;closeModal();toast("Reading note…",8000);
      try{const x=await evNoteText(nid);if(!x||x.length<20){toast("That note looks empty");break}
        ev.transcript=cleanTr(x);ev.tlink="evernote://view-note/"+nid;ev.tname="Evernote: "+tt;ev.trSig=null;await saveItem(ev);await extractActions(ev,{force:1})}catch(e){toast("Evernote read failed: "+(e.code||e.message))}break}
    case"sens":{const m=S.items.find(i=>i.id===el.dataset.id);if(m){m.sensitive=!m.sensitive;m.sensSet=true;if(!m.sensitive)delete m.sensWhy;else if(!m.sensWhy){const w=sensWhy(m);if(w)m.sensWhy=w}await saveItem(m);toast(m.sensitive?"Marked sensitive. Hidden in lists until opened.":"No longer sensitive")}break}
    case"lognow":{const m=S.items.find(i=>i.id===el.dataset.id);if(m){m.loggedAt=localIso();m.logged=m.loggedAt.slice(0,10);await saveItem(m)}break}
    case"sphadd":S.addIn=(S.addIn==="sph|"+el.dataset.s+"|"+el.dataset.k)?null:"sph|"+el.dataset.s+"|"+el.dataset.k;paintContent();break;
    case"cusave":{const p=S.people.find(x=>x.id===el.dataset.id);if(p){const v=i=>document.getElementById(i).value.trim();const nm=v("cu_name");if(nm)p.name=nm;p.nick=v("cu_nick");p.rels=relVals("cu_rel");p.rel=p.rels.join(", ");p.ptype=ptVals("cu_type");p.ptypeAuto=false;p.reviewed=true;p.context=v("cu_ctx");p.company=v("cu_co");{const oid=await ensureOrg(p.company);p.org=oid||null;if(oid)p.company=S.orgs.find(z=>z.id===oid).name}p.role=v("cu_role");p.email=v("cu_email");nicksOf(p).forEach(nk=>{if(nk!==p.name.split(/\s+/)[0])p.akas=[...new Set([...(p.akas||[]),nk])]});upsertLocal("people",p);await save("people",p);toast("Confirmed "+p.name);(S.cuStack=S.cuStack||[]).push(p.id);S.cuCur=null;paintContent()}break}
    case"whyco":whyCo(el.dataset.a,el.dataset.b);break;
    case"whyit":whyIt(el.dataset.id,el.dataset.a);break;
    case"whyun":{const i=S.items.find(x=>x.id===el.dataset.id);if(i){i.people=(i.people||[]).filter(x=>x!==el.dataset.p);await saveItem(i);toast("Removed "+fname(el.dataset.p)+" from that entry");const a=el.dataset.a,b=el.dataset.b;if(b)whyCo(a,b);else whyIt(i.id,a);paintContent()}break}
    case"whygo":{closeModal();location.hash="#day:"+el.dataset.id;break}
    case"mclose":closeModal();break;
    case"cuuse":{const t=document.getElementById("cu_ctx");if(t)t.value=el.dataset.v;break}
    case"orgrename":{const o=S.orgs.find(x=>x.id===el.dataset.id);if(o){const nn=await askText("Rename organization",o.name);if(nn&&nn.trim()){o.name=nn.trim();upsertLocal("orgs",o);await save("orgs",o);for(const p of S.people.filter(p=>p.org===o.id)){p.company=o.name;upsertLocal("people",p);await save("people",p)}render()}}break}
    case"cuskip":S.cuSkip=[...(S.cuSkip||[]),el.dataset.id];(S.cuStack=S.cuStack||[]).push(el.dataset.id);S.cuCur=null;paintContent();break;
    case"cuback":{const b=(S.cuStack||[]).pop();if(b){S.cuSkip=(S.cuSkip||[]).filter(x=>x!==b);S.cuCur=b}paintContent();break}
    case"curesetskip":S.cuSkip=[];S.cuTotal=0;paintContent();break;
    case"mergeinto2":openMergeInto(el.dataset.id);break;
    case"cuarch":{const p=S.people.find(x=>x.id===el.dataset.id);if(p&&await ask("Archive "+p.name+"? "+ARCH_MSG,"🗄 Archive"))await archiveEnt("people",p);break}
    case"collapse":if(S.sel===id)closeInsp();else{S.expanded[id]=false;paintContent()}break;
    case"moretxt":S.moreOpen[id]=!S.moreOpen[id];paintContent();break;
    case"delitem":if(it)await archiveItem(it);break;
    case"setf":if(it){const f=el.dataset.f,v=el.dataset.v;if(f==="star")it.star=v==="1";else if(f==="kind")it.kind=v;else if(f==="list"){setList(it,v)}else if(f==="status"){it.status=v;it.doneAt=v==="done"?localIso():null}else if(f==="sub")it.sub=v||"event";else if(f==="etype"){it.etype=v;it.etypeAuto=false;delete it.etypeAI}else if(f==="main"){it.main=v==="1";it.mainGuess=false;if(it.main)delete it.mainNo}else if(f==="whose"){setWhose(it,v)}await saveItem(it)}break;
    case"togwhose":if(it){setWhose(it,whoseOf(it)==="other"?"mine":"other");await saveItem(it)}break;
    case"evfset":setEvf(el.dataset.k,el.dataset.v);break;
    case"duebtn":if(it){const v=el.dataset.v,t=today();it.due=v==="today"?t:v==="tomorrow"?addDays(t,1):v==="nextmon"?nextMon():v==="week"?addDays(weekStart(t),6):v==="next"?addDays(weekStart(t),13):v==="month"?ymd(new Date(pd(t).getFullYear(),pd(t).getMonth()+1,0)):null;await saveItem(it)}break;
    case"rment":if(it){const e=el.dataset.ent,x=el.dataset.eid;if(e==="link")it.links=(it.links||[]).filter((_,n)=>n!==+x);else{const f=e==="person"?"people":e==="event"?"events":e==="rel"?"related":"colls";it[f]=(it[f]||[]).filter(y=>y!==x)}await saveItem(it)}break;
    case"ptfilt":S.pf=S.pf||{};S.pf.ptype=el.dataset.v;paintContent();break;
    case"ptog":el.classList.toggle("on");break;
    case"pdir":S.pf=S.pf||{};S.pf.dir=S.pf.dir<0?1:-1;paintContent();break;
    case"imdir":S.imf=S.imf||{};S.imf.rev=!S.imf.rev;paintContent();break;
    case"cfdir":S.cf=S.cf||{};S.cf.rev=!S.cf.rev;paintContent();break;
    case"setthumb":{const it2=S.items.find(i=>i.id===el.dataset.id);if(it2){it2.thumb=el.dataset.iid;await saveItem(it2);paintContent()}break}
    case"mq":{e.stopPropagation();const d=el.dataset.d,k=el.dataset.k;const t=await askText("New "+k+" on "+shortDate(d)+":","");if(t)await addQuick(t,d,undefined,k);break}
    case"evai":aiTypes();break;
    case"pmode":S.pf=S.pf||{};S.pf.mode=el.dataset.v;paintContent();break;
    case"mig":if(it)openMigrate(it);break;
    case"drop":if(it){it.status="dropped";it.droppedOn=today();await saveItem(it)}break;
    case"stale":S.filt["list-tasks"]={carried:"3+ times"};S.tabs["list-tasks"]="Open";location.hash="#list:tasks";break;
    case"setup":setupDay(el.dataset.d||S.date);break;
    case"backfill":openBackfill(S.date);break;
    case"newent":e.stopPropagation();if(el.dataset.k==="event")openNew("event");else openEntity(el.dataset.k);break;
    case"editent":openEntity(S.view,S.arg);break;
    case"sweep":sweepCollection(S.arg);break;
    case"itab":S.inboxTab=el.dataset.v;S.inboxSel={};S.snzFor=null;paintContent();break;
    case"psnz":{const pid=el.closest("[data-pid]").dataset.pid;S.snzFor=S.snzFor===pid?null:pid;paintContent();break}
    case"ppadd":{const inp=el.closest(".pw").querySelector("input"),box=el.closest("#pe_ppl,#pe_cl"),k=el.dataset.k==="colls"?"colls":"people";closePick();const n=el.dataset.n;
      if(box){const key=k==="colls"?"peColls":"peNames";S[key]=[...new Set([...(S[key]||[]),n])];box.querySelector(".ppc").innerHTML=ppChips(S[key],true,k);inp.value="";inp.focus();break}
      const c=el.closest("[data-pid]")||inp.closest("[data-pid]"),pr=c&&S.props.find(x=>x.id===c.dataset.pid),f=k==="colls"?"tagColls":"tagPeople";if(pr){pr[f]=[...new Set([...(pr[f]||[]),n])];await save("props",pr);paintContent()}break}
    case"ppdel":{const box=el.closest("#pe_ppl,#pe_cl"),i=+el.dataset.i,k=el.dataset.k==="colls"?"colls":"people";
      if(box){const key=k==="colls"?"peColls":"peNames";S[key]=(S[key]||[]).filter((_,j)=>j!==i);box.querySelector(".ppc").innerHTML=ppChips(S[key],true,k);break}
      const pr=S.props.find(x=>x.id===el.closest("[data-pid]").dataset.pid),f=k==="colls"?"tagColls":"tagPeople";if(pr){pr[f]=(pr[f]||[]).filter((_,j)=>j!==i);await save("props",pr);paintContent()}break}
    case"psnzgo":{const pid=el.closest("[data-pid]").dataset.pid,p=S.props.find(x=>x.id===pid);if(p){const v=el.dataset.v,to=v==="tom"?addDays(today(),1):v==="mon"?nextMon():addDays(today(),7);p.status="snoozed";p.snoozeUntil=to;await save("props",p);S.snzFor=null;toast("Snoozed until "+shortDate(to));render()}break}
    case"prest":{const pid=el.closest("[data-pid]").dataset.pid,p=S.props.find(x=>x.id===pid);if(p){p.status="pending";delete p.snoozeUntil;await save("props",p);render()}break}
    case"isweep":runSweep();break;
    case'wr':if(it){const v=el.dataset.v;if(v==='today'){await migrate(it,today(),true);render()}else{if(v==='wait')setList(it,'waiting');else if(v==='some')setList(it,'someday');else if(v==='next')setList(it,'next');else if(v==='drop'){it.status='dropped';it.droppedOn=today()}else if(v==='done'){it.status='done';it.doneAt=localIso()}else if(v==='chase'){it.due=addDays(today(),7);it.chased=(it.chased||0)+1}await saveItem(it)}}break;
    case'attt':S.attOpen=!S.attOpen;paintContent();break;
    case'wrdone':{S.lastWeekly={at:Date.now()};try{await S.db.doc('meta/weekly').set(S.lastWeekly)}catch(x){}toast('Weekly review done');render();break}
    case'wrahead':S.range='next';location.hash='#day:'+today();break;
    case"ibulk":inboxBulk(el.dataset.v);break;
    case"pacc":acceptProp(el.closest("[data-pid]").dataset.pid);break;
    case"prej":rejectProp(el.closest("[data-pid]").dataset.pid);break;
    case"pedit":editProp(el.closest("[data-pid]").dataset.pid);break;
    case"acceptall":acceptAll();break;
    case"rejectall":for(const p of S.props.filter(p=>p.status==="pending"))await rejectProp(p.id,1);toast("Rejected");render();break;
    case"exportmd":exportMd();break;case"exportzip":exportZip(true);break;case"exportzipt":exportZip(false);break;case"exportjson":exportJson();break;case"snap":snapshot();break;
    case"evsearch":evSearch();break;case"evpull":evPull(el.dataset.nid,el.dataset.t);break;
    case"qadd":{const i=el.closest(".quick").querySelector(".qa");const v=i.value,k=i.dataset.kind;i.value="";if(k)S.addIn=null;addQuick(v,undefined,undefined,k||undefined);break}
    case"addin":S.addIn=S.addIn===el.dataset.k?null:el.dataset.k;paintContent();break;
    case"newitem":newSpec().go();break;
    case"theme":{const A=window.tabulaAppearance;if(A)A.open();break}
    case"cal":{const v=el.dataset.v,td=today(),base=S.view==="daily"?S.date:S.view==="month"?(S.arg||monthOf(td))+"-01":S.view==="year"?(S.arg||td.slice(0,4))+"-01-01":td;
      if(v==="day"||v==="week"){S.range=v;if(S.view==="daily"){paintContent();paintTop()}else location.hash="#day:"+(base.slice(0,S.view==="month"?7:4)===td.slice(0,S.view==="month"?7:4)?td:base)}
      else if(v==="month")location.hash="#month:"+monthOf(base);else location.hash="#year:"+base.slice(0,4);break}
    case"sphere":{e.preventDefault();const k="list-tasks",cur=(S.filt[k]||{}).sphere,sp=el.dataset.sp;S.filt[k]={...(S.filt[k]||{}),sphere:cur===sp&&S.view==="list"&&S.arg==="tasks"?"":sp};S.tabs[k]=S.tabs[k]||"Open";if(location.hash==="#list:tasks")route();else location.hash="#list:tasks";break}
    case"imenu":{const m=el.parentNode.querySelector(".imenu");if(m){const was=m.classList.contains("open");document.querySelectorAll(".imenu.open").forEach(x=>x.classList.remove("open"));if(!was)m.classList.add("open")}break}
    case"inspclose":closeInsp();break;
    case"panelclose":closePanel();break;
    case"pp":togglePP();break;
    case"openfull":if(el.dataset.id)openFull(el.dataset.id);break;
    case"smenu":{const m=document.getElementById("smenu");if(m)m.classList.toggle("open");break}
    case"density":{const A=window.tabulaAppearance;if(A){const k=densKey(),v=el.dataset.v==="toggle"?(dens()==="compact"?"comfy":"compact"):el.dataset.v;A.setDensity(k,v)}paintTop();break}
    case"back":history.back();break;case"fwd":history.forward();break;
    case"burger":if(window.innerWidth<=860)document.getElementById("side").classList.toggle("open");else{document.body.classList.toggle("sbc");try{localStorage.setItem("bj-sbc",document.body.classList.contains("sbc")?"1":"")}catch(x){}}break;
    case"coll":S.collapsed[el.dataset.k]=!S.collapsed[el.dataset.k];paintSide();break;
    case"fields":openFields();break;case"more":openMore(key);break;
    case"saveview":openSaveView();break;
    case"delview":{e.preventDefault();e.stopPropagation();await del("views",id);S.views=S.views.filter(v=>v.id!==id);render();break}
  }
});
/* ---------- modal ---------- */
function openModal(html,wide){const b=document.getElementById("mbox");b.classList.remove("capbox");b.innerHTML=html;b.classList.toggle("wide",!!wide);document.getElementById("modal").classList.add("on")}
function closeModal(){if(!document.getElementById("modal").classList.contains("on")&&S.panel){closePanel();return}if(S.capUi&&S.capUi.rec&&S.dict){try{S.dict.stop()}catch(_){}}document.getElementById("modal").classList.remove("on");if(S.pvCancel){const f=S.pvCancel;S.pvCancel=null;f()}}
document.getElementById("modal").addEventListener("mousedown",e=>{if(e.target.id==="modal")closeModal()});
function sphereOpts(sel){return SPHERES.map(s=>`<option ${s===sel?"selected":""}>${esc(s)}</option>`).join("")}
function multiSel(arr,sel,id){return`<select multiple id="${id}" size="4" style="min-width:200px">${arr.map(x=>`<option value="${esc(x.id)}" ${(sel||[]).includes(x.id)?"selected":""}>${esc(x.name)}</option>`).join("")}</select>`}
const g=id=>document.getElementById(id);
function newSpec(){const v=S.view,a=S.arg;
  if(v==="list"&&a==="notes")return{label:"+ New note",go:()=>openNew("note")};
  if(v==="list")return{label:"+ New task",go:()=>openNew("task")};
  if(v==="events")return{label:"+ New event",go:()=>openNew("event")};
  if(v==="people")return{label:"+ New person",go:()=>openEntity("person")};
  if(v==="colls")return{label:"+ New collection",go:()=>openEntity("coll")};
  if(v==="images")return{label:"+ Add images",go:()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.multiple=true;i.onchange=async()=>{for(const f of i.files)await addImage(f,"",{});paintContent()};i.click()}};
  if(v==="month"){const ym=a||monthOf(today());return{label:"+ New",go:()=>openNew(undefined,ym===monthOf(today())?today():ym+"-01")}}
  return{label:"+ New",go:()=>openNew()}}
function openFields(){
  openModal(`<h3 style="margin-top:0">Fields</h3><div class="f"><label>Links &amp; tags</label><label><input type="checkbox" id="fl_c" ${S.fields.chips?"checked":""}> show</label><label>Detail</label><label><input type="checkbox" id="fl_d" ${S.fields.detail?"checked":""}> show</label><label>Due pill</label><label><input type="checkbox" id="fl_u" ${S.fields.due?"checked":""}> show</label></div><button class="pri" id="fl_ok">Done</button>`);
  g("fl_ok").onclick=()=>{S.fields={chips:g("fl_c").checked,detail:g("fl_d").checked,due:g("fl_u").checked};closeModal();paintContent()};
}
function openMore(key){
  openModal(`<h3 style="margin-top:0">View options</h3><div class="row"><button id="mo_s">🔖 Save this view…</button><button id="mo_c">Clear filters and grouping</button></div>`);
  g("mo_c").onclick=()=>{S.filt[key]={};S.fq[key]="";S.groups[key]="";closeModal();paintContent()};
  g("mo_s").onclick=()=>openSaveView();
}
function openSaveView(){
  if(S.view!=="list"){closeModal();toast("Open a task list first, set filters, then save it");return}
  openModal(`<h3 style="margin-top:0">Save view</h3><input id="sv_n" placeholder="Name, e.g. Gordon priorities" style="width:100%"><p class="mute">Saves the filters, grouping, layout and sort of “${esc(pageTitle())}”.</p><div class="row"><button class="pri" id="sv_ok">Save</button><button id="sv_c">Cancel</button></div>`);
  g("sv_c").onclick=closeModal;g("sv_n").focus();
  g("sv_ok").onclick=async()=>{const name=g("sv_n").value.trim();if(!name)return;const key="list-"+S.arg;
    const v={id:uid("v"),name,list:S.arg,filt:{...(S.filt[key]||{})},fq:S.fq[key]||"",group:S.groups[key]||"",mode:S.modes[key]||"list",sort:S.sorts[key]||{f:"date",d:1}};
    closeModal();upsertLocal("views",v);await save("views",v);render();toast("View saved")};
}
function openEditor(it){
  openModal(`<h3 style="margin-top:0">Edit</h3><div class="f"><label>Title</label><textarea id="e_text" style="min-height:56px">${esc(it.text)}</textarea>
  <label>Detail</label>${mdField("e_detail",it.detail,90)}
  <label>Type</label><select id="e_kind">${["task","event","note"].map(k=>`<option ${it.kind===k?"selected":""}>${k}</option>`).join("")}</select>
  <label>Status</label><select id="e_status">${["open","done","dropped"].map(k=>`<option ${(it.status||"open")===k?"selected":""}>${k}</option>`).join("")}</select>
  <label>Sphere</label><select id="e_sphere">${sphereOpts(it.sphere||DEFAULT_SPHERE)}</select>
  <label>Day</label><input type="date" id="e_date" value="${esc(it.date||"")}">
  <label>Due</label><input type="date" id="e_due" value="${esc(it.due||"")}">
  <label>Reminder</label><input id="e_remind" placeholder="e.g. 2026-12-01 09:00" value="${esc(it.remind||"")}">
  <label>Repeats</label><select id="e_recur">${["","daily","weekly","monthly","yearly"].map(k=>`<option ${(it.recur||"")===k?"selected":""}>${k}</option>`).join("")}</select>
  <label>Priority</label><label><input type="checkbox" id="e_star" ${it.star?"checked":""}> ★ High</label>
  <label>People</label>${multiSel(S.people,it.people,"e_people")}
  <label>Events</label>${multiSel(S.events,it.events,"e_events")}
  <label>Collections</label>${multiSel(S.colls,it.colls,"e_colls")}
  <label>Source</label><input id="e_srcn" placeholder="source name" value="${esc((it.src||{}).name||"")}">
  <label>Location</label><input id="e_srcl" placeholder="page, place, timestamp" value="${esc((it.src||{}).loc||"")}">
  <label>Link</label><input id="e_srcu" placeholder="https:// or evernote://" value="${esc((it.src||{}).link||"")}"></div>
  ${carriedN(it)?`<p class="mute">Migrated from: ${esc(it.history.join(" → "))}</p>`:""}
  <div class="row"><button class="pri" id="e_save">Save</button><button id="e_cancel">Cancel</button><span class="sp"></span><button class="warn" id="e_del">🗄 Archive</button></div>`);
  const msel=id=>[...g(id).selectedOptions].map(o=>o.value);
  g("e_cancel").onclick=closeModal;
  g("e_save").onclick=async()=>{
    const nd=g("e_date").value||it.date;
    if(it.kind==="task"&&nd>it.date){it.history=[...new Set([...(it.history||[]),it.date])]}
    Object.assign(it,{text:g("e_text").value.trim()||it.text,detail:g("e_detail").value.trim(),kind:g("e_kind").value,status:g("e_status").value,sphere:g("e_sphere").value,date:nd,due:g("e_due").value||null,remind:g("e_remind").value||null,recur:g("e_recur").value||null,star:g("e_star").checked,people:msel("e_people"),events:msel("e_events"),colls:msel("e_colls"),src:{name:g("e_srcn").value,loc:g("e_srcl").value,link:g("e_srcu").value}});
    S.lastSphere=it.sphere;closeModal();await saveItem(it);
    if(it.status==="done"&&it.recur)await spawnRecurring(it);
  };
  g("e_del").onclick=async()=>{closeModal();await archiveItem(it)};
}
async function addToItem(inp){
  const xp=inp.closest(".exp"),it=S.items.find(i=>i.id===xp.dataset.xid),v=inp.value.trim();if(!it||!v)return;
  const ent=inp.dataset.ent;
  if(ent==="link"){inp.value="";const u=/^[a-z]+:\/\//i.test(v)?v:"https://"+v;it.links=[...(it.links||[]),{url:u,label:linkLabel(u)}];await saveItem(it);return}
  if(ent==="event"||ent==="rel"){
    const pool=ent==="event"?V().filter(i=>i.kind==="event"&&i.id!==it.id):V().filter(i=>i.id!==it.id),lab=ent==="event"?evLabel:itemLabel,q=v.toLowerCase();
    let hit=pool.find(i=>lab(i).toLowerCase()===q)||pool.find(i=>lab(i).toLowerCase().includes(q));
    inp.value="";
    if(!hit&&ent==="event"){const sp=smartParse(v,"event");hit={id:uid("i"),kind:"event",text:sp.text,date:sp.when.date||(it.kind==="event"?it.date:tday(it)||today()),sphere:it.sphere||DEFAULT_SPHERE,people:[...sp.people],events:[],related:[],colls:[],created:Date.now(),history:[],src:{name:"Added from a linked item"}};if(sp.when.time)hit.time=sp.when.time;await saveItem(hit)}
    if(!hit){toast("Pick an item from the list");return}
    const f=ent==="event"?"events":"related";it[f]=[...new Set([...(it[f]||[]),hit.id])];await saveItem(it);return}
  inp.value="";
  const c=ent==="person"?"people":"colls";
  let e=S[c].find(x=>x.name.toLowerCase()===v.toLowerCase())||S[c].find(x=>x.name.toLowerCase().includes(v.toLowerCase()));
  if(!e){e={id:slug(v)+"-"+Math.random().toString(36).slice(2,5),name:v,created:Date.now()};if(ent==="person"){e.area="Unsorted"}upsertLocal(c,e);await save(c,e)}
  it[c]=[...new Set([...(it[c]||[]),e.id])];await saveItem(it);
}
async function spawnRecurring(it){
  const step={daily:1,weekly:7}[it.recur];let nd;const base=it.due||it.date;
  if(step)nd=addDays(base,step);else{const d=pd(base);if(it.recur==="monthly")d.setMonth(d.getMonth()+1);else d.setFullYear(d.getFullYear()+1);nd=ymd(d)}
  const nx={...it,id:uid("i"),status:"open",date:nd,due:nd,created:Date.now(),doneAt:null,history:[]};await saveItem(nx);toast("Next occurrence on "+nd);return nx.id;
}
function openMigrate(it){
  openModal(`<h3 style="margin-top:0">Migrate task</h3><p>${esc(it.text)}</p><p class="mute">The task is rescheduled to the new day. It is not copied, so it only ever appears on its latest day.</p><div class="f"><label>To day</label><input type="date" id="m_d" value="${addDays(today(),1)}"></div>
  <div class="row"><button class="pri" id="m_go">Migrate</button><button id="m_c">Cancel</button></div>`);
  g("m_c").onclick=closeModal;g("m_go").onclick=async()=>{const d=g("m_d").value;closeModal();await migrate(it,d)};
}
/* RULE: carrying a task MOVES the one record to the new day; history keeps the days it passed through. Never copies. */
async function migrate(it,d,quiet){
  if(!d||d===tday(it))return;
  reschedule(it,d);it.status="open";
  await saveItem(it);if(!quiet)toast("Moved to "+d);
}
function openMergeInto(id){
  const me=S.people.find(p=>p.id===id);if(!me)return;
  openModal(`<h3 style="margin-top:0">Merge ${esc(me.name)} into…</h3><p class="mute">Every item tagged ${esc(me.name)} moves to the person you pick, and ${esc(me.name)} becomes an alias.</p><div class="f"><label>Person</label><input id="mg_to" list="mg_dl" placeholder="Type to search…"><datalist id="mg_dl">${S.people.filter(p=>p.id!==id).sort((a,b)=>lastName(a).localeCompare(lastName(b))).map(p=>`<option value="${esc(p.name)}"></option>`).join("")}</datalist></div><div class="row"><button class="pri" id="mg_go">Merge</button><button id="mg_c">Cancel</button></div>`);
  g("mg_c").onclick=closeModal;g("mg_go").onclick=async()=>{const v=g("mg_to").value.trim().toLowerCase();const t=S.people.find(p=>p.id!==id&&p.name.toLowerCase()===v)||S.people.find(p=>p.id!==id&&p.name.toLowerCase().includes(v));if(!t){toast("Pick a person from the list");return}closeModal();await mergePeople(id,t.id);location.hash="#person:"+t.id};
}
function openEntity(kind,id){
  const c=kind==="person"?"people":kind==="event"?"events":"colls";const x=id?S[c].find(a=>a.id===id):{};
  (id?openPanel:openModal)(`<h3 style="margin-top:0">${id?"Edit":"New"} ${kind==="coll"?"collection":kind}</h3><div class="f"><label>Name</label><input id="n_name" value="${esc(x.name||"")}">
  ${kind==="person"?`<label>Type</label><div>${ptypeMulti("n_type",ptList(x).length?ptList(x):guessPtype(x))}</div><label>Nickname</label><input id="n_nick" value="${esc(x.nick||"")}" placeholder="Several allowed, separated by commas"><label>Relationship</label>${relMulti("n_rel",relList(x))}<label>Email</label><input id="n_email" value="${esc(x.email||"")}"><label>Phone</label><input id="n_phone" value="${esc(x.phone||"")}"><label>How I know them</label><textarea id="n_ctx" style="min-height:50px" placeholder="e.g. I work with them at Veracross · We go to church together · YHS class of ’96">${esc(x.context||"")}</textarea><label>Organization</label><div class="row"><select id="n_co" data-addnew="organization"><option value="">—</option>${[...new Set([...(x.company?[x.company]:[]),...S.orgs.map(o=>o.name)])].sort().map(n=>`<option ${x.company===n?"selected":""}>${esc(n)}</option>`).join("")}</select><input id="n_role" placeholder="Role / title there" value="${esc(x.role||"")}" style="flex:1;min-width:140px"></div><label>This is me</label><label><input type="checkbox" id="n_self" ${x.isSelf?"checked":""}> This record is me (skipped in review, never auto-tagged in your entries)</label><label>Links</label><input id="n_links" placeholder="comma-separated URLs (LinkedIn, site…)" value="${esc((x.links||[]).join(", "))}"><label>Photo</label><div class="row">${id?pav(x)+`<button data-act="imgpick" data-id="${esc(id)}" data-person="1" type="button">Upload photo</button><input type="file" accept="image/*" hidden data-act="imgfile" data-id="${esc(id)}" data-person="1">`:`<span class="mute">Save first, then add a photo.</span>`}</div>`:""}
  ${kind==="event"?`<label>Start</label><input type="date" id="n_start" value="${esc(x.start||"")}"><label>End</label><input type="date" id="n_end" value="${esc(x.end||"")}">`:""}
  ${kind==="coll"?`<label>Dynamic</label><label><input type="checkbox" id="n_dyn" ${x.dynamic?"checked":""}> defined in plain language</label><label>Definition</label><textarea id="n_def" style="min-height:60px" placeholder="e.g. memories at home — moments with family at Asbury Grove">${esc(x.definition||"")}</textarea>`:""}
  <label>Notes</label>${mdField("n_note",x.note,70)}</div>
  <div class="row"><button class="pri" id="n_s">Save</button><button id="n_c">Cancel</button>${id&&kind!=="event"?`<span class="sp"></span><button class="warn" id="n_arch">🗄 Archive</button>`:""}</div>`);
  g("n_c").onclick=closeModal;if(g("n_arch"))g("n_arch").onclick=async()=>{closeModal();if(await ask("Archive "+x.name+"? "+ARCH_MSG,"🗄 Archive")){await archiveEnt(c,x);location.hash=kind==="person"?"#people":"#colls"}};
  g("n_s").onclick=async()=>{const name=g("n_name").value.trim();if(!name)return;
    const o={...x,id:x.id||slug(name)+"-"+Math.random().toString(36).slice(2,5),name,note:g("n_note").value,created:x.created||Date.now()};
    if(kind==="person"){o.nick=g("n_nick").value.trim();o.rels=relVals("n_rel");o.rel=o.rels.join(", ");o.ptype=ptVals("n_type");o.ptypeAuto=false;o.isSelf=g("n_self").checked;o.email=g("n_email").value;o.phone=g("n_phone").value;o.context=g("n_ctx").value.trim();o.company=g("n_co").value.trim();o.role=g("n_role").value;o.links=g("n_links").value.split(",").map(z=>z.trim()).filter(Boolean);o.edited=true}if(kind==="event"){o.start=g("n_start").value;o.end=g("n_end").value}
    if(kind==="coll"){o.dynamic=g("n_dyn").checked;o.definition=g("n_def").value}
    if(kind==="person"){const oid=await ensureOrg(o.company);o.org=oid||null;if(oid)o.company=S.orgs.find(z=>z.id===oid).name}
    closeModal();upsertLocal(c,o);await save(c,o);render();if(!id)location.hash="#"+kind+":"+o.id};
}
/* ---------- proposals ---------- */
async function addProp(p){const o={id:uid("p"),status:"pending",created:Date.now(),...p};upsertLocal("props",o);await save("props",o);return o}
async function acceptProp(id,quiet,opts){
  opts=opts||{};const p=S.props.find(x=>x.id===id);if(!p)return;
  if(p.kind==="add"){const it={id:uid("i"),status:p.item.kind==="task"?"open":undefined,sphere:DEFAULT_SPHERE,people:[],events:[],colls:[],created:Date.now(),history:[],...p.item,date:p.item.date||p.date,src:p.item.src||p.src};
    if(!it.status)delete it.status;
    for(const n of p.tagPeople||[])it.people.push(await ensureEntity("people",n));
    for(const n of p.tagColls||[])it.colls.push(await ensureEntity("colls",n));
    if(it.kind==="task"){if(it.list==="someday")it.due=null;else if(it.list==="waiting"&&!it.due)it.due=addDays(it.date>today()?it.date:today(),7);if(it.list==="next")delete it.list}
    it.people=[...new Set(it.people)];it.events=[...new Set(it.events)];it.colls=[...new Set(it.colls)];
    if(opts.auto)it.autoFiled=true;if(p.quote&&!it.quote)it.quote=p.quote;if(p.capture)it.capture=p.capture;
    await saveItem(it);p.createdId=it.id}
  else if(p.kind==="merge")await applyMerge(p);
  else if(p.kind==="migrate"){const it=S.items.find(i=>i.id===p.targetId);if(it&&isOpen(it))await migrate(it,p.date)}
  else if(p.kind==="collAdd"){const it=S.items.find(i=>i.id===p.targetId);if(it){it.colls=[...new Set([...(it.colls||[]),p.collId])];await saveItem(it)}}
  p.status="accepted";p.accepted=Date.now();if(opts.auto)p.auto=true;await save("props",p);if(!opts.auto)await trustNote(p,"accept");if(!quiet)render();
}
async function rejectProp(id,quiet){const p=S.props.find(x=>x.id===id);if(!p)return;p.status="rejected";await save("props",p);await trustNote(p,"reject");if(!quiet)render()}
async function acceptAll(){const ps=S.props.filter(p=>p.status==="pending");S.busy="Accepting "+ps.length+"…";render();for(const p of ps)await acceptProp(p.id,1);S.busy="";toast("Accepted "+ps.length);render()}
function editProp(id){const p=S.props.find(x=>x.id===id);if(!p||!p.item)return;const it=p.item;S.peNames=[...(p.tagPeople||[])];S.peColls=[...(p.tagColls||[])];
  openModal(`<h3 style="margin-top:0">Edit proposal</h3><div class="f"><label>Title</label><textarea id="pe_t" style="min-height:56px">${esc(it.text)}</textarea><label>Details</label>${mdField("pe_d",it.detail,80)}
   <label>Type</label><select id="pe_k">${["task","event","note"].map(k=>`<option ${(it.kind||"note")===k?"selected":""}>${k}</option>`).join("")}</select>
   <label>Day</label><input type="date" id="pe_dt" value="${esc(it.date||p.date||"")}">
   <label>Sphere</label><select id="pe_s">${sphereOpts(it.sphere||DEFAULT_SPHERE)}</select>
   <label>People</label><div id="pe_ppl" class="row" style="gap:4px;flex-wrap:wrap"><span class="ppc">${ppChips(S.peNames,true)}</span>${ppAddBox()}</div>
   <label>Collections</label><div id="pe_cl" class="row" style="gap:4px;flex-wrap:wrap"><span class="ppc">${ppChips(S.peColls,true,"colls")}</span>${ppAddBox("colls")}</div></div>
   <div class="row"><button class="pri" id="pe_ok">Save</button><button id="pe_c">Cancel</button></div>`);
  const sp=v=>v.split(",").map(x=>x.trim()).filter(Boolean);
  g("pe_c").onclick=closeModal;g("pe_ok").onclick=async()=>{
    try{
      const typed=(document.querySelector("#pe_ppl input")||{}).value||"";if(typed.trim()&&!S.peNames.some(n=>n.toLowerCase()===typed.trim().toLowerCase()))S.peNames.push(typed.trim());
      const ni={...it,text:g("pe_t").value.trim()||it.text,detail:g("pe_d").value,kind:g("pe_k").value,sphere:g("pe_s").value,date:g("pe_dt").value||p.date};
      if(ni.kind==="task"&&!ni.status)ni.status="open";
      p.item=ni;p.edited=true;p.date=ni.date;p.tagPeople=[...S.peNames];const tc=(document.querySelector("#pe_cl input")||{}).value||"";if(tc.trim()&&!S.peColls.some(n=>n.toLowerCase()===tc.trim().toLowerCase()))S.peColls.push(tc.trim());p.tagColls=[...S.peColls];
      closeModal();await save("props",p);render();toast("Saved")
    }catch(e){toast("Couldn't save: "+(e&&e.message||e),6000)}}}
/* ---------- set up a day ---------- */
async function setupDay(d){
  if(S.busy)return;S.busy=(V().some(i=>i.date===d)?"Reviewing ":"Setting up ")+d+"…";render();
  let added=0;const existingTitles=V().filter(i=>i.date===d).map(i=>i.text);
  const rejected=S.props.filter(p=>p.status==='rejected'&&p.date===d&&p.item).map(p=>p.item.text);
  const pend=S.props.filter(p=>(p.status==="pending"||p.status==="snoozed")&&p.date===d&&p.item).map(p=>p.item.text);
  const note=[];
  try{
    if(!S.mcp)throw new Error("connectors off");
    const lt=await S.mcp.listTools();const srv=lt.servers.find(s=>/calendar/i.test(s.server));
    if(!srv)throw new Error("Google Calendar not connected");
    const cals=(await S.mcp.callTool(srv.server,"list_calendars",{})).payload;
    const list=(cals&&cals.calendars)||[];
    for(const c of list){
      if(/holiday/i.test(c.summary)||/^iansdrummond@gmail\.com$/i.test(c.summary))continue;
      let ev;try{ev=(await S.mcp.callTool(srv.server,"list_events",{calendarId:c.id,startTime:d+"T00:00:00",endTime:d+"T23:59:59",pageSize:50,timeZone:"America/New_York"})).payload}catch(e){continue}
      for(const e of(ev&&ev.events)||[]){
        const title=(e.summary||"").trim();if(!title||e.status==="cancelled")continue;
        if([...existingTitles,...pend,...rejected].some(x=>sameEv(x,title)))continue;pend.push(title);
        const t=e.start&&e.start.dateTime?new Date(e.start.dateTime).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:"America/New_York"}):"all day";
        await addProp({kind:"add",date:d,reason:"From calendar “"+c.summary+"” · "+t,src:{name:"Google Calendar: "+c.summary,loc:t,link:e.htmlLink||""},
          item:{kind:"event",text:title,time:t,sphere:/^Calendar$/.test(c.summary)?SPHERES[0]:DEFAULT_SPHERE}});added++;
      }
    }
  }catch(e){note.push("Calendars skipped ("+(e.code||e.message)+")")}
  {const od=V().filter(i=>isOpen(i)&&tday(i)<d).length;if(od&&d===today())note.push(od+" overdue task"+(od>1?"s are":" is")+" already on today's list; use ↪ to move them");}
  added+=await proposeMerges(d);
  const md=d.slice(5);V().filter(i=>i.date&&i.date.slice(5)===md&&i.date<d&&i.kind!=="task").slice(0,3).forEach(i=>note.push("On this day "+i.date+": "+i.text.slice(0,50)));
  S.busy="";render();
  toast((added?added+" new in Inbox. ":"Nothing new. ")+note.join(" · "),5000);
  if(added)location.hash="#review";
}
/* ---------- meeting transcripts and action items ---------- */
const selfName=()=>{const p=(S.people||[]).find(x=>x.isSelf);return p?p.name:"Ian"};
const nzT=s=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
function looksLikeTranscript(t,name){
  t=String(t||"");if(/\.(vtt|srt)$/i.test(name||""))return true;
  if(/^\s*WEBVTT/.test(t)||/\d\d:\d\d:\d\d[.,]\d{3}\s*-->/.test(t))return true;
  const lines=t.split(/\n/).filter(l=>l.trim());if(lines.length<8)return false;
  const spk=lines.filter(l=>/^\s*(\[?\d{1,2}:\d{2}(:\d{2})?\]?\s*)?[A-Z][\w.'’ -]{1,28}(\s+\d{1,2}:\d{2}(:\d{2})?)?\s*:\s+\S/.test(l)||/^\s*\[?\d{1,2}:\d{2}(:\d{2})?\]?\s+[A-Z]/.test(l)||/^[A-Z][\w.'’ -]{1,28}\s+\(?\d{1,2}:\d{2}(:\d{2})?\)?\s*$/.test(l)).length;
  if(spk>=6&&spk/lines.length>.3)return true;
  return /transcript|recording|zoom|teams|gong|otter|fireflies/i.test(t.slice(0,400))&&spk>=3;
}
function cleanTr(t){t=String(t||"").replace(/\r/g,"");
  if(/-->/.test(t))t=t.replace(/^\s*WEBVTT.*$/m,"").split("\n").filter(l=>!/-->/.test(l)&&!/^\s*\d+\s*$/.test(l)).join("\n").replace(/<v\s+([^>]+)>/g,"$1: ").replace(/<[^>]+>/g,"");
  return t.replace(/\n{3,}/g,"\n\n").trim()}
function matchEvents(text,fileName){
  const td=today(),lo=addDays(td,-45),hi=addDays(td,2);
  const evs=dedupeShow(V().filter(i=>i.kind==="event"&&i.date>=lo&&i.date<=hi));
  const head=(String(fileName||"")+" "+String(text).slice(0,4000)).toLowerCase();
  const stop=new Set(["the","and","with","for","meeting","weekly","call","sync","check","mtg","new","review"]);
  const iso=[...head.matchAll(/\d{4}-\d\d-\d\d/g)].map(m=>m[0]);
  return evs.map(e=>{let s=0;const t=cleanTitle(e).t.toLowerCase();
    const w=t.split(/[^a-z0-9]+/).filter(x=>x.length>=3&&!stop.has(x));
    const hit=w.filter(x=>head.includes(x)).length;s+=hit*2;if(w.length&&hit===w.length)s+=2;
    if(iso.includes(e.date))s+=5;
    const d=pd(e.date);if(new RegExp("\\b"+MNL3[d.getMonth()]+"[a-z]*\\.?\\s+0?"+d.getDate()+"\\b").test(head))s+=3;
    (e.people||[]).forEach(id=>{const p=S.people.find(x=>x.id===id);if(p&&head.includes(String(p.name).toLowerCase().split(/\s+/)[0]))s+=1.5});
    if(e.sub==="meeting")s+=1.5;if(e.transcript)s-=3;
    s+=Math.max(0,2-Math.abs((d-pd(td))/864e5)*.3);
    return{e,s}}).filter(x=>x.s>=3).sort((a,b)=>b.s-a.s)}
/* ---------- confirm before creating: sphere + people check ---------- */
const sphAreas=sph=>{const i=SPHERES.indexOf(sph);return i>=0&&i<4?AREA_OF_SPH[i]:["Family","Friends","Church","Asbury Grove"]};
const defArea=sph=>{const i=SPHERES.indexOf(sph);return i===0?"Veracross":i===1?"Gordon College":i===2?"Asbury Grove":i===3?"Core Homeschool":"Friends"};
const isSelfName=n=>{const t=String(n||"").trim().toLowerCase();if(!t)return false;const me=(S.people||[]).find(p=>p.isSelf);const nm=me?me.name.toLowerCase():"ian drummond";return t===nm||t===nm.split(/\s+/)[0]};
const cntMentions=(text,m)=>{try{return(String(text).match(new RegExp("(^|[^A-Za-z])"+reEsc(m)+"(?![A-Za-z])","gi"))||[]).length}catch(e){return 0}};
async function analyzeContext(text,o){
  const me=selfName();
  const head=text.length>16000?text.slice(0,9000)+"\n…\n"+text.slice(-5000):text;
  const roster=S.people.filter(p=>!p.isSelf&&p.kind!=="group").map(p=>p.name+" ["+(p.area||"?")+"]").slice(0,250).join("; ");
  const out=await S.sample.json(`You analyze ${o.kind} for ${me}, the user. Work out (1) which part of ${me}'s life it belongs to and (2) who is in it.
Spheres: "💼 Veracross" = ${me}'s employer, an EdTech company (support, knowledge and product teams, customers). "🎓 Gordon College" = where he teaches Latin and chairs or consults on the AI advisory task force (faculty, deans, provost, students). "🏕️ Asbury Grove" = his camp-meeting residential community. "📚 Core Homeschool Learning" = a homeschool organization he runs. "🏠 Personal" = family, friends, church, home.
${o.title?`Title: "${o.title}".`:""} ${o.attendees&&o.attendees.length?`Already tagged: ${o.attendees.join(", ")}.`:""}
Return JSON {"sphere":{"value":"one of the five sphere strings exactly, or null","confidence":0 to 1,"why":"short reason citing clues in the text"},"people":[{"mention":"the name as spoken or written, e.g. Joanna","fullName":"full name only if the title or text states it, else null","role":"speaker|attendee|mentioned","clue":"what the text says about who they are (job, organization, relationship), max 12 words, or empty"}],"labelsReliable":true or false}.
List every distinct person named or speaking except ${me}. Generic labels such as "Speaker 4" are not people. Merge spelling variants only when clearly the same person, and fold a name that looks like a mis-transcription of another participant (for example "Carolyn" for "Kerilyn") into that participant. Leave out hypothetical or generic people (for example someone who "might request funding"). Speaker labels in transcripts are often wrong, so judge by content. Existing people (name [area]), for reference only: ${roster}\n\nTEXT:\n${head}`);
  return out||{}}
function pvRows(ana,text,sphere,ev,drafts,prevMap){
  const all=S.people.filter(p=>!p.isSelf&&p.kind!=="group");
  const nm=p=>[p.name,...(p.akas||[]),...nicksOf(p)].map(x=>String(x).toLowerCase());
  const fst=s=>String(s).trim().split(/\s+/)[0].toLowerCase();
  const areas=sphAreas(sphere),attend=new Set((ev&&ev.people)||[]),seen=new Set(),rows=[];
  const owners=new Set((drafts||[]).map(x=>nzT(x.who)).filter(Boolean));
  for(const m of(ana.people||[])){
    const mention=String(m.mention||"").trim();if(!mention||isSelfName(mention)||/^speaker\s*\d*$/i.test(mention))continue;
    const key=nzT(mention);if(!key||seen.has(key))continue;seen.add(key);
    const full=String(m.fullName||"").trim(),spoken=mention.toLowerCase(),multi=/\s/.test(mention);
    let cands=[],near=[],how="";
    if(full&&!isSelfName(full)){cands=all.filter(p=>nm(p).includes(full.toLowerCase()));if(cands.length)how="full"}
    if(!cands.length){const by=all.filter(p=>nm(p).includes(spoken)||(!multi&&fst(p.name)===spoken));
      if(full&&!isSelfName(full))near=by;else{cands=by;how=multi?"full":"first"}}
    if(cands.length>1){const att=cands.filter(p=>attend.has(p.id));if(att.length===1)cands=att;else{const ar=cands.filter(p=>areas.includes(p.area));if(ar.length>=1)cands=ar}}
    let st,sel="",flag="";
    if(!cands.length){st="new";sel="new";if(near.length)flag="Not the same as "+near.map(p=>p.name).join(" or ")+"? Those share the first name."}
    else if(cands.length>1){st="pick"}
    else{const p=cands[0],aok=areas.includes(p.area)||!p.area||p.area==="Unsorted";sel=p.id;
      if(how==="full"&&aok||attend.has(p.id)&&aok)st="ok";
      else{st="confirm";flag=aok?"Matched on first name only.":"Filed under "+p.area+", but this looks like "+sphere+"."}}
    let touched=false;
    if(prevMap&&prevMap[key]!==undefined){sel=prevMap[key];touched=true;st="ok";flag=""}
    const n=cntMentions(text,mention),core=m.role==="speaker"||m.role==="attendee"||n>=3||owners.has(key)||(sel&&attend.has(sel));
    rows.push({key,mention,full:full||"",role:m.role||"mentioned",clue:m.clue||"",n,st,sel,flag,touched,core:!!core,
      cands:(cands.length?cands:near).map(p=>p.id),newName:full||mention,area:defArea(sphere),ctx:m.clue||"",edit:false})}
  rows.sort((a,b)=>(b.core-a.core)||b.n-a.n);return rows}
function mapLookup(ctx,who){
  const k=nzT(who);if(!k)return undefined;if(isSelfName(who))return"self";
  if(ctx.map[k]!==undefined)return ctx.map[k];
  const r=(ctx.rows||[]).find(r=>nzT(r.full)===k||r.key===k.split(" ")[0]||k===r.key);
  return r?ctx.map[r.key]:undefined}
function contextCheck(o){
  return new Promise(async resolve=>{
    const ana=o.ana||{},ev=o.ev;let sv=ana.sphere&&SPHERES.includes(ana.sphere.value)?ana.sphere.value:null,conf=Number(ana.sphere&&ana.sphere.confidence)||0,why=(ana.sphere&&ana.sphere.why)||"";
    if(ev&&ev.sphere&&ev.pvSphere){sv=ev.sphere;conf=1;why="You confirmed this earlier."}
    else if(!sv&&ev&&ev.sphere){sv=ev.sphere;conf=0}
    const st={sphere:sv,need:!sv||conf<.8,rows:[],showOthers:false,inc:(o.drafts||[]).map(()=>true)};
    const mk=sph=>pvRows(ana,o.text,sph||DEFAULT_SPHERE,ev,o.drafts,o.reuse&&ev?ev.pvMap:null);
    st.rows=mk(st.sphere);
    const unres=r=>(r.core||st.showOthers)&&!(r.sel==="skip"||(r.sel==="new"?(r.touched&&String(r.newName||"").trim()):r.sel&&(r.touched||r.st==="ok")));
    const blocked=()=>st.need||st.rows.some(unres);
    const finish=async()=>{
      const map={};
      for(const r of st.rows){const k=r.key;
        if(!(r.core||st.showOthers)||r.sel==="skip"||!r.sel){map[k]="skip";continue}
        if(r.sel==="new"){const name=String(r.newName||"").trim();if(!name){map[k]="skip";continue}
          let e=S.people.find(p=>p.name.toLowerCase()===name.toLowerCase());
          if(!e){const i=SPHERES.indexOf(st.sphere);e={id:slug(name)+"-"+Math.random().toString(36).slice(2,5),name,area:r.area||"Unsorted",context:r.ctx||"",created:Date.now(),ptype:i===0||i===1?["Work"]:["Personal"],ptypeAuto:true,akas:(!/\s/.test(r.mention)&&/\s/.test(name))?[r.mention]:[]};upsertLocal("people",e);await save("people",e)}
          map[k]=e.id;continue}
        const p=S.people.find(x=>x.id===r.sel);if(!p){map[k]="skip";continue}
        if(r.edit){const nn=String(r.newName||"").trim();if(nn&&nn!==p.name){if(!/\s/.test(p.name))p.akas=[...new Set([...(p.akas||[]),p.name])];p.name=nn}
          if(r.area)p.area=r.area;p.areaGuess=false;if(r.ctx)p.context=r.ctx;p.edited=true;upsertLocal("people",p);await save("people",p)}
        map[k]=p.id}
      S.pvCancel=null;const mb=document.getElementById("mbox");mb.onclick=mb.onchange=mb.oninput=null;closeModal();
      resolve({sphere:st.sphere,map,rows:st.rows,inc:st.inc})};
    if(o.reuse&&ev&&ev.pvSphere&&!blocked()){await finish();return}
    const optHtml=(r,i)=>{const sel=r.sel,seen=new Set();
      const op=p=>{seen.add(p.id);return`<option value="${esc(p.id)}" ${sel===p.id?"selected":""}>${esc(p.name)} · ${esc(p.area||"?")}${p.role?" · "+esc(p.role):p.context?" · "+esc(String(p.context).slice(0,32)):""}</option>`};
      const c=r.cands.map(id=>S.people.find(p=>p.id===id)).filter(Boolean);
      const rest=S.people.filter(p=>!p.isSelf&&p.kind!=="group"&&!c.includes(p)).sort((a,b)=>a.name.localeCompare(b.name));
      return`<option value="" ${sel===""?"selected":""}>Choose…</option>${c.length?`<optgroup label="Possible matches">${c.map(op).join("")}</optgroup>`:""}<option value="new" ${sel==="new"?"selected":""}>➕ A new person (not in my list)</option><option value="skip" ${sel==="skip"?"selected":""}>Don't tag this person</option><optgroup label="Someone else in my People">${rest.map(op).join("")}</optgroup>`};
    const rowHtml=(r,i)=>{
      const un=unres(r),cls=un?(r.st==="confirm"?"amber":"red"):"green";
      const lab={ok:"matched",confirm:"please confirm",pick:"which one?",new:"not in your list"}[r.st]||"choose";
      const p=r.sel&&r.sel!=="new"&&r.sel!=="skip"?S.people.find(x=>x.id===r.sel):null;
      const fields=(r.sel==="new"||r.edit)?`<div class="pvn"><label>Full name</label><input data-pv="nm" data-i="${i}" value="${esc(r.newName)}" placeholder="First Last"><label>Area</label><select data-pv="ar" data-i="${i}">${PAREAS.map(a=>`<option ${r.area===a?"selected":""}>${esc(a)}</option>`).join("")}</select><label>Who they are</label><input data-pv="cx" data-i="${i}" value="${esc(r.ctx)}" placeholder="e.g. Provost at Gordon College"></div>`:"";
      return`<div class="pvr ${cls}"><div class="pvh"><b>${esc(r.mention)}</b>${r.full&&r.full.toLowerCase()!==r.mention.toLowerCase()?` <span class="mute">(${esc(r.full)})</span>`:""} <span class="mute dsm">×${r.n} · ${esc(r.role)}${r.clue?" · “"+esc(r.clue)+"”":""}</span> <span class="pvs ${cls}">${un?lab:"✓"}</span></div>${r.flag?`<div class="mute dsm">${esc(r.flag)}</div>`:""}
       <div class="pvc"><select data-pv="sel" data-i="${i}">${optHtml(r,i)}</select>${p&&!r.edit?`<button data-pv="edit" data-i="${i}">✎ Edit person</button>`:""}${un&&p?`<button class="pri" data-pv="ok" data-i="${i}">✓ That's them</button>`:""}${un&&r.sel==="new"?`<button class="pri" data-pv="ok" data-i="${i}">➕ Add this person</button>`:""}</div>${fields}</div>`};
    const paint=()=>{
      const keep=document.getElementById("modal").scrollTop;
      const core=st.rows.filter(r=>r.core||st.showOthers),oth=st.rows.filter(r=>!r.core&&!st.showOthers);
      const newOth=oth.filter(r=>r.st==="new").length;
      openModal(`<h3 style="margin-top:0">Check this before I create anything</h3><p class="mute" style="margin:0 0 6px">I read the ${o.kind==="import"?"text":"transcript"}. Confirm where it belongs and who's in it so the names and tags come out right. Nothing is created until you press Continue.</p>
       <div class="pvbox"><b>${o.kind==="import"?"Default sphere":"Sphere"}</b><select data-pv="sph">${st.sphere?"":`<option value="" selected>Choose…</option>`}${SPHERES.map(s=>`<option ${st.sphere===s?"selected":""}>${esc(s)}</option>`).join("")}</select>${st.need?`<span class="pvs red">${st.sphere?"not sure, please confirm":"pick one"}</span>`:`<span class="pvs green">✓</span>`}<span class="mute dsm" style="flex-basis:100%">${esc(why)}</span></div>
       ${ana.labelsReliable===false?`<div class="pvwarn">The speaker labels in this transcript look unreliable (names swapped or generic). I judged owners from what was said and will leave the owner untagged when unsure.</div>`:""}
       <h4 style="margin:10px 0 2px">People${core.length?" ("+core.length+")":""}</h4>${core.map(r=>rowHtml(r,st.rows.indexOf(r))).join("")||`<p class="mute">No people to confirm.</p>`}
       ${oth.length?`<div class="pvwarn">${oth.length} more ${oth.length===1?"person is":"people are"} mentioned in passing${newOth?" ("+newOth+" not in your People list)":""}: ${esc(oth.slice(0,8).map(r=>r.mention).join(", "))}${oth.length>8?"…":""}. They won't be tagged unless you review them. <button data-pv="showall">Review all ${oth.length}</button></div>`:""}
       ${o.drafts&&o.drafts.length?`<h4 style="margin:10px 0 2px">Action items I found (${o.drafts.length})</h4>${o.drafts.map((x,i)=>`<label class="pvd"><input type="checkbox" data-pv="inc" data-i="${i}" ${st.inc[i]?"checked":""}><span><span class="cb">${x.type==="waiting"?"waiting on":"mine"}</span> ${esc(x.text)}${x.who?` <span class="mute dsm">· ${esc(x.who)}${x.uncertain?" (owner unclear)":""}</span>`:""}</span></label>`).join("")}<p class="mute dsm">Uncheck any that are wrong. The rest go to your Inbox for a final look.</p>`:""}
       <div class="row pvgo"><button class="pri" data-pv="go" ${blocked()?"disabled":""}>Continue</button>${st.rows.some(unres)?`<button data-pv="skipall">Skip the unresolved people</button>`:""}<span class="sp"></span><button data-pv="cancel">Cancel (create nothing)</button></div>`,1);
      document.getElementById("modal").scrollTop=keep};
    const mb=()=>document.getElementById("mbox");
    S.pvCancel=()=>{const m=mb();m.onclick=m.onchange=m.oninput=null;resolve(null)};
    const rowOf=t=>st.rows[Number(t.dataset.i)];
    paint();
    mb().onchange=e=>{const t=e.target,k=t.dataset.pv;if(!k)return;
      if(k==="sph"){st.sphere=t.value;st.need=!t.value;why="You chose this.";const old=st.rows;st.rows=mk(st.sphere);st.rows.forEach(r=>{const p=old.find(x=>x.key===r.key);if(p&&(p.touched||p.edit)){Object.assign(r,{sel:p.sel,touched:p.touched,edit:p.edit,newName:p.newName,ctx:p.ctx,area:p.area})}});paint();return}
      if(k==="sel"){const r=rowOf(t);r.sel=t.value;r.touched=true;r.edit=false;if(r.sel==="new"){r.newName=r.newName||r.mention}paint();return}
      if(k==="ar"){rowOf(t).area=t.value;return}
      if(k==="inc"){st.inc[Number(t.dataset.i)]=t.checked}};
    mb().oninput=e=>{const t=e.target,k=t.dataset.pv;if(k==="nm")rowOf(t).newName=t.value;else if(k==="cx")rowOf(t).ctx=t.value};
    mb().onclick=e=>{const b=e.target.closest("button[data-pv]");if(!b)return;const k=b.dataset.pv;
      if(k==="cancel"){S.pvCancel=null;const m=mb();m.onclick=m.onchange=m.oninput=null;closeModal();resolve(null);return}
      if(k==="go"){if(!blocked())finish();return}
      if(k==="showall"){st.showOthers=true;st.rows.forEach(r=>{if(!r.core&&!r.touched){r.sel="skip"}});paint();return}
      if(k==="skipall"){st.rows.forEach(r=>{if(unres(r)){r.sel="skip";r.touched=true}});paint();return}
      const r=rowOf(b);if(!r)return;
      if(k==="ok"){r.touched=true;paint()}
      else if(k==="edit"){const p=S.people.find(x=>x.id===r.sel);if(p){r.edit=true;r.newName=p.name;r.area=PAREAS.includes(p.area)?p.area:"Unsorted";r.ctx=p.context||"";paint()}}}
  })}
const ENG_TMP=new Map();
async function draftActions(ev,title){
  const lo=addDays(ev.date,-3),hi=addDays(ev.date,60);
  const evs=V().filter(i=>i.kind==="event"&&i.id!==ev.id&&i.date>=lo&&i.date<=hi).slice(0,80);
  const res=await engineRun({type:"meeting",text:String(ev.transcript||"").trim(),day:ev.date,title,events:evs,attendees:(ev.people||[]).map(pname),what:"a meeting transcript"});
  ENG_TMP.set("ev:"+ev.id,new Set(evs.map(e=>e.id)));
  return((res&&res.outputs)||[]).filter(x=>x.kind==="task"||x.kind==="event").slice(0,30).map(x=>({...x,type:x.kind==="task"&&x.list==="waiting"?"waiting":"mine"}))}
async function commitActions(ev,drafts,ctx,title){
  const outs=[];
  for(let i=0;i<drafts.length;i++){
    if(ctx.inc&&ctx.inc[i]===false)continue;const x={...drafts[i]};
    let text=String(x.text||"").trim().slice(0,200);if(!text)continue;
    let pid=null;
    if(x.kind==="task"&&x.who){const r=mapLookup(ctx,x.who);if(r==="self"){x.list="next";x.type="mine"}else if(r&&r!=="skip")pid=r}
    if(x.uncertain)pid=null;
    const p=pid?S.people.find(q=>q.id===pid):null;
    if(p&&!text.toLowerCase().includes(p.name.toLowerCase())){const w=String(x.who).trim();const re=new RegExp("(^|[^A-Za-z])("+reEsc(w)+")(?![A-Za-z])","i");if(re.test(text))text=text.replace(re,(m,a)=>a+p.name)}
    x.text=text;
    x.people=p?[p.name]:(x.kind==="event"?(x.people||[]).map(n=>{const id=mapLookup(ctx,n);return id&&id!=="skip"&&id!=="self"?pname(id):null}).filter(Boolean):[]);
    if(x.kind==="task")x.list=x.type==="waiting"?"waiting":"next";
    outs.push(x)}
  const r=await engineFile(outs,{type:"meeting",day:ev.date,itemDay:today(),src:{name:"Meeting: "+title,loc:ev.tname||"",link:ev.tlink||""},sphere:ctx.sphere||ev.sphere||DEFAULT_SPHERE,linkEv:ev.id,evIds:ENG_TMP.get("ev:"+ev.id)||new Set(),mapName:n=>n,reason:"From the "+title+" transcript"});
  ENG_TMP.set("r:"+ev.id,r);
  return r.n+r.auto}
async function extractActions(ev,opts){
  opts=opts||{};const tr=String(ev.transcript||"").trim();if(!tr)return 0;
  if(!S.sample){toast("Transcript saved. AI isn't available here to pull action items.");return 0}
  const sig=tr.length+":"+tr.slice(0,40);if(!opts.force&&ev.trSig===sig)return 0;
  S.trWork=S.trWork||{};S.trWork[ev.id]=true;toast("Reading the transcript…",9000);paintContent();
  let n=0;
  try{
    const title=cleanTitle(ev).t;
    const [drafts,ana]=await Promise.all([draftActions(ev,title),analyzeContext(tr,{kind:"a meeting transcript",title,attendees:(ev.people||[]).map(pname)}).catch(()=>null)]);
    const ctx=ana?await contextCheck({kind:"meeting",ana,text:tr,title,ev,drafts,reuse:!!opts.reuse}):{sphere:ev.sphere||null,map:{},rows:[],inc:drafts.map(()=>true)};
    if(!ctx){toast("Cancelled. Nothing was created.");S.trWork[ev.id]=false;paintContent();return 0}
    if(ctx.sphere){ev.sphere=ctx.sphere;ev.pvSphere=true}
    ev.pvMap=Object.assign({},ev.pvMap||{},ctx.map);
    for(const r of ctx.rows){const id=ctx.map[r.key];if(id&&id!=="skip"&&(r.role==="speaker"||r.role==="attendee")&&!(ev.people||[]).includes(id))ev.people=[...(ev.people||[]),id]}
    const sumP=(!ev.summary||ev.summaryAuto)?summarizeMeeting(ev,ev.sumFmt||"para",{auto:1}).catch(()=>{}):null;
    n=await commitActions(ev,drafts,ctx,title);
    const same=ev.trSig===sig;ev.trCount=(same?(ev.trCount||0):0)+n;ev.trSig=sig;
    S.trWork[ev.id]=false;if(sumP)await sumP;await saveItem(ev);
    if(ENG_TMP.has("r:"+ev.id)){engToast(ENG_TMP.get("r:"+ev.id),cleanTitle(ev).t);ENG_TMP.delete("r:"+ev.id)}else toast("No new action items found",5000);return n
  }catch(e){toast("Couldn't pull action items: "+(e.message||e.code||e));S.trWork[ev.id]=false;paintContent();return 0}}
const SUMFMT=[["para","One paragraph"],["bullets","Key points (bullets)"],["decisions","Decisions & next steps"],["brief","Brief (2–3 sentences)"],["detailed","Detailed notes by topic"],["recap","Recap to send attendees"]];
const SUMPROMPT={para:"Write ONE paragraph (4 to 6 sentences) covering the purpose, the main points discussed, decisions made and next steps.",bullets:"Write 5 to 8 bullet points of the key points discussed, each line starting with \"- \". Most important first.",decisions:"Write three sections headed \"### Decisions\", \"### Next steps\" and \"### Open questions\". Under each, lines starting with \"- \". Write \"- None\" when a section is empty. Name owners for next steps when stated.",brief:"Write 2 to 3 sentences: the shortest accurate summary of what mattered.",detailed:"Write detailed notes grouped by topic. Put each topic as a \"### Topic\" heading, then lines starting with \"- \" under it. Include names, numbers and dates that were stated.",recap:"Write a short recap email body to the attendees: a one-line opening, a brief summary of what was covered, the decisions, and who owns which next steps. Plain text, no subject line."};
async function summarizeMeeting(ev,fmt,o){
  o=o||{};const tr=String(ev.transcript||"").trim();
  if(!tr){toast("Add a transcript first");return}
  if(!S.sample){toast("AI isn't available here");return}
  fmt=SUMPROMPT[fmt]?fmt:"para";S.sumWork=S.sumWork||{};if(S.sumWork[ev.id])return;S.sumWork[ev.id]=true;
  if(!o.auto)toast("Writing summary…",20000);paintContent();
  const prev=ev.summary||"",prevAuto=!!ev.summaryAuto;
  try{
    const me=selfName(),title=cleanTitle(ev).t,att=(ev.people||[]).map(pname),long=tr.length>24000;
    let src=tr;
    if(long){const parts=[];for(let i=0;i<tr.length;i+=14000)parts.push(tr.slice(i,i+14000));const notes=[];
      for(const ch of parts){const r=await S.sample(`Condense this part of a meeting transcript into dense factual notes: topics, decisions, commitments with owners, numbers, dates. Notes only.\n\n${ch}`,{modelTier:"quick"});notes.push((r.text||"").trim())}
      src=notes.join("\n\n")}
    const r=await S.sample(`Summarize this meeting for ${me}. Meeting: "${title}" on ${ev.date}. Known attendees (use these full names when a spoken first name matches): ${att.join(", ")||"unknown"}.\n${SUMPROMPT[fmt]}\nUse only what is in the ${long?"notes":"transcript"}; do not invent anything. Format as Markdown: section labels as "### Label", bullets as "- ", bold only for names of decisions. No preamble. Reply with the summary only.\n\n${long?"NOTES":"TRANSCRIPT"}:\n${src}`,{cache:false});
    const out=(r.text||"").trim();if(!out){toast("No summary returned");return}
    ev.summary=out;ev.summaryAuto=true;ev.sumFmt=fmt;S.sumWork[ev.id]=false;await saveItem(ev);
    if(!o.auto&&prev.trim())toastUndo("Summary updated",async()=>{ev.summary=prev;ev.summaryAuto=prevAuto;await saveItem(ev)});else toast("Summary added",3000)
  }catch(e){toast(e&&e.code==="rate_limited"?"AI is busy. Try again in a moment.":"Couldn't write the summary")}
  finally{S.sumWork[ev.id]=false;paintContent()}}
document.addEventListener("click",e=>{if(S.sumMenu&&!e.target.closest(".sumhd")){S.sumMenu=null;paintContent()}});
async function attachTranscript(raw,o){
  const text=cleanTr(raw);let ev=null,title="",date="",created=false;
  if(o.evId&&o.evId!=="auto"&&o.evId!=="new")ev=S.items.find(i=>i.id===o.evId)||null;
  if(!ev&&o.evId!=="new"){
    const c=matchEvents(text,o.fileName).slice(0,6);
    if(S.sample){toast("Finding the meeting…",8000);
      try{const lines=c.map((x,n)=>n+"|"+x.e.date+"|"+(x.e.time||"")+"|"+cleanTitle(x.e).t+"|"+(x.e.people||[]).map(pname).join(", "));
        const out=await S.sample.json(`Decide which calendar event this meeting transcript belongs to. Candidate events (index|date|time|title|attendees):\n${lines.join("\n")||"(none)"}\nToday is ${today()}. Return JSON {"index": number or null, "title":"a short meeting title inferred from the transcript","date":"YYYY-MM-DD or null"}. Use null for index unless one candidate clearly fits.\n\nTRANSCRIPT START:\n${text.slice(0,3500)}`);
        if(out){title=String(out.title||"").slice(0,120);date=/^\d{4}-\d\d-\d\d$/.test(out.date||"")?out.date:"";const n=Number.isInteger(out.index)?out.index:null;if(n!==null&&c[n])ev=c[n].e}}catch(e){}}
    if(!ev&&c[0]&&c[0].s>=(S.sample?9:6))ev=c[0].e}
  if(!ev){
    const fnm=String(o.fileName||"").replace(/\.[a-z0-9]+$/i,"").replace(/[_-]+/g," ").trim();
    ev={id:uid("i"),kind:"event",sub:"meeting",text:title||fnm||"Meeting",date:date||(String(o.fileName||"").match(/\d{4}-\d\d-\d\d/)||[])[0]||today(),sphere:DEFAULT_SPHERE,people:[],events:[],related:[],colls:[],created:Date.now(),history:[],src:{name:"Created from a transcript"}};created=true}
  ev.transcript=text;if(o.link)ev.tlink=o.link;if(o.name)ev.tname=o.name;else if(o.fileName&&!ev.tname)ev.tname=o.fileName;ev.trSig=null;
  await saveItem(ev);
  toast((created?"No matching event, so I made a meeting: ":"Attached to: ")+cleanTitle(ev).t+" · "+shortDate(ev.date),5000);
  const n=await extractActions(ev,{force:1});if(n)location.hash="#review"}
async function evNoteText(id){
  const sv=await evServer();const d=await S.mcp.describeTool(sv,"get_note").catch(()=>null);
  const props=d&&d.inputSchema&&d.inputSchema.properties;const k=pickKey(props,/note.*(id|guid)|^(id|guid)$/i,"noteId");
  const r=(await S.mcp.callTool(sv,"get_note",{[k]:id})).payload;
  const t=typeof r==="string"?r:(r&&(r.content||r.body||r.text||r.markdown))||JSON.stringify(r);
  return String(t).replace(/<\/(div|p|li|h\d|tr)>|<br\s*\/?>/gi,"\n").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/[ \t]+/g," ").replace(/\n\s*\n+/g,"\n").trim()}
async function openEvFind(id){
  const ev=S.items.find(i=>i.id===id);if(!ev)return;if(!S.mcp){toast("Connectors not available here");return}
  S.evmFor=id;const base=cleanTitle(ev).t.replace(/[^\w\s'’&-]/g," ").replace(/\s+/g," ").trim();
  openModal(`<h3 style="margin-top:0">Find meeting notes in Evernote</h3><p class="mute">Looking for notes on “${esc(base)}” (${esc(shortDate(ev.date))}). Pick the one that has the transcript or meeting notes.</p><div class="row"><input id="evmq" value="${esc(base)}" style="flex:1;min-width:180px"><button id="evmgo">Search</button></div><div id="evmres" class="mute" style="margin-top:8px">Searching…</div><div class="row" style="margin-top:8px"><span class="sp"></span><button data-act="mclose">Close</button></div>`,1);
  g("evmgo").onclick=()=>evmSearch(ev,[g("evmq").value.trim()]);
  g("evmq").onkeydown=e=>{if(e.key==="Enter")evmSearch(ev,[g("evmq").value.trim()])};
  const w=base.split(" ").filter(x=>x.length>=3);
  evmSearch(ev,[base,...(w.length>2?[w.slice(0,3).join(" ")]:[]),base+" "+ev.date])}
async function evmSearch(ev,qs){
  const box=g("evmres");qs=qs.filter(Boolean);if(!qs.length)return;box.textContent="Searching…";
  try{
    const sv=await evServer();const d=await S.mcp.describeTool(sv,"search_notes").catch(()=>null);
    const props=d&&d.inputSchema&&d.inputSchema.properties;const k=pickKey(props,/^(query|text|search|keywords?)$/i,"query");
    const seen=new Map();
    for(const q of qs){try{const r=(await S.mcp.callTool(sv,"search_notes",{[k]:q})).payload;
      const list=(r&&(r.notes||r.results||r.items))||(Array.isArray(r)?r:[]);
      list.forEach(n=>{const id=n.guid||n.id||n.noteId;if(id&&!seen.has(id))seen.set(id,n)})}catch(e){}}
    const words=cleanTitle(ev).t.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=3);
    const rows=[...seen.entries()].map(([id,n])=>{const t=String(n.title||n.name||"(untitled)"),lt=t.toLowerCase();let s=words.filter(w=>lt.includes(w)).length*2;
      if(lt.includes(ev.date))s+=5;const dm=lt.match(/\d{4}-\d\d-\d\d/);if(dm){const df=Math.abs((pd(dm[0])-pd(ev.date))/864e5);if(df<=1)s+=4;else if(df<=7)s+=1}
      return{id,t,s,n}}).sort((a,b)=>b.s-a.s).slice(0,12);
    if(!rows.length){box.textContent="No matching notes. Try different words above.";return}
    box.innerHTML=rows.map((r,i)=>`<div class="it"><div class="mid"><div class="ttl">${esc(r.t)}${i===0&&r.s>=4?' <span class="cb">best match</span>':""}</div>${r.n.snippet||r.n.summary?`<div class="clamp1">${esc(String(r.n.snippet||r.n.summary).slice(0,160))}</div>`:""}</div><button data-act="evmuse" data-nid="${esc(r.id)}" data-t="${esc(r.t)}">Use this note</button></div>`).join("")
  }catch(e){box.textContent="Evernote search failed: "+(e.code||e.message)}}
/* ---------- backfill / AI parse ---------- */
function openBackfill(d){
  openModal(`<h3 style="margin-top:0">Add or import info</h3><p class="mute" style="margin:0 0 6px">Paste text or load a file (.txt .md .vtt .srt). Ordinary text is split into proposals for the Inbox. A <b>meeting transcript</b> is attached to its event and the action items go to your Inbox.</p>
  <input type="file" id="b_f" accept=".txt,.md,.csv,.json,.vtt,.srt"><textarea id="b_t" class="bigta" placeholder="Paste text or a meeting transcript here…" style="margin-top:6px"></textarea>
  <div class="f" style="margin-top:8px"><label>Transcript</label><div><label><input type="checkbox" id="b_tr"> This is a meeting transcript</label> <span id="b_trh" class="mute"></span><div id="b_trev" style="display:none;margin-top:6px">Attach to <select id="b_ev" style="max-width:100%"></select></div></div>
  <label>Day</label><div><label><input type="checkbox" id="b_inf" checked> Work it out from the text (may span many days)</label><br><input type="date" id="b_d" value="${d}" disabled style="margin-top:4px"> <span class="mute">used when the text has no dates</span></div>
  <label>Where it's from</label><input id="b_sn" placeholder="e.g. 2019 paper journal, Family log doc (optional)"><label>Where in it</label><input id="b_sl" placeholder="page 12, photo IMG_1234, timestamp (optional)"><label>Link</label><input id="b_su" placeholder="URL to the original or recording (optional)"></div>
  <div class="row" style="margin-top:8px"><button class="pri" id="b_go">${S.sample?"Review and split with AI":"Add for review"}</button><button id="b_c">Cancel</button></div>`,1);
  let fileNm="",manual=false,tm=null;
  const fillEv=()=>{const m=matchEvents(g("b_t").value,fileNm),seen=new Set();
    const rec=dedupeShow(V().filter(i=>i.kind==="event"&&i.date>=addDays(today(),-30)&&i.date<=addDays(today(),1))).sort((a,b)=>(b.date+(b.time||"")).localeCompare(a.date+(a.time||"")));
    const opt=e=>`<option value="${esc(e.id)}">${esc(shortDate(e.date))} · ${esc(cleanTitle(e).t.slice(0,60))}${e.transcript?" (has a transcript)":""}</option>`;
    const cur=g("b_ev").value;
    g("b_ev").innerHTML=`<option value="auto">Best match${m[0]?": "+esc(cleanTitle(m[0].e).t.slice(0,40)):" (finds the event, or makes a new meeting)"}</option>`+(m.length?`<optgroup label="Likely matches">${m.slice(0,5).map(x=>(seen.add(x.e.id),opt(x.e))).join("")}</optgroup>`:"")+`<optgroup label="Recent events">${rec.filter(e=>!seen.has(e.id)).slice(0,40).map(opt).join("")}</optgroup><option value="new">Make a new meeting for it</option>`;
    if(cur&&[...g("b_ev").options].some(o=>o.value===cur))g("b_ev").value=cur};
  const sync=()=>{const text=g("b_t").value,is=looksLikeTranscript(text,fileNm);if(!manual)g("b_tr").checked=is;
    const on=g("b_tr").checked;g("b_trh").textContent=is&&!manual?"Looks like one.":"";g("b_trev").style.display=on?"block":"none";
    g("b_go").textContent=on?"Attach and pull action items":(S.sample?"Review and split with AI":"Add for review");if(on)fillEv()};
  g("b_t").oninput=()=>{clearTimeout(tm);tm=setTimeout(sync,350)};g("b_tr").onchange=()=>{manual=true;sync()};
  g("b_c").onclick=closeModal;g("b_inf").onchange=()=>{g("b_d").disabled=g("b_inf").checked};
  g("b_f").onchange=async()=>{const f=g("b_f").files[0];if(f){fileNm=f.name;g("b_t").value=await f.text();if(!g("b_sn").value)g("b_sn").value=f.name;manual=false;sync()}};
  g("b_go").onclick=async()=>{const text=g("b_t").value.trim();if(!text)return;
    if(g("b_tr").checked){const o={fileName:fileNm,evId:g("b_ev").value,name:g("b_sn").value,link:g("b_su").value};closeModal();await attachTranscript(text,o);return}
    const def=g("b_inf").checked?"":g("b_d").value,src={name:g("b_sn").value,loc:g("b_sl").value,link:g("b_su").value};closeModal();await parseText(text,def,src)};
}
/* ---------- Tabula engine: one way to read any text and propose records ----------
   Every source (Capture/journal entry, meeting transcript, imported or pasted text, Evernote pull)
   goes through engineRun() (AI reads the text) and engineFile() (dedupe, trust rules, Inbox). */
const ENG_SRC={journal:"journal entries",meeting:"meeting transcripts",import:"imported text",evernote:"Evernote notes"};
const ENG_OUT={task:"Tasks",waiting:"Waiting-for items",event:"Events",note:"Notes"};
const engKey=(type,kind,list)=>(ENG_SRC[type]?type:"import")+":"+(kind==="task"&&list==="waiting"?"waiting":kind);
const engKeyLabel=k=>{const[a,b]=String(k).split(":");return(ENG_OUT[b]||b)+" from "+(ENG_SRC[a]||a)};
const ENG_KEYS=["journal:task","journal:event","journal:note","meeting:task","meeting:waiting","meeting:event","import:task","import:event","import:note","evernote:task","evernote:event","evernote:note"];
const okDate=s=>/^\d{4}-\d\d-\d\d$/.test(s||"");
const ENG_GUIDE={
  journal:`This is a spoken or typed journal entry. It is already saved whole, so do not retell it. Pull out: events (things that happened or will happen that belong in a calendar log: meetings, outings, trips, appointments, calls, visits, including past ones the writer attended; set "match" when it is one of the existing events listed), tasks (things the writer says they need, plan or promised to do; waiting = someone else owes the writer something), and stand-alone notes only for a distinct topic worth its own note (an idea, a plan, a spec, a reflection), copied verbatim with Markdown structure. At most 12 events, 12 tasks and 5 notes.`,
  meeting:`This is a meeting transcript or meeting notes. Tasks: only real commitments that matter to the user: the user committed to it or was asked or assigned to do it (list "next"), or someone else committed to something the user relies on (list "waiting", text "Name to …", "who" = that name as spoken). Skip ideas, hypotheticals ("might", "could", "we should think about"), open discussion, things already done, and other people's tasks that don't involve the user. Speaker labels may be wrong; decide the owner from what was said and set "uncertain" true when unclear. Usually 3 to 10 tasks, at most 25. Events: only follow-up meetings or deadlines explicitly scheduled. No notes (the meeting gets its own summary).`,
  import:`This is imported journal text or notes. Split text that covers several days, topics or to-dos into separate outputs; every meaningful passage becomes exactly one output (a note unless it is clearly a task or an event). "text" = its first line or sentence VERBATIM; "detail" = the rest of that passage VERBATIM. Omit nothing meaningful. Infer each output's day from the text (dates, weekdays, "last week" relative to context); use null when it can't be determined.`};
ENG_GUIDE.evernote=ENG_GUIDE.import;
async function engineRun(o){
  if(!S.sample)return null;
  const type=ENG_GUIDE[o.type]?o.type:"import",day=o.day||null,me=selfName();
  const dow=day?new Date(day+"T12:00:00").toLocaleDateString("en-US",{weekday:"long"}):"";
  const ppl=S.people.slice(0,250).map(p=>p.name+(p.rel?" ("+p.rel+")":"")).join("; ");
  const evl=(o.events||[]).map(e=>e.id+"|"+e.date+"|"+(e.time||"")+"|"+cleanTitle(e).t.slice(0,70)).join("\n");
  const colls=S.colls.map(c=>c.name);
  const text=String(o.text||""),chunks=[];for(let i=0;i<text.length;i+=12000)chunks.push(text.slice(i,i+12000));
  const res={title:"",sphere:null,people:[],outputs:[]},seen=new Set();
  for(let ci=0;ci<chunks.length;ci++){
    const out=await S.sample.json(`You read ${o.what||"a piece of text"} for ${me}, the user, and turn it into records for their planner app, Tabula.${o.title?` Source: "${o.title}".`:""} ${day?`The text belongs to ${day} (${dow}); resolve relative dates against it.`:"Infer dates from the text."} Today is ${today()}.${chunks.length>1?` This is part ${ci+1} of ${chunks.length}.`:""}
Spheres: ${JSON.stringify(SPHERES)}.
Known people (when someone is the same person, use this exact full name): ${ppl||"(none)"}${o.attendees&&o.attendees.length?`\nKnown attendees: ${o.attendees.join(", ")}`:""}
Existing events near that date (id|date|time|title):
${evl||"(none)"}
Existing collections: ${JSON.stringify(colls)}
${ENG_GUIDE[type]}
Rules for every output: copy the writer's words (only fix obvious line-break or transcription artefacts); never invent content; merge near-duplicates; every task gets a due date: the stated one, else your best guess with "dueGuess": true; "quote" = a short verbatim snippet (25 words or fewer) from the text that the output comes from; "confidence" = 0 to 1, how sure you are this output is right and wanted.
Return JSON {"title":"short descriptive title for the whole text, max 8 words","sphere":"best sphere or null","people":["people mentioned, full name if known"],"outputs":[{"kind":"task|event|note","list":"next|waiting|someday or empty","text":"title line","detail":"Markdown, verbatim where it comes from the text, or empty","date":"YYYY-MM-DD or null","due":"YYYY-MM-DD or null","dueGuess":true,"time":"e.g. 7:00 AM-12:00 PM, or empty","sphere":"one of the spheres or null","people":["names"],"who":"for waiting tasks the owner's name as spoken, else empty","uncertain":false,"match":"id of an existing event when this output IS that event, else empty","events":["ids of existing events it relates to"],"collections":["existing or sensible new collection names"],"quote":"…","confidence":0.8}]}. If there is nothing, return an empty outputs list.\n\nTEXT:\n${chunks[ci]}`);
    if(!out)continue;
    if(ci===0){res.title=String(out.title||"").trim();res.sphere=SPHERES.includes(out.sphere)?out.sphere:null}
    (Array.isArray(out.people)?out.people:[]).forEach(n=>{n=String(n||"").trim();if(n&&!res.people.includes(n))res.people.push(n)});
    for(const x of Array.isArray(out.outputs)?out.outputs:[]){if(!x||!String(x.text||x.detail||"").trim())continue;const k=(x.kind||"")+"|"+nzT(x.text||x.detail);if(seen.has(k))continue;seen.add(k);res.outputs.push(x)}}
  return res}
const engCanon=n=>{n=String(n||"").trim();const l=n.toLowerCase();if(!l)return"";const p=S.people.find(x=>x.name.toLowerCase()===l||(x.akas||[]).some(a=>String(a).toLowerCase()===l));return p?p.name:n};
const engKnown=n=>{const l=String(n||"").toLowerCase();return S.people.some(x=>x.name.toLowerCase()===l)};
function engDup(item,quote,src,parent){
  const k=nzT(item.text),qk=nzT(quote);if(!k)return"empty";
  if(item.kind==="task"&&V().some(i=>i.kind==="task"&&isOpen(i)&&nzT(i.text)===k))return"open task";
  if(item.kind==="event"&&V().some(i=>i.kind==="event"&&i.date===item.date&&sameEv(i.text,item.text)))return"existing event";
  if(item.kind==="note"&&parent&&V().some(i=>i.kind==="note"&&i.parent===parent&&nzT(i.text)===k))return"existing note";
  for(const p of S.props){if(!p.item)continue;
    const same=nzT(p.item.text)===k,origin=(src&&src.link&&p.src&&p.src.link===src.link)||(parent&&p.parent===parent),sameSrc=origin||p.date===item.date;
    if(same&&p.status==="rejected")return"dismissed before";
    if(same&&sameSrc)return p.status==="accepted"?"already filed":"already in Inbox";
    if(qk&&qk.length>12&&origin&&nzT(p.quote)===qk)return"same quote"}
  return""}
/* outs: engine outputs. o: {type, day, itemDay, taskOnDue, src, parent, sphere, mapName(name)->name|null, evIds:Set, linkEv, reason} */
async function engineFile(outs,o){
  const r={n:0,auto:0,dup:0,matched:[]},mapName=o.mapName||engCanon;
  for(const x of outs||[]){
    const kind=["task","event","note"].includes(x.kind)?x.kind:"note";
    if(kind==="event"&&x.match&&o.evIds&&o.evIds.has(x.match)){r.matched.push(x.match);continue}
    let date=o.itemDay||(okDate(x.date)?x.date:(o.day||today()));
    const sphere=SPHERES.includes(x.sphere)?x.sphere:(o.sphere||DEFAULT_SPHERE);
    const people=[...new Set((Array.isArray(x.people)?x.people:[]).map(mapName).filter(Boolean))];
    const item={kind,text:String(x.text||String(x.detail||"").split("\n")[0]).trim().slice(0,kind==="task"?300:600),detail:String(x.detail||""),sphere,date};
    if(kind==="task"){item.status=x.done?"done":"open";const due=okDate(x.due)?x.due:null;if(due){item.due=due}item.logged=o.day||today();if(x.list==="waiting"||x.list==="someday")item.list=x.list;if(o.taskOnDue&&due)item.date=date=due}
    if(kind==="event"){const tm=normRange(x.time);if(tm)item.time=tm}
    const evs=[...(o.linkEv?[o.linkEv]:[]),...(Array.isArray(x.events)?x.events:[]).filter(id=>o.evIds&&o.evIds.has(id))];if(evs.length)item.events=[...new Set(evs)];
    if(o.parent&&kind==="note")item.parent=o.parent;
    const quote=String(x.quote||"").trim().slice(0,240);
    const why=engDup(item,quote,o.src,o.parent);if(why){r.dup++;continue}
    const key=engKey(o.type,kind,item.list),conf=Math.max(0,Math.min(1,Number(x.confidence)||0.5));
    const newPeople=people.filter(n=>!engKnown(n));
    const p=await addProp({kind:"add",date,src:o.src,parent:o.parent||null,capture:o.capture||null,srcType:o.type,ruleKey:key,quote,confidence:conf,dueGuess:kind==="task"&&!!item.due&&x.dueGuess!==false,
      reason:(o.reason||"From "+((o.src&&o.src.name)||"text"))+(kind==="task"&&x.list==="waiting"?" · waiting on "+(x.who||"someone"):"")+(x.uncertain?" · owner unclear, check":"")+(okDate(x.date)||kind!=="note"||o.day?"":" · day not found, check it"),
      tagPeople:people,tagEvents:[],tagColls:(Array.isArray(x.collections)?x.collections:[]).map(String).filter(Boolean).slice(0,4),item});
    const rule=trustRule(key);
    if(rule&&rule.on&&conf>=0.6&&!newPeople.length&&!/veracross/i.test(sphere)&&!x.uncertain){await acceptProp(p.id,1,{auto:true});r.auto++}else r.n++}
  return r}
async function saveCapture(text,o){if(!S.db)return null;const c={id:uid("k"),type:o.type,src:o.src||{},day:o.day||null,text:String(text).slice(0,900000),at:Date.now()};upsertLocal("caps",c);await save("caps",c);return c}
async function finishCapture(c,r){c.result={n:r.n,auto:r.auto,dup:r.dup};await save("caps",c)}
function engToast(r,lead,extra){
  const bits=[];if(r.n)bits.push(r.n+" in your Inbox");if(r.auto)bits.push(r.auto+" filed for you");if(r.dup)bits.push(r.dup+" already there, skipped");if(extra)bits.push(extra);
  const m=(lead?lead+" · ":"")+(bits.join(" · ")||"nothing new to pull out");
  if(r.n||r.auto)toastGo(m,r.n?"Review":"See filed",()=>{if(!r.n)S.inboxTab="Filed for you";location.hash="#review";render()},12000);else toast(m,5000)}
/* ---------- trust: review by default, auto-file only what Ian turns on ---------- */
S.trust={rules:{},streak:{},declined:{}};
async function loadTrust(){try{const d=await S.db.doc("meta/trust").get();if(d.exists){const x=d.data()||{};S.trust={rules:x.rules||{},streak:x.streak||{},declined:x.declined||{}}}}catch(e){}}
async function saveTrust(){try{await S.db.doc("meta/trust").set(S.trust)}catch(e){}}
const trustRule=k=>S.trust.rules[k]||null;
const TRUST_N=5;
async function trustNote(p,what){
  const k=p&&p.ruleKey;if(!k)return;
  if(what==="accept"&&!p.edited)S.trust.streak[k]=(S.trust.streak[k]||0)+1;else S.trust.streak[k]=0;
  await saveTrust()}
function trustSuggestion(){return Object.keys(S.trust.streak).find(k=>S.trust.streak[k]>=TRUST_N&&!(S.trust.rules[k]&&S.trust.rules[k].on)&&!S.trust.declined[k])||null}
function trustWarning(){return Object.keys(S.trust.rules).find(k=>S.trust.rules[k].on&&(S.trust.rules[k].undos||0)>=3)||null}
async function setRule(k,on){S.trust.rules[k]={...(S.trust.rules[k]||{}),on,at:Date.now(),undos:0};if(on)delete S.trust.declined[k];S.trust.streak[k]=0;await saveTrust();render()}
async function undoAuto(pid){
  const p=S.props.find(x=>x.id===pid);if(!p)return;
  const it=p.createdId&&S.items.find(i=>i.id===p.createdId);
  if(it){S.items=S.items.filter(i=>i.id!==it.id);S._m=null;await del("items",it.id)}
  p.status="rejected";p.undone=true;await save("props",p);
  const r=p.ruleKey&&S.trust.rules[p.ruleKey];if(r){r.undos=(r.undos||0)+1;await saveTrust()}
  toast("Undone. It won't be proposed again.");render()}
function trustPanel(){
  const sug=trustSuggestion(),warn=trustWarning();let h="";
  if(sug)h+=`<div class="panel tsug"><b>Auto-file ${esc(engKeyLabel(sug).toLowerCase())}?</b> <span class="mute">You confirmed the last ${S.trust.streak[sug]} without changes.</span><div class="row" style="margin-top:6px"><button class="pri" data-act="trust" data-k="${esc(sug)}" data-v="on">Auto-file these from now on</button><button data-act="trust" data-k="${esc(sug)}" data-v="later">Not yet</button><button data-act="trust" data-k="${esc(sug)}" data-v="never">Don't ask again</button></div></div>`;
  if(warn)h+=`<div class="panel tsug"><b>Turn off auto-filing for ${esc(engKeyLabel(warn).toLowerCase())}?</b> <span class="mute">You undid ${S.trust.rules[warn].undos} of them.</span><div class="row" style="margin-top:6px"><button class="pri" data-act="trust" data-k="${esc(warn)}" data-v="off">Turn off</button><button data-act="trust" data-k="${esc(warn)}" data-v="keep">Keep it on</button></div></div>`;
  const on=ENG_KEYS.filter(k=>S.trust.rules[k]&&S.trust.rules[k].on).length;
  h+=`<details class="sec trules"${S.trustOpen?" open":""}><summary>Auto-file rules <span class="mute">${on?on+" on":"all off: everything comes here for review"}</span></summary><div class="panel" style="padding:8px 14px">
   <p class="mute dsm" style="margin:4px 0 8px">Off means it waits here for you. On means it is filed straight away and listed under “Filed for you” with Undo. Never auto-filed, whatever the rule: new people, the Veracross sphere, unclear owners, and anything the AI is unsure of.</p>
   ${ENG_KEYS.map(k=>{const r=S.trust.rules[k]||{},st=S.trust.streak[k]||0;return`<label class="trow"><input type="checkbox" data-act="trustset" data-k="${esc(k)}" ${r.on?"checked":""}> <span>${esc(engKeyLabel(k))}</span><span class="mute dsm">${r.on?(r.undos?r.undos+" undone":""):st?st+" confirmed in a row":""}</span></label>`}).join("")}</div></details>`;
  return h}

async function parseText(text,def,src){
  const fallback=def||today();const label=src.name||"Imported text";const type=/^Evernote/i.test(label)?"evernote":"import";
  const raw=await saveCapture(text,{type,src,day:def||null});
  if(!S.sample){
    const paras=text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).slice(0,60);
    for(const t of paras)await addProp({kind:"add",date:fallback,src,parent:null,srcType:type,ruleKey:engKey(type,"note"),reason:"Imported text (no AI: split by paragraph, day not inferred)",item:{kind:"note",text:t.split("\n")[0].slice(0,200),detail:t.includes("\n")||t.length>200?t:"",sphere:DEFAULT_SPHERE}});
    location.hash="#review";return}
  S.busy="Reading…";render();
  let ctx=null;
  try{const ana=await analyzeContext(text,{kind:"imported journal text or notes",title:src.name||""});ctx=await contextCheck({kind:"import",ana,text,title:src.name||"",ev:null,drafts:null})}catch(e){ctx={sphere:null,map:{},rows:[]}}
  if(!ctx){S.busy="";render();toast("Cancelled. Nothing was created.");return}
  S.busy="Reading and splitting…";render();
  try{
    const res=await engineRun({type,text,day:def||null,title:src.name||"",what:type==="evernote"?"an Evernote note":"imported journal text or notes"});
    const mapName=nm=>{const id=mapLookup(ctx,nm);return id&&id!=="skip"&&id!=="self"?pname(id):null};
    const r=await engineFile((res&&res.outputs)||[],{type,day:def||null,src,sphere:ctx.sphere||null,mapName,reason:"Split from "+label,capture:raw&&raw.id});
    if(raw)await finishCapture(raw,r);
    S.busy="";render();engToast(r,label);
  }catch(err){S.busy="";render();toast("AI split failed: "+(err.message||err.code||err))}
}
/* ---------- dynamic collections ---------- */
async function sweepCollection(id){
  const c=S.colls.find(x=>x.id===id);if(!c||!S.sample){toast("AI not available");return}
  S.busy="Sweeping items for “"+c.name+"”…";render();
  try{
    const pool=V().filter(i=>!(i.colls||[]).includes(id)).slice(-600);
    const lines=pool.map((i,n)=>n+"|"+i.date+"|"+i.text.slice(0,140));
    const out=await S.sample.json(`Collection: "${c.name}". Definition: ${c.definition||c.name}.
Pick items that belong. Each line is index|date|text. Return JSON {"matches":[{"i":index,"why":"short reason"}]}. Be selective.\n\n${lines.join("\n")}`);
    let n=0;for(const m of(out&&out.matches)||[]){const it=pool[m.i];if(!it)continue;
      await addProp({kind:"collAdd",date:it.date,targetId:it.id,collId:id,collName:c.name,reason:m.why||"",item:{text:it.text}});n++}
    c.lastRun=Date.now();await save("colls",c);toast(n+" proposed — open Review");
  }catch(e){toast("Sweep failed: "+(e.message||e.code))}
  S.busy="";render();
}
/* ---------- export ---------- */
function mdAll(){
  const L=["# Tabula export","Exported "+new Date().toISOString(),""];
  const its=V();const days=[...new Set(its.map(i=>i.date))].sort();
  const sym=i=>i.kind==="event"?"○":i.kind==="note"?"–":({open:"•",done:"×",dropped:"~"})[i.status||"open"];
  const line=i=>`- ${sym(i)} ${i.star?"★ ":""}${i.text}${i.people&&i.people.length?" "+i.people.map(p=>"@"+pname(p)).join(" "):""}${i.events&&i.events.length?" "+i.events.map(p=>"#"+ename(p)).join(" "):""}${i.due?" (due "+i.due+")":""}${carriedN(i)?" [carried from "+i.history.join(", ")+"]":""}${i.src&&i.src.name?" — source: "+i.src.name+(i.src.loc?", "+i.src.loc:"")+(i.src.link?" <"+i.src.link+">":""):""}${i.detail?"\n  "+i.detail.replace(/\n/g,"\n  "):""}`;
  L.push("## Daily logs","");
  days.forEach(d=>{L.push("### "+dlabel(d));bySphere(its.filter(i=>i.date===d)).forEach((a,s)=>{if(a.length){L.push("**"+s+"**");a.forEach(i=>L.push(line(i)))}});L.push("")});
  L.push("## People","");S.people.forEach(p=>{L.push("### "+p.name+(p.rel?" ("+p.rel+")":""));if(p.note)L.push(p.note);its.filter(i=>(i.people||[]).includes(p.id)).forEach(i=>L.push("- "+i.date+" "+i.text));L.push("")});
  L.push("## Events","");S.events.forEach(p=>{L.push("### "+p.name+(p.start?" ("+p.start+(p.end?" – "+p.end:"")+")":""));if(p.note)L.push(p.note);its.filter(i=>(i.events||[]).includes(p.id)).forEach(i=>L.push("- "+i.date+" "+i.text));L.push("")});
  L.push("## Collections","");S.colls.forEach(p=>{L.push("### "+p.name+(p.definition?" — "+p.definition:""));its.filter(i=>(i.colls||[]).includes(p.id)).forEach(i=>L.push("- "+i.date+" "+i.text));L.push("")});
  return L.join("\n");
}
async function saveFile(name,data){if(!S.dl){toast("Downloads not available here");return}try{await S.dl.save({filename:name,data});toast("Saved")}catch(e){if(e.code!=="declined")toast("Download failed: "+e.code)}}
function exportMd(){saveFile("tabula-"+today()+".md",mdAll())}
function exportJson(){saveFile("tabula-backup-"+today()+".json",JSON.stringify(backupBundle(),null,1))}
/* ---------- export: a folder of Markdown files (Obsidian-friendly) + images + full JSON backup, as one .zip ---------- */
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=~0;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return(~c)>>>0}
function makeZip(files){
  const enc=new TextEncoder(),parts=[],cen=[];let off=0;
  const d=new Date(),dt=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
  for(const f of files){
    const nm=enc.encode(f.name),data=typeof f.data==="string"?enc.encode(f.data):f.data,crc=crc32(data);
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(10,tm,true);h.setUint16(12,dt,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nm.length,true);
    parts.push(new Uint8Array(h.buffer),nm,data);
    const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(12,tm,true);c.setUint16(14,dt,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+data.length}
  const cs=cen.reduce((a,b)=>a+b.length,0),e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:"application/zip"})}
const yq=v=>JSON.stringify(String(v));
function frontmatter(o){
  const L=["---"];
  for(const[k,v]of Object.entries(o)){
    if(v===undefined||v===null||v===""||(Array.isArray(v)&&!v.length))continue;
    if(Array.isArray(v))L.push(k+":",...v.map(x=>"  - "+yq(x)));
    else if(typeof v==="number"||typeof v==="boolean")L.push(k+": "+v);
    else L.push(k+": "+yq(v))}
  L.push("---","");return L.join("\n")}
const fsafe=s=>String(s||"").replace(/[\\/:*?"<>|#^\[\]\n\r\t]+/g," ").replace(/\s+/g," ").trim().slice(0,70)||"untitled";
function backupBundle(){
  const b={format:"tabula-backup",version:1,exported:new Date().toISOString(),meta:{spheres:SPHERES.slice(),trust:S.trust,maint:S.maint||null}};
  for(const c of Object.keys(COLS))b[c]=(S[c]||[]).concat(c==="people"||c==="colls"?(S["arch_"+c]||[]):[]);
  return b}
async function buildExportFiles(withImages){
  const files=[],names=new Map(),used=new Set(),items=S.items.filter(i=>!i.archivedAt);
  const uniq=(dir,base)=>{let n=base,i=2;while(used.has(dir+"/"+n.toLowerCase()))n=base+" ("+(i++)+")";used.add(dir+"/"+n.toLowerCase());return n};
  const kdir={task:"tasks",event:"events",note:"notes"};
  for(const it of items){const dir=kdir[it.kind]||"notes";names.set(it.id,{dir,name:uniq(dir,(it.date?it.date+" ":"")+fsafe(cleanTitle(it).t))})}
  const pn=new Map();for(const p of S.people.concat(S.arch_people||[]))pn.set(p.id,uniq("people",fsafe(p.name)));
  const cn=new Map();for(const c of S.colls.concat(S.arch_colls||[]))cn.set(c.id,uniq("collections",fsafe(c.name)));
  const en=new Map();for(const e of S.events||[])en.set(e.id,uniq("topics",fsafe(e.name||e.text||e.id)));
  const link=(id)=>{if(names.has(id))return"[["+names.get(id).name+"]]";if(en.has(id))return"[["+en.get(id)+"]]";return null};
  const imgPath=new Map();
  if(withImages){for(const m of S.imgs||[]){try{const r=await fetch(imgSrc(m));if(!r.ok)continue;const buf=new Uint8Array(await r.arrayBuffer());const ext=/png/i.test(r.headers.get("content-type")||"")?"png":"jpg";const p="assets/images/"+m.id+"."+ext;imgPath.set(m.id,p);files.push({name:"Tabula/"+p,data:buf})}catch(e){}}}
  const imgsOf=it=>(S.imgs||[]).filter(m=>m.parent===it.id||(m.links||[]).includes(it.id));
  for(const it of items){
    const {dir,name}=names.get(it.id),src=it.src||{};
    const fm=frontmatter({id:it.id,kind:it.kind,title:cleanTitle(it).t,date:it.date,time:cleanTitle(it).time,due:it.due,status:it.kind==="task"?(it.status||"open"):undefined,list:it.list,star:it.star||undefined,sphere:it.sphere,
      people:(it.people||[]).map(id=>"[["+(pn.get(id)||pname(id))+"]]"),links:[...(it.events||[]),...(it.related||[])].map(link).filter(Boolean),collections:(it.colls||[]).map(id=>"[["+(cn.get(id)||id)+"]]"),
      parent:it.parent?link(it.parent):undefined,source:src.name,source_location:src.loc,source_link:src.link,quote:it.quote,journal:it.journal||undefined,main:it.main||undefined,whose:it.whose,recur:it.recur?JSON.stringify(it.recur):undefined,
      carried_from:(it.history||[]).map(h=>typeof h==="string"?h:(h&&h.date)||"").filter(Boolean),sensitive:it.sensitive||undefined,auto_filed:it.autoFiled||undefined,created:it.created?new Date(it.created).toISOString():undefined,updated:it.updated?new Date(it.updated).toISOString():undefined,tabula:"item"});
    let body="# "+cleanTitle(it).t+"\n\n"+(it.detail?String(it.detail).replace(/\[img:([^\]]+)\]/g,(m,id)=>imgPath.has(id)?"![[images/"+imgPath.get(id).split("/").pop()+"]]":m)+"\n":"");
    if(it.summary)body+="\n## Summary\n\n"+it.summary+"\n";
    const ims=imgsOf(it);if(ims.length)body+="\n## Images\n\n"+ims.map(m=>(imgPath.has(m.id)?"![["+imgPath.get(m.id).split("/").pop()+"]]":"- image "+m.id+" (not exported)")+(m.desc?"\n"+m.desc:"")).join("\n\n")+"\n";
    if(it.transcript)body+="\n## Transcript\n\n```text\n"+String(it.transcript).replace(/```/g,"'''")+"\n```\n";
    files.push({name:"Tabula/"+dir+"/"+name+".md",data:fm+body})}
  const byDay=new Map();for(const it of items){if(!it.date)continue;if(!byDay.has(it.date))byDay.set(it.date,[]);byDay.get(it.date).push(it)}
  for(const[d,arr]of byDay){
    const sec=(k,label)=>{const a=arr.filter(i=>i.kind===k);if(!a.length)return"";return"## "+label+"\n\n"+a.map(i=>(k==="task"?"- ["+(i.status==="done"?"x":i.status==="dropped"?"-":" ")+"] ":"- ")+(cleanTitle(i).time&&k==="event"?cleanTitle(i).time+" ":"")+"[["+names.get(i.id).name+"]]").join("\n")+"\n\n"};
    files.push({name:"Tabula/journal/"+d.slice(0,4)+"/"+d.slice(5,7)+"/"+d+".md",data:frontmatter({date:d,tabula:"day"})+"# "+d+"\n\n"+sec("event","Events")+sec("task","Tasks")+sec("note","Notes")})}
  const backlinks=(field,id)=>items.filter(i=>(i[field]||[]).includes(id)).sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(i=>"- "+(i.date||"")+" [["+names.get(i.id).name+"]]").join("\n");
  for(const p of S.people.concat(S.arch_people||[]))files.push({name:"Tabula/people/"+pn.get(p.id)+".md",data:frontmatter({id:p.id,name:p.name,aliases:p.akas,relationship:p.rel,context:p.context,area:p.area,email:p.email,phone:p.phone,company:p.company,role:p.role,self:p.isSelf||undefined,archived:p.archivedAt?true:undefined,tabula:"person"})+"# "+p.name+"\n\n"+(p.note||"")+"\n\n## Appears in\n\n"+backlinks("people",p.id)+"\n"});
  for(const c of S.colls.concat(S.arch_colls||[]))files.push({name:"Tabula/collections/"+cn.get(c.id)+".md",data:frontmatter({id:c.id,name:c.name,definition:c.definition,tabula:"collection"})+"# "+c.name+"\n\n"+(c.note||"")+"\n\n## Items\n\n"+backlinks("colls",c.id)+"\n"});
  for(const e of S.events||[])files.push({name:"Tabula/topics/"+en.get(e.id)+".md",data:frontmatter({id:e.id,name:e.name||e.text,tabula:"event-topic"})+"# "+(e.name||e.text||e.id)+"\n\n"+(e.note||"")+"\n\n## Items\n\n"+backlinks("events",e.id)+"\n"});
  for(const k of S.caps||[])files.push({name:"Tabula/captures/"+new Date(k.at||Date.now()).toISOString().slice(0,10)+" "+fsafe((k.src&&k.src.name)||k.type)+" "+k.id+".md",data:frontmatter({id:k.id,type:k.type,day:k.day,source:k.src&&k.src.name,source_location:k.src&&k.src.loc,source_link:k.src&&k.src.link,captured:new Date(k.at||0).toISOString(),tabula:"capture"})+k.text+"\n"});
  files.push({name:"Tabula/data/tabula-backup.json",data:JSON.stringify(backupBundle(),null,1)});
  files.push({name:"Tabula/README.md",data:`# Tabula export\n\nExported ${new Date().toISOString()}.\n\nOpen this folder as an Obsidian vault, or read it in any text editor. Every record is a Markdown file with YAML frontmatter; links use [[wiki links]].\n\n- journal/YYYY/MM/YYYY-MM-DD.md: one file per day, linking that day's events, tasks and notes\n- tasks/, events/, notes/: one file per item (frontmatter holds id, dates, status, sphere, people, source)\n- people/, collections/, topics/: one file per person, collection and event topic, with backlinks\n- captures/: imported text kept verbatim, the source of what was split out\n- assets/images/: the images attached to items\n- data/tabula-backup.json: the complete data, for restoring into Tabula (Data page, Import)\n`});
  return files}
async function exportZip(withImages){
  if(S.busy)return;S.busy="Building the export…";render();
  try{const files=await buildExportFiles(withImages);const blob=makeZip(files);S.busy="";render();await saveFile("tabula-"+today()+".zip",blob);
    try{localStorage.setItem("tabula_lastexport",String(Date.now()))}catch(e){}}
  catch(e){S.busy="";render();toast("Export failed: "+(e.message||e))}}

/* ---------- Evernote (manual) ---------- */
async function evServer(){const lt=await S.mcp.listTools();const srv=lt.servers.find(x=>/evernote/i.test(x.server));if(!srv)throw{code:"server_not_connected"};return srv.server}
function pickKey(props,re,fallback){const k=Object.keys(props||{}).find(x=>re.test(x));return k||fallback}
async function evSearch(){
  const q=g("evq").value.trim(),box=g("evres");if(!q)return;
  if(!S.mcp){box.textContent="Connectors not available here.";return}
  box.textContent="Searching…";
  try{
    const sv=await evServer();const d=await S.mcp.describeTool(sv,"search_notes").catch(()=>null);
    const props=d&&d.inputSchema&&d.inputSchema.properties;const k=pickKey(props,/^(query|text|search|keywords?)$/i,"query");
    const r=(await S.mcp.callTool(sv,"search_notes",{[k]:q})).payload;
    const list=(r&&(r.notes||r.results||r.items))||(Array.isArray(r)?r:[]);
    if(!list.length){box.textContent="No notes found.";return}
    box.innerHTML=list.slice(0,15).map(n=>{const id=n.guid||n.id||n.noteId,t=n.title||n.name||"(untitled)";return`<div class="it"><div class="mid"><div class="ttl">${esc(t)}</div></div><button data-act="evpull" data-nid="${esc(id)}" data-t="${esc(t)}">Propose entries</button></div>`}).join("");
  }catch(e){box.textContent="Evernote search failed: "+(e.code||e.message)}
}
async function evPull(id,title){
  try{
    S.busy="Reading note…";render();
    const sv=await evServer();const d=await S.mcp.describeTool(sv,"get_note").catch(()=>null);
    const props=d&&d.inputSchema&&d.inputSchema.properties;const k=pickKey(props,/note.*(id|guid)|^(id|guid)$/i,"noteId");
    const r=(await S.mcp.callTool(sv,"get_note",{[k]:id})).payload;
    let text=typeof r==="string"?r:(r&&(r.content||r.body||r.text))||JSON.stringify(r);
    text=String(text).replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ");
    const m=(title||"").match(/(\d{4}-\d{2}-\d{2})/);
    await parseText(text,m?m[1]:today(),{name:"Evernote: "+title,loc:"",link:"evernote://view-note/"+id});
  }catch(e){toast("Evernote read failed: "+(e.code||e.message))}
  S.busy="";render();
}
async function snapshot(){
  const ym=g("snapm").value.trim();if(!/^\d{4}-\d{2}$/.test(ym))return toast("Use YYYY-MM");
  if(!S.mcp)return toast("Connectors not available");
  const items=V().filter(i=>monthOf(i.date)===ym);if(!items.length)return toast("No items that month");
  const days=[...new Set(items.map(i=>i.date))].sort();
  const html=days.map(d=>`<h2>${esc(dlabel(d))}</h2><ul>${sortItems(items.filter(i=>i.date===d),"snap").map(i=>`<li>${i.kind==="event"?"⚪ ":i.kind==="task"?(i.status==="done"?"[x] ":"[ ] "):""}${i.star?"⭐ ":""}${esc(i.text)}</li>`).join("")}</ul>`).join("");
  try{
    const sv=await evServer();const desc=await S.mcp.describeTool(sv,"create_note").catch(()=>null);
    const props=(desc&&desc.inputSchema&&desc.inputSchema.properties)||{title:1,content:1};
    const input={};if(props.title)input.title="Snapshot "+ym+" (from Tabula)";
    for(const k of["content","body","text","html"])if(props[k]){input[k]=html;break}
    await S.mcp.callTool(sv,"create_note",input);toast("Snapshot note created in Evernote");
  }catch(e){toast("Snapshot failed: "+(e.code||e.message))}
}
/* ---------- AI quick-edit icon on text fields ---------- */
(function(){
  const css=document.createElement("style");
  css.textContent=`
  #aiq-btn{position:fixed;z-index:25;width:24px;height:24px;padding:0;border-radius:7px;border:1px solid var(--line);background:var(--bg);color:var(--acc);font-size:13px;line-height:1;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:var(--shadow)}
  #aiq-btn:hover,#aiq-btn.on{background:var(--accbg)}
  #aiq-btn.busy{opacity:.7;cursor:progress}
  #aiq-menu{position:fixed;z-index:26;min-width:190px;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:5px;box-shadow:0 6px 24px rgba(0,0,0,.18);display:none}
  #aiq-menu .h{font-size:11px;color:var(--mute);padding:5px 8px 2px;text-transform:uppercase;letter-spacing:.04em}
  #aiq-menu button{display:block;width:100%;text-align:left;border:0;background:transparent;color:var(--ink);padding:6px 8px;border-radius:6px;cursor:pointer;font:inherit}
  #aiq-menu button:hover{background:var(--soft)}
  #aiq-menu hr{border:0;border-top:1px solid var(--line);margin:4px 0}`;
  document.head.appendChild(css);
  const btn=document.createElement("button");btn.id="aiq-btn";btn.type="button";btn.title="AI quick edit";btn.setAttribute("aria-label","AI quick edit");btn.textContent="✨";
  const menu=document.createElement("div");menu.id="aiq-menu";
  document.body.appendChild(btn);document.body.appendChild(menu);

  const ACTS={
    format:["Formatting review","Review the structure of this text and apply Markdown, changing ONLY structure and markers, never the words. For each passage decide whether it is a heading (use #, ## or ###), a bulleted list (\"- \"), a numbered list (\"1. \"), a multi-level list (indent child items by two spaces under their parent, mixing bullets and numbers where natural), a to-do list (\"- [ ] \" open, \"- [x] \" done), a short quote (\"> \"), or a phrase that deserves **bold**. Convert existing symbols and cues (•, –, ○, 1), a., (a), indentation, ALL-CAPS lines, bold or underlined lines used as headings) into proper Markdown. Put a blank line between paragraphs and leave plain prose as paragraphs. Do not summarize, reword, reorder or drop anything.",true],
    dict:["Tidy dictation","Clean up speech-to-text: remove filler words and false starts, fix punctuation, capitalization and obvious mis-hearings, and break it into short paragraphs. Keep the speaker's own wording, meaning and first person.",false],
    tidy:["Light edit (grammar)","Fix grammar, spelling, punctuation and capitalization only. Do not change wording, tone, structure or length otherwise.",false],
    clear:["Rewrite for clarity","Rewrite for clarity: simpler, more direct sentences, same meaning, same voice, roughly the same length.",false],
    short:["Make shorter","Rewrite to be about half as long while keeping every key fact, name, date and decision.",false],
    long:["Make longer","Expand slightly with smoother connecting language and a little more explicit detail. Do not invent facts, names, dates or events that are not in the text.",false]
  };
  const SYS="You edit text typed into a personal planner and journal app. Preserve the writer's voice, first person, names, dates, times, numbers, URLs, #tags, @mentions, checkbox markers and any [img:...] tokens exactly as written. Never add commentary, quotes or explanations; add Markdown headings, lists or emphasis only when the task is about formatting. Reply with the edited text only.";

  let cur=null,busy=false,saved={};
  const multi=el=>el.tagName==="TEXTAREA";
  function eligible(el){
    if(!el||el.readOnly||el.disabled||!el.closest)return false;
    if(el.id==="aiq-btn"||el.closest("#aiq-menu"))return false;
    if(el.tagName==="TEXTAREA")return el.id!=="trta";
    if(el.tagName!=="INPUT")return false;
    if(el.type&&el.type!=="text")return false;
    if(el.dataset.pick||el.dataset.act||el.hasAttribute("list"))return false;
    return el.matches(".qa,[data-f=text],#n_t,#e_text,#ask_in");
  }
  function place(){
    if(!cur||!document.contains(cur)){hide();return}
    const r=cur.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight||r.width<80){btn.style.display="none";return}
    btn.style.display="flex";
    const x=Math.min(r.right-28,innerWidth-30);
    const y=multi(cur)?Math.min(r.bottom-28,innerHeight-30):r.top+(r.height-24)/2;
    btn.style.left=Math.max(4,x)+"px";btn.style.top=Math.max(4,y)+"px";
    if(menu.style.display==="block"){const b=btn.getBoundingClientRect();const mh=menu.offsetHeight;
      menu.style.left=Math.max(6,Math.min(b.right-menu.offsetWidth,innerWidth-menu.offsetWidth-6))+"px";
      menu.style.top=(b.bottom+4+mh>innerHeight?Math.max(6,b.top-mh-4):b.bottom+4)+"px"}
  }
  function pad(el,on){
    if(on){if(el.dataset.aiPad===undefined){el.dataset.aiPad=el.style.paddingRight||"";el.style.paddingRight="32px"}}
    else if(el.dataset.aiPad!==undefined){el.style.paddingRight=el.dataset.aiPad;delete el.dataset.aiPad}
  }
  function closeMenu(){menu.style.display="none";btn.classList.remove("on")}
  function hide(){closeMenu();btn.style.display="none";if(cur&&document.contains(cur))pad(cur,false);cur=null}
  function show(el){if(cur&&cur!==el&&document.contains(cur))pad(cur,false);cur=el;pad(el,true);closeMenu();place()}

  function openMenu(){
    const m=multi(cur);
    let h="";
    if(m){h+='<div class="h">Structure</div><button data-k="format">'+ACTS.format[0]+'</button><hr>'}
    h+='<div class="h">Edit</div>'+["tidy","dict","clear","short","long"].map(k=>`<button data-k="${k}">${ACTS[k][0]}</button>`).join("");
    if(window.getSelection&&cur.selectionStart!==cur.selectionEnd)h+='<div class="h" style="text-transform:none">Applies to selected text</div>';
    menu.innerHTML=h;menu.style.display="block";btn.classList.add("on");place();
  }

  async function run(k){
    const el=cur;closeMenu();
    if(!el||!document.contains(el))return;
    if(!S.sample){toast("AI isn't available in this view");return}
    if(busy)return;
    const hasSel=el.selectionStart!=null&&el.selectionStart!==el.selectionEnd;
    const a=el.selectionStart,b=el.selectionEnd,full=el.value;
    const src=hasSel?full.slice(a,b):full;
    if(!src.trim()){toast("Nothing to edit yet");return}
    busy=true;btn.classList.add("busy");btn.textContent="…";
    try{
      const r=await S.sample(`${SYS}\n\nTask: ${ACTS[k][1]}\n\nText to edit (between the markers):\n<<<\n${src}\n>>>\n\nReply with the edited text only.`,{modelTier:(k==="format"||k==="dict")?"default":"quick",cache:false});
      let out=(r.text||"").trim().replace(/^<<<\s*/,"").replace(/\s*>>>$/,"");
      if(!out){toast("No change returned");return}
      if(!document.contains(el)){toast("The field changed while the AI was working. Try again.");return}
      if(el.value!==full){toast("You edited the text meanwhile. Try again.");return}
      const next=hasSel?full.slice(0,a)+out+full.slice(b):out;
      el.value=next;
      el.dispatchEvent(new Event("input",{bubbles:true}));
      if(!el.classList.contains("qa"))el.dispatchEvent(new Event("change",{bubbles:true}));
      if(multi(el)&&typeof growTa==="function"&&el.closest(".nedit"))growTa(el);
      toastUndo(ACTS[k][0]+" done",()=>{if(!document.contains(el))return;el.value=full;el.dispatchEvent(new Event("input",{bubbles:true}));if(!el.classList.contains("qa"))el.dispatchEvent(new Event("change",{bubbles:true}))});
      place();
    }catch(e){
      if(e&&e.code==="not_granted")toast("AI isn't allowed here");
      else if(e&&e.code==="rate_limited")toast("AI is busy. Try again in a moment.");
      else toast("AI edit failed");
    }finally{busy=false;btn.classList.remove("busy");btn.textContent="✨";place()}
  }

  // keep focus in the field when pressing the icon or menu
  [btn,menu].forEach(n=>n.addEventListener("mousedown",e=>e.preventDefault()));
  btn.addEventListener("click",e=>{e.stopPropagation();if(busy)return;menu.style.display==="block"?closeMenu():openMenu()});
  menu.addEventListener("click",e=>{const b=e.target.closest("button[data-k]");if(!b)return;e.stopPropagation();run(b.dataset.k)});
  document.addEventListener("focusin",e=>{const t=e.target;if(eligible(t))show(t);else if(!(t.closest&&(t.closest("#aiq-menu")||t.id==="aiq-btn")))hide()});
  document.addEventListener("focusout",e=>{if(busy)return;setTimeout(()=>{const a=document.activeElement;if(!a||!eligible(a))hide()},120)});
  document.addEventListener("input",e=>{if(e.target===cur)place()});
  document.addEventListener("mouseup",e=>{if(menu.style.display==="block"&&!e.target.closest("#aiq-menu")&&e.target!==btn)closeMenu()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.style.display==="block"){closeMenu()}},true);
  addEventListener("scroll",place,true);addEventListener("resize",place);
  new MutationObserver(()=>{if(cur&&!document.contains(cur)){hide()}}).observe(document.body,{childList:true,subtree:true});
})();
/* ---------- markdown (all long text is Markdown; legacy • bullets still render as lists) ---------- */
function mdInline(it,s){
  const h=it?linkTerms(it,s):esc(s);
  return h.split(/(<[^>]+>)/).map((p,i)=>i%2?p:p
    .replace(/`([^`]+)`/g,"<code>$1</code>")
    .replace(/\*\*([^*]+?)\*\*/g,"<b>$1</b>")
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g,"$1<i>$2</i>")
    .replace(/~~([^~]+?)~~/g,"<s>$1</s>")
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(https:\/\/[^\s<)]+)/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>')
  ).join("");
}
/* Markdown display mode: "formatted" (default) opens filled fields formatted and shows titles formatted; "markdown" always shows the raw Markdown */
try{S.mdMode=localStorage.getItem("tabula_mdmode")||"formatted"}catch(e){S.mdMode="formatted"}
function mdStart(id,val,store){if(store&&id&&store[id]!==undefined)return!!store[id];return S.mdMode!=="markdown"&&!!String(val||"").trim()}
function mdTitle(it,raw){return S.mdMode==="markdown"?linkTerms(it,raw):mdInline(it,raw)}
const mdStrip=s=>String(s||"").replace(/\[([^\]]+)\]\((https:[^)\s]+)\)/g,"$1").replace(/\*\*|~~|`/g,"").replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g,"$1$2");
function mdBar(on){return`<div class="mdbar"><button type="button" class="mdtog" data-act="mdtog" title="Switch between the Markdown text and the formatted view">${on?"Markdown":"Formatted"}</button></div>`}
function mdRender(it,src){
  const L=String(src||"").replace(/\r/g,"").split("\n"),out=[],st=[];let para=[],quote=[];
  const inl=s=>mdInline(it,s);
  const fp=()=>{if(para.length){out.push("<p>"+para.map(inl).join("<br>")+"</p>");para=[]}};
  const fq=()=>{if(quote.length){out.push("<blockquote>"+quote.map(inl).join("<br>")+"</blockquote>");quote=[]}};
  const cl=n=>{while(st.length>n)out.push("</li></"+st.pop().t+">")};
  const isLi=l=>/^\s*([-*+•]|\d+[.)])\s+\S/.test(l);
  for(let i=0;i<L.length;i++){const l=L[i];
    if(!l.trim()){fp();fq();let j=i+1;while(j<L.length&&!L[j].trim())j++;if(!(st.length&&j<L.length&&isLi(L[j])))cl(0);continue}
    let m=l.match(/^(#{1,4})\s+(.*)$/);
    if(m){fp();fq();cl(0);out.push("<h"+m[1].length+">"+inl(m[2])+"</h"+m[1].length+">");continue}
    if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)){fp();fq();cl(0);out.push("<hr>");continue}
    m=l.match(/^>\s?(.*)$/);
    if(m){fp();cl(0);quote.push(m[1]);continue}
    m=l.match(/^(\s*)([-*+•]|\d+[.)])\s+(.*)$/);
    if(m&&m[3].trim()!==""){fp();fq();
      const ind=m[1].replace(/\t/g,"    ").length,t=/\d/.test(m[2])?"ol":"ul";
      while(st.length&&st[st.length-1].ind>ind)out.push("</li></"+st.pop().t+">");
      const top=st[st.length-1];
      if(top&&top.ind===ind){if(top.t===t)out.push("</li><li>");else{out.push("</li></"+st.pop().t+"><"+t+"><li>");st.push({t,ind})}}
      else{out.push("<"+t+"><li>");st.push({t,ind})}
      let body=m[3];const cb=body.match(/^\[( |x|X)\]\s+(.*)$/);
      if(cb)body=(cb[1]===" "?"☐ ":"☑ ")+cb[2];
      out.push(mdInline(it,body));continue}
    if(st.length&&/^\s+\S/.test(l)){out.push("<br>"+mdInline(it,l.trim()));continue}
    fq();cl(0);para.push(l)}
  fp();fq();cl(0);return out.join("")}
const mdPlain=s=>String(s||"").replace(/^\s*(#{1,4}\s+|[-*+•]\s+|\d+[.)]\s+|>\s?)/gm,"").replace(/\*\*|~~|`/g,"");
function mdField(id,val,minh){const on=mdStart(null,val);return`<div class="mdwrap">${mdBar(on)}<textarea id="${id}" style="min-height:${minh||56}px" ${on?"hidden":""}>${esc(val||"")}</textarea><div class="mdp mkd" ${on?"":"hidden"}>${on?inlineImgs(mdRender(null,val),1):""}</div></div>`}
function mdToggle(el){
  const w=el.closest(".mdwrap");if(!w)return;
  const ta=w.querySelector("textarea"),pv=w.querySelector(".mdp"),btn=w.querySelector("[data-act=mdtog]");if(!ta||!pv)return;
  if(pv.hidden){const xp=w.closest(".exp"),it=xp?S.items.find(i=>i.id===xp.dataset.xid):null;
    pv.innerHTML=inlineImgs(mdRender(it,ta.value),1)||'<span class="mute">Nothing yet.</span>';pv.hidden=false;ta.hidden=true;if(btn)btn.textContent="Markdown"}
  else{pv.hidden=true;ta.hidden=false;if(btn)btn.textContent="Formatted";ta.focus();if(typeof growTa==="function"&&ta.closest(".nedit"))growTa(ta)}
  if(w.dataset.mdkey){S.mdPrev=S.mdPrev||{};S.mdPrev[w.dataset.mdkey]=!pv.hidden}
  const xp2=w.closest(".exp");if(xp2){if(ta.dataset.f==="summary"){S.sumEdit=S.sumEdit||{};S.sumEdit[xp2.dataset.xid]=pv.hidden}else if(ta.dataset.f==="detail"){S.mdPrev=S.mdPrev||{};S.mdPrev[xp2.dataset.xid]=!pv.hidden}}
}

/* ---------- capture: one box for a quick add or a long dictated journal entry ---------- */
const CAPKEY="bj_capdraft";
const wordsOf=t=>(String(t).trim().match(/\S+/g)||[]).length;
const journalish=t=>{const w=wordsOf(t),ln=String(t).trim().split(/\n+/).length;return w>=40||(ln>=3&&w>=12)};
function toastGo(m,label,fn,ms){const t=document.getElementById("toast");t.innerHTML=esc(m)+' <button id="tgo" style="margin-left:8px">'+esc(label)+'</button>';t.style.display="block";clearTimeout(toast.t);document.getElementById("tgo").onclick=()=>{t.style.display="none";fn()};toast.t=setTimeout(()=>t.style.display="none",ms||10000)}
function wireDict(){
  if(!S.dict||S.dictWired)return;S.dictWired=true;
  S.dict.onPartial(({text})=>{const l=g("cap_l");if(l&&S.capUi)l.textContent=text||""});
  S.dict.onFinal(({text})=>{const u=S.capUi;if(!u||!u.ta||!document.contains(u.ta))return;const t=u.ta,s=String(text||"").trim();if(!s)return;
    t.value=(t.value&&!/\s$/.test(t.value)?t.value+" ":t.value)+s;u.dictated=true;const l=g("cap_l");if(l)l.textContent="";
    t.dispatchEvent(new Event("input",{bubbles:true}));t.scrollTop=t.scrollHeight});
  S.dict.onState(({state})=>{const u=S.capUi;if(!u)return;u.rec=state==="listening";const m=g("cap_m");if(m){m.classList.toggle("live",u.rec);m.textContent=u.rec?"Stop":"🎙 Dictate"}if(!u.rec){const l=g("cap_l");if(l)l.textContent=""}});
}
function openNew(kind,day){
  const d0=day||(S.view==="daily"?S.date:today());
  let pill=["task","event","note","journal"].includes(kind)?kind:"auto";
  let draft="";try{draft=localStorage.getItem(CAPKEY)||""}catch(_){}
  const P=[["auto","Auto"],["task","Task"],["event","Event"],["note","Note"],["journal","Journal entry"]];
  const PH={auto:"Type or dictate anything.\n\nA short line (“Starbucks 7–12 with Jen”) becomes a task, event or note. A longer ramble is saved whole as a journal entry, then sorted into events, tasks and notes.",task:"A task, due date, people…",event:"Event, date and time, people…",note:"A note or idea. Markdown works: - bullets, 1. numbers, ## headings.",journal:"Talk or type as long as you like. I'll save it whole, tag the people in it, then pull out events, tasks and notes for your Inbox."};
  openModal(`<div class="row" style="margin-bottom:6px"><h3 style="margin:0;flex:1">Capture</h3><button type="button" id="cap_x" class="lnk" aria-label="Close">✕</button></div>
  <div class="cap-pills" id="cap_p">${P.map(([v,l])=>`<button type="button" data-p="${v}" class="${pill===v?"on":""}">${l}</button>`).join("")}</div>
  <textarea id="cap_t" placeholder="${esc(PH[pill])}" autocomplete="off"></textarea>
  <div class="cap-live" id="cap_l"></div>
  <div class="cap-bar">${S.dict?`<button type="button" id="cap_m" class="cap-mic">🎙 Dictate</button>`:""}<span class="cap-hint" id="cap_h"></span><span class="sp"></span><span class="cap-hint" id="cap_n"></span></div>
  <div class="row cap-go"><button class="pri" id="cap_ok">Add</button><button type="button" id="cap_raw" title="Save the text exactly as a note, without sorting it">Save only, no sorting</button><span class="sp"></span><button type="button" id="cap_c">Cancel</button></div>
  <div class="cap-opts"><label>Day</label><input type="date" id="n_d" value="${d0}"><label>Sphere</label><select id="n_s" onchange="this.dataset.set=1"><option value="">Pick automatically</option>${SPHERES.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>`,1);
  g("mbox").classList.add("capbox");
  const ta=g("cap_t"),ui=S.capUi={rec:false,dictated:false,ta};
  wireDict();
  const refresh=()=>{const t=ta.value,w=wordsOf(t),jr=pill==="journal"||(pill==="auto"&&journalish(t));
    ta.placeholder=PH[pill];g("cap_n").textContent=w?w+" word"+(w===1?"":"s"):"";
    g("cap_ok").textContent=jr?(S.sample?"Save entry & sort":"Save entry"):"Add";
    g("cap_h").textContent=!t.trim()?(S.dict?"":"Tip: tap the 🎙 key on your keyboard to dictate."):jr?(S.sample?"Saved whole as a journal entry. Events, tasks and notes in it go to your Inbox.":"Saved whole as a journal entry."):pill==="auto"?"Quick add: I'll work out whether it's a task, event or note.":"";
    g("cap_raw").style.display=(t.trim()&&jr&&S.sample)?"":"none"};
  if(draft){ta.value=draft}
  refresh();if(draft)g("cap_h").textContent="Restored your unsent draft.";
  let tm=null;ta.addEventListener("input",()=>{refresh();clearTimeout(tm);tm=setTimeout(()=>{try{ta.value.trim()?localStorage.setItem(CAPKEY,ta.value):localStorage.removeItem(CAPKEY)}catch(_){}},250)});
  g("cap_p").onclick=e=>{const b=e.target.closest("button[data-p]");if(!b)return;pill=b.dataset.p;[...g("cap_p").children].forEach(x=>x.classList.toggle("on",x===b));refresh();ta.focus()};
  const submit=async raw=>{const text=ta.value.trim();if(!text)return;clearTimeout(tm);
    const day=g("n_d").value||d0,sph=g("n_s").dataset.set?(g("n_s").value||undefined):undefined;
    const jr=pill==="journal"||(pill==="auto"&&journalish(text));
    try{localStorage.removeItem(CAPKEY)}catch(_){}
    const dictated=ui.dictated;closeModal();
    if(jr||(pill==="note"&&journalish(text))){await captureJournal(text,{day,sphere:sph,dictated,ai:!!(jr&&!raw&&S.sample)});return}
    await addQuick(text,day,sph,pill==="auto"?undefined:pill)};
  g("cap_ok").onclick=()=>submit(false);g("cap_raw").onclick=()=>submit(true);
  g("cap_c").onclick=g("cap_x").onclick=()=>{clearTimeout(tm);const keep=ta.value.trim();try{keep?localStorage.setItem(CAPKEY,ta.value):localStorage.removeItem(CAPKEY)}catch(_){}closeModal();if(keep)toast("Draft kept. It will be here when you tap + again.",3500)};
  ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.isComposing){const t=ta.value;if(e.metaKey||e.ctrlKey||(!e.shiftKey&&pill!=="journal"&&!/\n/.test(t)&&!journalish(t))){e.preventDefault();submit(false)}}});
  const mic=g("cap_m");
  if(mic)mic.onclick=()=>{if(ui.rec){S.dict.stop();return}ta.focus();S.dict.start().catch(err=>{const c=err&&err.code;if(c==="not_granted")toast("Microphone access was declined.");else if(c!=="dismissed")toast("Couldn't start dictation.")})};
  ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);
}
async function captureJournal(text,o){
  const day=o.day||today(),first=text.split("\n")[0].replace(/^#+\s*/,"").trim();
  const sent=(first.match(/^(.{12,90}?[.!?])(\s|$)/)||[])[1];
  const title=sent||(first.slice(0,70)+(first.length>70?"…":""))||"Journal entry";
  const it={id:uid("i"),kind:"note",text:title,detail:text,date:day,sphere:o.sphere||DEFAULT_SPHERE,people:[],events:[],related:[],colls:[],created:Date.now(),history:[],journal:true,src:{name:"Journal entry",loc:o.dictated?"dictated":"typed"}};
  if(day===today())it.loggedAt=localIso();
  await saveItem(it);await autoTag(it);
  if(!o.ai){toast("Journal entry saved");return}
  toast("Saved. Sorting out events, tasks and notes…",30000);
  const lo=addDays(day,-10),hi=addDays(day,45);
  const evs=V().filter(i=>i.kind==="event"&&i.date>=lo&&i.date<=hi).slice(0,120);
  let res=null;
  try{res=await engineRun({type:"journal",text,day,events:evs,what:"a spoken or typed journal entry"})}
  catch(e){toast("Saved. Sorting didn't work ("+((e&&e.code)||"error")+"), but the entry is safe.",6000);return}
  res=res||{outputs:[]};
  if(res.title)it.text=res.title.slice(0,100);
  if(!o.sphere&&SPHERES.includes(res.sphere))it.sphere=res.sphere;
  const known=new Set(it.people||[]);(res.people||[]).forEach(n=>{const l=String(n).toLowerCase();const p=S.people.find(x=>x.name.toLowerCase()===l);if(p)known.add(p.id)});it.people=[...known];
  const r=await engineFile(res.outputs,{type:"journal",day,taskOnDue:true,src:{name:"Journal entry",loc:it.text},parent:it.id,sphere:it.sphere,evIds:new Set(evs.map(e=>e.id)),reason:"From your journal entry “"+it.text+"”"});
  it.events=[...new Set([...(it.events||[]),...r.matched])];
  await saveItem(it);
  const m=new Set(r.matched).size;
  engToast(r,"Entry saved",m?"linked to "+m+" existing event"+(m===1?"":"s"):"");
}
document.addEventListener("mousedown",e=>{if(e.target.closest&&e.target.closest(".nedit .tb button,.mdbar button"))e.preventDefault()});
document.addEventListener("keydown",e=>{
  if(e.key!=="c"||e.metaKey||e.ctrlKey||e.altKey||e.isComposing)return;
  const t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
  if(document.getElementById("modal").classList.contains("on"))return;
  e.preventDefault();openNew(undefined,S.view==="daily"?S.date:today())});
document.addEventListener("click",async e=>{const b=e.target.closest&&e.target.closest("[data-act='pundo'],[data-act='trust']");if(!b)return;
  if(b.dataset.act==="pundo"){const c=b.closest("[data-pid]");if(c)await undoAuto(c.dataset.pid);return}
  const k=b.dataset.k,v=b.dataset.v;
  if(v==="on")await setRule(k,true);
  else if(v==="off")await setRule(k,false);
  else if(v==="keep"){S.trust.rules[k].undos=0;await saveTrust();render()}
  else if(v==="later"){S.trust.streak[k]=0;await saveTrust();render()}
  else if(v==="never"){S.trust.declined[k]=Date.now();S.trust.streak[k]=0;await saveTrust();render()}});
document.addEventListener("change",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.act==="trustset")setRule(t.dataset.k,t.checked)});
document.addEventListener("toggle",e=>{if(e.target&&e.target.classList&&e.target.classList.contains("trules"))S.trustOpen=e.target.open},true);
/* ---------- boot ---------- */
(function(){
  try{const w=localStorage.getItem("bj-sw");if(w)document.documentElement.style.setProperty("--sw",w+"px")}catch(e){}
  const rs=document.getElementById("rs");if(!rs)return;
  rs.addEventListener("pointerdown",e=>{e.preventDefault();rs.classList.add("drag");rs.setPointerCapture(e.pointerId);
    const mv=ev=>{const w=Math.max(180,Math.min(480,ev.clientX));document.documentElement.style.setProperty("--sw",w+"px");rs._w=w};
    const up=()=>{rs.classList.remove("drag");rs.removeEventListener("pointermove",mv);rs.removeEventListener("pointerup",up);try{if(rs._w)localStorage.setItem("bj-sw",rs._w)}catch(e){}};
    rs.addEventListener("pointermove",mv);rs.addEventListener("pointerup",up)});
})();

/* ---------- phone helpers ---------- */
function paintBnav(){
  /* Phone tab bar (docs/DESIGN.md): Today, Tasks, New, Inbox, More. */
  const n=document.getElementById("bnav");if(!n)return;
  const pend=(S.props||[]).filter(p=>p.status==="pending").length;
  const v=S.view;
  const tabs=[["day:"+today(),"today","Today",["daily","month","year"].includes(v)],["list:tasks","tasks","Tasks",v==="list"&&S.arg==="tasks"],["cap","plus","New",false],["review","inbox","Inbox",v==="review",pend]];
  n.innerHTML=tabs.map(([h,i,l,a,c])=>h==="cap"?`<a href="#" class="capb" data-act="capture"><span class="i">${ic(i)}</span>${l}</a>`:`<a href="#${h}" class="${a?"on":""}"><span class="i">${ic(i)}</span>${c?`<span class="n">${c>99?"99+":c}</span>`:""}${l}</a>`).join("")+`<a href="#" data-mside="1"><span class="i">${ic("menu")}</span>More</a>`;
}
document.addEventListener("click",e=>{
  const m=document.getElementById("mmenu");
  const t=e.target.closest("[data-act=mmore],[data-act=mctl],[data-mside]");
  if(t&&t.dataset.act==="mmore"){e.preventDefault();e.stopPropagation();if(m&&m.classList.contains("open"))m.classList.remove("open");else{paintTop0();const m2=document.getElementById("mmenu");if(m2)m2.classList.add("open")}return}
  {const sm=document.getElementById("smenu");if(sm&&sm.classList.contains("open")&&!e.target.closest("[data-act=smenu]"))setTimeout(()=>sm.classList.remove("open"),0)}
  if(!e.target.closest("[data-act=imenu]"))document.querySelectorAll(".imenu.open").forEach(x=>setTimeout(()=>x.classList.remove("open"),0));
  if(m&&m.classList.contains("open")&&!e.target.closest("[data-act=mmore]"))setTimeout(()=>m.classList.remove("open"),0);
  if(t&&t.dataset.act==="mctl"){e.preventDefault();e.stopPropagation();S.mctl=!S.mctl;paintContent();return}
  if(t&&t.dataset.mside){e.preventDefault();e.stopPropagation();document.getElementById("side").classList.toggle("open");return}
  if(window.matchMedia("(max-width:700px)").matches){const sd=document.getElementById("side");if(sd.classList.contains("open")&&!e.target.closest("#side"))sd.classList.remove("open");}
},true);
(function(){
  // give every filter panel a phone toggle and mark its rows
  const fix=()=>{document.querySelectorAll("#content .ctlp").forEach(p=>{
    p.classList.toggle("mopen",!!S.mctl);
    p.querySelectorAll(":scope>.ctlr").forEach(r=>{const l=(r.querySelector(".ctll")||{}).textContent||"";r.classList.toggle("cshow",/^(show|sweeps)$/i.test(l.trim()));r.classList.toggle("cswp",/^sweeps$/i.test(l.trim()));r.classList.toggle("fx",/^filter$/i.test(l.trim()))});
    if(!p.querySelector(":scope>.mtog")){
      const n=[...p.querySelectorAll(".ctlr.fx input,.ctlr.fx select")].filter(x=>x.value).length;
      const b=document.createElement("button");b.className="mob mtog";b.dataset.act="mctl";
      b.textContent=S.mctl?"Hide filters & view ▴":"Filters & view"+(n?" ("+n+" on)":"")+" ▾";p.prepend(b)}
  })};
  const c=document.getElementById("content");new MutationObserver(fix).observe(c,{childList:true});
})();
async function boot(){
  route();
  const use=async n=>{try{return await window.claude.use(n)}catch(e){return null}};
  S.db=await use("db");
  if(!S.db){S.loadErr="Database unavailable in this view — open the journal in Claude to use it.";render();return}
  [S.sample,S.mcp,S.dl,S.dict,S.assets]=await Promise.all([use("sample"),use("mcp"),use("downloads"),use("dictation"),use("assets")]);
  subscribe();
}
boot();
