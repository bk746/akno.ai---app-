/* ============================ APPLICATION ============================ */
const LS='akno_demo_v3';
const $=s=>document.querySelector(s);
const I=(n,w=20,st='')=>`<svg class="s" width="${w}" height="${w}" style="${st}"><use href="#${n}"/></svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ini=n=>n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const AV=(t,s=40)=>`<div class="av" style="width:${s}px;height:${s}px;font-size:${Math.round(s*.36)}px">${esc(t)}</div>`;
const LOGO=`<svg width="34" height="25" style="color:#fff;display:block"><use href="#mark"/></svg>`;
const ACC=`<button class="av" style="width:40px;height:40px;font-size:14px" data-go="#/reglages" aria-label="Compte">${PROFIL.initiales}</button>`;
const RB=(i,attr='',lbl='')=>`<button class="rb" ${attr} aria-label="${lbl}">${I(i,20)}</button>`;
const STL={a_rappeler:'À rappeler',rappele:'Rappelé',rdv_pris:'RDV pris',renseigne:'Renseigné'};
const JOURS=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const cap=s=>s[0].toUpperCase()+s.slice(1);
const hm=d=>{d=new Date(d);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const sod=d=>{d=new Date(d);d.setHours(0,0,0,0);return d};
const dd=(a,b)=>Math.round((sod(a)-sod(b))/864e5);
const dlabel=d=>{const n=dd(d,new Date());return n==0?'Aujourd\'hui':n==-1?'Hier':n==1?'Demain':JOURS[new Date(d).getDay()]+' '+new Date(d).getDate()+' '+MOIS[new Date(d).getMonth()]};
const MC=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const rdvTxt=d=>{d=new Date(d);return cap(JOURS[d.getDay()].slice(0,3))+'. '+d.getDate()+' '+MC[d.getMonth()]+' · '+hm(d)};
const prenom=n=>n.split(' ')[0];
const telHref=t=>'tel:'+t.replace(/\s/g,'').replace(/^0/,'+33');

/* ---------- état & persistance ---------- */
let DB;
function load(){try{const s=JSON.parse(localStorage.getItem(LS)||'null');if(s&&s.calls&&s.rdvs){DB=s;return}}catch(e){}reset(false)}
function reset(t=true){const cl=JSON.parse(JSON.stringify(DEMO_CALLS));DB={rdvs:cl.filter(c=>c.rdv_date).map(c=>({id:'r'+c.id,call_id:c.id,nom_client:c.nom_client,telephone_client:c.telephone_client,motif:c.motif,rdv_date:c.rdv_date,duree:60,adresse:c.adresse,ville:c.ville,note:''})),chat:[],calls:cl,unseen:[...DEMO_UNSEEN],notif:{nouveaux:true,urgents:true,resume:false}};save();if(t)toast('Données de démo réinitialisées')}
function save(){try{localStorage.setItem(LS,JSON.stringify(DB))}catch(e){}}
const byId=id=>DB.calls.find(c=>c.id==id);
const sorted=()=>[...DB.calls].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
function setStatut(id,s){const c=byId(id);if(!c||c.statut==s)return;c.statut=s;save();toast(s=='rappele'?prenom(c.nom_client)+' marqué rappelé':'Statut : '+STL[s])}
function seen(id){const i=DB.unseen.indexOf(+id);if(i>-1){DB.unseen.splice(i,1);save()}}

/* ---------- toast ---------- */
let tt;function toast(m,err){const t=$('#toast');t.innerHTML=I(err?'flame':'check',16,'stroke-width:2.2;color:'+(err?'#FB7185':'#5B8CFF'))+esc(m);t.classList.add('sh');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('sh'),2000)}

/* ---------- UI state ---------- */
const UI={q:'',f:'tous',cq:'',week:null,day:null};

/* ---------- navbar ---------- */
const TABS=[['resume','t-home','Résumé'],['appels','t-phone','Appels'],['agenda','t-cal','Agenda'],['assistant','t-ai','Assistant'],['reglages','t-gear','Réglages']];
const TABS_D=[TABS[0],TABS[1],TABS[2],TABS[3],['clients','t-users','Clients'],TABS[4]];
function nav(active){const n=DB.unseen.length;
 $('#tab').innerHTML=TABS.map(([k,i,l])=>`<button class="tbb ${k==active?'on':''}" data-go="#/${k}" aria-label="${l}"><span style="position:relative;display:block;height:22px"><svg><use href="#${i}"/></svg>${k=='appels'&&n?`<b class="bdg">${n}</b>`:''}</span>${l}</button>`).join('')}

/* ---------- composants ---------- */
const SIG='#FF6B6B';
const URGB=`<span class="sg urg2"><i class="sd" style="background:${SIG}"></i>Urgent</span>`;
const badgeStat=c=>c.statut=='a_rappeler'?`<span class="sg"><i class="sd" style="background:${SIG}"></i>À rappeler</span>`:c.statut=='rappele'?`<span class="sg">${I('check',12,'stroke-width:2.4')}Rappelé</span>`:c.statut=='rdv_pris'?'<span class="sg"><i class="sd" style="background:#5B8CFF"></i>RDV pris</span>':'<span class="sg"><i class="sd" style="background:#5E5E64"></i>Renseigné</span>';
const barC=c=>({rdv_pris:'#5B8CFF',a_rappeler:'#E27A7A',rappele:'#5A5A5E',renseigne:'#3A3A3C'})[c.statut];
function row(c){const u=c.urgence=='urgent',nw=DB.unseen.includes(c.id);
 return `<div class="sw ${UI.sel==c.id&&isD()?'sel':''}" data-id="${c.id}"><div class="acts"><button data-act="note" style="width:74px;background:#2C2C2E">${I('note',20)}Note</button><button data-act="done" style="width:84px;background:#fff;color:#000;font-weight:700">${I('check',20,'stroke-width:2.2')}Rappelé</button></div>
 <div class="k fg"><i class="bar" style="background:${barC(c)}"></i><div class="f" style="gap:12px">${AV(ini(c.nom_client),40)}<div class="fl"><div class="f sp"><span class="f" style="gap:8px;font-size:16px;font-weight:600;min-width:0"><span class="ell">${esc(c.nom_client)}</span>${u&&c.statut=='a_rappeler'||nw?`<i class="dot" style="width:7px;height:7px;background:${nw&&!u?'#5B8CFF':'var(--ro)'}"></i>`:''}</span>${c.statut=='a_rappeler'?badgeStat(c):`<span class="t2" style="font-size:13px;flex:none">${hm(c.created_at)}</span>`}</div><div class="t2 ell" style="font-size:13px;margin-top:2px">${esc(c.ville)} · ${c.statut=='a_rappeler'?hm(c.created_at):c.code_postal}</div></div></div>
 <div class="f" style="gap:6px;margin-top:12px;padding-left:52px"><span class="chip">${esc(c.motif)}</span>${u?URGB:''}<span class="fl"></span>${c.statut=='a_rappeler'?`<a class="rpb" href="${telHref(c.telephone_client)}" data-stop>${I('phone',15,'stroke-width:2')}Rappeler</a>`:badgeStat(c)}<button class="qk dq" data-act="note" title="Ajouter une note" aria-label="Ajouter une note">${I('note',14)}</button>${c.statut=='a_rappeler'?`<button class="qk" data-act="done" title="Marquer rappelé" aria-label="Marquer rappelé">${I('check',15,'stroke-width:2.2')}</button>`:''}</div></div></div>`}
function grouped(list){let out='',last='';list.forEach(c=>{const l=dlabel(c.created_at);if(l!=last){const n=list.filter(x=>dlabel(x.created_at)==l).length;out+=`<div class="lab f sp" style="margin:${last?14:4}px 4px 10px"><span>${l}</span><span>${n}</span></div>`;last=l}out+=row(c)});return out||'<div class="empty">Aucun appel trouvé</div>'}

/* ---------- Résumé ---------- */
function vResume(){const now=new Date(),wk=DB.calls.filter(c=>dd(c.created_at,now)>-7),T=wk.length;
 const cnt=s=>wk.filter(c=>c.statut==s).length;
 const seg=[[cnt('rdv_pris'),'#5B8CFF','RDV pris'],[cnt('a_rappeler'),'#F43F5E','À rappeler'],[cnt('renseigne'),'#D1D1D6','Renseignés'],[cnt('rappele'),'#5A5A5E','Rappelés']];
 const R=46,C=2*Math.PI*R;let off=0;
 const ring=seg.map(([v,c])=>{if(!v)return'';const L=Math.max(C*v/T-3,0.1);const s=`<circle cx="56" cy="56" r="${R}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${L} ${C}" stroke-dashoffset="${-off}"/>`;off+=C*v/T;return s}).join('');
 const traites=T?Math.round((T-cnt('a_rappeler'))/T*100):0,conv=T?Math.round(cnt('rdv_pris')/T*100):0;
 const sp=[6,5,4,3,2,1,0].map(i=>DB.calls.filter(c=>dd(c.created_at,now)==-i).length),mx=Math.max(...sp,1),sx=i=>i*14,sy=v=>30-v/mx*26;
 const spl=`<svg width="84" height="34" style="overflow:visible;flex:none"><path d="M${sp.map((v,i)=>sx(i)+' '+sy(v)).join(' L')}" fill="none" stroke="#E6E6E6" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${sx(6)}" cy="${sy(sp[6])}" r="3" fill="#fff"/></svg>`;
 const td=sp[6];
 const pr=sorted().find(c=>c.urgence=='urgent'&&c.statut=='a_rappeler');
 const ago=c=>{const m=Math.round((now-new Date(c.created_at))/6e4);return m<60?'il y a '+m+' min':m<1440?'il y a '+Math.round(m/60)+' h':dlabel(c.created_at)};
 const nx=RDVS().filter(c=>c.rdv_date&&new Date(c.rdv_date)>now).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date))[0];
 let nxl='';if(nx){const m=Math.round((new Date(nx.rdv_date)-now)/6e4);nxl=m<60?'dans '+m+' min':dd(nx.rdv_date,now)==0?'dans '+Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'):dlabel(nx.rdv_date)}
 return `<div class="top">${LOGO}<div class="f" style="gap:10px">${RB('bell','data-go="#/appels"','Nouveaux appels')}${ACC}</div></div>
 <div style="margin:6px 0 16px"><div class="t2" style="font-size:15px">${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]}</div><div class="h1" style="margin-top:2px">Bonjour ${PROFIL.prenom}</div></div>
 ${pr?`<div class="k" style="padding:16px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(244,63,94,.28)" data-go="#/appel/${pr.id}"><div class="f sp"><span class="lab" style="color:#FB7185">Action prioritaire</span><span class="t2" style="font-size:12px">${ago(pr)}</span></div>
 <div class="f" style="gap:12px;margin-top:12px">${AV(ini(pr.nom_client),44)}<div class="fl"><div class="ell" style="font-size:16px;font-weight:600">${esc(pr.nom_client)}</div><div class="t2 ell" style="font-size:13px;margin-top:2px">Urgent · ${esc(pr.motif)}</div></div><a class="bw" style="padding:0 14px" href="${telHref(pr.telephone_client)}" data-stop>${I('phone',18,'stroke-width:2')}Rappeler</a></div></div>`
 :`<div class="k f" style="padding:16px;gap:12px"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('check',18,'stroke-width:2.2')}</div><div><div style="font-size:15px;font-weight:600">Aucune urgence en attente</div><div class="t2" style="font-size:13px;margin-top:2px">Tous les appels urgents sont traités</div></div></div>`}
 <div class="k" style="padding:16px;margin-top:12px;cursor:pointer" data-go="#/appels"><div class="f" style="gap:18px"><div style="position:relative;width:112px;height:112px;flex:none"><svg width="112" height="112" style="transform:rotate(-90deg)"><circle cx="56" cy="56" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="9"/>${ring}</svg>
 <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:28px;font-weight:700;letter-spacing:-.04em">${T}</span><span class="t2" style="font-size:11px">appels · 7 j</span></div></div>
 <div class="fl">${seg.map(([v,c,l])=>`<div class="f" style="gap:8px;height:24px"><i style="width:8px;height:8px;border-radius:3px;background:${c}"></i><span class="t2 fl" style="font-size:13px">${l}</span><span style="font-size:14px;font-weight:600">${v}</span></div>`).join('')}</div></div>
 <div class="f sp" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line);gap:10px"><div><div style="font-size:13px;font-weight:600">${traites} % traités <span class="t2" style="font-weight:400">· ${conv} % en RDV</span></div><div style="font-size:12px;color:#5B8CFF;margin-top:3px">${td} appel${td>1?'s':''} aujourd'hui</div></div>${spl}</div></div>
 <div class="lab" style="margin:22px 4px 10px">Prochain rendez-vous</div>
 ${nx?`<div class="k f" style="padding:14px 16px;gap:14px;overflow:hidden;position:relative;cursor:pointer" data-rdv="${nx.id}"><i style="position:absolute;left:0;top:14px;bottom:14px;width:3px;border-radius:0 3px 3px 0;background:#5B8CFF"></i><div style="width:70px;flex:none"><div style="font-size:17px;font-weight:700">${hm(nx.rdv_date)}</div><div style="font-size:11px;color:#5B8CFF;margin-top:2px;font-weight:600;white-space:nowrap">${nxl}</div></div><div class="fl"><div class="ell" style="font-size:16px;font-weight:600">${esc(nx.nom_client)}</div><div class="t2 ell" style="font-size:13px;margin-top:3px">${esc(nx.motif)} · ${esc(nx.ville)}</div></div><a class="rb" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nx.adresse)}" target="_blank" rel="noopener" data-stop aria-label="Itinéraire">${I('nav',20)}</a></div>`:'<div class="k empty" style="padding:22px">Aucun rendez-vous à venir</div>'}`}

/* ---------- Appels ---------- */
const FIL={tous:c=>true,a_rappeler:c=>c.statut=='a_rappeler',rappele:c=>c.statut=='rappele',urgent:c=>c.urgence=='urgent'};
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const match=(c,q)=>{if(!q)return true;q=norm(q);return [c.nom_client,c.ville,c.motif,c.code_postal,c.besoin_detail].some(v=>norm(v).includes(q))||c.telephone_client.replace(/\s/g,'').includes(q.replace(/\s/g,''))};
function appelsList(){const L=sorted().filter(c=>match(c,UI.q));
 const P=[['tous','Tous'],['a_rappeler','À rappeler'],['rappele','Rappelés'],['urgent','Urgents']];
 $('#pills').innerHTML=P.map(([k,l])=>`<button class="pill ${UI.f==k?'on':''}" data-f="${k}">${k=='urgent'?'<i class="dot" style="background:var(--ro)"></i>':''}${l} · ${L.filter(FIL[k]).length}</button>`).join('');
 const F=L.filter(FIL[UI.f]);
 if(UI.f=='tous'||UI.f=='urgent'){const A=F.filter(c=>c.statut=='a_rappeler'),B=F.filter(c=>c.statut!='a_rappeler');
  $('#list').innerHTML=LEG+(A.length?`<div class="shd red"><span class="f" style="gap:8px"><i class="dot" style="background:#F43F5E;width:8px;height:8px"></i>À rappeler</span><b>${A.length}</b></div>${A.map(row).join('')}`:'<div class="shd ok"><span>Aucun appel à rappeler</span></div>')+(B.length?`<div class="shd"><span>Traités</span><b>${B.length}</b></div>`+grouped(B):'')}
 else $('#list').innerHTML=(UI.f=='a_rappeler'?`<div class="shd red"><span class="f" style="gap:8px"><i class="dot" style="background:#F43F5E;width:8px;height:8px"></i>À rappeler</span><b>${F.length}</b></div>`:'')+grouped(F)}
