/* ============================ CONFIG SUPABASE ============================ */
/* Remplir ces deux constantes pour passer en mode réel. Vides = mode démo. */
const _ENV=(typeof window!=='undefined'&&window.__AKNO_ENV)||{};
const SUPABASE_URL=_ENV.NEXT_PUBLIC_SUPABASE_URL||'';       // ex. https://xxxx.supabase.co
const SUPABASE_ANON_KEY=_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY||'';  // clé "anon public" (jamais la clé service_role)
const CLOUD=!!(SUPABASE_URL&&SUPABASE_ANON_KEY);
/* ============================ OUTILS ============================ */
const LS=CLOUD?'akno_prefs_v5':'akno_demo_v5';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ini=n=>(n||'?').trim().split(/\s+/).filter(w=>/[a-zA-ZÀ-ÿ]/.test(w[0])).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const P={dash:'<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 14H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.8 3.4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9c.3.6.9 1 1.6 1H21a2 2 0 1 1 0 4h-.1c-.7 0-1.3.4-1.5 1z"/>',
back:'<path d="M15 5 8 12l7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',
in:'<path d="M17 7 7 17M7 10v7h7"/>',out:'<path d="M7 17 17 7M10 7h7v7"/>',
msg:'<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>',nav:'<path d="M3 11 21 3l-8 18-2-8z"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',check:'<path d="M5 12.5 10 17 19 7"/>',
pin:'<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',up:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
shield:'<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',send:'<path d="M12 19V5M6 11l6-6 6 6"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',
out2:'<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>'};
const I=(n,w=20,st='')=>`<svg class="i" viewBox="0 0 24 24" width="${w}" height="${w}" style="${st}" aria-hidden="true">${P[n]}</svg>`;
const PHF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';
const MARK=(w=34,h=25)=>`<svg width="${w}" height="${h}" style="color:#fff;display:block" aria-label="Akno"><use href="#mark"/></svg>`;
const JOURS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const JC=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const p2=n=>String(n).padStart(2,'0');
const hm=d=>{d=new Date(d);return d.getHours()+':'+p2(d.getMinutes())};
const hmTxt=d=>{d=new Date(d);return d.getHours()+' h'+(d.getMinutes()?' '+p2(d.getMinutes()):'')};
const sod=d=>{d=new Date(d);d.setHours(0,0,0,0);return d};
const dd=(a,b)=>Math.round((sod(a)-sod(b))/864e5);
const addD=(d,n)=>{d=new Date(d);d.setDate(d.getDate()+n);return d};
const mon=d=>{d=sod(d);return addD(d,-((d.getDay()+6)%7))};
const ymd=d=>{d=new Date(d);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const dayWord=d=>{const n=dd(d,new Date());return n==0?'aujourd\'hui':n==1?'demain':n==-1?'hier':JOURS[new Date(d).getDay()]+' '+new Date(d).getDate()+' '+MOIS[new Date(d).getMonth()]};
const dateLong=d=>{d=new Date(d);return cap(JOURS[d.getDay()])+' '+d.getDate()+' '+MOIS[d.getMonth()]+' '+d.getFullYear()};
const rowTime=d=>{const n=dd(new Date(),d);return n==0?hm(d):n==1?'hier':n<7?JOURS[new Date(d).getDay()]:new Date(d).getDate()+'/'+p2(new Date(d).getMonth()+1)};
const telHref=t=>'tel:'+String(t||'').replace(/\s/g,'').replace(/^0/,'+33');
const maps=a=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(a||'');
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const isD=()=>innerWidth>=1024;
const ST={a_rappeler:'À rappeler',rappele:'Rappelé',rdv_pris:'RDV pris',traite:'Sans suite'};
const TYPES=['Visite devis','Panne','Entretien','Installation'];
const PROFIL={prenom:'Julien',nom:'Martin',initiales:'JM',entreprise:'Martin Chauffage',telephone:'04 78 00 00 00',zone:'Lyon et alentours (69)',email:'contact@martin-chauffage.fr'};

/* ============================ DÉMO (données fictives) ============================ */
function demo(){const t=(j,h,m)=>{const x=addD(new Date(),j);x.setHours(h,m,0,0);return x.toISOString()};
 const C=[[0,10,42,'Marie Laurent','06 21 45 78 90','Remplacement chaudière','Chaudière gaz de 2004, facture trop élevée. Souhaite étudier une pompe à chaleur air-eau.','normal','24 rue Paul Bert','69003','Lyon','marie.laurent@exemple.fr','rdv_pris',[1,9,30,75,'Visite devis']],
 [0,9,15,'Pierre Dubois','06 12 34 56 78','Panne PAC','Pompe à chaleur arrêtée depuis 2 jours, code erreur affiché. Maison qui refroidit.','urgent','8 rue des Lilas','69100','Villeurbanne','pierre.dubois@exemple.fr','a_rappeler'],
 [0,8,2,'','05 68 30 26 40','Information','Appel court, la personne a demandé les horaires puis a raccroché.','normal','','','','','a_rappeler'],
 [-1,17,40,'Sophie Martin','06 77 88 12 05','Entretien','Entretien annuel de la chaudière gaz, contrat à renouveler.','normal','5 cours Vitton','69006','Lyon','sophie.martin@exemple.fr','rdv_pris',[0,16,30,60,'Entretien']],
 [-1,14,5,'Thomas Bernard','06 45 12 87 33','Installation PAC','Maison de 120 m², souhaite installer une PAC et connaître les aides MaPrimeRénov\'.','normal','17 chemin du Moulin','69130','Écully','thomas.bernard@exemple.fr','rappele'],
 [-1,11,20,'Julie Moreau','07 61 22 33 44','Devis climatisation','Demande de devis pour une climatisation réversible dans 3 pièces.','normal','3 place Bellecour','69002','Lyon','julie.moreau@exemple.fr','a_rappeler'],
 [-2,10,0,'Luc Petit','06 98 76 54 32','Remplacement chaudière','Chaudière fioul en fin de vie, veut passer à une PAC. A demandé les aides.','normal','42 avenue Foch','69110','Sainte-Foy-lès-Lyon','luc.petit@exemple.fr','rappele'],
 [-2,16,45,'Claire Roux','06 11 22 33 44','Suivi de devis','Relance au sujet du devis envoyé la semaine dernière.','normal','9 rue Mercière','69002','Lyon','claire.roux@exemple.fr','a_rappeler'],
 [-3,9,10,'Karim Benali','06 55 44 33 22','Panne chaudière','Plus d\'eau chaude depuis ce matin.','urgent','21 rue Garibaldi','69007','Lyon','karim.benali@exemple.fr','rdv_pris',[2,14,0,60,'Panne']],
 [-3,15,30,'Nadia Lefèvre','06 33 21 09 87','Entretien','Entretien de la pompe à chaleur avant l\'hiver.','normal','14 rue de Créqui','69006','Lyon','nadia.lefevre@exemple.fr','traite'],
 [-4,8,50,'Antoine Garnier','06 20 30 40 50','Installation PAC','Construction neuve, cherche un installateur pour PAC air-eau.','normal','2 allée des Pins','38200','Vienne','antoine.garnier@exemple.fr','rappele'],
 [-4,10,15,'Émilie Girard','06 70 80 90 10','Panne PAC','Bruit anormal sur l\'unité extérieure.','normal','30 rue Duguesclin','69006','Lyon','emilie.girard@exemple.fr','rdv_pris',[3,10,0,60,'Panne']],
 [-5,9,5,'Hugo Fontaine','06 12 90 34 78','Remplacement chaudière','Chaudière qui tombe souvent en panne, envisage un remplacement.','normal','11 rue Sala','69002','Lyon','hugo.fontaine@exemple.fr','rappele'],
 [-5,11,40,'Camille Robin','06 88 77 66 55','Entretien','Demande de contrat d\'entretien annuel.','normal','6 rue Juliette Récamier','69006','Lyon','camille.robin@exemple.fr','rdv_pris',[4,9,0,45,'Entretien']],
 [-6,9,20,'Marc Chevalier','06 41 52 63 74','Panne PAC','PAC en sécurité, radiateurs froids.','urgent','19 rue Victor Hugo','42000','Saint-Étienne','marc.chevalier@exemple.fr','traite'],
 [-6,10,30,'Léa Mercier','06 23 45 67 89','Installation PAC','Projet de rénovation complète, PAC + plancher chauffant.','normal','8 rue Pasteur','69007','Lyon','lea.mercier@exemple.fr','rdv_pris',[6,14,0,90,'Visite devis']],
 [-6,15,0,'Paul Lambert','06 98 12 34 56','Remplacement chaudière','Compare plusieurs devis pour remplacer sa chaudière gaz.','normal','27 quai Saint-Antoine','69002','Lyon','paul.lambert@exemple.fr','rappele'],
 [-8,10,10,'Inès Faure','06 54 32 10 98','Entretien','Entretien chaudière à condensation.','normal','4 rue Royale','69001','Lyon','ines.faure@exemple.fr','traite'],
 [-9,14,20,'Bruno Roche','06 87 65 43 21','Remplacement chaudière','Souhaite un devis pour une chaudière à granulés.','normal','15 route de Lyon','69570','Dardilly','bruno.roche@exemple.fr','rappele']];
 const calls=[],rdvs=[];C.forEach((c,i)=>{const id=i+1;const x={id,nom_client:c[3]||'',telephone_client:c[4],motif:c[5],besoin_detail:c[6],urgence:c[7],adresse:c[8],code_postal:c[9],ville:c[10],email_client:c[11],statut:c[12],note:'',created_at:t(c[0],c[1],c[2]),duration:70+((i*37)%80),rdv_date:null,
  resume:(c[3]?c[3].split(' ')[0]:'La personne')+' appelle pour : '+c[5].toLowerCase()+'. '+c[6]+(c[12]=='rdv_pris'?' Un rendez-vous a été fixé.':c[7]=='urgent'?' Demande un rappel rapide.':' Souhaite être rappelé.')};
  if(c[13]){const r=c[13];x.rdv_date=t(r[0],r[1],r[2]);rdvs.push({id:'r'+id,call_id:id,nom_client:x.nom_client,telephone_client:x.telephone_client,type:r[4],motif:x.motif,rdv_date:x.rdv_date,duree:r[3],adresse:x.adresse+', '+x.code_postal+' '+x.ville,note:'',rappel:true})}
  calls.push(x)});
 rdvs.push({id:'r100',call_id:null,nom_client:'Gérard Blanc',telephone_client:'06 32 14 58 96',type:'Installation',motif:'Installation PAC',rdv_date:t(1,14,0),duree:120,adresse:'12 rue Bossuet, 69006 Lyon',note:'Pose de l\'unité extérieure.',rappel:false});
 return {calls,rdvs,chat:[],notif:{nouveaux:true,urgents:true,resume:false}}}

/* ============================ ÉTAT ============================ */
let DB;
function load(){try{const s=JSON.parse(localStorage.getItem(LS)||'null');if(s&&s.calls&&s.rdvs){DB=s;return}}catch(e){}DB=demo();save()}
function save(){if(CLOUD){cloudSync();try{localStorage.setItem(LS,JSON.stringify({chat:DB.chat,notif:DB.notif}))}catch(e){}return}try{localStorage.setItem(LS,JSON.stringify(DB))}catch(e){}}
const byId=id=>DB.calls.find(c=>String(c.id)==String(id));
const rdvById=id=>DB.rdvs.find(r=>String(r.id)==String(id));
const nomOf=c=>c.nom_client||c.telephone_client||'Numéro inconnu';
const sorted=()=>[...DB.calls].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
const aRappeler=()=>DB.calls.filter(c=>c.statut=='a_rappeler').sort((a,b)=>(b.urgence=='urgent')-(a.urgence=='urgent')||new Date(b.created_at)-new Date(a.created_at));
const upcoming=()=>DB.rdvs.filter(r=>new Date(r.rdv_date).getTime()+(r.duree||60)*6e4>Date.now()).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date));
const week=()=>DB.calls.filter(c=>dd(new Date(),c.created_at)<7);
let tt;function toast(m){const t=$('#toast');t.innerHTML=I('check',16,'color:#5B8CFF;stroke-width:2.2')+esc(m);t.classList.add('sh');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('sh'),2000)}