const LEG=`<div class="leg"><span><i class="dot" style="background:#F43F5E"></i>À rappeler</span><span><i class="dot" style="background:#5B8CFF"></i>RDV pris</span><span>${I('check',12,'stroke-width:2.4')}Rappelé</span><span class="lu">${I('flame',11,'stroke-width:2.4')}Urgent</span></div>`;
function vAppels(){const n=DB.unseen.length;
 return `<div class="top">${LOGO}<div class="f" style="gap:10px">${RB('users','data-go="#/clients"','Clients')}${ACC}</div></div>
 <div class="f sp" style="margin:6px 0 14px;align-items:flex-end"><div class="h1">Appels</div><span class="t2" style="font-size:13px;padding-bottom:5px">${n?n+' nouveau'+(n>1?'x':''):'À jour'}</span></div>
 <label class="srch">${I('search',18)}<input id="q" type="search" placeholder="Client, ville, motif, téléphone…" value="${esc(UI.q)}" autocomplete="off"></label>
 <div class="pills" id="pills"></div><div id="list"></div>`}

/* ---------- Détail ---------- */
function vDetail(id){const c=byId(id);if(!c)return '<div class="empty">Appel introuvable</div>';
 const info=(ic,k,v,href)=>`<${href?'a href="'+href+'" target="_blank" rel="noopener"':'div'} class="irow"><div class="tile" ${ic=='cal'?'style="background:rgba(91,140,255,.14);color:#5B8CFF"':''}>${I(ic,17)}</div><div class="fl"><div class="t2" style="font-size:12px">${k}</div><div style="font-size:15px;font-weight:500;margin-top:2px">${v}</div></div>${href?I('chev',16,'color:var(--t3)'):''}</${href?'a':'div'}>`;
 const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse);
 const rv=RDVS().filter(r=>r.call_id==c.id).sort((a,b)=>new Date(b.rdv_date)-new Date(a.rdv_date))[0];
 return `<div class="top">${RB('back','data-act="back"','Retour')}<span style="font-size:15px;font-weight:600;margin-left:50px" class="t2">Appel · ${hm(c.created_at)}</span><div class="f" style="gap:10px">${RB('more','data-act="share"','Copier le numéro')}${ACC}</div></div>
 <div class="f" style="gap:14px;margin:6px 0 16px">${AV(ini(c.nom_client),56)}<div class="fl"><div class="ell" style="font-size:24px;font-weight:700;letter-spacing:-.03em">${esc(c.nom_client)}</div><div class="f" style="gap:6px;margin-top:6px">${c.urgence=='urgent'?URGB:''}<span class="chip">${esc(c.motif)}</span><span class="t2" style="font-size:12px;margin-left:2px">${dlabel(c.created_at)}</span></div></div></div>
 <div class="f" style="gap:8px;margin-bottom:14px"><a class="sec" href="sms:${c.telephone_client.replace(/\s/g,'')}">${I('msg',18)}SMS</a><a class="sec" href="mailto:${c.email_client}?subject=${encodeURIComponent(PROFIL.entreprise+' – votre demande')}">${I('mail',18)}E-mail</a><a class="sec" href="${maps}" target="_blank" rel="noopener">${I('nav',18)}Itinéraire</a></div>
 <div style="padding:1px;border-radius:22px;background:linear-gradient(135deg,#5B8CFF88,rgba(255,255,255,.08) 55%)"><div style="border-radius:21px;background:#18181B;padding:14px 16px">
 <div class="f sp"><span class="f" style="gap:8px;font-size:13px;font-weight:600"><svg width="18" height="13" style="color:#fff"><use href="#mark"/></svg>Résumé IA</span><span style="font-size:12px;color:var(--t3)">${esc(c.duree||'')}</span></div>
 <div style="font-size:15px;line-height:21px;margin-top:10px;color:#E4E4E7">${esc(c.resume)}</div></div></div>
 <div class="k" style="padding:2px 16px;margin-top:12px">
 ${rv?`<div class="irow" data-rdv="${rv.id}" style="cursor:pointer"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('cal',17)}</div><div class="fl"><div class="t2" style="font-size:12px">${new Date(rv.rdv_date)<new Date()?'Rendez-vous passé':'Rendez-vous confirmé'}</div><div style="font-size:15px;font-weight:500;margin-top:2px">${rdvTxt(rv.rdv_date)} · ${esc(rv.motif)}</div></div>${I('chev',16,'color:var(--t3)')}</div><div class="sep"></div>`:`<div class="irow" data-act="addrdv" data-call="${c.id}" style="cursor:pointer"><div class="tile">${I('plus',17)}</div><div class="fl" style="font-size:15px;font-weight:500">Planifier un rendez-vous</div>${I('chev',16,'color:var(--t3)')}</div><div class="sep"></div>`}
 ${info('phone','Téléphone',esc(c.telephone_client),telHref(c.telephone_client))}<div class="sep"></div>
 ${info('pin','Adresse',esc(c.adresse),maps)}<div class="sep"></div>
 ${info('spark','Besoin',esc(c.besoin_detail))}<div class="sep"></div>
 <div class="irow" style="align-items:flex-start"><div class="tile">${I('note',17)}</div><div class="fl"><div class="t2 f sp" style="font-size:12px">Note<span id="nsv" style="color:var(--t3);opacity:0;transition:opacity .3s">Enregistré</span></div><textarea class="nt" id="ntxt" rows="1" placeholder="Ajouter une note…">${esc(c.note)}</textarea></div></div></div>
 <div class="lab" style="margin:18px 4px 8px">Statut</div>
 <div class="seg" id="seg">${['a_rappeler','rappele','rdv_pris','renseigne'].map(s=>`<button class="${c.statut==s?'on':''}" data-st="${s}">${STL[s]}</button>`).join('')}</div>
 <div style="height:90px"></div>`}
const detailFoot=c=>`<div style="position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(rgba(10,10,11,0),#0A0A0B 50%);z-index:7;pointer-events:none"></div><a class="bw" href="${telHref(c.telephone_client)}" data-act="call" style="position:absolute;left:20px;right:20px;bottom:calc(env(safe-area-inset-bottom) + 96px);z-index:8;height:54px;border-radius:18px;font-size:17px">${I('phone',18,'stroke-width:2')}Rappeler ${esc(prenom(c.nom_client))}</a>`;

/* ---------- Agenda ---------- */
const monday=d=>{d=sod(d);const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return d};
function vAgenda(){const now=new Date();if(!UI.week)UI.week=monday(now);if(!UI.day){const t=sod(now);UI.day=t.getDay()==0?new Date(+UI.week):t}
 const days=[...Array(6)].map((_,i)=>{const d=new Date(UI.week);d.setDate(d.getDate()+i);return d});
 const rdvs=d=>RDVS().filter(c=>c.rdv_date&&dd(c.rdv_date,d)==0).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date));
 const mid=days[2];const H=56,h0=8,h1=19;
 const today=dd(UI.day,now)==0,nowH=now.getHours()+now.getMinutes()/60;
 const list=rdvs(UI.day);
 return `<div class="top">${LOGO}<div class="f" style="gap:10px">${RB('cal','data-act="today"','Aujourd\'hui')}${RB('plus','data-act="addrdv"','Nouveau RDV')}${ACC}</div></div>
 <div class="f sp" style="margin:6px 0 14px;align-items:flex-end"><div class="h1">Agenda</div><div class="f" style="gap:4px;padding-bottom:2px"><button class="rb" style="width:30px;height:30px;border-radius:10px" data-act="wprev" aria-label="Semaine précédente">${I('back',16)}</button><span class="t2" style="font-size:15px;min-width:112px;text-align:center">${cap(MOIS[mid.getMonth()])} ${mid.getFullYear()}</span><button class="rb" style="width:30px;height:30px;border-radius:10px" data-act="wnext" aria-label="Semaine suivante">${I('chev',16)}</button></div></div>
 <div class="f" style="gap:8px">${days.map(d=>{const n=rdvs(d).length,on=dd(d,UI.day)==0;return `<button class="day ${on?'on':''} ${dd(d,now)==0?'td':''}" data-day="${+d}"><span class="dn">${JOURS[d.getDay()].slice(0,3)}</span><span style="font-size:17px;font-weight:700">${d.getDate()}</span><span class="f" style="gap:2px;height:5px">${'<i style="width:5px;height:5px;border-radius:50%;background:#5B8CFF"></i>'.repeat(Math.min(n,4))}</span></button>`}).join('')}</div>
 <div class="f sp" style="margin:18px 4px 6px"><span class="lab">${dlabel(UI.day)}</span><span class="t2" style="font-size:12px">${list.length?list.length+' rendez-vous':'Aucun rendez-vous'}</span></div>
 <div style="position:relative;height:${(h1-h0)*H+10}px;margin-top:14px">
 ${[...Array(h1-h0+1)].map((_,i)=>`<div style="position:absolute;left:0;right:0;top:${i*H-7}px;display:flex;align-items:center;gap:10px"><span style="width:38px;font-size:11px;color:var(--t3);text-align:right">${h0+i}:00</span><div style="flex:1;height:1px;background:rgba(255,255,255,.06)"></div></div>`).join('')}
 ${list.map(c=>{const d=new Date(c.rdv_date),s=d.getHours()+d.getMinutes()/60,past=d.getTime()+c.duree*6e4<now;return `<div class="blk ${past?'past':''}" data-rdv="${c.id}" style="top:${(s-h0)*H+2}px;height:${Math.max(c.duree/60*H-4,40)}px"><i class="bar" style="background:#5B8CFF"></i><div class="f sp" style="gap:8px"><span class="ell" style="font-size:14px;font-weight:600">${hm(d)} · ${esc(c.nom_client)}</span><span style="font-size:11px;font-weight:500;color:#A1A1AA;flex:none">${esc(c.motif)}</span></div><div class="ell" style="font-size:12px;color:#A1A1AA;margin-top:3px">${esc(c.adresse)}</div></div>`}).join('')}
 ${today&&nowH>=h0&&nowH<=h1?`<div style="position:absolute;left:44px;right:0;top:${(nowH-h0)*H}px;height:0;z-index:3"><div style="position:absolute;left:0;top:-4px;width:8px;height:8px;border-radius:50%;background:#fff"></div><div style="position:absolute;left:4px;right:0;top:-.75px;height:1.5px;background:#fff"></div><span style="position:absolute;left:-46px;top:-8px;font-size:11px;font-weight:700;color:#fff;background:#141416;padding:0 3px;border-radius:4px">${hm(now)}</span></div>`:''}
 </div>`}

/* ---------- Clients ---------- */
function clients(){const m=new Map();sorted().forEach(c=>{const k=c.telephone_client;if(!m.has(k))m.set(k,{...c,calls:[]});m.get(k).calls.push(c)});return [...m.values()]}
function clientsList(){const L=clients().filter(c=>match(c,UI.cq));
 $('#clist').innerHTML=L.length?`<div class="k" style="padding:4px 0">${L.map((c,i)=>`${i?'<div class="sep" style="margin-left:68px"></div>':''}<div class="lrow" data-go="#/client/${encodeURIComponent(c.telephone_client)}">${AV(ini(c.nom_client),40)}<div class="fl"><div class="ell" style="font-size:16px;font-weight:600">${esc(c.nom_client)}</div><div class="t2 ell" style="font-size:13px;margin-top:2px">${esc(c.ville)} · ${c.calls.length} appel${c.calls.length>1?'s':''}</div></div><span class="t2" style="font-size:12px">${dlabel(c.created_at).replace(/ \d+ \w+$/,'')}</span>${I('chev',16,'color:var(--t3)')}</div>`).join('')}</div>`:'<div class="empty">Aucun client trouvé</div>'}
function vClients(){return `<div class="top">${LOGO}${ACC}</div>
 <div class="f sp" style="margin:6px 0 14px;align-items:flex-end"><div class="h1">Clients</div><span class="t2" style="font-size:13px;padding-bottom:5px">${clients().length} clients</span></div>
 <label class="srch" style="margin-bottom:16px">${I('search',18)}<input id="cq" type="search" placeholder="Nom, ville, téléphone…" value="${esc(UI.cq)}" autocomplete="off"></label><div id="clist"></div>`}
function vClient(tel){const c=clients().find(x=>x.telephone_client==tel);if(!c)return '<div class="empty">Client introuvable</div>';
 return `<div class="top">${RB('back','data-act="back"','Retour')}<span style="font-size:15px;font-weight:600;margin-left:0" class="t2">Fiche client</span>${ACC}</div>
 <div class="f" style="gap:14px;margin:6px 0 16px">${AV(ini(c.nom_client),56)}<div class="fl"><div class="ell" style="font-size:24px;font-weight:700;letter-spacing:-.03em">${esc(c.nom_client)}</div><div class="t2" style="font-size:13px;margin-top:4px">${esc(c.ville)} · ${c.code_postal}</div></div></div>
 <div class="f" style="gap:8px;margin-bottom:14px"><a class="sec" href="${telHref(c.telephone_client)}">${I('phone',18)}Appeler</a><a class="sec" href="sms:${c.telephone_client.replace(/\s/g,'')}">${I('msg',18)}SMS</a><a class="sec" href="mailto:${c.email_client}">${I('mail',18)}E-mail</a></div>
 <div class="k" style="padding:2px 16px;margin-bottom:18px"><div class="irow"><div class="tile">${I('phone',17)}</div><div class="fl"><div class="t2" style="font-size:12px">Téléphone</div><div style="font-size:15px;font-weight:500;margin-top:2px">${esc(c.telephone_client)}</div></div></div><div class="sep"></div><div class="irow"><div class="tile">${I('mail',17)}</div><div class="fl"><div class="t2" style="font-size:12px">E-mail</div><div class="ell" style="font-size:15px;font-weight:500;margin-top:2px">${esc(c.email_client)}</div></div></div><div class="sep"></div><div class="irow"><div class="tile">${I('pin',17)}</div><div class="fl"><div class="t2" style="font-size:12px">Adresse</div><div style="font-size:15px;font-weight:500;margin-top:2px">${esc(c.adresse)}</div></div></div></div>
 <div class="lab" style="margin:0 4px 10px">Historique · ${c.calls.length} appel${c.calls.length>1?'s':''}</div>${grouped(c.calls)}`}

/* ---------- Réglages ---------- */
function vReglages(){const tg=(k,l,s)=>`<div class="lrow" data-tg="${k}" style="cursor:pointer"><div class="fl"><div style="font-size:15px;font-weight:500">${l}</div><div class="t2" style="font-size:12px;margin-top:2px">${s}</div></div><span class="tg ${DB.notif[k]?'on':''}"></span></div>`;
 return `<div class="top">${LOGO}${ACC}</div>
 <div class="h1" style="margin:6px 0 16px">Réglages</div>
 <div class="k f" style="padding:16px;gap:14px">${AV(PROFIL.initiales,56)}<div class="fl"><div style="font-size:18px;font-weight:700">${PROFIL.prenom} ${PROFIL.nom}</div><div class="t2" style="font-size:13px;margin-top:3px">${PROFIL.entreprise} · ${PROFIL.ville}</div><div class="t2" style="font-size:12px;margin-top:2px">${PROFIL.metier}</div></div></div>
 <div class="lab" style="margin:22px 4px 10px">Réceptionniste Akno</div>
 <div class="k" style="padding:4px 0"><div class="lrow" style="cursor:default"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('phone',17)}</div><div class="fl"><div style="font-size:15px;font-weight:500">Numéro Akno</div><div class="t2" style="font-size:12px;margin-top:2px">Renvoi d'appel actif</div></div><span style="font-size:14px;font-weight:600">${PROFIL.numero_akno}</span></div><div class="sep" style="margin-left:66px"></div>
 <div class="lrow" style="cursor:default"><div class="tile">${I('spark',17)}</div><div class="fl"><div style="font-size:15px;font-weight:500">Statut de l'assistant</div><div class="t2" style="font-size:12px;margin-top:2px">Répond 24 h/24, 7 j/7</div></div><span class="f" style="gap:6px;font-size:13px;font-weight:600;color:#5B8CFF"><i class="dot" style="background:#5B8CFF"></i>Actif</span></div></div>
 <button class="k lrow" data-go="#/clients" style="width:100%;margin-top:12px"><div class="tile">${I('users',17)}</div><div class="fl" style="text-align:left"><div style="font-size:15px;font-weight:500">Clients</div><div class="t2" style="font-size:12px;margin-top:2px">${clients().length} fiches clients</div></div>${I('chev',16,'color:var(--t3)')}</button>
 <div class="lab" style="margin:22px 4px 10px">Notifications</div>
 <div class="k" style="padding:4px 0">${tg('nouveaux','Nouveaux appels','Alerte à chaque appel traité')}<div class="sep" style="margin-left:16px"></div>${tg('urgents','Appels urgents','Alerte prioritaire, même en silencieux')}<div class="sep" style="margin-left:16px"></div>${tg('resume','Résumé quotidien','Chaque soir à 19:00')}</div>
 <div class="lab" style="margin:22px 4px 10px">Démo</div>
 <button class="k" data-act="reset" style="width:100%;height:52px;font-size:15px;font-weight:600;color:#FB7185">Réinitialiser les données de démo</button>
 <div class="t2" style="text-align:center;font-size:12px;margin-top:18px;color:var(--t3)">Akno · version démo · données fictives</div>`}

/* ---------- routeur ---------- */
let curTab='resume',lastHash='';
function mRoute(){const h=location.hash||'#/resume',[,v,p]=h.split('/');const pushed=['appel','client'].includes(v);
 let html,tab=v,foot='';
 if(v=='appel'){seen(p);html=vDetail(p);tab='appels';const c=byId(p);if(c)foot=detailFoot(c)}
 else if(v=='client'){html=vClient(decodeURIComponent(p));tab='clients'}
 else{tab=TITLES[v]?v:'resume';html={resume:vResume,appels:vAppels,agenda:vAgenda,clients:vClients,reglages:vReglages,assistant:vAssist}[tab]()}
 $('#view').innerHTML=`<div class="scr ${pushed?'push':'in'}" id="scr">${html}</div>${foot}`;
 $('#fd').style.display=v=='appel'?'none':'';
 nav(tab=='clients'?'appels':tab);curTab=tab;lastHash=h;
 if(tab=='appels'&&v!='appel')appelsList();
 if(tab=='clients'&&v!='client')clientsList();
 if(v=='appel')autoGrow();
 if(tab=='assistant')feedList();
 if(tab=='agenda'){const n=new Date(),s=$('#scr');s.scrollTop=0}}
function refresh(){if(isD())return route();const s=$('#scr'),y=s?s.scrollTop:0;route();const n=$('#scr');n.classList.remove('in','push');n.scrollTop=y}
const autoGrow=()=>{const t=$('#ntxt');if(t){t.style.height='auto';t.style.height=t.scrollHeight+'px'}};

/* ---------- note sheet ---------- */
function noteSheet(id){const c=byId(id);$('#sheet').innerHTML=`<div class="sheet-bg" data-act="closes"></div><div class="sheet"><div style="width:36px;height:5px;border-radius:3px;background:rgba(255,255,255,.2);margin:0 auto 14px"></div><div style="font-size:17px;font-weight:700">Note · ${esc(c.nom_client)}</div><textarea id="snote" placeholder="Ajouter une note…">${esc(c.note)}</textarea><button class="bw" style="width:100%;height:50px" data-act="savenote" data-id="${id}">Enregistrer</button></div>`;
 requestAnimationFrame(()=>{$('.sheet-bg').classList.add('sh');$('.sheet').classList.add('sh');setTimeout(()=>$('#snote').focus(),300)})}
function closeSheet(){const b=$('.sheet-bg'),s=$('.sheet');if(!s)return;b.classList.remove('sh');s.classList.remove('sh');setTimeout(()=>$('#sheet').innerHTML='',300)}

/* ---------- événements ---------- */
let drag=null,suppress=false;
document.addEventListener('click',e=>{
 if(suppress){suppress=false;e.preventDefault();e.stopPropagation();return}
 const t=e.target;const act=t.closest('[data-act]'),go=t.closest('[data-go]'),stop=t.closest('[data-stop]');
 // fermer les lignes ouvertes
 document.querySelectorAll('.sw.op').forEach(s=>{if(!s.contains(t)){s.classList.remove('op');s.querySelector('.fg').style.transform=''}});
 if(stop){if(stop.href&&stop.href.startsWith('tel:'))toast('Appel en cours…');e.stopPropagation();return}
 const sw=t.closest('.sw');
 if(act){const a=act.dataset.act,id=sw?sw.dataset.id:act.dataset.id;
  if(a=='done'){e.preventDefault();setStatut(id,'rappele');refresh();return}
  if(a=='note'){e.preventDefault();sw.classList.remove('op');sw.querySelector('.fg').style.transform='';noteSheet(id);return}
  if(a=='savenote'){const c=byId(id);c.note=$('#snote').value.trim();save();closeSheet();toast('Note enregistrée');refresh();return}
  if(a=='closes'){closeSheet();return}
  if(a=='back'){if(history.length>1&&lastNav)history.back();else location.hash=location.hash.startsWith('#/client')?'#/clients':'#/appels';return}
  if(a=='call'){toast('Appel en cours…');return}
  if(a=='share'){const c=byId(curId());navigator.clipboard?.writeText(c.telephone_client).catch(()=>{});toast('Numéro copié');return}
  if(a=='cyclef'){const k=Object.keys(FIL);UI.f=k[(k.indexOf(UI.f)+1)%k.length];appelsList();return}
  if(a=='wprev'||a=='wnext'){const w=new Date(UI.week);w.setDate(w.getDate()+(a=='wnext'?7:-7));UI.week=w;UI.day=new Date(+w);refresh();return}
  if(a=='today'){UI.week=null;UI.day=null;route();toast('Aujourd\'hui');return}
  if(a=='reset'){reset();UI.sel=null;UI.csel=null;UI.q='';UI.f='tous';UI.cq='';UI.week=null;UI.day=null;route();return}
 }
 if(sw&&t.closest('.fg')){if(isD()&&curTab=='appels'&&!t.closest('.pane')){location.hash='#/appel/'+sw.dataset.id;return}location.hash='#/appel/'+sw.dataset.id;return}
 const f=t.closest('[data-f]');if(f){UI.f=f.dataset.f;appelsList();return}
 const dy=!go&&t.closest('[data-day]');if(dy){UI.day=new Date(+dy.dataset.day);refresh();return}
 const st=t.closest('[data-st]');if(st){setStatut(curId(),st.dataset.st);refresh();return}
 const tg=t.closest('[data-tg]');if(tg){const k=tg.dataset.tg;DB.notif[k]=!DB.notif[k];save();tg.querySelector('.tg').classList.toggle('on',DB.notif[k]);toast((DB.notif[k]?'Activé : ':'Désactivé : ')+tg.querySelector('div div').textContent);return}
 if(go){e.preventDefault();if(location.hash==go.dataset.go)route();else location.hash=go.dataset.go}
});
let lastNav=false,nt;
window.addEventListener('hashchange',()=>{lastNav=true;route()});
document.addEventListener('input',e=>{
 if(e.target.id=='q'){UI.q=e.target.value;appelsList()}
 if(e.target.id=='cq'){UI.cq=e.target.value;clientsList()}
 if(e.target.id=='ntxt'){autoGrow();const c=byId(curId());c.note=e.target.value;save();clearTimeout(nt);const s=$('#nsv');s.style.opacity=1;nt=setTimeout(()=>s.style.opacity=0,1200)}
});
document.addEventListener('focusout',e=>{if(e.target.id=='ntxt')toast('Note enregistrée')});
// swipe (tactile + souris)
document.addEventListener('pointerdown',e=>{const fg=e.target.closest('.fg');if(isD()||!fg||e.target.closest('.qk'))return;const sw=fg.parentElement;drag={sw,fg,x:e.clientX,y:e.clientY,base:sw.classList.contains('op')?-158:0,dx:0,moved:false}});
document.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(!drag.moved){if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;drag.sw.classList.add('drag')}else if(Math.abs(dy)>8){drag=null;return}else return}
 drag.dx=dx;const x=Math.min(0,Math.max(-190,drag.base+dx));drag.fg.style.transform=`translateX(${x}px)`});
document.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;if(!d.moved)return;suppress=true;setTimeout(()=>suppress=false,50);d.sw.classList.remove('drag');const open=d.base+d.dx<-70;d.sw.classList.toggle('op',open);d.fg.style.transform=open?'translateX(-158px)':''});
document.addEventListener('pointercancel',()=>{if(drag){drag.sw.classList.remove('drag');drag.fg.style.transform='';drag=null}});

/* ======================= VERSION ORDINATEUR (≥ 768 px) ======================= */
const isD=()=>innerWidth>=768;
const curId=()=>{const h=location.hash.split('/');return h[1]=='appel'?h[2]:UI.sel};
const TITLES={resume:'Résumé',appels:'Appels',agenda:'Agenda',assistant:'Assistant IA',clients:'Clients',reglages:'Réglages'};
function dSide(tab){const n=DB.unseen.length;
 $('#side').innerHTML=`<div class="f" style="height:44px;padding:0 12px;margin-bottom:22px">${LOGO}</div>
 <nav style="display:flex;flex-direction:column;gap:4px">${TABS_D.map(([k,i,l])=>`<button class="sn ${k==tab?'on':''}" data-go="#/${k}" title="${l}"><span style="position:relative;display:block;height:22px;flex:none"><svg width="22" height="22"><use href="#${i}"/></svg>${k=='appels'&&n?`<b class="bdg sbdg">${n}</b>`:''}</span><span class="sl">${l}</span>${k=='appels'&&n?`<b class="scount">${n}</b>`:''}</button>`).join('')}</nav>
 <div class="fl"></div>
 <button class="sacc" data-go="#/reglages">${AV(PROFIL.initiales,38)}<div class="sl fl" style="text-align:left;min-width:0"><div class="ell" style="font-size:14px;font-weight:600">${PROFIL.prenom} ${PROFIL.nom}</div><div class="t2 ell" style="font-size:12px;margin-top:1px">${PROFIL.entreprise}</div></div></button>`}
function dTop(tab){const now=new Date();
 if(!$('#tbar').firstChild)$('#tbar').innerHTML=`<div class="fl"><div id="ttl" class="h1" style="font-size:24px"></div><div id="tsub" class="t2" style="font-size:13px;margin-top:2px"></div></div>
 <label class="srch gsrch">${I('search',18)}<input id="gq" type="search" placeholder="Rechercher un appel, un client…" autocomplete="off"></label>
 <button class="rb" data-go="#/appels" aria-label="Nouveaux appels" style="position:relative">${I('bell',20)}<i id="tdot" class="dot" style="position:absolute;top:9px;right:10px;width:8px;height:8px;background:var(--ro);box-shadow:0 0 0 2px #232326"></i></button>${ACC}`;
 $('#ttl').textContent=TITLES[tab];
 $('#tsub').textContent=tab=='resume'?`${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]} · Bonjour ${PROFIL.prenom}`:tab=='appels'?`${DB.calls.length} appels · ${DB.unseen.length?DB.unseen.length+' nouveau'+(DB.unseen.length>1?'x':''):'tout est à jour'}`:tab=='agenda'?'Rendez-vous de la semaine':tab=='assistant'?'Briefing, questions et journal des appels':tab=='clients'?clients().length+' clients':`${PROFIL.entreprise} · ${PROFIL.ville}`;
 $('#tdot').style.display=DB.unseen.length?'':'none';
 const g=$('#gq');if(document.activeElement!==g)g.value=UI.q}