/* ============================ UI ============================ */
const UI={f:'tous',view:'jour',day:sod(new Date()),aq:''};
const TABS=[['dash','Dashboard','#/'],['phone','Appels','#/appels'],['cal','Agenda','#/agenda'],['spark','Assistant','#/assistant'],['gear','Réglages','#/reglages']];
function shell(tab,body,extra=''){
 const nav=`<nav class="nav" aria-label="Navigation">${TABS.map(([i,l,h],k)=>`<a class="tb${tab==k?' on':''}" href="${h}" ${tab==k?'aria-current="page"':''}>${I(i,21)}${l}</a>`).join('')}</nav>`;
 const side=`<aside class="side"><div class="lg">${MARK(40,29)}</div>${TABS.map(([i,l,h],k)=>`<button data-go="${h}" class="${tab==k?'on':''}">${I(i,20)}${l}</button>`).join('')}<div class="spc"></div><button data-go="#/reglages"><span class="av" style="width:30px;height:30px;font-size:11px">${PROFIL.initiales}</span>${esc(PROFIL.prenom)} ${esc(PROFIL.nom)}</button></aside>`;
 $('#app').innerHTML=side+`<main id="main">${body}</main>`+extra+nav}
const topBar=(left)=>`<div class="top">${left||`<span class="lgm">${MARK()}</span><span class="dsk"></span>`}<a class="av" href="#/reglages" aria-label="Compte">${PROFIL.initiales}</a></div>`;
const backBtn=(h,l)=>`<a class="back" href="${h}">${I('back',22,'stroke-width:2')}${l}</a>`;
const av=(c,s)=>`<div class="a${s?' '+s:''}">${c.nom_client?ini(c.nom_client):I('user',20,'color:#9AA8C6')}</div>`;