/* Résumé */
function dResume(){const now=new Date(),wk=DB.calls.filter(c=>dd(c.created_at,now)>-7),T=wk.length,cnt=s=>wk.filter(c=>c.statut==s).length;
 const seg=[[cnt('rdv_pris'),'#5B8CFF','RDV pris'],[cnt('a_rappeler'),'#F43F5E','À rappeler'],[cnt('renseigne'),'#D1D1D6','Renseignés'],[cnt('rappele'),'#5A5A5E','Rappelés']];
 const R=62,C=2*Math.PI*R;let off=0;
 const ring=seg.map(([v,c])=>{if(!v)return'';const L=Math.max(C*v/T-4,.1);const x=`<circle cx="75" cy="75" r="${R}" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${L} ${C}" stroke-dashoffset="${-off}"/>`;off+=C*v/T;return x}).join('');
 const traites=T?Math.round((T-cnt('a_rappeler'))/T*100):0,conv=T?Math.round(cnt('rdv_pris')/T*100):0;
 const days=[6,5,4,3,2,1,0].map(i=>{const d=new Date();d.setDate(d.getDate()-i);const L=DB.calls.filter(c=>dd(c.created_at,d)==0);return {d,n:L.length,r:L.filter(c=>c.statut=='rdv_pris').length}}),mx=Math.max(...days.map(x=>x.n),1);
 const pr=sorted().find(c=>c.urgence=='urgent'&&c.statut=='a_rappeler');
 const ago=c=>{const m=Math.round((now-new Date(c.created_at))/6e4);return m<60?'il y a '+m+' min':m<1440?'il y a '+Math.round(m/60)+' h':dlabel(c.created_at)};
 const up=RDVS().filter(c=>c.rdv_date&&new Date(c.rdv_date)>now).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date));const nx=up[0];
 let nxl='';if(nx){const m=Math.round((new Date(nx.rdv_date)-now)/6e4);nxl=m<60?'dans '+m+' min':dd(nx.rdv_date,now)==0?'dans '+Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'):dlabel(nx.rdv_date)}
 const maps=c=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse);
 return `<div class="dg">
 <div class="k dc c7" style="${pr?'box-shadow:inset 0 0 0 1px rgba(244,63,94,.28)':''}">${pr?`<div class="f sp"><span class="lab" style="color:#FB7185">Action prioritaire</span><span class="t2" style="font-size:12px">${ago(pr)}</span></div>
  <div class="f" style="gap:16px;margin-top:16px;cursor:pointer" data-go="#/appel/${pr.id}">${AV(ini(pr.nom_client),52)}<div class="fl"><div class="ell" style="font-size:19px;font-weight:700">${esc(pr.nom_client)}</div><div class="t2 ell" style="font-size:13px;margin-top:3px">Urgent · ${esc(pr.motif)} · ${esc(pr.ville)}</div></div><a class="bw" href="${telHref(pr.telephone_client)}" data-stop>${I('phone',18,'stroke-width:2')}Rappeler</a></div>
  <div style="font-size:14px;line-height:20px;color:#C7C7CC;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)" class="clamp2">${esc(pr.resume)}</div>`:`<span class="lab">Action prioritaire</span><div class="f" style="gap:12px;margin-top:16px"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('check',18,'stroke-width:2.2')}</div><div><div style="font-size:16px;font-weight:600">Aucune urgence en attente</div><div class="t2" style="font-size:13px;margin-top:2px">Tous les appels urgents sont traités</div></div></div>`}</div>
 <div class="k dc c5"><div class="f sp"><span class="lab">Prochain rendez-vous</span><a class="t2" style="font-size:12px;font-weight:600" href="#/agenda">Voir l'agenda</a></div>
  ${nx?`<div class="f" style="gap:16px;margin-top:16px;cursor:pointer;position:relative;padding-left:14px" data-rdv="${nx.id}"><i style="position:absolute;left:0;top:2px;bottom:2px;width:3px;border-radius:3px;background:#5B8CFF"></i><div style="flex:none"><div style="font-size:22px;font-weight:700">${hm(nx.rdv_date)}</div><div style="font-size:12px;color:#5B8CFF;font-weight:600;margin-top:2px">${nxl}</div></div><div class="fl"><div class="ell" style="font-size:16px;font-weight:600">${esc(nx.nom_client)}</div><div class="t2 ell" style="font-size:13px;margin-top:3px">${esc(nx.motif)} · ${esc(nx.adresse)}</div></div><a class="rb" href="${maps(nx)}" target="_blank" rel="noopener" data-stop aria-label="Itinéraire">${I('nav',20)}</a></div>
  <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">${up.slice(1,3).map(c=>`<div class="f lrw" data-rdv="${c.id}" style="gap:12px;height:36px"><span style="font-size:13px;font-weight:600;width:110px;flex:none" class="t2">${dlabel(c.rdv_date).replace(/ \d+ \S+$/,'')} ${hm(c.rdv_date)}</span><span class="ell fl" style="font-size:14px">${esc(c.nom_client)}</span><span class="chip">${esc(c.motif)}</span></div>`).join('')||'<div class="t2" style="font-size:13px">Pas d\'autre rendez-vous prévu</div>'}</div>`:'<div class="empty">Aucun rendez-vous à venir</div>'}</div>
 <div class="k dc c5"><span class="lab">Cette semaine</span><div class="f" style="gap:24px;margin-top:16px"><div style="position:relative;width:150px;height:150px;flex:none"><svg width="150" height="150" style="transform:rotate(-90deg)"><circle cx="75" cy="75" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="11"/>${ring}</svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:36px;font-weight:700;letter-spacing:-.04em">${T}</span><span class="t2" style="font-size:12px">appels · 7 j</span></div></div>
  <div class="fl">${seg.map(([v,c,l])=>`<div class="f" style="gap:10px;height:30px"><i style="width:9px;height:9px;border-radius:3px;background:${c}"></i><span class="t2 fl" style="font-size:14px">${l}</span><span style="font-size:15px;font-weight:600">${v}</span></div>`).join('')}</div></div>
  <div class="f" style="gap:10px;margin-top:18px">${[[traites+' %','traités'],[conv+' %','en RDV'],[days[6].n,'aujourd\'hui']].map(([a,b])=>`<div class="fl" style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.05)"><div style="font-size:20px;font-weight:700">${a}</div><div class="t2" style="font-size:12px;margin-top:2px">${b}</div></div>`).join('')}</div></div>
 <div class="k dc c7"><div class="f sp"><span class="lab">Appels par jour</span><span class="f t2" style="gap:14px;font-size:12px"><span class="f" style="gap:6px"><i class="dot" style="background:#5B8CFF"></i>RDV pris</span><span class="f" style="gap:6px"><i class="dot" style="background:rgba(255,255,255,.35)"></i>Autres</span></span></div>
  <div class="f" style="gap:14px;align-items:flex-end;height:210px;margin-top:18px">${days.map(x=>{const h=150;return `<div class="fl" style="display:flex;flex-direction:column;align-items:center;gap:8px"><span style="font-size:13px;font-weight:600">${x.n}</span><div style="width:100%;max-width:44px;height:${h}px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:12px;background:rgba(255,255,255,.04);overflow:hidden"><div style="height:${(x.n-x.r)/mx*h}px;background:rgba(255,255,255,.3)"></div><div style="height:${x.r/mx*h}px;background:#5B8CFF"></div></div><span class="t2" style="font-size:12px;${dd(x.d,now)==0?'color:#fff;font-weight:600':''}">${JOURS[x.d.getDay()].slice(0,3)}</span></div>`}).join('')}</div></div>
 <div class="k dc c12" style="padding:8px 8px 6px"><div class="f sp" style="padding:12px 12px 8px"><span class="lab">Appels récents</span><a class="t2" style="font-size:12px;font-weight:600" href="#/appels">Tout voir</a></div>
  ${sorted().slice(0,6).map(c=>`<div class="trow" data-go="#/appel/${c.id}">${AV(ini(c.nom_client),36)}<div class="fl" style="min-width:140px"><div class="ell f" style="gap:8px;font-size:15px;font-weight:600">${esc(c.nom_client)}${DB.unseen.includes(c.id)?'<i class="dot" style="background:#5B8CFF"></i>':''}</div><div class="t2 ell" style="font-size:12px;margin-top:2px">${esc(c.ville)} · ${c.code_postal}</div></div><div class="hm1 fl ell t2" style="font-size:13px">${esc(c.besoin_detail)}</div><div class="f" style="gap:6px;width:180px;flex:none"><span class="chip">${esc(c.motif)}</span>${c.urgence=='urgent'?URGB:''}</div><span class="t2" style="width:120px;font-size:13px;flex:none;text-align:right">${dlabel(c.created_at).replace(/ \d+ \S+$/,'')} · ${hm(c.created_at)}</span><span style="width:100px;flex:none;display:flex;justify-content:flex-end">${badgeStat(c)}</span></div>`).join('')}</div>
 </div>`}

/* Détail (panneau) */
function dDetail(id){const c=byId(id);if(!c)return '<div class="empty">Sélectionnez un appel</div>';
 const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse);
 const body=vDetail(id);const a=body.indexOf('<div style="padding:1px'),b=body.lastIndexOf('<div style="height:90px">');
 return `<div class="phd"><div class="f" style="gap:16px;min-width:0">${AV(ini(c.nom_client),56)}<div class="fl"><div class="ell" style="font-size:24px;font-weight:700;letter-spacing:-.03em">${esc(c.nom_client)}</div><div class="f" style="gap:6px;margin-top:6px;flex-wrap:wrap">${c.urgence=='urgent'?URGB:''}<span class="chip">${esc(c.motif)}</span><span class="t2" style="font-size:12px;margin-left:2px">${dlabel(c.created_at)} · ${hm(c.created_at)}</span></div></div></div>
 <div class="f" style="gap:8px;flex:none"><a class="rb" href="sms:${c.telephone_client.replace(/\s/g,'')}" title="SMS">${I('msg',19)}</a><a class="rb" href="mailto:${c.email_client}" title="E-mail">${I('mail',19)}</a><a class="rb" href="${maps}" target="_blank" rel="noopener" title="Itinéraire">${I('nav',19)}</a><button class="rb" data-act="share" title="Copier le numéro">${I('more',19)}</button><a class="bw" href="${telHref(c.telephone_client)}" data-act="call" style="margin-left:4px">${I('phone',18,'stroke-width:2')}Rappeler ${esc(prenom(c.nom_client))}</a></div></div>
 <div class="pbd">${body.slice(a,b)}</div>`}

/* Appels : maître-détail */
function dAppels(){const L=sorted().filter(c=>match(c,UI.q)).filter(FIL[UI.f]);if(!UI.sel||!byId(UI.sel))UI.sel=L[0]?.id;
 return `<div class="md"><div class="col k" data-keep="lcol" style="padding:16px 12px 4px"><label class="srch" style="margin:0 4px">${I('search',18)}<input id="q" type="search" placeholder="Client, ville, motif, téléphone…" value="${esc(UI.q)}" autocomplete="off"></label><div class="pills" id="pills" style="margin:12px 0 14px;padding:0 4px;flex-wrap:wrap"></div><div id="list"></div></div>
 <div class="col k pane" data-keep="pane${UI.sel}">${dDetail(UI.sel)}</div></div>`}

/* Agenda : semaine */
function dAgenda(){const now=new Date();if(!UI.week)UI.week=monday(now);if(!UI.day)UI.day=sod(now);
 const days=[...Array(7)].map((_,i)=>{const d=new Date(UI.week);d.setDate(d.getDate()+i);return d});
 const rdvs=d=>RDVS().filter(c=>c.rdv_date&&dd(c.rdv_date,d)==0).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date));
 const H=60,h0=8,h1=19,nowH=now.getHours()+now.getMinutes()/60,mid=days[3],list=rdvs(UI.day);
 const wl=`${days[0].getDate()} ${MOIS[days[0].getMonth()].slice(0,4)}. – ${days[6].getDate()} ${MOIS[days[6].getMonth()].slice(0,4)}.`;
 return `<div class="ag"><div class="col k" style="padding:0" data-keep="agrid">
 <div class="f sp agh"><div class="f" style="gap:8px"><button class="rb" style="width:34px;height:34px;border-radius:11px" data-act="wprev" aria-label="Semaine précédente">${I('back',17)}</button><button class="rb" style="width:34px;height:34px;border-radius:11px" data-act="wnext" aria-label="Semaine suivante">${I('chev',17)}</button><span style="font-size:17px;font-weight:700;margin-left:8px">${cap(MOIS[mid.getMonth()])} ${mid.getFullYear()}</span><span class="t2" style="font-size:13px;margin-left:4px">${wl}</span></div><div class="f" style="gap:8px"><button class="pill" data-act="today">Aujourd'hui</button><button class="bw" style="height:36px;padding:0 14px;font-size:14px" data-act="addrdv">${I('plus',16,'stroke-width:2.2')}Nouveau RDV</button></div></div>
 <div class="wk"><div></div>${days.map(d=>{const on=dd(d,UI.day)==0,td=dd(d,now)==0,n=rdvs(d).length;return `<button class="wd ${on?'on':''}" data-day="${+d}"><span class="t2" style="font-size:12px;font-weight:600">${JOURS[d.getDay()].slice(0,3)}</span><span class="wdn ${td?'td':''}">${d.getDate()}</span><span style="font-size:11px;color:${n?'#5B8CFF':'var(--t3)'};font-weight:600">${n?n+' RDV':'—'}</span></button>`}).join('')}</div>
 <div class="wk wkb" style="height:${(h1-h0)*H+16}px"><div style="position:relative">${[...Array(h1-h0+1)].map((_,i)=>`<span style="position:absolute;right:10px;top:${i*H+1}px;font-size:11px;color:var(--t3)">${h0+i}:00</span>`).join('')}</div>
 ${days.map(d=>{const on=dd(d,UI.day)==0,td=dd(d,now)==0;return `<div class="wc ${on?'on':''}" data-slot="${+d}" title="Cliquer pour ajouter un RDV">${[...Array(h1-h0+1)].map((_,i)=>`<i style="position:absolute;left:0;right:0;top:${i*H+8}px;height:1px;background:rgba(255,255,255,.06)"></i>`).join('')}
 ${rdvs(d).map(c=>{const t=new Date(c.rdv_date),s=t.getHours()+t.getMinutes()/60,past=t.getTime()+c.duree*6e4<now;return `<div class="blk wb ${past?'past':''}" data-rdv="${c.id}" style="top:${(s-h0)*H+10}px;height:${Math.max(c.duree/60*H-4,40)}px" title="${esc(c.nom_client)} · ${esc(c.adresse)}"><i class="bar" style="background:#5B8CFF"></i><div style="font-size:11px;font-weight:600;color:#A1A1AA">${hm(t)}</div><div class="ell" style="font-size:13px;font-weight:600;margin-top:1px">${esc(c.nom_client)}</div><div class="ell" style="font-size:11px;color:#A1A1AA;margin-top:1px">${esc(c.motif)}</div></div>`}).join('')}
 ${td&&nowH>=h0&&nowH<=h1?`<div style="position:absolute;left:0;right:0;top:${(nowH-h0)*H+8}px;height:0;z-index:3"><div style="position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:50%;background:#fff"></div><div style="position:absolute;left:0;right:0;top:-.75px;height:1.5px;background:#fff"></div></div>`:''}</div>`}).join('')}</div></div>
 <div class="col k agside" style="padding:18px"><div class="lab">${dlabel(UI.day)}</div><div class="t2" style="font-size:13px;margin:4px 0 14px">${list.length?list.length+' rendez-vous':'Aucun rendez-vous'}</div>
 ${list.map(c=>`<div class="arow" data-rdv="${c.id}"><div style="font-size:15px;font-weight:700">${hm(c.rdv_date)}</div><div class="fl"><div class="ell" style="font-size:14px;font-weight:600">${esc(c.nom_client)}</div><div class="t2 ell" style="font-size:12px;margin-top:2px">${esc(c.motif)} · ${esc(c.ville)}</div></div>${I('chev',16,'color:var(--t3)')}</div>`).join('')||'<div class="empty" style="padding:20px 0">Journée libre</div>'}</div></div>`}

/* Clients : liste + fiche */
function dClientsList(){const L=clients().filter(c=>match(c,UI.cq));if(!UI.csel||!clients().some(c=>c.telephone_client==UI.csel))UI.csel=L[0]?.telephone_client;
 $('#clist').innerHTML=L.length?`<div class="thd"><span class="fl">Client</span><span class="hm1" style="width:130px">Téléphone</span><span style="width:70px;text-align:right">Appels</span><span style="width:96px;text-align:right">Dernier</span></div>${L.map(c=>`<div class="trow ${c.telephone_client==UI.csel?'sel':''}" data-csel="${esc(c.telephone_client)}">${AV(ini(c.nom_client),36)}<div class="fl"><div class="ell" style="font-size:15px;font-weight:600">${esc(c.nom_client)}</div><div class="t2 ell" style="font-size:12px;margin-top:2px">${esc(c.ville)} · ${c.code_postal}</div></div><span class="hm1 t2" style="width:130px;font-size:13px">${esc(c.telephone_client)}</span><span style="width:70px;text-align:right;font-size:14px;font-weight:600">${c.calls.length}</span><span class="t2" style="width:96px;text-align:right;font-size:12px">${dlabel(c.created_at).replace(/ \d+ \w+$/,'')}</span></div>`).join('')}`:'<div class="empty">Aucun client trouvé</div>'}
function dClients(){if(!UI.csel)UI.csel=clients()[0]?.telephone_client;const body=UI.csel?vClient(UI.csel):'';const a=body.indexOf('<div class="f" style="gap:14px');
 return `<div class="md mdc"><div class="col k" data-keep="ccol" style="padding:16px 12px 8px"><label class="srch" style="margin:0 4px 12px">${I('search',18)}<input id="cq" type="search" placeholder="Nom, ville, téléphone…" value="${esc(UI.cq)}" autocomplete="off"></label><div id="clist"></div></div>
 <div class="col k pane" data-keep="cpane" style="padding:24px">${a>-1?body.slice(a):'<div class="empty">Sélectionnez un client</div>'}</div></div>`}

/* Réglages */
function dReglages(){const v=vReglages();const p=v.split('<div class="lab"');const head=p[0].slice(p[0].indexOf('<div class="k f"'));
 const sec=i=>'<div class="lab"'+p[i];
 return `<div class="rg"><div>${head}${sec(1)}</div><div>${sec(2)}${sec(3)}</div></div>`}

function dRoute(){const h=location.hash||'#/resume',[,v,p]=h.split('/');let tab=v;
 if(v=='appel'){tab='appels';if(byId(p)){UI.sel=+p;seen(p)}}else if(v=='client'){tab='clients';UI.csel=decodeURIComponent(p)}else if(!TITLES[v])tab='resume';
 const keep={};if(tab==curTab)document.querySelectorAll('[data-keep]').forEach(e=>keep[e.dataset.keep]=e.scrollTop);
 const sy=$('#scr')&&tab==curTab?$('#scr').scrollTop:0;
 const html={resume:dResume,appels:dAppels,agenda:dAgenda,clients:dClients,reglages:dReglages,assistant:dAssist}[tab]();
 const full=['appels','agenda','clients','assistant'].includes(tab);
 $('#view').innerHTML=`<div class="scr ${tab!=curTab?'in':''} ${full?'fx':''}" id="scr"><div class="wrap">${html}</div></div>`;
 dSide(tab);dTop(tab);curTab=tab;lastHash=h;
 if(tab=='appels'){appelsList();autoGrow()}
 if(tab=='clients')dClientsList();if(tab=='assistant')feedList();
 document.querySelectorAll('[data-keep]').forEach(e=>{if(keep[e.dataset.keep]!=null)e.scrollTop=keep[e.dataset.keep]});$('#scr').scrollTop=sy;
 const s=$('.sw.sel');if(s&&tab=='appels'&&v=='appel'&&keep.lcol==null)s.scrollIntoView({block:'nearest'})}
function route(){document.body.classList.toggle('D',isD());if(isD())dRoute();else{$('#side').innerHTML='';$('#tbar').innerHTML='';mRoute()}}
document.addEventListener('click',e=>{const r=e.target.closest('[data-csel]');if(r){UI.csel=r.dataset.csel;location.hash='#/client/'+encodeURIComponent(UI.csel)}},true);
document.addEventListener('input',e=>{if(e.target.id=='gq'){UI.q=e.target.value;if(curTab!='appels'||location.hash.startsWith('#/appel/')){UI.sel=null;location.hash='#/appels'}else{const q=$('#q');if(q)q.value=UI.q;appelsList()}}
 if(isD()&&e.target.id=='q'){const g=$('#gq');if(g)g.value=UI.q}});
document.addEventListener('keydown',e=>{if(!isD()||curTab!='appels'||e.target.matches('input,textarea'))return;if(e.key!='ArrowDown'&&e.key!='ArrowUp')return;e.preventDefault();
 const L=sorted().filter(c=>match(c,UI.q)).filter(FIL[UI.f]);const i=L.findIndex(c=>c.id==UI.sel);const n=L[Math.max(0,Math.min(L.length-1,i+(e.key=='ArrowDown'?1:-1)))];if(n)location.hash='#/appel/'+n.id});

/* ===================== RDV (table « rdvs ») ===================== */
const RDVS=()=>DB.rdvs;
const rdvById=id=>DB.rdvs.find(r=>r.id==id);
const MOTIFS=['PAC air-eau','PAC air-air','Entretien','Panne','Visite devis','Information'];
const pad=n=>String(n).padStart(2,'0');
const isoDate=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
function rdvSheet(id,pre={}){const r=id?rdvById(id):null,cl=clients();
 const base=r||{nom_client:'',telephone_client:'',motif:'PAC air-eau',rdv_date:null,duree:60,adresse:'',note:'',call_id:pre.call||null};
 if(!r&&pre.call){const c=byId(pre.call);Object.assign(base,{nom_client:c.nom_client,telephone_client:c.telephone_client,motif:MOTIFS.includes(c.motif)?c.motif:'Visite devis',adresse:c.adresse})}
 const d=base.rdv_date?new Date(base.rdv_date):(()=>{const x=pre.date?new Date(pre.date):new Date(UI.day||Date.now());x.setHours(pre.h??10,pre.h!=null?(pre.m||0):0,0,0);return x})();
 const sel=base.telephone_client;
 $('#sheet').innerHTML=`<div class="sheet-bg" data-act="closes"></div><div class="sheet rs"><div class="grab"></div>
 <div class="f sp"><div style="font-size:19px;font-weight:700">${r?'Modifier le rendez-vous':'Nouveau rendez-vous'}</div>${r?`<button class="rb" data-act="delrdv" data-id="${r.id}" aria-label="Supprimer" style="color:#FB7185">${I('trash',18)}</button>`:''}</div>
 <div id="rconf"></div>
 <label class="fld"><span>Client</span><select id="r_cli"><option value="__new">+ Nouveau client</option>${cl.map(c=>`<option value="${esc(c.telephone_client)}" ${c.telephone_client==sel?'selected':''}>${esc(c.nom_client)} · ${esc(c.ville)}</option>`).join('')}</select></label>
 <div id="r_new" style="display:${sel&&cl.some(c=>c.telephone_client==sel)?'none':'grid'};grid-template-columns:1fr 1fr;gap:10px"><label class="fld"><span>Nom</span><input id="r_nom" value="${esc(base.nom_client)}" placeholder="Nom du client"></label><label class="fld"><span>Téléphone</span><input id="r_tel" type="tel" value="${esc(base.telephone_client)}" placeholder="06 00 00 00 00"></label></div>
 <div class="g2"><label class="fld"><span>Motif</span><select id="r_mot">${MOTIFS.map(m=>`<option ${m==base.motif?'selected':''}>${m}</option>`).join('')}</select></label><label class="fld"><span>Durée</span><select id="r_dur">${[30,60,90,120,180].map(m=>`<option value="${m}" ${m==base.duree?'selected':''}>${m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' 30':'')}</option>`).join('')}</select></label></div>
 <div class="g2"><label class="fld"><span>Date</span><input id="r_date" type="date" value="${isoDate(d)}"></label><label class="fld"><span>Heure</span><input id="r_h" type="time" step="900" value="${pad(d.getHours())}:${pad(d.getMinutes())}"></label></div>
 <label class="fld"><span>Adresse</span><input id="r_adr" value="${esc(base.adresse)}" placeholder="Adresse de l'intervention"></label>
 <label class="fld"><span>Note</span><textarea id="r_note" rows="2" placeholder="Accès, matériel à prévoir…">${esc(base.note)}</textarea></label>
 <div class="f" style="gap:10px;margin-top:6px">${r&&r.call_id?`<button class="sec" style="flex:none;padding:0 16px" data-act="rdvcall" data-id="${r.call_id}">Voir l'appel</button>`:''}<button class="bw" style="flex:1;height:50px" data-act="saverdv" data-id="${r?r.id:''}" data-call="${base.call_id||''}">${r?'Enregistrer':'Ajouter le rendez-vous'}</button></div></div>`;
 requestAnimationFrame(()=>{$('.sheet-bg').classList.add('sh');$('.sheet').classList.add('sh')})}
function saveRdv(id,callId){const v=x=>$('#'+x).value.trim();const tel=v('r_cli');let nom,phone,ville='',call=callId?+callId:null;
 if(tel=='__new'){nom=v('r_nom');phone=v('r_tel');if(!nom){toast('Indiquez le nom du client',1);$('#r_nom').focus();return}}
 else{const c=clients().find(x=>x.telephone_client==tel);nom=c.nom_client;phone=c.telephone_client;ville=c.ville;if(!call||byId(call).telephone_client!=tel)call=c.id}
 if(!v('r_date')||!v('r_h')){toast('Indiquez la date et l\'heure',1);return}
 const [y,mo,da]=v('r_date').split('-').map(Number),[hh,mm]=v('r_h').split(':').map(Number);const dt=new Date(y,mo-1,da,hh,mm);
 const o={nom_client:nom,telephone_client:phone,motif:v('r_mot'),rdv_date:dt.toISOString(),duree:+v('r_dur'),adresse:v('r_adr'),ville:ville||(v('r_adr').match(/\d{5}\s+(.+)$/)||[,''])[1],note:v('r_note'),call_id:call};
 if(id){Object.assign(rdvById(id),o)}else{DB.rdvs.push({id:'r'+Date.now(),...o})}
 if(call){const c=byId(call);if(c){c.rdv_date=o.rdv_date;if(c.statut!='rdv_pris'){c.statut='rdv_pris'}}}
 save();closeSheet();UI.week=monday(dt);UI.day=sod(dt);toast(id?'Rendez-vous modifié':'Rendez-vous ajouté · '+rdvTxt(dt));refresh()}
function delRdv(id){const r=rdvById(id);DB.rdvs=DB.rdvs.filter(x=>x.id!=id);if(r.call_id){const c=byId(r.call_id);if(c&&c.rdv_date==r.rdv_date){c.rdv_date=null;if(c.statut=='rdv_pris')c.statut='a_rappeler'}}save();closeSheet();toast('Rendez-vous supprimé');refresh()}

/* ===================== Assistant IA (démo locale) ===================== */
const DEBRIEF=c=>c.statut=='rdv_pris'?(()=>{const r=DB.rdvs.find(x=>x.call_id==c.id);return r?'RDV fixé le '+rdvTxt(r.rdv_date)+'.':'RDV pris.'})():c.statut=='rappele'?'Client rappelé, demande traitée.':c.statut=='a_rappeler'?(c.urgence=='urgent'?'Urgent : à rappeler en priorité.':'En attente de rappel.')+(c.raison_blocage?' Blocage : '+c.raison_blocage.toLowerCase()+'.':''):'Client renseigné'+(c.raison_blocage?', bloqué par : '+c.raison_blocage.toLowerCase()+'.':'.');
function stats(){const now=new Date(),wk=DB.calls.filter(c=>dd(c.created_at,now)>-7),td=DB.calls.filter(c=>dd(c.created_at,now)==0);
 const cnt=(L,f)=>L.filter(f).length,mot={},bl={};wk.forEach(c=>{mot[c.motif]=(mot[c.motif]||0)+1;if(c.raison_blocage&&c.statut!='rdv_pris')bl[c.raison_blocage]=(bl[c.raison_blocage]||0)+1});
 return {now,wk,td,ar:DB.calls.filter(c=>c.statut=='a_rappeler'),urg:DB.calls.filter(c=>c.statut=='a_rappeler'&&c.urgence=='urgent'),rdvTd:cnt(td,c=>c.statut=='rdv_pris'),rdvWk:cnt(wk,c=>c.statut=='rdv_pris'),mot:Object.entries(mot).sort((a,b)=>b[1]-a[1]),bl:Object.entries(bl).sort((a,b)=>b[1]-a[1]),nbBl:wk.filter(c=>c.statut!='rdv_pris'&&c.raison_blocage).length}}
function debrief(){const S=stats(),conv=S.wk.length?Math.round(S.rdvWk/S.wk.length*100):0,mx=Math.max(1,...S.bl.map(b=>b[1]));
 const kpi=(v,l,c='')=>`<div class="kp"><div style="font-size:24px;font-weight:700;${c}">${v}</div><div class="t2" style="font-size:12px;margin-top:2px">${l}</div></div>`;
 return `<div class="aib"><div class="aibi"><div class="f sp"><span class="f" style="gap:8px;font-size:13px;font-weight:600"><svg width="18" height="13" style="color:#fff"><use href="#mark"/></svg>Debrief du jour</span><span class="t2" style="font-size:12px">${JOURS[S.now.getDay()]} ${S.now.getDate()} ${MOIS[S.now.getMonth()]}</span></div>
 <div style="font-size:15px;line-height:22px;margin-top:10px;color:#E4E4E7">${S.td.length} appel${S.td.length>1?'s':''} aujourd'hui, ${S.rdvTd} RDV pris. ${S.ar.length?`<b style="color:#FB7185">${S.ar.length} client${S.ar.length>1?'s':''} à rappeler</b>${S.urg.length?` dont ${S.urg.length} urgent${S.urg.length>1?'s':''}`:''}.`:'Aucun rappel en attente.'} Sur 7 jours, ${conv} % des appels finissent en RDV ; motif principal : ${S.mot[0]?S.mot[0][0]:'—'}.</div>
 <div class="kps">${kpi(S.td.length,'appels du jour')}${kpi(S.rdvTd,'RDV pris','color:#5B8CFF')}${kpi(S.ar.length,'à rappeler','color:#FB7185')}${kpi(S.urg.length,'urgences','color:#FB7185')}</div>
 <div class="g2" style="gap:18px;margin-top:16px"><div><div class="lab" style="margin-bottom:8px">Motifs · 7 jours</div>${S.mot.slice(0,4).map(([m,n])=>`<div class="f sp" style="font-size:13px;height:24px"><span class="t2">${esc(m)}</span><b>${n}</b></div>`).join('')}</div>
 <div><div class="lab" style="margin-bottom:8px">Où la conversion bloque</div>${S.bl.slice(0,4).map(([m,n])=>`<div style="margin-bottom:7px"><div class="f sp" style="font-size:13px"><span class="t2 ell">${esc(m)}</span><b>${n}</b></div><div style="height:4px;border-radius:2px;background:rgba(255,255,255,.06);margin-top:4px"><div style="height:4px;border-radius:2px;width:${n/mx*100}%;background:#FB7185"></div></div></div>`).join('')||'<div class="t2" style="font-size:13px">Aucun blocage</div>'}</div></div></div></div>`}
const FFIL={tous:['Tous',c=>true],notes:['Avec note',c=>c.note],a_rappeler:['À rappeler',c=>c.statut=='a_rappeler'],rdv:['RDV pris',c=>c.statut=='rdv_pris'],bloques:['Bloqués',c=>c.raison_blocage&&c.statut!='rdv_pris']};
UI.ff='tous';
function feedList(){const el=$('#feed');if(!el)return;const L=sorted();
 $('#fpills').innerHTML=Object.entries(FFIL).map(([k,[l,f]])=>`<button class="pill ${UI.ff==k?'on':''}" data-ff="${k}">${l} · ${L.filter(f).length}</button>`).join('');
 const F=L.filter(FFIL[UI.ff][1]);let last='';
 el.innerHTML=F.map(c=>{const l=dlabel(c.created_at),h=l!=last?`<div class="lab" style="margin:14px 4px 8px">${l}</div>`:'';last=l;
  return h+`<div class="k fi" data-go="#/appel/${c.id}"><i class="bar" style="background:${barC(c)}"></i><div class="f sp" style="gap:10px"><span class="f" style="gap:10px;min-width:0">${AV(ini(c.nom_client),32)}<span style="min-width:0"><span class="ell" style="display:block;font-size:15px;font-weight:600">${esc(c.nom_client)}</span><span class="t2" style="font-size:12px">${hm(c.created_at)} · ${esc(c.motif)} · ${esc(c.ville)}</span></span></span><span class="f" style="gap:6px;flex:none">${c.urgence=='urgent'?URGB:''}${badgeStat(c)}</span></div>
  <div class="fsec"><span class="fk">${I('spark',13)}Résumé IA</span><p>${esc(c.resume)}</p></div>
  ${c.note?`<div class="fsec"><span class="fk">${I('note',13)}Note</span><p>${esc(c.note)}</p></div>`:''}
  <div class="fsec"><span class="fk">${I('check',13)}Debrief</span><p class="${c.statut=='a_rappeler'?'rd':''}">${esc(DEBRIEF(c))}</p></div></div>`}).join('')||'<div class="empty">Rien à afficher</div>'}
const SUGG=['Qui dois-je rappeler ?','Mes RDV demain','Résumé de la semaine','Pourquoi je perds des clients ?','Urgences en attente'];
function chatHtml(){return `<div class="aich k"><div class="f sp" style="margin-bottom:10px"><span class="f" style="gap:8px;font-size:14px;font-weight:600">${I('t-ai',16)}Demander à Akno</span><span class="demo">Assistant de démo · calculé sur vos données locales</span></div>
 <div id="msgs">${DB.chat.map(m=>m.u?`<div class="mu">${esc(m.t)}</div>`:`<div class="ma">${m.t}</div>`).join('')||'<div class="t2" style="font-size:13px;padding:2px 2px 6px">Posez une question sur vos appels, vos RDV ou vos clients.</div>'}</div>
 <div class="chips">${SUGG.map(q=>`<button class="pill" data-ask="${esc(q)}">${q}</button>`).join('')}</div>
 <form class="ain" id="askf"><input id="askq" placeholder="Ex. : Que voulait Martin Durand ?" autocomplete="off"><button class="snd" aria-label="Envoyer">${I('send',18,'stroke-width:2.2')}</button></form>${DB.chat.length?'<button class="t2 clr" data-act="clearchat">Effacer la conversation</button>':''}</div>`}
function ask(q){const n=norm(q),S=stats(),now=new Date();const link=c=>`<a data-go="#/appel/${c.id}">${esc(c.nom_client)}</a>`;const lr=r=>`<a data-rdv="${r.id}">${esc(r.nom_client)}</a>`;
 const rdvOn=off=>{const d=new Date();d.setDate(d.getDate()+off);return DB.rdvs.filter(r=>dd(r.rdv_date,d)==0).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date))};
 const lst=a=>'<ul>'+a.join('')+'</ul>';
 if(/rappel/.test(n)){const L=[...S.ar].sort((a,b)=>(b.urgence=='urgent')-(a.urgence=='urgent')||new Date(b.created_at)-new Date(a.created_at));return L.length?`<b>${L.length} client${L.length>1?'s':''} à rappeler</b>, par priorité :`+lst(L.map(c=>`<li>${link(c)} · ${esc(c.motif)}${c.urgence=='urgent'?' · <span class="rd">urgent</span>':''} · ${dlabel(c.created_at)} ${hm(c.created_at)}</li>`)):'Personne à rappeler, tout est traité.'}
 if(/urgen/.test(n))return S.urg.length?`<b>${S.urg.length} urgence${S.urg.length>1?'s':''} en attente</b> :`+lst(S.urg.map(c=>`<li>${link(c)} · ${esc(c.besoin_detail)}</li>`)):'Aucune urgence en attente.';
 if(/(rdv|rendez)/.test(n)||/demain|aujourd/.test(n)&&/(rdv|rendez|agenda|planning)/.test(n)){const off=/demain/.test(n)?1:/aujourd/.test(n)?0:null;
  if(off!=null){const L=rdvOn(off);return L.length?`<b>${L.length} RDV ${off?'demain':'aujourd\'hui'}</b> :`+lst(L.map(r=>`<li>${hm(r.rdv_date)} · ${lr(r)} · ${esc(r.motif)} · ${esc(r.adresse)}</li>`)):`Aucun RDV ${off?'demain':'aujourd\'hui'}.`}
  const L=DB.rdvs.filter(r=>new Date(r.rdv_date)>now&&dd(r.rdv_date,now)<7).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date));return L.length?`<b>${L.length} RDV dans les 7 prochains jours</b> :`+lst(L.map(r=>`<li>${rdvTxt(r.rdv_date)} · ${lr(r)} · ${esc(r.motif)}</li>`)):'Aucun RDV à venir cette semaine.'}
 if(/(semaine|bilan|resume|resumé|recap)/.test(n)){const conv=S.wk.length?Math.round(S.rdvWk/S.wk.length*100):0;return `<b>Bilan des 7 derniers jours</b>`+lst([`<li>${S.wk.length} appels reçus, ${S.rdvWk} RDV pris (${conv} % de conversion)</li>`,`<li>${S.ar.length} à rappeler, dont ${S.urg.length} urgent${S.urg.length>1?'s':''}</li>`,`<li>Motifs : ${S.mot.map(([m,k])=>esc(m)+' ('+k+')').join(', ')}</li>`,S.bl[0]?`<li>Premier frein : ${esc(S.bl[0][0].toLowerCase())} (${S.bl[0][1]} cas)</li>`:''])}
 if(/(perd|pourquoi|bloqu|conversion|frein)/.test(n)){if(!S.bl.length)return 'Aucun blocage relevé cette semaine.';const t=S.bl[0][0];const tips={'Rappel non effectué':'rappelez dans l\'heure : ce sont des clients chauds.','Prix / attente des aides':'mettez en avant MaPrimeRénov\' et les CEE dès le rappel.','Prix du contrat':'proposez une formule d\'entretien plus simple.','Pas de créneau proposé':'proposez 2 créneaux dès le rappel.','Devis sans réponse':'relancez les devis après 48 h.'};
  return `<b>${S.nbBl} appel${S.nbBl>1?'s':''} n'ont pas abouti cette semaine.</b> Les causes :`+lst(S.bl.map(([m,k])=>`<li>${esc(m)} · ${k}</li>`))+(tips[t]?`Piste : ${tips[t]}`:'')}
 const words=n.split(/[^a-z0-9]+/).filter(w=>w.length>=3);const cl=clients().filter(c=>words.some(w=>norm(c.nom_client).split(' ').includes(w)));
 if(cl.length){return cl.slice(0,3).map(c=>{const r=DB.rdvs.filter(x=>x.telephone_client==c.telephone_client).sort((a,b)=>new Date(b.rdv_date)-new Date(a.rdv_date))[0];return `<b>${esc(c.nom_client)}</b> · ${esc(c.ville)} · ${esc(c.telephone_client)}`+lst(c.calls.map(x=>`<li>${dlabel(x.created_at)} · ${link(x)} : ${esc(x.resume)}${x.note?' <i>Note : '+esc(x.note)+'</i>':''}</li>`))+(r?`Prochain RDV : ${lr(r)} le ${rdvTxt(r.rdv_date)}.`:'Aucun RDV planifié.')}).join('<br>')}
 const ca=DB.calls.filter(c=>words.some(w=>norm(c.motif+' '+c.ville+' '+c.besoin_detail).includes(w)));
 if(ca.length)return `<b>${ca.length} appel${ca.length>1?'s':''} correspondant${ca.length>1?'s':''}</b> :`+lst(ca.slice(0,6).map(c=>`<li>${link(c)} · ${esc(c.motif)} · ${esc(c.ville)} · ${STL[c.statut]}</li>`));
 return 'Je n\'ai pas trouvé de réponse. Essayez : « Qui dois-je rappeler ? », « Mes RDV demain », « Résumé de la semaine » ou le nom d\'un client.'}