/* ---------- Dashboard ---------- */
function vDash(){const w=week(),ar=aRappeler(),up=upcoming(),nx=up[0];
 const days=[...Array(7)].map((_,i)=>addD(sod(new Date()),i-6));const cnt=days.map(d=>DB.calls.filter(c=>dd(c.created_at,d)==0).length);const mx=Math.max(1,...cnt);
 const chart=`<div class="chart">${days.map((d,i)=>`<div class="c${i==6?' t':''}"><b>${cnt[i]}</b><i style="height:${cnt[i]/mx*60+6}px"></i><span>${JC[d.getDay()]}</span></div>`).join('')}</div>`;
 const rec=sorted().slice(0,4);
 const recent=`<div class="k"><div class="hd"><div class="lab">Appels récents</div></div><div style="margin-top:4px">${rec.map(c=>`<a class="cl" href="#/appel/${c.id}" style="cursor:pointer">${av(c)}<div class="fl"><div class="nm ell">${esc(nomOf(c))}</div><div class="sb ell">${esc(c.motif)}${c.statut=='a_rappeler'?` · <span class="dot"></span><span class="red">À rappeler</span>`:''}</div></div><div class="tm">${rowTime(c.created_at)}</div></a>`).join('')}</div><a class="btnw" href="#/appels" style="margin-top:8px">Voir tous les appels</a></div>`;
 const nxt=`<div class="k"><div class="hd"><div class="lab">Prochains rendez-vous</div><a class="link" href="#/agenda" style="font-size:13px">Agenda</a></div><div style="margin-top:4px">${up.slice(0,3).map(r=>`<a class="cl" href="#/rdv/${r.id}"><div class="a" style="font-size:12px">${hm(r.rdv_date)}</div><div class="fl"><div class="nm ell">${esc(r.nom_client)}</div><div class="sb ell">${cap(dayWord(r.rdv_date))} · ${esc(r.type)}</div></div>${I('chev',16,'color:var(--t3)')}</a>`).join('')||'<div class="empty">Aucun rendez-vous à venir</div>'}</div></div>`;
 const k1=`<a class="k" href="#/appels" style="display:block"><div class="lab">Appels reçus</div><div class="big">${w.length}</div><div class="sub">7 derniers jours</div>${ar.length?`<div class="f red" style="gap:6px;font-size:12px;margin-top:12px"><span class="dot"></span>${ar.length} client${ar.length>1?'s':''} à rappeler</div>`:`<div class="t2" style="font-size:12px;margin-top:12px">Tout est à jour</div>`}</a>`;
 const k2=`<a class="k" href="#/agenda" style="display:block"><div class="lab">RDV à venir</div><div class="big">${up.length}</div><div class="sub">planifiés</div><div class="blue ell" style="font-size:12px;margin-top:12px">${nx?'Prochain : '+dayWord(nx.rdv_date)+' '+hmTxt(nx.rdv_date):'Aucun RDV'}</div></a>`;
 const ch=`<div class="k"><div class="hd"><div class="lab">Appels par jour</div><div class="t3" style="font-size:12px">7 derniers jours</div></div>${chart}</div>`;
 return topBar()+`<div class="dsk" style="margin:-6px 0 18px"><div class="h1">Bonjour ${esc(PROFIL.prenom)}</div><div class="sub">${cap(dateLong(new Date()))}</div></div>
 <div class="mob gap"><div class="row2">${k1}${k2}</div>${ch}${recent}${nxt}</div>
 <div class="dsk"><div class="dg">${k1}${k2}<div class="k" style="min-height:100%"><div class="lab">Taux de RDV</div><div class="big">${w.length?Math.round(w.filter(c=>c.statut=='rdv_pris').length/w.length*100):0} %</div><div class="sub">des appels de la semaine</div></div><div class="s2">${ch}</div><div class="r2">${nxt}</div><div class="s2">${recent}</div></div></div>`}

/* ---------- Appels ---------- */
function callRows(list,sel){if(!list.length)return '<div class="list"><div class="empty">Aucun appel</div></div>';
 const g={Aujourd:[],Hier:[],Plus:[]};list.forEach(c=>{const n=dd(new Date(),c.created_at);(n==0?g.Aujourd:n==1?g.Hier:g.Plus).push(c)});
 const L={Aujourd:'Aujourd\'hui',Hier:'Hier',Plus:'Plus ancien'};
 return Object.keys(g).filter(k=>g[k].length).map(k=>`<div class="gh">${L[k]}</div><div class="list">${g[k].map(c=>`<div class="r${sel==c.id?' sel':''}" data-go="#/appel/${c.id}" role="link" tabindex="0">${av(c)}<div class="fl"><div class="nm ell${c.statut=='a_rappeler'?' red':''}">${esc(nomOf(c))}</div><div class="sb ell">${I('in',11,'stroke-width:2')}${esc(c.motif)}</div></div><div class="tm">${rowTime(c.created_at)}</div><a class="cb" href="${telHref(c.telephone_client)}" aria-label="Appeler ${esc(nomOf(c))}" data-stop>${PHF}</a></div>`).join('')}</div>`).join('')}
function filtered(){return sorted().filter(c=>UI.f=='tous'||(UI.f=='ar'?c.statut=='a_rappeler':c.statut=='rdv_pris'))}
function vAppels(sel){const ar=aRappeler().length;
 const head=`<div class="hd" style="margin:2px 2px 14px;align-items:flex-end"><div class="h1">Appels</div><span class="t2" style="font-size:13px">${DB.calls.length} au total</span></div><div class="seg" role="tablist">${[['tous','Tous'],['ar','À rappeler'+(ar?' ('+ar+')':'')],['rdv','RDV pris']].map(([k,l])=>`<button data-f="${k}" class="${UI.f==k?'on':''}" role="tab">${l}</button>`).join('')}</div>`;
 if(isD()){const s=sel||filtered()[0]?.id;return topBar()+`<div class="split"><div>${head}${callRows(filtered(),s)}</div><div class="pane">${s?detailBody(byId(s),true):'<div class="k empty">Sélectionnez un appel</div>'}</div></div>`}
 return topBar()+head+callRows(filtered())}
function detailBody(c,desk){if(!c)return '<div class="k empty">Appel introuvable</div>';const rv=DB.rdvs.find(r=>r.call_id==c.id);const adr=[c.adresse,c.code_postal,c.ville].filter(Boolean).join(' ');
 const kv=rows=>rows.map(([k,v])=>`<div class="kv"><span>${k}</span><span>${v||'<span class="t3">—</span>'}</span></div>`).join('');
 return `<div class="hero" style="${desk?'margin-top:6px':''}">${av(c,'ba')}<div class="hn">${esc(nomOf(c))}</div><div class="t2" style="font-size:14px;margin-top:4px">${esc(c.telephone_client)} · ${dayWord(c.created_at)}, ${hm(c.created_at)}</div><div class="chip">${c.statut=='a_rappeler'?'<span class="dot"></span><span class="red">À rappeler</span>':esc(ST[c.statut])}</div></div>
 <div class="acts"><a class="act" href="${telHref(c.telephone_client)}">${I('phone')}Appeler</a><a class="act" href="sms:${esc(String(c.telephone_client).replace(/\s/g,''))}">${I('msg')}SMS</a><a class="act" href="${maps(adr)}" target="_blank" rel="noopener">${I('nav')}Itinéraire</a></div>
 <div class="gap"><div class="k"><div class="ct">${MARK(18,13)}Résumé IA</div><div class="tx">${esc(c.resume)}</div></div>
 <div class="k"><div class="ct">Descriptif</div>${kv([['Motif',esc(c.motif)],['Besoin',esc(c.besoin_detail)],['Urgence',c.urgence=='urgent'?'<span class="red">Urgent</span>':'Normale'],['Durée',Math.floor(c.duration/60)+' min '+p2(c.duration%60)]])}</div>
 <div class="k"><div class="ct">Coordonnées</div>${kv([['Téléphone',`<a class="link" href="${telHref(c.telephone_client)}">${esc(c.telephone_client)}</a>`],['E-mail',c.email_client?`<a class="link" href="mailto:${esc(c.email_client)}">${esc(c.email_client)}</a>`:''],['Adresse',c.adresse?`<a class="link" href="${maps(adr)}" target="_blank" rel="noopener">${esc(c.adresse)}, ${esc(c.ville)}</a>`:''],['Code postal',esc(c.code_postal)]])}</div>
 <div class="k"><div class="ct">Rendez-vous</div>${rv?`<a class="f sp" href="#/rdv/${rv.id}"><span class="tx">${cap(dayWord(rv.rdv_date))} à ${hmTxt(rv.rdv_date)}</span>${I('chev',16,'color:var(--t3)')}</a>`:`<button class="f sp link" style="width:100%" data-act="newrdv" data-call="${c.id}"><span>Planifier un rendez-vous</span>${I('plus',18)}</button>`}</div>
 <div class="k"><div class="ct">Statut</div>${Object.entries(ST).map(([k,l])=>`<button class="opt" data-st="${k}" data-id="${c.id}" aria-pressed="${c.statut==k}"><span>${l}</span>${c.statut==k?I('check',18):''}</button>`).join('')}</div>
 <div class="k"><div class="ct">Notes</div><textarea class="note" id="note" data-id="${c.id}" placeholder="Ajouter une note…">${esc(c.note)}</textarea></div></div>`}