function sendAsk(q){q=q.trim();if(!q)return;DB.chat.push({u:1,t:q},{t:ask(q)});if(DB.chat.length>30)DB.chat=DB.chat.slice(-30);save();const box=$('.aich');box.outerHTML=chatHtml();const m=$('#msgs');m.scrollTop=m.scrollHeight;$('.aich').scrollIntoView?.({block:'nearest'});if(isD())$('#askq').focus()}
function vAssist(){return `<div class="top">${LOGO}<div class="f" style="gap:10px">${RB('users','data-go="#/clients"','Clients')}${ACC}</div></div>
 <div class="f sp" style="margin:6px 0 14px;align-items:flex-end"><div class="h1">Assistant IA</div><span class="t2" style="font-size:13px;padding-bottom:5px">${DB.calls.length} appels</span></div>
 ${debrief()}<div style="margin-top:12px">${chatHtml()}</div><div class="lab" style="margin:22px 4px 10px">Fil des appels</div><div class="pills" id="fpills"></div><div id="feed"></div>`}
function dAssist(){return `<div class="as"><div class="col" data-keep="acol">${debrief()}<div style="margin-top:16px">${chatHtml()}</div></div><div class="col k" data-keep="afeed" style="padding:16px 16px 6px"><div class="f sp" style="padding:2px 4px 0"><span class="lab">Fil des appels · résumés, notes, debriefs</span></div><div class="pills" id="fpills" style="margin:12px 0 4px;padding:0;flex-wrap:wrap"></div><div id="feed"></div></div></div>`}

/* événements v2 (capture) */
document.addEventListener('click',e=>{const t=e.target;let x;
 const st=()=>{e.preventDefault();e.stopPropagation()};
 if(x=t.closest('[data-act=addrdv]')){st();rdvSheet(null,{call:x.dataset.call?+x.dataset.call:null});return}
 if(x=t.closest('[data-act=saverdv]')){st();saveRdv(x.dataset.id,x.dataset.call);return}
 if(x=t.closest('[data-act=delrdv]')){st();$('#rconf').innerHTML=`<div class="conf"><span>Supprimer ce rendez-vous ?</span><span class="f" style="gap:8px"><button class="pill" data-act="delno">Annuler</button><button class="pill delb" data-act="delyes" data-id="${x.dataset.id}">Supprimer</button></span></div>`;return}
 if(x=t.closest('[data-act=delno]')){st();$('#rconf').innerHTML='';return}
 if(x=t.closest('[data-act=delyes]')){st();delRdv(x.dataset.id);return}
 if(x=t.closest('[data-act=rdvcall]')){st();closeSheet();location.hash='#/appel/'+x.dataset.id;return}
 if(x=t.closest('[data-act=clearchat]')){st();DB.chat=[];save();$('.aich').outerHTML=chatHtml();return}
 if(x=t.closest('[data-rdv]')){st();rdvSheet(x.dataset.rdv);return}
 if(x=t.closest('[data-ask]')){st();sendAsk(x.dataset.ask);return}
 if(x=t.closest('[data-ff]')){st();UI.ff=x.dataset.ff;feedList();return}
 if(x=t.closest('[data-slot]')){st();const r=x.getBoundingClientRect(),y=e.clientY-r.top-8,hr=8+Math.max(0,y)/60,h=Math.min(18,Math.floor(hr)),m=hr-h>=.5&&h<18?30:0;const d=new Date(+x.dataset.slot);UI.day=sod(d);rdvSheet(null,{date:d,h,m});return}
},true);
document.addEventListener('submit',e=>{if(e.target.id=='askf'){e.preventDefault();sendAsk($('#askq').value)}});
document.addEventListener('change',e=>{if(e.target.id=='r_cli'){const v=e.target.value,c=clients().find(x=>x.telephone_client==v);$('#r_new').style.display=c?'none':'grid';if(c){$('#r_adr').value=c.adresse}}});

/* ======================= V3 : Dashboard, Appels, Assistant ======================= */
TABS[0][2]='Dashboard';TITLES.resume='Dashboard';UI.f='a_rappeler';UI.per='7';UI.jx=null;UI.jopen=false;
const ago=d=>{const m=Math.max(0,Math.round((Date.now()-new Date(d))/6e4));return m<1?'à l\'instant':m<60?'il y a '+m+' min':m<1440?'il y a '+Math.floor(m/60)+' h':m<2880?'hier':'il y a '+Math.round(m/1440)+' j'};
const eur=n=>Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\s/g,'\u00a0')+'\u00a0€';
const panier=()=>DB.panier||12000;
const doneMap=()=>DB.done||(DB.done={});
const hors=c=>{const d=new Date(c.created_at),h=d.getHours()+d.getMinutes()/60,w=d.getDay();return w==0||w==6||h<8||h>=18};

/* ---------- Dashboard ---------- */
const PER={j:[1,'Aujourd\'hui','hier'],'7':[7,'7 jours','7 j. précédents'],'30':[30,'30 jours','30 j. précédents']};
function inPer(c,n,off=0){const x=dd(c.created_at,new Date());return x>-n*(off+1)&&x<=-n*off}
function kpis(L){const T=L.length,rdv=L.filter(c=>c.statut=='rdv_pris').length,ar=L.filter(c=>c.statut=='a_rappeler').length;
 return {T,rdv,ar,ia:T?Math.round((T-ar)/T*100):0,conv:T?Math.round(rdv/T*100):0,pipe:rdv*panier()}}
function trend(cur,prev,o={}){if(o.pts){const d=cur-prev;if(!prev&&!cur)return '<span class="tr">—</span>';return `<span class="tr ${(d>0)!=!!o.bad&&d!=0?'up':d?'dn':''}">${d>0?'↑':d<0?'↓':'='} ${Math.abs(d)} pt${Math.abs(d)>1?'s':''}</span>`}
 if(!prev)return `<span class="tr">${cur?'nouveau':'—'}</span>`;const p=Math.round((cur-prev)/prev*100);
 return `<span class="tr ${(p>0)!=!!o.bad&&p!=0?'up':p?'dn':''}">${p>0?'↑':p<0?'↓':'='} ${Math.abs(p)} %</span>`}