function vDetail(id){if(isD())return vAppels(id);return `<div class="top">${backBtn('#/appels','Appels')}<a class="av" href="#/reglages">${PROFIL.initiales}</a></div>`+detailBody(byId(id))}

/* ---------- Agenda ---------- */
const H0=7,H1=20;
function dayRdvs(d){return DB.rdvs.filter(r=>dd(r.rdv_date,d)==0).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date))}
function timeline(days,HH){const n=days.length;const left=46;
 const hrs=[...Array(H1-H0+1)].map((_,i)=>`<div class="hr" style="top:${i*HH}px"><span>${H0+i}:00</span><hr></div>`).join('');
 const col=i=>`calc(${left}px + (100% - ${left}px) * ${i}/${n} + 2px)`;const wd=`calc((100% - ${left}px)/${n} - 4px)`;
 let ev='';days.forEach((d,i)=>dayRdvs(d).forEach(r=>{const s=new Date(r.rdv_date),h=s.getHours()+s.getMinutes()/60;if(h<H0||h>=H1)return;const ht=Math.max((r.duree||60)/60*HH-4,n>1?40:54);
  ev+=`<button class="ev" data-go="#/rdv/${r.id}" style="top:${(h-H0)*HH+6}px;height:${ht}px;left:${col(i)};width:${wd}"><div class="et ell">${n>1?esc(r.nom_client):esc(r.type)+' — '+esc(r.nom_client)}</div><div class="es ell">${hm(r.rdv_date)} – ${hm(new Date(s.getTime()+(r.duree||60)*6e4))}${n>1?'':' · '+esc(r.motif)+(r.adresse?' · '+esc(r.adresse.split(',').pop().trim()):'')}</div></button>`}));
 const now=new Date(),nh=now.getHours()+now.getMinutes()/60;const ti=days.findIndex(d=>dd(d,now)==0);
 const nl=ti>-1&&nh>=H0&&nh<=H1?`<div class="now" style="top:${(nh-H0)*HH+6}px;left:${n>1?col(ti):'40px'};${n>1?'width:'+wd:'right:0'}"></div>`:'';
 const hdr=n>1?`<div style="display:grid;grid-template-columns:${left}px repeat(${n},1fr);margin-bottom:8px"><span></span>${days.map(d=>`<button data-day="${ymd(d)}" data-view="jour" style="text-align:center;padding:6px 0;border-radius:12px;${dd(d,now)==0?'color:var(--ac2)':''}"><div class="t2" style="font-size:12px">${JC[d.getDay()]}</div><div style="font-size:20px;font-weight:500">${d.getDate()}</div></button>`).join('')}</div>`:'';
 return hdr+`<div class="tl" style="height:${(H1-H0)*HH+20}px">${hrs}${nl}${ev}</div>`}
function vAgenda(){const d=UI.day,m=mon(d),now=new Date();const days=[...Array(7)].map((_,i)=>addD(m,i));const D=isD();
 const view=UI.view;
 const strip=`<div class="wk"><button class="nb" data-wk="-1" aria-label="Semaine précédente">${I('back',18)}</button><div class="days">${days.map(x=>`<button class="d${dd(x,d)==0?' on':''}${dd(x,now)==0?' td':''}" data-day="${ymd(x)}"><span>${JC[x.getDay()]}</span><b>${x.getDate()}</b><i class="${dayRdvs(x).length?'e':''}"></i></button>`).join('')}</div><button class="nb" data-wk="1" aria-label="Semaine suivante">${I('chev',18)}</button></div>`;
 const seg=`<div class="seg" style="width:fit-content">${[['jour','Jour'],['semaine','Semaine'],['mois','Mois']].map(([k,l])=>`<button data-view="${k}" class="${view==k?'on':''}" style="flex:none;height:28px;font-size:12px">${l}</button>`).join('')}</div>`;
 const title=view=='mois'?cap(MOIS[d.getMonth()])+' '+d.getFullYear():cap(MOIS[m.getMonth()])+' '+m.getFullYear();
 let body='';
 if(view=='jour'){const lst=dayRdvs(d);body=strip+`<div class="t2" style="font-size:13px;margin:14px 4px 0">${cap(dateLong(d))} · ${lst.length} RDV</div>`+timeline([d],D?60:52)}
 else if(view=='semaine'){if(D)body=`<div class="f" style="gap:8px;margin-bottom:10px"><button class="nb" data-wk="-1">${I('back',18)}</button><button class="nb" data-wk="1">${I('chev',18)}</button><button class="link" data-today style="font-size:13px">Aujourd'hui</button></div><div class="k" style="padding:14px 14px 4px">`+timeline(days,56)+'</div>';
  else body=strip+'<div class="gap" style="margin-top:14px">'+days.map(x=>{const l=dayRdvs(x);return `<div><div class="gh" style="margin-top:4px${dd(x,now)==0?';color:var(--ac2)':''}">${cap(dateLong(x))}</div>${l.length?`<div class="list">${l.map(r=>`<div class="r" data-go="#/rdv/${r.id}"><div class="a" style="font-size:12px">${hm(r.rdv_date)}</div><div class="fl"><div class="nm ell">${esc(r.nom_client)}</div><div class="sb ell">${esc(r.type)} · ${esc(r.motif)}</div></div>${I('chev',16,'color:var(--t3)')}</div>`).join('')}</div>`:'<div class="t3" style="font-size:13px;margin:0 6px">Aucun RDV</div>'}</div>`}).join('')+'</div>'}
 else{const f=new Date(d.getFullYear(),d.getMonth(),1),st=mon(f);const cells=[...Array(42)].map((_,i)=>addD(st,i));
  body=`<div class="k"><div class="f sp" style="margin-bottom:8px"><button class="nb" data-mo="-1">${I('back',18)}</button><b style="font-weight:500">${cap(MOIS[d.getMonth()])} ${d.getFullYear()}</b><button class="nb" data-mo="1">${I('chev',18)}</button></div><div class="mg">${['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(x=>`<div class="h">${x}</div>`).join('')}${cells.map(x=>{const n=dayRdvs(x).length;return `<button class="mc${x.getMonth()!=d.getMonth()?' o':''}${dd(x,now)==0?' td':''}${dd(x,d)==0?' on':''}" data-day="${ymd(x)}" data-view="jour">${x.getDate()}<i>${'<u></u>'.repeat(Math.min(n,3))}</i></button>`}).join('')}</div></div>`+
  `<div class="gh">${cap(dateLong(d))}</div><div class="list">${dayRdvs(d).map(r=>`<div class="r" data-go="#/rdv/${r.id}"><div class="a" style="font-size:12px">${hm(r.rdv_date)}</div><div class="fl"><div class="nm ell">${esc(r.nom_client)}</div><div class="sb ell">${esc(r.type)}</div></div></div>`).join('')||'<div class="empty">Aucun RDV ce jour</div>'}</div>`}
 return topBar()+`<div class="hd" style="margin:0 2px 14px;align-items:flex-end;flex-wrap:wrap"><div><div class="h1">Agenda</div><div class="sub">${title}</div></div><div class="f" style="gap:10px">${seg}<button class="btns dsk" data-act="newrdv" style="height:32px">${I('plus',16,'stroke-width:2')} Nouveau</button></div></div>`+body}