function dashBody(){const now=new Date(),[n,pl,prl]=PER[UI.per],L=DB.calls.filter(c=>inPer(c,n)),P=DB.calls.filter(c=>inPer(c,n,1)),K=kpis(L),Q=kpis(P);
 const card=(v,l,tr,sub,cls='')=>`<div class="kpi ${cls}"><div class="t2 kl">${l}</div><div class="kv">${v}</div><div class="ks">${tr}<span class="t3">${sub}</span></div></div>`;
 const kp=`<div class="kpis6">${card(K.T,'Appels reçus',trend(K.T,Q.T),'vs '+prl)}${card(K.ia+' %','Traités par l\'IA',trend(K.ia,Q.ia,{pts:1}),'sans rappel nécessaire')}${card(K.rdv,'RDV pris',trend(K.rdv,Q.rdv),'vs '+prl,'blue')}${card(K.conv+' %','Conversion appel → RDV',trend(K.conv,Q.conv,{pts:1}),'vs '+prl)}${card(K.ar,'À rappeler',trend(K.ar,Q.ar,{bad:1}),'sur la période')}${card(eur(K.pipe),'Pipeline · estimation',trend(K.pipe,Q.pipe),K.rdv+' RDV × '+eur(panier()))}</div>`;
 // appels par jour
 const nd=Math.max(n,7),days=[...Array(nd)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(nd-1-i));const X=DB.calls.filter(c=>dd(c.created_at,d)==0);return {d,n:X.length,r:X.filter(c=>c.statut=='rdv_pris').length}}),mx=Math.max(1,...days.map(x=>x.n));
 const step=nd>7?5:1;
 const ch1=`<div class="k dcard s8"><div class="f sp ch"><span class="lab">Appels et RDV par jour</span><span class="f t2 lg"><span><i class="dot" style="background:rgba(255,255,255,.4)"></i>Appels</span><span><i class="dot" style="background:#5B8CFF"></i>RDV pris</span></span></div>
 <div class="bars ${nd>7?'dense':''}">${days.map((x,i)=>`<div class="bc" title="${dlabel(x.d)} : ${x.n} appel${x.n>1?'s':''}, ${x.r} RDV"><div class="bt"><div class="bv" style="height:${x.n/mx*100}%">${x.r?`<div class="br" style="height:${x.r/x.n*100}%"></div>`:''}</div></div><span class="bl ${dd(x.d,now)==0?'on':''}">${(nd-1-i)%step==0?(nd>7?x.d.getDate():JOURS[x.d.getDay()].slice(0,3)):''}</span></div>`).join('')}</div>${n==1?'<div class="t3" style="font-size:11px;margin-top:6px">Contexte des 7 derniers jours</div>':''}</div>`;
 // entonnoir
 const qual=L.filter(c=>c.statut=='rdv_pris'||(c.motif!='Information'&&c.statut!='renseigne')).length,dev=L.filter(c=>c.statut=='rdv_pris'&&c.rdv_date&&new Date(c.rdv_date)<now).length;
 const F=[['Appels',K.T,'rgba(255,255,255,.32)'],['Qualifiés',qual,'rgba(255,255,255,.22)'],['RDV',K.rdv,'#5B8CFF'],['Devis (visite faite)',dev,'rgba(255,255,255,.16)']];
 const fun=`<div class="k dcard s4"><span class="lab">Entonnoir</span><div style="margin-top:14px">${F.map(([l,v,c],i)=>`<div class="fr"><div class="f sp" style="font-size:13px"><span>${l}</span><span>${v}${i?`<span class="t3"> · ${F[i-1][1]?Math.round(v/F[i-1][1]*100):0} %</span>`:''}</span></div><div class="ft"><div style="width:${K.T?v/K.T*100:0}%;background:${c}"></div></div></div>`).join('')}</div></div>`;
 // motifs
 const mo={};L.forEach(c=>mo[c.motif]=(mo[c.motif]||0)+1);const MO=Object.entries(mo).sort((a,b)=>b[1]-a[1]),mm=Math.max(1,...MO.map(x=>x[1]));
 const hl=(arr,col,mx)=>arr.map(([m,v])=>`<div class="hl"><div class="f sp" style="font-size:13px"><span class="ell f">${m.startsWith('<i')?m:esc(m)}</span><span class="t2">${v}</span></div><div class="ft"><div style="width:${v/mx*100}%;background:${col}"></div></div></div>`).join('')||'<div class="t2" style="font-size:13px;padding:8px 0">Aucune donnée</div>';
 const ch3=`<div class="k dcard s4"><span class="lab">Motifs d'appel</span><div style="margin-top:14px">${hl(MO,'rgba(255,255,255,.45)',mm)}</div></div>`;
 // heures
 const HB=[...Array(16)].map((_,i)=>6+i),hc=HB.map(h=>L.filter(c=>new Date(c.created_at).getHours()==h)),hm2=Math.max(1,...hc.map(x=>x.length)),nh=L.filter(hors).length;
 const ch2=`<div class="k dcard s4"><div class="f sp"><span class="lab">Heures d'appel</span><span class="f t2 lg"><span><i class="dot" style="background:#fff"></i>Hors horaires</span></span></div>
 <div style="font-size:14px;margin-top:10px"><b>${nh}</b> appel${nh>1?'s':''} hors horaires <span class="t2">(${L.length?Math.round(nh/L.length*100):0} %) captés par l'IA</span></div>
 <div class="bars hrs">${HB.map((h,i)=>{const ho=h<8||h>=18;return `<div class="bc" title="${h} h : ${hc[i].length} appel(s)"><div class="bt"><div class="bv" style="height:${hc[i].length/hm2*100}%;background:${ho?'#fff':'rgba(255,255,255,.22)'}"></div></div><span class="bl">${h%3==0?h+'h':''}</span></div>`}).join('')}</div></div>`;
 // blocages
 const bl={};L.forEach(c=>{if(c.raison_blocage&&c.statut!='rdv_pris')bl[c.raison_blocage]=(bl[c.raison_blocage]||0)+1});const BL=Object.entries(bl).sort((a,b)=>b[1]-a[1]),bm=Math.max(1,...BL.map(x=>x[1]));
 const ch4=`<div class="k dcard s4"><span class="lab">Où la conversion bloque</span><div style="margin-top:14px">${hl(BL.slice(0,5).map(([m,v])=>['<i class="sd" style="background:'+SIG+';margin-right:8px"></i>'+m,v]),'rgba(255,255,255,.28)',bm)}</div></div>`;
 // action + rdv compacts
 const pr=sorted().filter(c=>c.statut=='a_rappeler').sort((a,b)=>(b.urgence=='urgent')-(a.urgence=='urgent'))[0];
 const nx=RDVS().filter(r=>new Date(r.rdv_date)>now).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date))[0];
 const act=`<div class="k dcard s6 cmp">${pr?`<div class="f" style="gap:12px;cursor:pointer" data-go="#/appel/${pr.id}">${AV(ini(pr.nom_client),40)}<div class="fl"><div class="lab f" style="gap:6px"><i class="sd" style="background:${SIG}"></i>Action prioritaire</div><div class="ell" style="font-size:16px;font-weight:600;margin-top:3px">${esc(pr.nom_client)}</div><div class="t2 ell" style="font-size:13px">${pr.urgence=='urgent'?'Urgent · ':''}${esc(pr.motif)} · ${ago(pr.created_at)}</div></div><a class="bw bsm" href="${telHref(pr.telephone_client)}" data-stop>${I('phone',15,'stroke-width:2')}Rappeler</a></div>`:`<div class="f" style="gap:12px"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('check',18,'stroke-width:2.2')}</div><div><div class="lab">Action prioritaire</div><div style="font-size:15px;font-weight:600;margin-top:3px">Tout est traité</div></div></div>`}</div>`;
 const rdv=`<div class="k dcard s6 cmp">${nx?`<div class="f" style="gap:12px;cursor:pointer" data-rdv="${nx.id}"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('cal',18)}</div><div class="fl"><div class="lab">Prochain rendez-vous</div><div class="ell" style="font-size:16px;font-weight:600;margin-top:3px">${esc(nx.nom_client)}</div><div class="t2 ell" style="font-size:13px">${rdvTxt(nx.rdv_date)} · ${esc(nx.motif)}</div></div><a class="rb" href="#/agenda" data-stop aria-label="Agenda">${I('chev',18)}</a></div>`:'<div class="lab">Prochain rendez-vous</div><div class="t2" style="margin-top:6px">Aucun rendez-vous à venir</div>'}</div>`;
 const seg=`<div class="seg per">${['j','7','30'].map(k=>[k,PER[k]]).map(([k,[,l]])=>`<button class="${UI.per==k?'on':''}" data-per="${k}">${l}</button>`).join('')}</div>`;
 return {seg,html:`<div class="db">${act}${rdv}<div class="s12">${kp}</div>${ch1}${ch2}${fun}${ch3}${ch4}</div>`,L}}
function vResume(){const now=new Date(),D=dashBody();
 return `<div class="top">${LOGO}<div class="f" style="gap:10px">${RB('bell','data-go="#/appels"','Nouveaux appels')}${ACC}</div></div>
 <div style="margin:6px 0 14px"><div class="t2" style="font-size:15px">${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]}</div><div class="h1" style="margin-top:2px">Dashboard</div></div>
 <div style="margin-bottom:14px">${D.seg}</div>${D.html}<div style="height:20px"></div>`}
function dResume(){const D=dashBody();return `<div class="f sp" style="margin-bottom:16px;gap:12px;flex-wrap:wrap"><div class="t2" style="font-size:14px">Période : <b style="color:#fff">${PER[UI.per][1]}</b> · ${D.L.length} appels</div><div style="width:340px;max-width:100%">${D.seg}</div></div>${D.html}`}

/* ---------- Réglages : panier moyen ---------- */
const _vReg=vReglages;
vReglages=function(){const v=_vReg(),a='<div class="lab" style="margin:22px 4px 10px">Notifications</div>';
 return v.replace(a,`<div class="lab" style="margin:22px 4px 10px">Estimation du pipeline</div><div class="k" style="padding:14px 16px"><label class="f sp" style="gap:12px"><span><span style="font-size:15px;font-weight:500;display:block">Panier moyen d'un chantier</span><span class="t2" style="font-size:12px">Valeur fictive utilisée pour estimer le pipeline</span></span><span class="f" style="gap:6px;flex:none"><input id="panier" type="number" min="0" step="500" value="${panier()}" class="pin"><span class="t2">€</span></span></label></div>\n`+a)};

/* ---------- Appels ---------- */
const FIL3={a_rappeler:['À rappeler',c=>c.statut=='a_rappeler'],tous:['Tous',c=>true],traites:['Traités',c=>c.statut!='a_rappeler']};
const prio=(a,b)=>(b.urgence=='urgent')-(a.urgence=='urgent')||new Date(b.created_at)-new Date(a.created_at);
function row(c){const u=c.urgence=='urgent',nw=DB.unseen.includes(c.id),ar=c.statut=='a_rappeler';
 return `<div class="sw lw ${UI.sel==c.id&&isD()?'sel':''}" data-id="${c.id}"><div class="acts"><button data-act="note" style="width:74px;background:#2C2C2E">${I('note',20)}Note</button><button data-act="done" style="width:84px;background:#3A3A3E;color:#fff">${I('check',20,'stroke-width:2.2')}Rappelé</button></div>
 <div class="fg lr">${AV(ini(c.nom_client),36)}<div class="fl" style="min-width:0"><div class="f" style="gap:8px;min-width:0"><span class="nm ell">${esc(c.nom_client)}</span>${nw?'<i class="sd" style="background:#5B8CFF"></i>':''}</div><div class="sub ell">${esc(c.motif)} · ${esc(c.ville)}</div></div>
 <div class="lrm"><span class="ago">${ago(c.created_at)}</span><span class="f" style="gap:10px">${u&&ar?URGB:badgeStat(c)}</span></div>
 <div class="lra">${ar?`<button class="ib qk2" data-act="done" title="Marquer rappelé" aria-label="Marquer rappelé">${I('check',15,'stroke-width:2.2')}</button><a class="ib cph" href="${telHref(c.telephone_client)}" data-stop title="Rappeler" aria-label="Rappeler">${I('phone',15,'stroke-width:1.9')}</a>`:''}</div></div></div>`}
function appelsList(){if(!FIL3[UI.f])UI.f='a_rappeler';const L=sorted().filter(c=>match(c,UI.q));
 $('#pills').outerHTML=`<div class="seg tabs3" id="pills">${Object.entries(FIL3).map(([k,[l,f]])=>`<button class="${UI.f==k?'on':''}" data-f="${k}">${l} <span class="cnt">${L.filter(f).length}</span></button>`).join('')}</div>`;
 const F=L.filter(FIL3[UI.f][1]);
 if(UI.f=='a_rappeler'){$('#list').innerHTML=F.length?[...F].sort(prio).map(row).join(''):`<div class="emp"><div class="tile" style="margin:0 auto;border-radius:50%">${I('check',18,'stroke-width:2')}</div><div style="font-size:16px;font-weight:600;margin-top:14px">Tout est traité</div><div class="t2" style="font-size:14px;margin-top:4px">${UI.q?'Aucun appel à rappeler pour cette recherche.':'Aucun client n\'attend de rappel. Akno vous prévient au prochain appel.'}</div><button class="pill" style="margin-top:14px" data-f="tous">Voir tous les appels</button></div>`}
 else $('#list').innerHTML=grouped(F)}
function vAppels(){const n=DB.unseen.length;
 return `<div class="top">${LOGO}<div class="f" style="gap:10px">${RB('users','data-go="#/clients"','Clients')}${ACC}</div></div>
 <div class="f sp" style="margin:6px 0 14px;align-items:flex-end"><div class="h1">Appels</div><span class="t2" style="font-size:13px;padding-bottom:5px">${n?n+' nouveau'+(n>1?'x':''):'À jour'}</span></div>
 <label class="srch">${I('search',18)}<input id="q" type="search" placeholder="Client, ville, motif, téléphone…" value="${esc(UI.q)}" autocomplete="off"></label>
 <div style="margin:12px 0 14px"><div id="pills"></div></div><div id="list"></div>`}
function detailBody(c){const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse);
 const info=(ic,k,v,href)=>`<${href?'a href="'+href+'"'+(href.startsWith('http')?' target="_blank" rel="noopener"':''):'div'} class="irow"><div class="tile">${I(ic,17)}</div><div class="fl" style="min-width:0"><div class="t2" style="font-size:12px">${k}</div><div class="ell" style="font-size:15px;font-weight:500;margin-top:2px">${v}</div></div>${href?I('chev',16,'color:var(--t3)'):''}</${href?'a':'div'}>`;
 const rv=RDVS().filter(r=>r.call_id==c.id).sort((a,b)=>new Date(b.rdv_date)-new Date(a.rdv_date))[0];
 const hist=DB.calls.filter(x=>x.telephone_client==c.telephone_client&&x.id!=c.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 const S=t=>`<div class="sh2">${t}</div>`;
 return `${S('Ce que veut le client')}<div class="blk2"><div style="font-size:17px;font-weight:600;line-height:24px">${esc(c.besoin_detail)}</div><div class="sub" style="margin-top:4px">${esc(c.motif)} · ${esc({devis:'Devis',depannage:'Dépannage',entretien:'Entretien',information:'Information'}[c.type_demande]||c.type_demande)}${c.urgence=='urgent'?' · <span class="sg urg2" style="display:inline-flex"><i class="sd" style="background:'+SIG+'"></i>Urgent</span>':''}</div></div>
 ${S('Résumé IA')}<div class="aisum"><div><div class="f sp"><span class="f" style="gap:8px;font-size:13px;font-weight:600"><svg width="18" height="13" style="color:#fff"><use href="#mark"/></svg>Akno</span><span style="font-size:12px;color:var(--t3)">Appel de ${esc(c.duree||'')}</span></div><div style="font-size:15px;line-height:21px;margin-top:8px;color:#E4E4E7">${esc(c.resume)}</div>${c.raison_blocage&&c.statut!='rdv_pris'?`<div class="t2" style="font-size:13px;margin-top:8px">Frein détecté : ${esc(c.raison_blocage)}</div>`:''}</div></div>
 ${S('Infos')}<div class="blk2 lst">${info('phone','Téléphone',esc(c.telephone_client),telHref(c.telephone_client))}<div class="sep"></div>${info('pin','Adresse',esc(c.adresse),maps)}<div class="sep"></div>${info('t-home','Code postal · Ville',esc(c.code_postal)+' · '+esc(c.ville))}<div class="sep"></div>${info('mail','E-mail',esc(c.email_client),'mailto:'+c.email_client)}</div>
 ${S('Rendez-vous')}<div class="blk2 lst">${rv?`<div class="irow" data-rdv="${rv.id}" style="cursor:pointer"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('cal',17)}</div><div class="fl"><div class="t2" style="font-size:12px">${new Date(rv.rdv_date)<new Date()?'Rendez-vous passé':'Rendez-vous confirmé'}</div><div style="font-size:15px;font-weight:500;margin-top:2px">${rdvTxt(rv.rdv_date)} · ${esc(rv.motif)}</div></div>${I('chev',16,'color:var(--t3)')}</div>`:`<div class="irow" data-act="addrdv" data-call="${c.id}" style="cursor:pointer"><div class="tile">${I('plus',17)}</div><div class="fl" style="font-size:15px;font-weight:500">Planifier un rendez-vous</div>${I('chev',16,'color:var(--t3)')}</div>`}</div>
 ${S('Note')}<div class="blk2"><div class="t2 f sp" style="font-size:12px">Visible uniquement par vous<span id="nsv" style="color:var(--t3);opacity:0;transition:opacity .3s">Enregistré</span></div><textarea class="nt" id="ntxt" rows="1" placeholder="Ajouter une note…">${esc(c.note)}</textarea></div>
 ${S('Statut')}<div class="seg" id="seg">${['a_rappeler','rappele','rdv_pris','renseigne'].map(s=>`<button class="${c.statut==s?'on':''}" data-st="${s}">${STL[s]}</button>`).join('')}</div>
 ${S('Historique'+(hist.length?' · '+hist.length:''))}<div class="blk2 lst">${hist.map(x=>`<div class="trow" data-go="#/appel/${x.id}"><div class="fl" style="min-width:0"><div class="ell" style="font-size:14px;font-weight:600">${esc(x.motif)} · ${dlabel(x.created_at)}</div><div class="t2 ell" style="font-size:12px;margin-top:2px">${esc(x.resume)}</div></div>${badgeStat(x)}</div>`).join('')||'<div class="t2" style="font-size:13px;padding:12px 8px">Premier appel de ce client</div>'}</div>`}
function vDetail(id){const c=byId(id);if(!c)return '<div class="empty">Appel introuvable</div>';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse);
 return `<div class="top">${RB('back','data-act="back"','Retour')}<span style="font-size:15px;font-weight:600;margin-left:50px" class="t2">Appel · ${hm(c.created_at)}</span><div class="f" style="gap:10px">${RB('more','data-act="share"','Copier le numéro')}${ACC}</div></div>
 <div class="f" style="gap:14px;margin:6px 0 14px">${AV(ini(c.nom_client),56)}<div class="fl"><div class="ell" style="font-size:24px;font-weight:700;letter-spacing:-.03em">${esc(c.nom_client)}</div><div class="f" style="gap:8px;margin-top:6px;flex-wrap:wrap">${badgeStat(c)}<span class="t2" style="font-size:13px">${esc(c.telephone_client)} · ${ago(c.created_at)}</span></div></div></div>
 <div class="f qa" style="gap:8px">${c.statut=='a_rappeler'?`<button class="ghost" data-act="done" data-id="${c.id}">${I('check',15,'stroke-width:2.2')}Marquer rappelé</button>`:''}<a class="sec" href="sms:${c.telephone_client.replace(/\s/g,'')}">${I('msg',18)}SMS</a><a class="sec" href="${maps}" target="_blank" rel="noopener">${I('nav',18)}Itinéraire</a></div>
 ${detailBody(c)}<div style="height:110px"></div>`}
function dDetail(id){const c=byId(id);if(!c)return '<div class="empty">Sélectionnez un appel</div>';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse),ar=c.statut=='a_rappeler';
 return `<div class="phd"><div class="f" style="gap:16px;min-width:0">${AV(ini(c.nom_client),56)}<div class="fl" style="min-width:0"><div class="ell" style="font-size:24px;font-weight:700;letter-spacing:-.03em">${esc(c.nom_client)}</div><div class="f" style="gap:8px;margin-top:6px;flex-wrap:wrap"><a href="${telHref(c.telephone_client)}" data-stop class="t2" style="font-size:13px">${esc(c.telephone_client)}</a>${c.urgence=='urgent'&&c.statut=='a_rappeler'?URGB:''}${badgeStat(c)}<span class="t2" style="font-size:12px">${ago(c.created_at)}</span></div></div></div>
 <div class="f" style="gap:8px;flex:none;flex-wrap:wrap"><a class="rb" href="sms:${c.telephone_client.replace(/\s/g,'')}" title="SMS">${I('msg',19)}</a><a class="rb" href="mailto:${c.email_client}" title="E-mail">${I('mail',19)}</a><a class="rb" href="${maps}" target="_blank" rel="noopener" title="Itinéraire">${I('nav',19)}</a>${ar?`<button class="ghost" data-act="done" data-id="${c.id}">${I('check',15,'stroke-width:2.2')}Marquer rappelé</button>`:''}<a class="bw bsm" href="${telHref(c.telephone_client)}" data-act="call">${I('phone',16,'stroke-width:2')}Rappeler</a></div></div>
 <div class="pbd">${detailBody(c)}</div>`}
function dAppels(){if(!FIL3[UI.f])UI.f='a_rappeler';const L=sorted().filter(c=>match(c,UI.q)).filter(FIL3[UI.f][1]);if(!UI.sel||!byId(UI.sel))UI.sel=(UI.f=='a_rappeler'?[...L].sort(prio)[0]:L[0])?.id||sorted()[0]?.id;
 return `<div class="md"><div class="col k" data-keep="lcol" style="padding:16px 12px 4px"><label class="srch" style="margin:0 4px">${I('search',18)}<input id="q" type="search" placeholder="Client, ville, motif, téléphone…" value="${esc(UI.q)}" autocomplete="off"></label><div style="margin:12px 4px 12px"><div id="pills"></div></div><div id="list"></div></div>
 <div class="col k pane" data-keep="pane${UI.sel}">${dDetail(UI.sel)}</div></div>`}

/* ---------- Assistant IA ---------- */
function actions(){const now=new Date(),A=[];
 [...DB.calls.filter(c=>c.statut=='a_rappeler')].sort(prio).forEach(c=>A.push({k:'cb'+c.id,t:'Rappeler '+c.nom_client,s:(c.urgence=='urgent'?'Urgent · ':'')+c.motif+' · '+ago(c.created_at),go:'#/appel/'+c.id,tel:c.telephone_client,red:1}));
 const tm=new Date();tm.setDate(tm.getDate()+1);DB.rdvs.filter(r=>dd(r.rdv_date,tm)==0).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date)).forEach(r=>A.push({k:'cf'+r.id,t:'Confirmer le RDV de '+r.nom_client,s:'Demain '+hm(r.rdv_date)+' · '+r.motif,rdv:r.id}));
 DB.calls.filter(c=>c.raison_blocage=='Devis sans réponse'&&c.statut!='rdv_pris'&&dd(c.created_at,now)>-14).forEach(c=>A.push({k:'dv'+c.id,t:'Relancer le devis de '+c.nom_client,s:'Devis envoyé '+dlabel(c.created_at).toLowerCase(),go:'#/appel/'+c.id}));
 const D=doneMap();return A.slice(0,7).sort((a,b)=>!!D[a.k]-!!D[b.k])}
function briefing(){const S=stats(),now=new Date(),y=DB.calls.filter(c=>dd(c.created_at,now)==-1).length,old=[...S.ar].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))[0];
 const nx=DB.rdvs.filter(r=>new Date(r.rdv_date)>now).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date))[0],nh=S.wk.filter(hors).length;
 const B=[`<b>${S.td.length} appel${S.td.length>1?'s':''}</b> aujourd'hui (${y} hier), <b>${S.rdvTd} RDV pris</b>.`,
  S.ar.length?`<b>${S.ar.length} client${S.ar.length>1?'s':''} à rappeler</b>${S.urg.length?`, dont ${S.urg.length} urgent${S.urg.length>1?'s':''}`:''} — le plus ancien attend depuis ${ago(old.created_at).replace('il y a ','')}.`:'Aucun client n\'attend de rappel.',
  S.bl[0]?`Premier frein sur 7 jours : <b>${esc(S.bl[0][0].toLowerCase())}</b> (${S.bl[0][1]} cas).`:'Aucun frein relevé sur 7 jours.',
  nx?`Prochain RDV : <b>${esc(nx.nom_client)}</b>, ${rdvTxt(nx.rdv_date)}.${nh?` ${nh} appels hors horaires captés cette semaine.`:''}`:`${nh} appels hors horaires captés cette semaine.`];
 const A=actions(),D=doneMap(),nd=A.filter(a=>D[a.k]).length;
 return `<div class="aib"><div class="aibi"><div class="f sp"><span class="f" style="gap:8px;font-size:14px;font-weight:600"><svg width="18" height="13" style="color:#fff"><use href="#mark"/></svg>Briefing du jour</span><span class="t2" style="font-size:12px">${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]}</span></div>
 <ul class="bul">${B.map(b=>`<li>${b}</li>`).join('')}</ul>
 <div class="f sp" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)"><span class="lab">Prochaines actions</span><span class="t2" style="font-size:12px" id="acnt">${nd}/${A.length} faites</span></div>
 <div class="chk">${A.map(a=>`<div class="ci ${D[a.k]?'dn':''}"><button class="cb" data-chk="${a.k}" aria-label="Cocher">${I('check',13,'stroke-width:3')}</button><div class="fl" style="min-width:0;cursor:pointer" ${a.rdv?`data-rdv="${a.rdv}"`:`data-go="${a.go}"`}><div class="ell ct">${esc(a.t)}</div><div class="t2 ell" style="font-size:12px">${esc(a.s)}</div></div>${a.tel&&!D[a.k]?`<a class="ib cph" style="opacity:1" href="${telHref(a.tel)}" data-stop aria-label="Appeler">${I('phone',15,'stroke-width:1.9')}</a>`:''}</div>`).join('')||'<div class="t2" style="font-size:13px;padding:8px 0">Rien à faire pour le moment.</div>'}</div></div></div>`}
function answersHtml(){const C=DB.chat,P=[];for(let i=0;i<C.length;i+=2)if(C[i+1])P.push([C[i].t,C[i+1].t]);
 return P.reverse().slice(0,4).map(([q,a],i)=>`<div class="ans ${i?'old':''}"><div class="aq">${I('t-ai',13)}${esc(q)}</div><div class="ma2">${a}</div></div>`).join('')}
function chatHtml(){return `<div class="askb aich k"><div class="f sp"><span style="font-size:17px;font-weight:700">Demander à Akno</span>${DB.chat.length?'<button class="t2 clr" data-act="clearchat">Effacer</button>':''}</div>
 <form class="ain big" id="askf"><input id="askq" placeholder="Qui rappeler, mes RDV, un client…" autocomplete="off"><button class="snd" aria-label="Envoyer">${I('send',18,'stroke-width:2.2')}</button></form>
 <div class="chips">${SUGG.map(q=>`<button class="pill" data-ask="${esc(q)}">${q}</button>`).join('')}</div>
 <div id="answers">${answersHtml()}</div><div class="demo">Assistant de démo · réponses calculées sur vos données locales</div></div>`}
function sendAsk(q){q=q.trim();if(!q)return;DB.chat.push({u:1,t:q},{t:ask(q)});if(DB.chat.length>30)DB.chat=DB.chat.slice(-30);save();$('.askb').outerHTML=chatHtml();if(isD())$('#askq').focus()}
function feedList(){const el=$('#feed');if(!el)return;const L=sorted();
 $('#fpills').innerHTML=Object.entries(FFIL).map(([k,[l,f]])=>`<button class="pill ${UI.ff==k?'on':''}" data-ff="${k}">${l} · ${L.filter(f).length}</button>`).join('');
 const F=L.filter(FFIL[UI.ff][1]);
 el.innerHTML=F.map(c=>{const o=UI.jx==c.id;return `<div class="jr ${o?'open':''}"><button class="jh" data-jx="${c.id}"><i class="dot" style="background:${barC(c)};width:8px;height:8px"></i><span class="fl ell" style="text-align:left"><b>${esc(c.nom_client)}</b><span class="t2"> · ${esc(c.motif)}</span></span>${c.note?I('note',13,'color:var(--t3);flex:none'):''}<span class="t2" style="font-size:12px;flex:none">${dlabel(c.created_at).replace(/ \d+ \S+$/,'')} ${hm(c.created_at)}</span>${I('chev',14,'color:var(--t3);flex:none;transform:rotate('+(o?90:0)+'deg)')}</button>
 ${o?`<div class="jb"><div class="fsec"><span class="fk">Résumé IA</span><p>${esc(c.resume)}</p></div>${c.note?`<div class="fsec"><span class="fk">Note</span><p>${esc(c.note)}</p></div>`:''}<div class="fsec"><span class="fk">Debrief</span><p class="${c.statut=='a_rappeler'?'rd':''}">${esc(DEBRIEF(c))}</p></div><div class="f sp" style="margin-top:10px">${badgeStat(c)}<a class="t2" style="font-size:13px;font-weight:600" data-go="#/appel/${c.id}">Ouvrir l'appel ›</a></div></div>`:''}</div>`}).join('')||'<div class="empty">Rien à afficher</div>'}
const journal=(open=true)=>`<div class="k jn"><button class="f sp jt" data-act="jtog" style="width:100%"><span class="lab">Journal des appels · ${DB.calls.length}</span>${isD()?'':`<span class="t2" style="font-size:13px">${open?'Masquer':'Afficher'}</span>`}</button>${open?'<div class="pills" id="fpills" style="margin:10px 0 6px;padding:0;flex-wrap:wrap"></div><div id="feed"></div>':''}</div>`;
function vAssist(){return `<div class="top">${LOGO}<div class="f" style="gap:10px">${RB('users','data-go="#/clients"','Clients')}${ACC}</div></div>
 <div class="h1" style="margin:6px 0 14px">Assistant IA</div>${briefing()}<div style="margin-top:12px">${chatHtml()}</div><div style="margin-top:12px">${journal(UI.jopen)}</div><div style="height:20px"></div>`}
function dAssist(){return `<div class="as"><div class="col" data-keep="acol">${briefing()}<div style="margin-top:16px">${chatHtml()}</div></div><div class="col" data-keep="afeed">${journal(true)}</div></div>`}

document.addEventListener('click',e=>{const t=e.target;let x;const st=()=>{e.preventDefault();e.stopPropagation()};
 if(x=t.closest('[data-per]')){st();UI.per=x.dataset.per;refresh();return}
 if(x=t.closest('[data-chk]')){st();const D=doneMap(),k=x.dataset.chk;D[k]=!D[k];if(!D[k])delete D[k];save();const b=$('.aib');b.outerHTML=briefing();toast(D[k]?'Action faite':'Action rouverte');return}
 if(x=t.closest('[data-jx]')){st();UI.jx=UI.jx==+x.dataset.jx?null:+x.dataset.jx;feedList();return}
 if(x=t.closest('[data-act=jtog]')){st();if(isD())return;UI.jopen=!UI.jopen;$('.jn').outerHTML=journal(UI.jopen);feedList();return}
},true);
document.addEventListener('input',e=>{if(e.target.id=='panier'){const v=+e.target.value;if(v>=0){DB.panier=v;save()}}});
document.addEventListener('change',e=>{if(e.target.id=='panier')toast('Panier moyen : '+eur(panier()))});

load();route();
let _mode=isD();addEventListener("resize",()=>{if(isD()!=_mode){_mode=isD();route()}});
setInterval(()=>{if(['resume','agenda'].includes(curTab)&&!document.activeElement.matches('input,textarea'))refresh()},60000);