function vRdv(id){const r=rdvById(id);if(!r)return topBar()+'<div class="k empty">Rendez-vous introuvable</div>';const e=new Date(new Date(r.rdv_date).getTime()+(r.duree||60)*6e4);
 const kv=rows=>rows.map(([k,v])=>`<div class="kv"><span>${k}</span><span>${v}</span></div>`).join('');
 const b=`<div class="${isD()?'':''}" style="max-width:640px"><div style="margin:2px 2px 14px"><div class="blue" style="font-size:13px">${esc(r.type)}</div><div class="h1" style="font-size:28px;margin-top:4px">${esc(r.nom_client)}</div><div class="sub" style="margin-top:6px">${cap(dayWord(r.rdv_date))} · ${hmTxt(r.rdv_date)} – ${hmTxt(e)}</div></div>
 <div class="gap"><div class="k"><div class="ct">Rendez-vous</div>${kv([['Date',dateLong(r.rdv_date)],['Motif',esc(r.motif)],['Durée',r.duree>=60?Math.floor(r.duree/60)+' h'+(r.duree%60?' '+p2(r.duree%60):''):r.duree+' min'],['Téléphone',`<a class="link" href="${telHref(r.telephone_client)}">${esc(r.telephone_client)}</a>`],['Rappel SMS la veille',r.rappel?'Activé':'Désactivé']])}</div>
 <div class="k"><div class="ct">Adresse</div><a class="map" href="${maps(r.adresse)}" target="_blank" rel="noopener" aria-label="Ouvrir la carte"><svg width="100%" height="100%" style="position:absolute;inset:0"><g stroke="rgba(255,255,255,.07)" stroke-width="6" fill="none"><path d="M-10 30 Q120 60 700 20"/><path d="M60 -10 L140 120"/><path d="M220 -10 Q200 60 260 120"/></g></svg><span class="pin"></span></a><div class="f sp" style="gap:10px"><span style="font-size:14px">${esc(r.adresse)||'<span class="t3">Aucune adresse</span>'}</span><a class="link" href="${maps(r.adresse)}" target="_blank" rel="noopener">Itinéraire</a></div></div>
 <div class="k"><div class="ct">Notes</div><div class="tx">${esc(r.note)||'<span class="t3">Aucune note</span>'}</div>${r.call_id&&byId(r.call_id)?`<a class="f sp link" href="#/appel/${r.call_id}" style="margin-top:12px;padding-top:12px;border-top:.5px solid var(--line)"><span>Voir l'appel</span>${I('chev',16)}</a>`:''}</div></div>
 <button class="btnw" data-act="editrdv" data-id="${r.id}" style="margin-top:12px;height:48px;border-radius:24px">Modifier</button><button class="del" data-act="delrdv" data-id="${r.id}">Supprimer le rendez-vous</button></div>`;
 return `<div class="top">${backBtn('#/agenda','Agenda')}<a class="av" href="#/reglages">${PROFIL.initiales}</a></div>`+b}
let FORM=null;
function rdvSheet(r,callId){const c=callId?byId(callId):null;const s=r?new Date(r.rdv_date):(()=>{const x=new Date(UI.day);const n=new Date();x.setHours(dd(x,n)==0?Math.min(n.getHours()+1,18):9,0,0,0);return x})();const e=new Date(s.getTime()+((r&&r.duree)||60)*6e4);
 FORM={id:r?r.id:null,call_id:r?r.call_id:(c?c.id:null),type:r?r.type:(c&&/panne/i.test(c.motif)?'Panne':c&&/entretien/i.test(c.motif)?'Entretien':'Visite devis'),rappel:r?!!r.rappel:true};
 const v=(k,d)=>esc(r?r[k]:(c?(k=='adresse'?[c.adresse,c.code_postal+' '+c.ville].filter(x=>x.trim()).join(', '):c[k]):d)||'');
 $('#layer').innerHTML=`<div class="ov" data-act="close"></div><form class="sheet" id="rf" role="dialog" aria-label="${r?'Modifier le rendez-vous':'Nouveau rendez-vous'}"><div class="grab"></div><div class="sh"><button type="button" data-act="close">Annuler</button><b>${r?'Modifier':'Nouveau rendez-vous'}</b><button class="ok" type="submit">${r?'Enregistrer':'Ajouter'}</button></div>
 <div class="grp"><div class="fld"><input class="l" name="nom" placeholder="Client" value="${v('nom_client')}" aria-label="Client" autocomplete="off"></div><div class="fld"><span>Téléphone</span><input name="tel" type="tel" placeholder="06 00 00 00 00" value="${v('telephone_client')}"></div></div>
 <div class="lab2">Type</div><div class="grp"><div class="chips" id="tchips">${TYPES.map(t=>`<button type="button" data-type="${t}" class="${FORM.type==t?'on':''}">${t}</button>`).join('')}</div></div>
 <div class="grp"><div class="fld"><span>Date</span><input type="date" name="date" value="${ymd(s)}" required></div><div class="fld"><span>Début</span><input type="time" name="deb" value="${p2(s.getHours())}:${p2(s.getMinutes())}" required></div><div class="fld"><span>Fin</span><input type="time" name="fin" value="${p2(e.getHours())}:${p2(e.getMinutes())}" required></div></div>
 <div class="grp"><div class="fld"><input class="l" name="adr" placeholder="Adresse" value="${v('adresse')}" aria-label="Adresse"></div><div class="fld"><span>Rappel SMS la veille</span><button type="button" class="tg${FORM.rappel?' on':''}" id="tgr" role="switch" aria-checked="${FORM.rappel}" aria-label="Rappel SMS la veille"></button></div><div class="fld"><textarea name="note" placeholder="Notes" aria-label="Notes">${esc(r?r.note:'')}</textarea></div></div>
 <div class="err" id="ferr"></div></form>`;
 setTimeout(()=>{const i=$('#rf [name=nom]');if(i&&!i.value&&!isD())i.focus()},300)}
function closeLayer(){$('#layer').innerHTML='';FORM=null}
function submitRdv(f){const g=n=>f.elements[n].value.trim();if(!g('nom')){$('#ferr').textContent='Indiquez le nom du client';return}
 const s=new Date(g('date')+'T'+g('deb')),e=new Date(g('date')+'T'+g('fin'));if(isNaN(s)||isNaN(e)||e<=s){$('#ferr').textContent='Vérifiez la date et les heures';return}
 const o={nom_client:g('nom'),telephone_client:g('tel'),type:FORM.type,motif:FORM.call_id&&byId(FORM.call_id)?byId(FORM.call_id).motif:FORM.type,rdv_date:s.toISOString(),duree:Math.round((e-s)/6e4),adresse:g('adr'),note:g('note'),rappel:FORM.rappel,call_id:FORM.call_id};
 let id=FORM.id;if(id){Object.assign(rdvById(id),o);toast('Rendez-vous modifié')}else{id='r'+Date.now();DB.rdvs.push({id,...o});toast('Rendez-vous ajouté')}
 if(o.call_id){const c=byId(o.call_id);if(c){c.rdv_date=o.rdv_date;if(c.statut=='a_rappeler'||c.statut=='rappele')c.statut='rdv_pris'}}
 save();closeLayer();UI.day=sod(s);if(location.hash.startsWith('#/rdv/'))route();else location.hash='#/agenda';route()}
function confirmDel(id){const r=rdvById(id);$('#layer').innerHTML=`<div class="ov" data-act="close"></div><div class="dlg" role="alertdialog"><b style="font-weight:500;font-size:16px">Supprimer ce rendez-vous ?</b><p>${esc(r.nom_client)} · ${dayWord(r.rdv_date)} à ${hmTxt(r.rdv_date)}. Cette action est définitive.</p><div class="bb"><button data-act="close">Annuler</button><button class="rd" data-act="dodel" data-id="${id}">Supprimer</button></div></div>`}

/* ---------- Assistant ---------- */
function stats(){const w=week(),rdv=w.filter(c=>c.statut=='rdv_pris').length,dur=w.length?Math.round(w.reduce((s,c)=>s+(c.duration||0),0)/w.length):0;
 const m={};w.forEach(c=>{const k=/panne/i.test(c.motif)?'Panne':/chaudi/i.test(c.motif)?'Remplacement chaudière':/entretien/i.test(c.motif)?'Entretien':/install|clim/i.test(c.motif)?'Installation':'Autre';m[k]=(m[k]||0)+1});
 const hz=DB.calls.filter(c=>c.code_postal&&!/^69/.test(c.code_postal)).length;
 const byDay={};w.forEach(c=>{const k=new Date(c.created_at).getDay();byDay[k]=(byDay[k]||0)+1});const pk=Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0];
 const aides=DB.calls.filter(c=>/aide|maprime/i.test(c.besoin_detail)).length;
 return {w,rdv,conv:w.length?Math.round(rdv/w.length*100):0,dur,m,hz,pk,aides,gain:w.length*6}}
function vBilan(){const s=stats();const kp=(v,sm,l)=>`<div class="kv2"><b>${v}${sm?`<small>${sm}</small>`:''}</b><span>${l}</span></div>`;const mx=Math.max(1,...Object.values(s.m));
 const gain=Math.floor(s.gain/60)+' h '+p2(s.gain%60);
 return `<div class="gap"><div class="k"><div class="ct">Bilan de la semaine</div><div class="kp">${kp('100 %',s.w.length+'/'+s.w.length,'Appels décrochés')}${kp(s.rdv,'','RDV pris')}${kp(s.conv+' %','','Taux de conversion')}${kp(Math.floor(s.dur/60)+' min '+p2(s.dur%60),'','Durée moyenne')}</div></div>
 <div class="k"><div class="ct">Ce que l'IA a remarqué</div>${[['pin',s.hz+' appel'+(s.hz>1?'s':'')+' hors zone'],['up',s.pk?'Pic d\'appels le '+JOURS[s.pk[0]]:'Pas encore de tendance'],['shield',s.aides+' client'+(s.aides>1?'s ont':' a')+' demandé les aides MaPrimeRénov\''],['clock','Temps gagné estimé : '+gain]].map(([i,t])=>`<div class="ins"><div class="ic">${I(i)}</div>${t}</div>`).join('')}</div>
 <div class="k"><div class="ct">Motifs des appels</div>${Object.entries(s.m).sort((a,b)=>b[1]-a[1]).map(([l,n])=>`<div class="br"><div class="bl"><span>${l}</span><span>${n}</span></div><div class="bt"><i style="width:${n/mx*100}%"></i></div></div>`).join('')||'<div class="t2">Aucun appel cette semaine</div>'}</div></div>`}
const SUG=['Qui dois-je rappeler aujourd\'hui ?','Résume ma semaine','Quels devis relancer ?','Quels RDV demain ?'];
function answer(q){const n=norm(q);
 if(/rappel/.test(n)){const l=aRappeler();if(!l.length)return{t:'Personne à rappeler, tout est à jour.'};const u=l.find(c=>c.urgence=='urgent');return{t:`Vous avez ${l.length} client${l.length>1?'s':''} à rappeler :`,ids:l.slice(0,5).map(c=>c.id),note:u?`${nomOf(u)} est prioritaire : ${u.motif.toLowerCase()} depuis ${Math.max(1,dd(new Date(),u.created_at))||1} jour${dd(new Date(),u.created_at)>1?'s':''}.`:''}}
 if(/semaine|resum|bilan/.test(n)){const s=stats();return{t:`Cette semaine, votre assistante a décroché ${s.w.length} appels. ${s.rdv} ont abouti à un rendez-vous (${s.conv} %). ${aRappeler().length} clients attendent encore un rappel. Motif principal : ${(Object.entries(s.m).sort((a,b)=>b[1]-a[1])[0]||['aucun'])[0].toLowerCase()}.`}}
 if(/devis|relanc/.test(n)){const l=sorted().filter(c=>c.statut=='rappele'&&/devis|chaudi|install|clim/i.test(c.motif)&&!DB.rdvs.some(r=>r.call_id==c.id));return l.length?{t:`${l.length} devis à relancer (rappelés mais sans rendez-vous) :`,ids:l.slice(0,5).map(c=>c.id)}:{t:'Aucun devis à relancer pour le moment.'}}
 if(/demain|rdv|rendez/.test(n)){const dt=/demain/.test(n)?addD(new Date(),1):new Date();const l=dayRdvs(dt);return{t:l.length?`${l.length} rendez-vous ${dayWord(dt)} :`:`Aucun rendez-vous ${dayWord(dt)}.`,rdvs:l.map(r=>r.id)}}
 return{t:'Je n\'ai pas encore de réponse à cette question. Essayez par exemple :',sug:true}}
function msgHtml(m){if(m.r=='u')return `<div class="ub">${esc(m.t)}</div>`;const a=m.a;
 const ids=(a.ids||[]).map(byId).filter(Boolean),rs=(a.rdvs||[]).map(rdvById).filter(Boolean);
 return `<div class="ai">${MARK(18,13)}Assistant Akno</div><div class="k ab"><div class="tx">${esc(a.t)}</div>${ids.length?`<div style="margin-top:8px">${ids.map(c=>`<div class="cl">${av(c)}<a class="fl" href="#/appel/${c.id}"><div class="nm ell">${esc(nomOf(c))}</div><div class="sb ell"><span class="dot" style="${c.urgence=='urgent'?'':'background:var(--ac)'}"></span>${esc(c.motif)} · ${c.urgence=='urgent'?'urgent':'normal'}</div></a><a class="btns" href="${telHref(c.telephone_client)}">Appeler</a></div>`).join('')}</div>`:''}
 ${rs.length?`<div style="margin-top:8px">${rs.map(r=>`<a class="cl" href="#/rdv/${r.id}"><div class="a" style="font-size:12px">${hm(r.rdv_date)}</div><div class="fl"><div class="nm ell">${esc(r.nom_client)}</div><div class="sb ell">${esc(r.type)} · ${esc(r.adresse)}</div></div><span class="btns" style="pointer-events:none">Voir</span></a>`).join('')}</div>`:''}
 ${a.note?`<div class="pr"><span class="dot"></span><span>${esc(a.note)}</span></div>`:''}${a.sug?`<div class="schips" style="margin-top:12px">${SUG.map(s=>`<button data-ask="${esc(s)}">${esc(s)}</button>`).join('')}</div>`:''}</div>`}
const INP=`<form class="inp" id="askf"><input id="askq" placeholder="Posez une question…" aria-label="Question" autocomplete="off"><button type="button" class="mic" aria-label="Dicter" data-act="mic">${I('mic')}</button><button class="snd" aria-label="Envoyer">${I('send')}</button></form>`;
function chatHtml(){return DB.chat.length?`<div class="hd" style="margin:18px 4px 0"><span class="t2" style="font-size:13px">Conversation</span><button class="link" style="font-size:13px" data-act="clearchat">Effacer</button></div>`+DB.chat.map(msgHtml).join(''):''}
function vAssistant(){const sug=`<div class="t2" style="font-size:13px;margin:18px 4px 10px">Demandez à votre assistant</div><div class="schips">${SUG.map(s=>`<button data-ask="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
 const hd=`<div class="h1">Assistant IA</div><div class="sub" style="margin-bottom:16px">Analyse de votre réceptionniste · cette semaine</div>`;
 if(isD())return topBar()+hd+`<div class="split" style="grid-template-columns:minmax(0,440px) minmax(0,1fr)"><div>${vBilan()}</div><div class="k" style="padding:16px 20px;min-height:calc(100vh - 200px);display:flex;flex-direction:column"><div class="fl" id="chat">${sug}${chatHtml()}</div>${INP}</div></div>`;
 return topBar()+hd+vBilan()+sug+`<div id="chat">${chatHtml()}</div>`}
function ask(q){q=q.trim();if(!q)return;DB.chat.push({r:'u',t:q},{r:'a',a:answer(q)});if(DB.chat.length>30)DB.chat=DB.chat.slice(-30);save();route(true);
 requestAnimationFrame(()=>{const el=[...document.querySelectorAll('.ub')].pop();if(el)el.scrollIntoView({block:'start',behavior:'smooth'})})}

/* ---------- Réglages ---------- */
function vReglages(){const tg=(k,l)=>`<div class="fld"><span>${l}</span><button class="tg${DB.notif[k]?' on':''}" data-notif="${k}" role="switch" aria-checked="${!!DB.notif[k]}" aria-label="${l}"></button></div>`;
 return topBar()+`<div class="h1" style="margin-bottom:16px">Réglages</div><div style="max-width:640px">
 <div class="hero" style="text-align:left;display:flex;gap:14px;align-items:center"><div class="a" style="width:60px;height:60px;font-size:20px">${PROFIL.initiales}</div><div><div style="font-size:18px;font-weight:500">${esc(PROFIL.prenom)} ${esc(PROFIL.nom)}</div><div class="t2" style="font-size:13px;margin-top:2px">${esc(PROFIL.entreprise)}</div></div></div>
 <div class="lab2">Entreprise</div><div class="grp">${[['Nom',PROFIL.entreprise],['Téléphone',PROFIL.telephone],['E-mail',PROFIL.email],['Zone',PROFIL.zone]].map(([k,v])=>`<div class="fld"><span>${k}</span><span class="t2 ell" style="font-size:14px">${esc(v)}</span></div>`).join('')}</div>
 <div class="lab2">Notifications</div><div class="grp">${tg('nouveaux','Nouveaux appels')}${tg('urgents','Appels urgents')}${tg('resume','Résumé quotidien')}</div>
 <div class="grp">${CLOUD?`<button class="fld" style="width:100%" data-act="logout"><span class="red">Se déconnecter</span>${I('out2',18,'color:var(--red)')}</button>`:`<button class="fld" style="width:100%" data-act="resetdemo"><span>Réinitialiser la démo</span>${I('reset',18,'color:var(--t2)')}</button>`}</div>
 <div class="t3" style="font-size:12px;text-align:center;margin-top:14px">Akno · ${CLOUD?'connecté':'mode démo, données fictives'}</div></div>`}

/* ============================ ROUTEUR ============================ */
let last='';
function route(keep){const h=location.hash||'#/';const y=scrollY;let m;
 if(h.startsWith('#/appel/'))shell(1,vDetail(h.slice(8)));
 else if(h=='#/appels')shell(1,vAppels());
 else if(h=='#/agenda')shell(2,vAgenda(),`<button class="fab" data-act="newrdv" aria-label="Nouveau rendez-vous">${I('plus')}</button>`);
 else if(m=h.match(/^#\/rdv\/(.+)/))shell(2,vRdv(m[1]));
 else if(h=='#/assistant')shell(3,vAssistant(),isD()?'':INP);
 else if(h=='#/reglages')shell(4,vReglages());
 else shell(0,vDash());
 if(keep||h==last&&!isD())scrollTo(0,y);else if(!(isD()&&h.startsWith('#/appel')&&last.startsWith('#/appel')))scrollTo(0,0);
 last=h;if(keep||h.startsWith('#/appel')&&isD())$('#main').style.animation='none'}
addEventListener('hashchange',()=>{closeLayer();route()});
document.addEventListener('click',e=>{const t=e.target;let x;
 if(t.closest('[data-stop]'))return;
 if(x=t.closest('[data-f]')){UI.f=x.dataset.f;route(true);return}
 if(x=t.closest('[data-st]')){const c=byId(x.dataset.id);if(c.statut!=x.dataset.st){c.statut=x.dataset.st;save();toast('Statut : '+ST[c.statut])}route(true);return}
 if(x=t.closest('[data-type]')){FORM.type=x.dataset.type;document.querySelectorAll('#tchips button').forEach(b=>b.classList.toggle('on',b==x));return}
 if(x=t.closest('#tgr')){FORM.rappel=!FORM.rappel;x.classList.toggle('on',FORM.rappel);x.setAttribute('aria-checked',FORM.rappel);return}
 if(x=t.closest('[data-notif]')){const k=x.dataset.notif;DB.notif[k]=!DB.notif[k];save();route(true);return}
 if(x=t.closest('[data-day]')){UI.day=sod(new Date(x.dataset.day+'T12:00'));if(x.dataset.view)UI.view=x.dataset.view;route(true);return}
 if(x=t.closest('[data-view]')){UI.view=x.dataset.view;route(true);return}
 if(x=t.closest('[data-wk]')){UI.day=addD(UI.day,7*x.dataset.wk);route(true);return}
 if(x=t.closest('[data-mo]')){const d=new Date(UI.day);d.setDate(1);d.setMonth(d.getMonth()+ +x.dataset.mo);UI.day=d;route(true);return}
 if(t.closest('[data-today]')){UI.day=sod(new Date());route(true);return}
 if(x=t.closest('[data-ask]')){ask(x.dataset.ask);return}
 if(x=t.closest('[data-go]')){e.preventDefault();location.hash=x.dataset.go;return}
 if(x=t.closest('[data-act]')){const a=x.dataset.act;
  if(a=='close')closeLayer();
  else if(a=='newrdv')rdvSheet(null,x.dataset.call);
  else if(a=='editrdv')rdvSheet(rdvById(x.dataset.id));
  else if(a=='delrdv')confirmDel(x.dataset.id);
  else if(a=='dodel'){const r=rdvById(x.dataset.id);DB.rdvs=DB.rdvs.filter(y=>y!==r);if(r.call_id){const c=byId(r.call_id);if(c){c.rdv_date=null;if(c.statut=='rdv_pris')c.statut='a_rappeler'}}save();closeLayer();toast('Rendez-vous supprimé');location.hash='#/agenda'}
  else if(a=='clearchat'){DB.chat=[];save();route(true)}
  else if(a=='mic')toast('Dictée : utilisez le micro de votre clavier');
  else if(a=='resetdemo'){DB=demo();save();UI.f='tous';UI.day=sod(new Date());toast('Démo réinitialisée');route()}
  else if(a=='logout')sb.auth.signOut().then(()=>location.reload())}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.matches('.r[data-go]'))location.hash=e.target.dataset.go;if(e.key=='Escape')closeLayer()});
document.addEventListener('submit',e=>{e.preventDefault();if(e.target.id=='rf')submitRdv(e.target);else if(e.target.id=='askf'){const q=$('#askq').value;ask(q)}});
let nt;document.addEventListener('input',e=>{if(e.target.id=='note'){const c=byId(e.target.dataset.id);c.note=e.target.value;clearTimeout(nt);nt=setTimeout(()=>{save()},400)}});
document.addEventListener('change',e=>{if(e.target.id=='note'){save();toast('Note enregistrée')}});
let _m=isD();addEventListener('resize',()=>{if(isD()!=_m){_m=isD();route(true)}});
setInterval(()=>{if((location.hash=='#/agenda'||location.hash==''||location.hash=='#/')&&!$('#layer').innerHTML&&!document.activeElement.matches('input,textarea'))route(true)},60000);

/* ===================== Mode réel : Supabase ===================== */
let sb=null,SNAP=null,USER=null;
const CALL_SYNC=['statut','note','rdv_date'];
const rowToCall=r=>({id:r.id,nom_client:r.nom_client||'',telephone_client:r.telephone_client||'',motif:r.motif||'Autre',besoin_detail:r.besoin_detail||'',code_postal:r.code_postal||'',ville:r.ville||'',adresse:r.adresse||'',email_client:r.email_client||'',rdv_date:r.rdv_date,urgence:r.urgence||'normal',duration:r.duration||0,resume:r.resume||r.besoin_detail||'',statut:r.statut=='renseigne'?'traite':(r.statut||'a_rappeler'),note:r.notes||'',created_at:r.created_at});
const TYPE_RE=/^\[(Visite devis|Panne|Entretien|Installation)\]\s*/;
const rowToRdv=r=>{const m=(r.title||'').match(TYPE_RE);const rp=/\[rappel-sms\]/.test(r.notes||'');return{id:r.id,call_id:r.call_id,nom_client:r.client||'',telephone_client:r.telephone_client||'',type:m?m[1]:'Visite devis',motif:(r.title||'').replace(TYPE_RE,'')||'Rendez-vous',rdv_date:r.start,duree:Math.max(15,Math.round((new Date(r.end)-new Date(r.start))/6e4))||60,adresse:[r.adresse,r.ville].filter(Boolean).join(', '),note:(r.notes||'').replace(/\s*\[rappel-sms\]/,''),rappel:rp}};
const rdvToRow=r=>({artisan_id:USER.id,call_id:r.call_id||null,title:'['+r.type+'] '+(r.motif||''),client:r.nom_client,telephone_client:r.telephone_client||null,start:r.rdv_date,end:new Date(new Date(r.rdv_date).getTime()+(r.duree||60)*6e4).toISOString(),adresse:r.adresse||null,notes:((r.note||'')+(r.rappel?' [rappel-sms]':'')).trim()||null});
const snap=()=>JSON.parse(JSON.stringify({calls:DB.calls,rdvs:DB.rdvs}));
const isUuid=id=>/^[0-9a-f]{8}-/.test(String(id));
async function cloudSync(){if(!SNAP)return;const old=SNAP;SNAP=snap();const err=e=>{if(e){console.warn(e);toast('Erreur de synchronisation')}};
 for(const c of DB.calls){const o=old.calls.find(x=>x.id==c.id);if(!o)continue;const p={};CALL_SYNC.forEach(k=>{if((c[k]??null)!==(o[k]??null))p[k=='note'?'notes':k]=c[k]??null});if(Object.keys(p).length){const{error}=await sb.from('calls').update(p).eq('id',c.id);err(error)}}
 for(const r of old.rdvs)if(!DB.rdvs.some(x=>x.id==r.id)&&isUuid(r.id)){const{error}=await sb.from('appointments').delete().eq('id',r.id);err(error)}
 for(const r of DB.rdvs){const o=old.rdvs.find(x=>x.id==r.id);
  if(!o||!isUuid(r.id)){const{data,error}=await sb.from('appointments').insert(rdvToRow(r)).select('id').single();err(error);if(data){const tmp=r.id;r.id=data.id;const s2=SNAP.rdvs.find(x=>x.id==tmp);if(s2)s2.id=data.id;if(location.hash=='#/rdv/'+tmp)location.hash='#/rdv/'+data.id}}
  else if(JSON.stringify(o)!==JSON.stringify(r)){const{error}=await sb.from('appointments').update(rdvToRow(r)).eq('id',r.id);err(error)}}}
async function cloudLoad(){const[a,c,r]=await Promise.all([sb.from('artisans').select('*').eq('id',USER.id).maybeSingle(),sb.from('calls').select('*').order('created_at',{ascending:false}).limit(500),sb.from('appointments').select('*').order('start')]);
 if(c.error||r.error){toast('Impossible de charger les données');console.warn(c.error||r.error)}
 const pf=a.data||{};const pr=pf.prenom||(USER.email||'').split('@')[0];
 Object.assign(PROFIL,{prenom:pr,nom:'',initiales:ini(pr+' '+(pf.nom_entreprise||'')),entreprise:pf.nom_entreprise||'',telephone:pf.telephone||'',email:pf.email||USER.email||''});
 let p={};try{p=JSON.parse(localStorage.getItem(LS)||'{}')}catch(e){}
 DB={calls:(c.data||[]).map(rowToCall),rdvs:(r.data||[]).map(rowToRdv),chat:p.chat||[],notif:p.notif||{nouveaux:true,urgents:true,resume:false}};SNAP=snap();
 sb.channel('calls').on('postgres_changes',{event:'INSERT',schema:'public',table:'calls'},e=>{const x=rowToCall(e.new);if(DB.calls.some(y=>y.id==x.id))return;DB.calls.push(x);SNAP=snap();toast('Nouvel appel · '+nomOf(x));if(!$('#layer').innerHTML)route(true)}).subscribe()}
function loginView(msg=''){$('#app').innerHTML=`<div class="login"><div style="width:100%;max-width:380px"><div style="display:flex;justify-content:center;margin-bottom:28px">${MARK(48,35)}</div><div class="k"><div class="h1" style="font-size:26px">Connexion</div><div class="sub" style="margin-top:6px">Retrouvez les appels pris par votre assistante.</div>
 <form id="lgf"><label class="lf">E-mail<input id="lg_em" type="email" required autocomplete="email" placeholder="vous@entreprise.fr"></label><label class="lf">Mot de passe<input id="lg_pw" type="password" autocomplete="current-password" placeholder="Laisser vide pour recevoir un lien"></label>
 <button class="btnw" type="submit" style="margin-top:20px;height:50px;border-radius:25px">Se connecter</button></form><button class="link" id="lg_ml" style="width:100%;height:44px;margin-top:6px">Recevoir un lien par e-mail</button>
 <div id="lg_msg" class="t2" style="font-size:13px;margin-top:8px;min-height:18px;text-align:center">${esc(msg)}</div></div><div class="t3" style="font-size:12px;text-align:center;margin-top:18px">Akno · assistante téléphonique IA</div></div></div>`;
 const m=t=>$('#lg_msg').textContent=t;
 const magic=async()=>{const em=$('#lg_em').value.trim();if(!em){m('Indiquez votre e-mail');return}m('Envoi du lien…');const{error}=await sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:false}});m(error?'Envoi impossible : vérifiez votre e-mail':'Lien envoyé. Ouvrez votre boîte mail.')};
 $('#lg_ml').onclick=magic;
 $('#lgf').addEventListener('submit',async e=>{e.preventDefault();e.stopPropagation();const em=$('#lg_em').value.trim(),pw=$('#lg_pw').value;if(!pw)return magic();m('Connexion…');const{error}=await sb.auth.signInWithPassword({email:em,password:pw});if(error)m('E-mail ou mot de passe incorrect');else location.reload()})}
async function boot(){
 if(!CLOUD){load();route();return}
 await new Promise(r=>{const x=document.createElement('script');x.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';x.onload=x.onerror=r;document.head.appendChild(x)});
 if(!window.supabase){loginView('Connexion impossible : vérifiez votre réseau.');return}
 sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const{data:{session}}=await sb.auth.getSession();
 if(!session){loginView();sb.auth.onAuthStateChange((ev,s)=>{if(ev=='SIGNED_IN'&&s)location.reload()});return}
 USER=session.user;await cloudLoad();route()}
boot();
