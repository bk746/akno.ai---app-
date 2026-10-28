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
const P={home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',dash:'<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 14H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.8 3.4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9c.3.6.9 1 1.6 1H21a2 2 0 1 1 0 4h-.1c-.7 0-1.3.4-1.5 1z"/>',
back:'<path d="M15 5 8 12l7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',play:'<path d="M8 5v14l11-7z"/>',pause:'<rect x="7" y="5" width="4" height="14" rx="1"/><rect x="13" y="5" width="4" height="14" rx="1"/>',
in:'<path d="M17 7 7 17M7 10v7h7"/>',out:'<path d="M7 17 17 7M10 7h7v7"/>',
msg:'<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>',nav:'<path d="M3 11 21 3l-8 18-2-8z"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',check:'<path d="M5 12.5 10 17 19 7"/>',
pin:'<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',up:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
shield:'<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',send:'<path d="M12 19V5M6 11l6-6 6 6"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',
out2:'<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>'};
const I=(n,w=24,st='')=>`<svg class="i" viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"${st?` style="${st}"`:''} aria-hidden="true">${P[n]||""}</svg>`;
const Ifill=(n,w=20,c='#070b17')=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="${c}" aria-hidden="true">${P[n]||''}</svg>`;
const recFmt=s=>{if(!isFinite(s)||s<0)s=0;return Math.floor(s/60)+':'+p2(Math.floor(s%60))};
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
const TZ='Europe/Paris';
const ymdParis=d=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
const jcParis=d=>{const s=new Intl.DateTimeFormat('fr-FR',{timeZone:TZ,weekday:'short'}).format(new Date(d));return s.charAt(0).toUpperCase()+s.slice(1,3)};
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
let tt;function toast(m){const t=$('#toast');t.innerHTML=I('check',16,'stroke-width:2.2')+esc(m);t.classList.add('sh');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('sh'),2000)}

/* ============================ UI (V2) ============================ */
const UI={f:'tous',view:null,day:sod(new Date()),aq:'',asOpen:false};
const MAIN_TABS=[['home','Accueil','#/'],['phone','Appels','#/appels'],['cal','Agenda','#/agenda'],['spark','Assistant','#/assistant']];
const TABS=[...MAIN_TABS,['gear','Réglages','#/reglages']];
const AVC=['#3a4d86','#2f6b62','#6a4b8a','#7a5a3a','#3a6a86','#5a4f86','#86503a','#3f6a4a'];
const avCol=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.charCodeAt(0))>>>0;return AVC[h%AVC.length]};
const av=(c,cls='')=>`<span class="ini${cls?' '+cls:''}" style="background:${c.nom_client?avCol(c.nom_client):'#26314f'}">${c.nom_client?ini(c.nom_client):I('user',20)}</span>`;
const durTxt=s=>{s=s||0;return s<60?s+' s':Math.floor(s/60)+' min '+p2(s%60)};
const hmList=d=>{d=new Date(d);return d.getHours()+' h '+p2(d.getMinutes())};
const tmTxt=d=>{const n=dd(new Date(),d);return n==0?hmList(d):n==1?'Hier':n<7?cap(JOURS[new Date(d).getDay()]):new Date(d).getDate()+'/'+p2(new Date(d).getMonth()+1)};
const viewMode=()=>UI.view||(isD()?'semaine':'jour');
const sideAccountHtml=()=>`<span class="ini sm" style="background:#2a3c6e">${esc(PROFIL.initiales)}</span><span class="lbl"><b>${esc((PROFIL.prenom+' '+(PROFIL.nom||'')).trim())}</b><small>${esc(PROFIL.entreprise||'')}</small></span>`;
let _chrome=false,_pillPrimed=false,_navLed=false;
function buildChromeHtml(){const sn=MAIN_TABS.map(([i,l,h])=>`<a href="${h}" aria-label="${l}">${I(i,22)}<span class="lbl">${l}</span></a>`).join('');const mb=TABS.map(([i,l,h])=>`<a href="${h}" aria-label="${l}">${I(i,24)}<span>${l}</span></a>`).join('');
 return `<aside class="side"><div class="lg">${MARK(40,29)}</div><nav class="snav" aria-label="Navigation"><span class="nav-pill snav-pill" aria-hidden="true"></span>${sn}</nav><div class="side-foot"><a class="acc" href="#/reglages">${sideAccountHtml()}</a><a class="set-btn" href="#/reglages" aria-label="Réglages">${I('gear',24)}</a></div></aside><main id="page"></main><nav class="nav" aria-label="Navigation"><span class="nav-pill nav-pill-m" aria-hidden="true"></span>${mb}</nav>`}
function ensureChrome(){if(_chrome||document.body.classList.contains('is-login'))return;const app=$('#app');if(!app.querySelector('.side')){app.innerHTML=buildChromeHtml();_chrome=true;_pillPrimed=false}}
function syncNavTab(tab){const sn=$('.snav');if(sn)sn.querySelectorAll('a').forEach((a,k)=>{const on=tab<4&&tab===k;a.classList.toggle('on',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
 const nv=$('.nav');if(nv)nv.querySelectorAll('a').forEach((a,k)=>{const on=tab===k;a.classList.toggle('on',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
 const setBtn=$('.set-btn');if(setBtn){setBtn.classList.toggle('on',tab===4)}const acc=$('.side-foot .acc');if(acc)acc.innerHTML=sideAccountHtml()}
function navLead(tab){_navLed=true;syncNavTab(tab);layoutNavPills(tab,false)}
function viewForHash(h){let tab=0,m,body,extra='';
 if(h.startsWith('#/appel/')){[body,extra]=vDetail(decodeURIComponent(h.slice(8)));tab=1}
 else if(h=='#/appels'){body=vAppels();tab=1}
 else if(h=='#/agenda'){body=vAgenda();tab=2}
 else if(m=h.match(/^#\/rdv\/(.+)/)){body=vRdv(decodeURIComponent(m[1]));tab=2}
 else if(h=='#/assistant'){body=vAssistant();extra=innerWidth<768?asMobileExtra():'';tab=3}
 else if(h=='#/reglages'){body=vReglages();tab=4}
 else{body=vDash();tab=0}
 return {tab,body,extra}}
const head=(title,sub,right='')=>`<header class="top"><div class="tl">${sub?`<div class="t13 mut fw5">${sub}</div>`:''}<h1 class="h1">${title}</h1></div><div class="tr">${right}</div></header>`;
const act=(icon,label,attrs,white)=>`<a class="act${white?' w':''}" ${attrs}><i>${I(icon,22)}</i><span>${label}</span></a>`;
const callLi=(c,o={})=>{const ar=c.statut=='a_rappeler';
 const right=o.btn&&ar?`<a class="wbtn" href="${telHref(c.telephone_client)}" data-stop>Rappeler</a>`:`<span class="tm">${tmTxt(c.created_at)}</span>`;
 return `<div class="li${o.sel?' sel':''}" data-go="#/appel/${c.id}" role="link" tabindex="0">${av(c)}<div class="t"><div class="n"><span class="ell">${esc(nomOf(c))}</span>${ar?'<span class="dot" aria-label="À rappeler"></span>':''}${c.statut=='rdv_pris'?'<span class="tag">RDV</span>':''}${c.urgence=='urgent'?'<span class="tag">Urgent</span>':''}</div><div class="s">${esc(c.motif)}${o.dur&&c.duration?' · '+durTxt(c.duration):''}</div></div>${right}</div>`};

/* ---------- Accueil ---------- */
function vDash(){const now=new Date(),w=week(),ar=aRappeler(),up=upcoming(),nx=up[0];
 const days=[...Array(7)].map((_,i)=>addD(now,i-6));
 const cnt=days.map(d=>DB.calls.filter(c=>ymdParis(c.created_at)===ymdParis(d)).length);
 const mx=Math.max(1,...cnt);
 const chart=`<div class="chart">${days.map((d,i)=>{const n=cnt[i],h=Math.max(6,n/mx*100),on=i===6;return `<div class="c${on?' on':''}"><div class="bw">${n>0?`<span class="cn">${n}</span>`:''}<i style="height:${h}%"></i></div><span class="clbl">${jcParis(d)}</span></div>`}).join('')}</div>`;
 const mois=DB.calls.filter(c=>{const d=new Date(c.created_at);return d.getMonth()==now.getMonth()&&d.getFullYear()==now.getFullYear()});
 const mins=Math.round(mois.reduce((s,c)=>s+(c.duration||0),0)/60);
 const rdvW=w.filter(c=>c.statut=='rdv_pris').length,conv=w.length?Math.round(rdvW/w.length*100):0;
 const avg=w.length?Math.round(w.reduce((s,c)=>s+(c.duration||0),0)/w.length):0;
 const hello=now.getHours()<18?'Bonjour':'Bonsoir';
 const top=`<header class="top home-top"><a class="ini sm mb" href="#/reglages" style="background:#2a3c6e" aria-label="Compte">${esc(PROFIL.initiales)}</a><div class="tl dk"><div class="t13 mut fw5">${cap(dateLong(now))}</div><h1 class="h1">${hello} ${esc(PROFIL.prenom)}</h1></div>
 <div class="tr"><a class="search" href="#/appels">${I('search',16)}<span>Rechercher</span></a><a class="ib" href="#/appels" aria-label="Notifications">${I('bell',20)}${ar.length?'<i class="bdg"></i>':''}</a></div></header>`;
 const hero=`<section class="hero"><div class="hlft"><div class="t13 mut fw5">${esc(PROFIL.entreprise||'Akno')} · 7 derniers jours</div><div class="big"><span class="hero-n" data-n="${w.length}" data-anim-key="hero-calls">${w.length}</span> <small>appel${w.length>1?'s':''}</small></div>
 ${ar.length?`<a class="pill" href="#/appels" data-f="ar"><span class="dot"></span>${ar.length} client${ar.length>1?'s':''} à rappeler</a>`:`<span class="pill">Tout est à jour</span>`}</div>
 <div class="acts">${act('phone','Rappeler',ar.length?`href="#/appel/${ar[0].id}"`:'href="#/appels"',true)}${act('cal','Agenda','href="#/agenda"')}${act('spark','Assistant','href="#/assistant"')}${act('plus','Nouveau','href="#" data-act="newrdv"')}</div></section>`;
 const stats=`<section class="stats">
 <a class="card stat" href="#/agenda"><span class="t13 mut">RDV à venir</span><b class="v"><span class="ak-count-n" data-count-n="${up.length}" data-anim-key="stat-rdv">${up.length}</span></b><span class="t13 mut ell">${nx?cap(dayWord(nx.rdv_date))+' · '+hmTxt(nx.rdv_date):'Aucun RDV prévu'}</span></a>
 <div class="card stat"><span class="t13 mut">Minutes ce mois-ci</span><b class="v"><span class="ak-count-n" data-count-n="${mins}" data-anim-key="stat-mins">${mins}</span><small> / 250</small></b><span class="bar"><b class="ak-bar-fill" data-n="${Math.min(100,mins/250*100)}" data-anim-key="stat-mins-bar" style="width:${Math.min(100,mins/250*100)}%"></b></span></div>
 <div class="card stat"><span class="t13 mut">Taux de RDV</span><b class="v">${conv} %</b><span class="t13 mut">${rdvW} RDV sur ${w.length} appel${w.length>1?'s':''}</span></div>
 <div class="card stat"><span class="t13 mut">Durée moyenne</span><b class="v">${durTxt(avg)}</b><span class="t13 mut">Par appel</span></div></section>`;
 const rec=sorted().slice(0,5);
 const chartCard=`<div class="card chart-card"><div class="rowh"><h2 class="h2">Appels par jour</h2><span class="t13 mut">7 derniers jours</span></div>${chart}</div>`;
 const recentCard=`<div class="card lst"><div class="rowh"><h2 class="h2">Appels récents</h2><a class="t13 mut" href="#/appels">Tout voir</a></div>${rec.length?rec.map(c=>callLi(c)).join(''):'<div class="empty">Aucun appel pour l\'instant</div>'}</div>`;
 const duo=isD()?`<section class="duo">${chartCard}${recentCard}</section>`:`<section class="duo">${chartCard}</section>`;
 return top+hero+stats+duo}

/* ---------- Appels ---------- */
function filtered(){const q=norm(UI.aq);return sorted().filter(c=>(UI.f=='tous'||(UI.f=='ar'?c.statut=='a_rappeler':c.statut=='rdv_pris'))&&(!q||norm(nomOf(c)+' '+c.motif+' '+c.telephone_client+' '+c.ville).includes(q)))}
function callRows(list,sel){if(!list.length)return '<div class="card empty">Aucun appel</div>';
 const g={Aujourd:[],Hier:[],Sem:[],Plus:[]};list.forEach(c=>{const n=dd(new Date(),c.created_at);(n==0?g.Aujourd:n==1?g.Hier:n<7?g.Sem:g.Plus).push(c)});
 const L={Aujourd:'Aujourd\'hui',Hier:'Hier',Sem:'Cette semaine',Plus:'Plus ancien'};
 return Object.keys(g).filter(k=>g[k].length).map(k=>`<div class="grp-t">${L[k]}</div><div class="card lst">${g[k].map(c=>callLi(c,{btn:!isD(),dur:true,sel:sel==c.id})).join('')}</div>`).join('')}
function appelsList(sel){const ar=aRappeler().length;
 const seg=`<div class="seg" role="tablist">${[['tous','Tous'],['ar','À rappeler'+(ar?' <span class="dot"></span>':'')],['rdv','RDV pris']].map(([k,l])=>`<button role="tab" data-f="${k}" class="${UI.f==k?'on':''}" aria-selected="${UI.f==k}">${l}</button>`).join('')}</div>`;
 return head('Appels','',`<label class="search inp-s">${I('search',16)}<input id="aq" value="${esc(UI.aq)}" placeholder="Rechercher un client" aria-label="Rechercher un client" autocomplete="off"></label>`)+seg+callRows(filtered(),sel)+(DB.calls.length?`<p class="foot">${DB.calls.length} appel${DB.calls.length>1?'s':''} au total</p>`:'')}
function vAppels(sel){if(isD()){const s=sel||filtered()[0]?.id;return `<div class="ap"><div class="list">${appelsList(s)}</div><aside class="detail">${s?detailBody(byId(s),true):'<div class="card empty">Sélectionnez un appel</div>'}</aside></div>`}
 return appelsList()}
function recBlock(c){const u=(c.recording_url||'').trim();if(!u)return '';
 return `<div class="sub-c rec-c"><div class="t13 mut">Enregistrement</div><div class="rec-wrap"><div class="rec-player" data-rec><audio preload="metadata" src="${esc(u)}" hidden></audio><button type="button" class="rec-play" aria-label="Lecture">${Ifill('play')}</button><div class="rec-track" role="slider" aria-label="Position" tabindex="0"><i class="rec-fill"></i></div><span class="rec-time">0:00 / 0:00</span><button type="button" class="rec-spd" aria-label="Vitesse de lecture">1x</button></div><p class="rec-err t13 mut">Enregistrement indisponible</p></div></div>`}
function detailBody(c,desk){if(!c)return '<div class="card empty">Appel introuvable</div>';const rv=DB.rdvs.find(r=>r.call_id==c.id);const adr=[c.adresse,c.code_postal,c.ville].filter(Boolean).join(' ');
 const kv=rows=>rows.filter(r=>r[1]).map(([k,v])=>`<div class="kv"><span>${k}</span><span>${v}</span></div>`).join('');
 const stl={a_rappeler:'<span class="dot"></span>À rappeler',rappele:'Rappelé',rdv_pris:'RDV pris',traite:'Sans suite'}[c.statut]||'';
 return `<div class="card dcard"><div class="dh">${av(c,'xl')}<h2 class="dn">${esc(nomOf(c))}</h2><div class="t15 mut">${esc(c.telephone_client)} · ${cap(dayWord(c.created_at))}, ${hmTxt(c.created_at)}</div><span class="pill">${stl}</span></div>
 <div class="acts">${act('phone','Rappeler',`href="${telHref(c.telephone_client)}" data-stop`,true)}${act('msg','SMS',`href="sms:${esc(String(c.telephone_client).replace(/\s/g,''))}" data-stop`)}${rv?act('cal','RDV',`href="#/rdv/${rv.id}"`):act('cal','Planifier',`href="#" data-act="newrdv" data-call="${c.id}"`)}${act('pin','Itinéraire',`href="${maps(adr)}" target="_blank" rel="noopener" data-stop`)}</div>
 <div class="sub-c"><div class="t13 mut">Résumé par Akno</div><p class="t15">${esc(c.resume)||'—'}</p></div>${recBlock(c)}
 <div class="kvs">${kv([['Projet',esc(c.motif)],['Besoin',esc(c.besoin_detail)],['Urgence',c.urgence=='urgent'?'Urgent':'Normale'],['Durée',c.duration?durTxt(c.duration):''],['E-mail',c.email_client?`<a href="mailto:${esc(c.email_client)}" data-stop>${esc(c.email_client)}</a>`:''],['Adresse',adr?`<a href="${maps(adr)}" target="_blank" rel="noopener" data-stop>${esc(adr)}</a>`:''],['Rendez-vous',rv?`<a href="#/rdv/${rv.id}">${cap(dayWord(rv.rdv_date))} à ${hmTxt(rv.rdv_date)}</a>`:'']])}</div>
 <div class="grp-t in">Statut</div><div class="stseg">${Object.entries(ST).map(([k,l])=>`<button data-st="${k}" data-id="${c.id}" aria-pressed="${c.statut==k}" class="${c.statut==k?'on':''}">${l}</button>`).join('')}</div>
 <div class="grp-t in">Notes</div><textarea class="note" id="note" data-id="${c.id}" placeholder="Ajouter une note…">${esc(c.note)}</textarea></div>`}
function vDetail(id){if(isD())return [vAppels(id),''];
 return [appelsList(),`<div class="ov" data-go="#/appels"></div><div class="dsheet" role="dialog" aria-label="Détail de l'appel"><div class="grab"></div><a class="ib x" href="#/appels" aria-label="Fermer">${I('x',16)}</a>${detailBody(byId(id))}</div>`]}

/* ---------- Agenda ---------- */
function dayRdvs(d){return DB.rdvs.filter(r=>dd(r.rdv_date,d)==0).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date))}
function timeline(days,HH){const now=new Date(),n=days.length,all=days.flatMap(dayRdvs);
 let H0=8,H1=18;all.forEach(r=>{const s=new Date(r.rdv_date),e=new Date(s.getTime()+(r.duree||60)*6e4);H0=Math.min(H0,s.getHours());H1=Math.max(H1,e.getHours()+(e.getMinutes()?1:0))});
 const hasToday=days.some(d=>dd(d,now)==0);
 if(hasToday){H0=Math.min(H0,now.getHours());H1=Math.max(H1,now.getHours()+(now.getMinutes()?1:0))}
 const nh=now.getHours()+now.getMinutes()/60,showNow=hasToday&&nh>=H0&&nh<=H1,nowTop=(nh-H0)*HH;
 const nowLbl=showNow?`<span class="now-lbl" style="top:${nowTop}px">${p2(now.getHours())}:${p2(now.getMinutes())}</span>`:'';
 const nxt=upcoming()[0];
 const hrs=[...Array(H1-H0+1)].map((_,i)=>`<div class="hl" style="top:${i*HH}px"><span>${p2(H0+i)}:00</span></div>`).join('');
 const cols=days.map(d=>{const ev=dayRdvs(d).map(r=>{const s=new Date(r.rdv_date),h=s.getHours()+s.getMinutes()/60,e=new Date(s.getTime()+(r.duree||60)*6e4);const ht=Math.max((r.duree||60)/60*HH-4,40);
   return `<button class="ev${nxt&&nxt.id==r.id?' w':''}" data-go="#/rdv/${r.id}" style="top:${(h-H0)*HH+2}px;height:${ht}px"><b class="ell">${n>1?esc(r.nom_client):esc(r.type)+' — '+esc(r.nom_client)}</b><span class="ell">${hmTxt(s)} – ${hmTxt(e)}${n>1?'':(r.adresse?' · '+esc(r.adresse):'')}</span></button>`}).join('');
  const nl=dd(d,now)==0&&showNow?`<div class="now" style="top:${nowTop}px" aria-hidden="true"></div>`:'';
  return `<div class="col${dd(d,now)==0?' today':''}">${n>1?`<button class="colh" data-day="${ymd(d)}" data-view="jour">${JC[d.getDay()]} <b>${d.getDate()}</b></button>`:''}<div class="cb" style="height:${(H1-H0)*HH}px">${nl}${ev}</div></div>`}).join('');
 return `<div class="card cal${n>1?' wk7':''}"><div class="hours${n>1?' off':''}" style="height:${(H1-H0)*HH}px">${hrs}${nowLbl}</div><div class="cols" style="--n:${n}">${cols}</div></div>`}
const JCM=['lun.','mar.','mer.','jeu.','ven.','sam.','dim.'];
const moAbb=m=>MOIS[m].slice(0,3)+'.';
const moDayLbl=(x,ref)=>x.getMonth()!=ref.getMonth()&&x.getDate()==1?x.getDate()+' '+moAbb(x.getMonth()):String(x.getDate());
const calEvTxt=r=>hmTxt(r.rdv_date)+'  '+r.type+' — '+r.nom_client;
function vMonth(d,now,mob){const f=new Date(d.getFullYear(),d.getMonth(),1),st=mon(f);const cells=[...Array(42)].map((_,i)=>addD(st,i));
 const wd=JCM.map(w=>`<span class="cal-mo-wd">${w}</span>`).join('');
 const grid=cells.map(x=>{const rdvs=dayRdvs(x),isOut=x.getMonth()!=d.getMonth(),isToday=dd(x,now)==0,dow=x.getDay();
  const attrs=`data-day="${ymd(x)}"`+(mob?'':` data-view="jour"`);
  let inner=`<span class="cal-mo-num${isToday?' is-today':''}">${moDayLbl(x,d)}</span>`;
  if(mob&&rdvs.length)inner+=`<i class="cal-mo-dot" aria-hidden="true"></i>`;
  let evs='';if(!mob){const max=3;evs=rdvs.slice(0,max).map(r=>{const t=calEvTxt(r);return `<button type="button" class="cal-ev ell" data-go="#/rdv/${r.id}" data-stop title="${esc(t)}">${esc(t)}</button>`}).join('');
   if(rdvs.length>max)evs+=`<span class="cal-ev-more">+${rdvs.length-max} autres</span>`}
  return `<button type="button" class="cal-mo-cell${isOut?' out':''}${isToday?' today':''}${mob&&dd(x,d)==0?' sel':''}${dow==6?' sat':''}${dow==0?' sun':''}" ${attrs}>${inner}<span class="cal-mo-evs">${evs}</span></button>`}).join('');
 const list=mob?`<section class="cal-mo-day" aria-label="Rendez-vous du jour"><h2 class="cal-mo-dayh">${cap(dateLong(d))}</h2>${dayRdvs(d).length?`<div class="card lst cal-mo-lst">${dayRdvs(d).map(r=>`<div class="li" data-go="#/rdv/${r.id}"><span class="ini tmb">${hm(r.rdv_date)}</span><div class="t"><div class="n"><span class="ell">${esc(r.nom_client)}</span></div><div class="s">${esc(r.type)}</div></div></div>`).join('')}</div>`:'<p class="cal-mo-empty">Aucun rendez-vous</p>'}</section>`:'';
 return `<div class="cal-mo"><div class="cal-mo-wds">${wd}</div><div class="cal-mo-grid">${grid}</div></div>${list}`}
function vAgenda(){const d=UI.day,m=mon(d),now=new Date();const days=[...Array(7)].map((_,i)=>addD(m,i));const view=viewMode();
 const seg=`<div class="seg sm">${[['jour','Jour'],['semaine','Semaine'],['mois','Mois']].map(([k,l])=>`<button data-view="${k}" class="${view==k?'on':''}">${l}</button>`).join('')}</div>`;
 const navb=`<div class="navb"><button class="ib" data-${view=='mois'?'mo':'wk'}="-1" aria-label="Précédent">${I('back',18)}</button><button class="pill" data-today>Aujourd'hui</button><button class="ib" data-${view=='mois'?'mo':'wk'}="1" aria-label="Suivant">${I('chev',18)}</button></div>`;
 const title=view=='mois'?cap(MOIS[d.getMonth()])+' '+d.getFullYear():view=='semaine'?'Semaine du '+m.getDate()+' '+MOIS[m.getMonth()]:cap(MOIS[d.getMonth()])+' '+d.getFullYear();
 const strip=`<div class="week">${days.map(x=>`<button class="${dd(x,d)==0?'on':''}${dd(x,now)==0?' td':''}" data-day="${ymd(x)}"><small>${JC[x.getDay()]}</small><b>${x.getDate()}</b><i class="${dayRdvs(x).length?'has':''}"></i></button>`).join('')}</div>`;
 let body='';
 if(view=='jour'){const l=dayRdvs(d);body=strip+`<div class="dayh"><h2 class="h22">${cap(dayWord(d))}${dd(d,now)>=-1&&dd(d,now)<=1?', '+JOURS[d.getDay()]+' '+d.getDate():''}</h2><div class="t13 mut">${l.length?l.length+' rendez-vous':'Aucun rendez-vous'}</div></div>`+timeline([d],64)}
 else if(view=='semaine'){body=isD()||innerWidth>=768?timeline(days,64):strip+days.map(x=>{const l=dayRdvs(x);return l.length?`<div class="grp-t">${cap(dayWord(x))}</div><div class="card lst">${l.map(r=>`<div class="li" data-go="#/rdv/${r.id}"><span class="ini tmb">${hm(r.rdv_date)}</span><div class="t"><div class="n"><span class="ell">${esc(r.nom_client)}</span></div><div class="s">${esc(r.type)}${r.adresse?' · '+esc(r.adresse):''}</div></div></div>`).join('')}</div>`:''}).join('')||'<div class="card empty">Aucun rendez-vous cette semaine</div>'}
 else{const mob=innerWidth<768;body=vMonth(d,now,mob);
  const moTitle=cap(MOIS[d.getMonth()])+' '+d.getFullYear();
  const navMo=`<div class="navb cal-mo-navb"><button class="ib cal-nb" data-mo="-1" aria-label="Précédent">${I('back',18)}</button><button class="pill cal-nb-pill" data-today>Aujourd'hui</button><button class="ib cal-nb" data-mo="1" aria-label="Suivant">${I('chev',18)}</button></div>`;
  const hdr=`<header class="top cal-mo-head"><div class="cal-mo-head-main"><h1 class="cal-mo-title">${moTitle}</h1><div class="cal-mo-tools">${mob?'':seg}${mob?'':navMo}<button class="ib wt" data-act="newrdv" aria-label="Nouveau rendez-vous">${I('plus',20)}</button></div></div>${mob?`<div class="cal-mo-seg-m">${seg}</div>`:''}</header>`;
  return hdr+(mob?`<div class="mb navm cal-mo-navm">${navMo}</div>`:'')+`<div class="cal-mo-wrap${mob?' is-mob':''}">${body}</div>`}
 return head('Agenda',esc(title),`${seg}<span class="dk">${navb}</span><button class="ib wt" data-act="newrdv" aria-label="Nouveau rendez-vous">${I('plus',20)}</button>`)+`<div class="mb navm">${navb}</div>`+body}
function vRdv(id){const r=rdvById(id);if(!r)return head('Rendez-vous')+'<div class="card empty">Rendez-vous introuvable</div>';const s=new Date(r.rdv_date),e=new Date(s.getTime()+(r.duree||60)*6e4);
 const kv=rows=>rows.filter(x=>x[1]).map(([k,v])=>`<div class="kv"><span>${k}</span><span>${v}</span></div>`).join('');
 return `<a class="back" href="#/agenda">${I('back',20)}Agenda</a><div class="narrow"><div class="dh l"><div class="t13 mut fw5">${esc(r.type)}</div><h1 class="h1">${esc(r.nom_client)}</h1><div class="t15 mut">${cap(dayWord(r.rdv_date))} · ${hmTxt(s)} – ${hmTxt(e)}</div></div>
 <div class="acts l">${r.telephone_client?act('phone','Appeler',`href="${telHref(r.telephone_client)}" data-stop`,true):''}${r.adresse?act('pin','Itinéraire',`href="${maps(r.adresse)}" target="_blank" rel="noopener" data-stop`):''}${act('cal','Modifier',`href="#" data-act="editrdv" data-id="${r.id}"`)}${r.call_id&&byId(r.call_id)?act('in','Appel',`href="#/appel/${r.call_id}"`):''}</div>
 <div class="card kvs">${kv([['Date',dateLong(r.rdv_date)],['Motif',esc(r.motif)],['Durée',r.duree>=60?Math.floor(r.duree/60)+' h'+(r.duree%60?' '+p2(r.duree%60):''):r.duree+' min'],['Téléphone',r.telephone_client?`<a href="${telHref(r.telephone_client)}" data-stop>${esc(r.telephone_client)}</a>`:''],['Adresse',r.adresse?`<a href="${maps(r.adresse)}" target="_blank" rel="noopener" data-stop>${esc(r.adresse)}</a>`:''],['Rappel SMS',r.rappel?'La veille':'Non']])}</div>
 ${r.note?`<div class="card"><div class="t13 mut">Notes</div><p class="t15" style="margin-top:8px">${esc(r.note)}</p></div>`:''}
 <button class="del" data-act="delrdv" data-id="${r.id}">Supprimer le rendez-vous</button></div>`}

let FORM=null;
function rdvSheet(r,callId){const c=callId?byId(callId):null;const s=r?new Date(r.rdv_date):(()=>{const x=new Date(UI.day);const n=new Date();x.setHours(dd(x,n)==0?Math.min(n.getHours()+1,18):9,0,0,0);return x})();const e=new Date(s.getTime()+((r&&r.duree)||60)*6e4);
 FORM={id:r?r.id:null,call_id:r?r.call_id:(c?c.id:null),type:r?r.type:(c&&/panne/i.test(c.motif)?'Panne':c&&/entretien/i.test(c.motif)?'Entretien':'Visite devis'),rappel:r?!!r.rappel:true};
 const v=(k,d)=>esc(r?r[k]:(c?(k=='adresse'?[c.adresse,c.code_postal+' '+c.ville].filter(x=>x.trim()).join(', '):c[k]):d)||'');
 $('#layer').innerHTML=`<div class="ov" data-act="close"></div><form class="sheet" id="rf" role="dialog" aria-label="${r?'Modifier le rendez-vous':'Nouveau rendez-vous'}"><div class="grab"></div><div class="sh"><button type="button" data-act="close">Annuler</button><b>${r?'Modifier':'Nouveau rendez-vous'}</b><button class="ok" type="submit">${r?'Enregistrer':'Ajouter'}</button></div><div class="sheet-body">
 <div class="grp"><div class="fld"><input class="l" name="nom" placeholder="Client" value="${v('nom_client')}" aria-label="Client" autocomplete="off"></div><div class="fld"><span>Téléphone</span><input name="tel" type="tel" placeholder="06 00 00 00 00" value="${v('telephone_client')}"></div></div>
 <div class="lab2">Type</div><div class="grp"><div class="chips" id="tchips">${TYPES.map(t=>`<button type="button" data-type="${t}" class="${FORM.type==t?'on':''}">${t}</button>`).join('')}</div></div>
 <div class="grp"><div class="fld"><span>Date</span><input type="date" name="date" value="${ymd(s)}" required></div><div class="fld"><span>Début</span><input type="time" name="deb" value="${p2(s.getHours())}:${p2(s.getMinutes())}" required></div><div class="fld"><span>Fin</span><input type="time" name="fin" value="${p2(e.getHours())}:${p2(e.getMinutes())}" required></div></div>
 <div class="grp"><div class="fld"><input class="l" name="adr" placeholder="Adresse" value="${v('adresse')}" aria-label="Adresse"></div><div class="fld"><span>Rappel SMS la veille</span><button type="button" class="tg${FORM.rappel?' on':''}" id="tgr" role="switch" aria-checked="${FORM.rappel}" aria-label="Rappel SMS la veille"></button></div><div class="fld"><textarea name="note" placeholder="Notes" aria-label="Notes">${esc(r?r.note:'')}</textarea></div></div>
 <div class="err" id="ferr"></div></div></form>`;
 lockScroll();setTimeout(()=>{const i=$('#rf [name=nom]');if(i&&!i.value&&!isD())i.focus()},300)}
function closeLayer(){const L=$('#layer');if(!L||!L.innerHTML){FORM=null;return}if(motionOk()&&L.querySelector('.sheet,.dlg')){L.classList.add('layer-closing');setTimeout(()=>{L.innerHTML='';L.classList.remove('layer-closing');FORM=null;unlockScroll()},250);return}L.innerHTML='';FORM=null;unlockScroll()}
function submitRdv(f){const g=n=>f.elements[n].value.trim();if(!g('nom')){$('#ferr').textContent='Indiquez le nom du client';return}
 const s=new Date(g('date')+'T'+g('deb')),e=new Date(g('date')+'T'+g('fin'));if(isNaN(s)||isNaN(e)||e<=s){$('#ferr').textContent='Vérifiez la date et les heures';return}
 const o={nom_client:g('nom'),telephone_client:g('tel'),type:FORM.type,motif:FORM.call_id&&byId(FORM.call_id)?byId(FORM.call_id).motif:FORM.type,rdv_date:s.toISOString(),duree:Math.round((e-s)/6e4),adresse:g('adr'),note:g('note'),rappel:FORM.rappel,call_id:FORM.call_id};
 let id=FORM.id;if(id){Object.assign(rdvById(id),o);toast('Rendez-vous modifié')}else{id='r'+Date.now();DB.rdvs.push({id,...o});toast('Rendez-vous ajouté')}
 if(o.call_id){const c=byId(o.call_id);if(c){c.rdv_date=o.rdv_date;if(c.statut=='a_rappeler'||c.statut=='rappele')c.statut='rdv_pris'}}
 save();closeLayer();UI.day=sod(s);if(location.hash.startsWith('#/rdv/'))route();else location.hash='#/agenda';route()}
function confirmDel(id){const r=rdvById(id);$('#layer').innerHTML=`<div class="ov" data-act="close"></div><div class="dlg" role="alertdialog"><b style="font-weight:500;font-size:16px">Supprimer ce rendez-vous ?</b><p>${esc(r.nom_client)} · ${dayWord(r.rdv_date)} à ${hmTxt(r.rdv_date)}. Cette action est définitive.</p><div class="bb"><button data-act="close">Annuler</button><button class="rd" data-act="dodel" data-id="${id}">Supprimer</button></div></div>`;lockScroll()}
/* ---------- Assistant (logique) ---------- */
function stats(){const w=week(),rdv=w.filter(c=>c.statut=='rdv_pris').length,dur=w.length?Math.round(w.reduce((s,c)=>s+(c.duration||0),0)/w.length):0;
 const m={};w.forEach(c=>{const k=/panne/i.test(c.motif)?'Panne':/chaudi/i.test(c.motif)?'Remplacement chaudière':/entretien/i.test(c.motif)?'Entretien':/install|clim/i.test(c.motif)?'Installation':'Autre';m[k]=(m[k]||0)+1});
 const hz=DB.calls.filter(c=>c.code_postal&&!/^69/.test(c.code_postal)).length;
 const byDay={};w.forEach(c=>{const k=new Date(c.created_at).getDay();byDay[k]=(byDay[k]||0)+1});const pk=Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0];
 const aides=DB.calls.filter(c=>/aide|maprime/i.test(c.besoin_detail)).length;
 return {w,rdv,conv:w.length?Math.round(rdv/w.length*100):0,dur,m,hz,pk,aides,gain:w.length*6}}
const SUG=['Qui dois-je rappeler aujourd\'hui ?','Résume ma semaine','Quels devis relancer ?','Quels RDV demain ?'];
function answer(q){const n=norm(q);
 if(/rappel/.test(n)){const l=aRappeler();if(!l.length)return{t:'Personne à rappeler, tout est à jour.'};const u=l.find(c=>c.urgence=='urgent');return{t:`Vous avez ${l.length} client${l.length>1?'s':''} à rappeler :`,ids:l.slice(0,5).map(c=>c.id),note:u?`${nomOf(u)} est prioritaire : ${u.motif.toLowerCase()} depuis ${Math.max(1,dd(new Date(),u.created_at))||1} jour${dd(new Date(),u.created_at)>1?'s':''}.`:''}}
 if(/semaine|resum|bilan/.test(n)){const s=stats();return{t:`Cette semaine, votre assistante a décroché ${s.w.length} appels. ${s.rdv} ont abouti à un rendez-vous (${s.conv} %). ${aRappeler().length} clients attendent encore un rappel. Motif principal : ${(Object.entries(s.m).sort((a,b)=>b[1]-a[1])[0]||['aucun'])[0].toLowerCase()}.`}}
 if(/devis|relanc/.test(n)){const l=sorted().filter(c=>c.statut=='rappele'&&/devis|chaudi|install|clim/i.test(c.motif)&&!DB.rdvs.some(r=>r.call_id==c.id));return l.length?{t:`${l.length} devis à relancer (rappelés mais sans rendez-vous) :`,ids:l.slice(0,5).map(c=>c.id)}:{t:'Aucun devis à relancer pour le moment.'}}
 if(/demain|rdv|rendez/.test(n)){const dt=/demain/.test(n)?addD(new Date(),1):new Date();const l=dayRdvs(dt);return{t:l.length?`${l.length} rendez-vous ${dayWord(dt)} :`:`Aucun rendez-vous ${dayWord(dt)}.`,rdvs:l.map(r=>r.id)}}
 return{t:'Je n\'ai pas encore de réponse à cette question. Essayez par exemple :',sug:true}}
function ask(q){q=q.trim();if(!q)return;DB.chat.push({r:'u',t:q},{r:'a',a:answer(q)});if(DB.chat.length>30)DB.chat=DB.chat.slice(-30);save();route(true);
 requestAnimationFrame(()=>{const el=[...document.querySelectorAll('.as-ub')].pop();if(el)el.scrollIntoView({block:'start',behavior:'smooth'})})}
/* ---------- Assistant ---------- */
const asSugList=()=>`<div class="as-sugs">${SUG.map(s=>`<button type="button" class="as-sug" data-ask="${esc(s)}"><span>${esc(s)}</span>${I('chev',18)}</button>`).join('')}</div>`;
const asSugRow=()=>`<div class="as-sug-row">${SUG.map(s=>`<button type="button" class="as-sug-chip" data-ask="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
function msgHtml(m){if(m.r=='u')return `<div class="as-ub">${esc(m.t)}</div>`;const a=m.a;
 const ids=(a.ids||[]).map(byId).filter(Boolean),rs=(a.rdvs||[]).map(rdvById).filter(Boolean);
 return `<div class="as-ab"><div class="as-ai">${MARK(14,10)}Akno AI</div><p class="as-ab-t">${esc(a.t)}</p>${ids.length?`<div class="lst as-ab-lst">${ids.map(c=>callLi(c,{btn:true})).join('')}</div>`:''}
 ${rs.length?`<div class="lst as-ab-lst">${rs.map(r=>`<div class="li" data-go="#/rdv/${r.id}"><span class="ini tmb">${hm(r.rdv_date)}</span><div class="t"><div class="n"><span class="ell">${esc(r.nom_client)}</span></div><div class="s">${esc(r.type)}${r.adresse?' · '+esc(r.adresse):''}</div></div></div>`).join('')}</div>`:''}
 ${a.note?`<div class="as-pr"><span class="as-pr-dot"></span><span>${esc(a.note)}</span></div>`:''}${a.sug?asSugList():''}</div>`}
const INP=`<form class="as-inp" id="askf"><input id="askq" placeholder="Posez une question…" aria-label="Question" autocomplete="off"><button type="button" class="as-mic" aria-label="Dicter" data-act="mic">${I('mic',20)}</button><button class="as-snd" aria-label="Envoyer">${I('send',20)}</button></form>`;
const asOffH=c=>{const d=new Date(c.created_at),h=d.getHours(),w=d.getDay();return w===0||w===6||h<8||h>=18};
const asRing=(used,max)=>{const r=26,circ=163.4,frac=Math.max(Math.min(used/max,1),0.04),off=circ*(1-frac);return `<svg class="as-ring" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${off}" transform="rotate(-90 32 32)"/></svg>`};
function asInsRow(icon,dot,t1,t2,act){return `<div class="as-ins"><span class="as-ins-ico">${I(icon,20)}${dot?'<i class="as-ins-dot" aria-hidden="true"></i>':''}</span><div class="as-ins-t"><div class="as-ins-t1">${t1}</div><div class="as-ins-t2">${t2}</div></div>${act}</div>`}
function asInsights(s,ar){const rows=[];
 if(ar.length){const c=ar[0];rows.push(asInsRow('phone',true,`${ar.length} client${ar.length>1?'s':''} attend${ar.length>1?'ent':''} votre rappel`,`${esc(nomOf(c))} · ${esc(c.motif.toLowerCase())}`,`<a class="as-pill as-pill-w" href="${telHref(c.telephone_client)}" data-stop>Rappeler</a>`))}
 if(s.hz>0){const vz=[...new Set(DB.calls.filter(c=>c.code_postal&&!/^69/.test(c.code_postal)).map(c=>c.ville).filter(Boolean))].slice(0,4).join(', ');rows.push(asInsRow('pin',false,`${s.hz} appel${s.hz>1?'s':''} hors de votre zone`,esc(vz),`<a class="as-pill" href="#/appels">Voir</a>`))}
 if(s.pk&&s.pk[1]>0){const pct=s.w.length?Math.round(s.pk[1]/s.w.length*100):0;rows.push(asInsRow('up',false,`Pic d'appels le ${JOURS[s.pk[0]]}`,`${pct} % des appels de la semaine`,`<a class="as-pill" href="#/appels">Voir</a>`))}
 if(s.aides>0)rows.push(asInsRow('shield',false,`${s.aides} client${s.aides>1?'s ont':' a'} demandé les aides MaPrimeRénov'`,'Questions sur les dispositifs d\'aide',`<a class="as-pill" href="#/appels">Voir</a>`));
 return rows.length?`<div class="as-ins-lst">${rows.join('')}</div>`:'<p class="as-ins-empty">Rien à signaler pour l\'instant.</p>'}
function asChatPanel(){const has=DB.chat.length;const hdr=has?`<div class="as-convh"><span class="t13 mut">Conversation</span><button type="button" class="t13 mut" data-act="clearchat">Effacer</button></div>`:'';
 const msgs=has?DB.chat.map(msgHtml).join(''):`<div class="as-empty"><span class="as-mark">${MARK(28,21)}</span><h2 class="as-empty-t">Demandez à Akno</h2><p class="as-empty-s">Vos appels, RDV et clients, en une question.</p></div>`;
 return `<div class="card as-chat">${hdr}<div class="as-msgs${has?'':' as-msgs--empty'}" id="chat">${msgs}</div>${asSugRow()}${INP}</div>`}
function scrollAsChatEnd(){const m=document.querySelector('.as-msgs:not(.as-msgs--empty)');if(m)m.scrollTo({top:m.scrollHeight,behavior:'smooth'})}
function asMain(s,now,ar){const ws=mon(now),nh=s.w.filter(asOffH).length,mStart=ws;
 const mois=DB.calls.filter(c=>{const d=new Date(c.created_at);return d.getMonth()==now.getMonth()&&d.getFullYear()==now.getFullYear()});
 const used=Math.round(mois.reduce((a,c)=>a+(c.duration||0),0)/60),mx=Math.max(1,...Object.values(s.m)),motifs=Object.entries(s.m).sort((a,b)=>b[1]-a[1]).slice(0,4);
 const xfer=s.w.filter(c=>c.urgence==='urgent'&&c.statut==='traite').length;
 let sum=`Akno a décroché <b>${s.w.length}</b> appel${s.w.length>1?'s':''} et pris <b>${s.rdv}</b> RDV.`;
 if(ar.length)sum+=` <b>${ar.length}</b> client${ar.length>1?'s':''} attend${ar.length>1?'ent':'ent'} votre rappel.`;
 const kpi=(l,v,u,sub)=>`<div class="as-kpi"><span class="as-kpi-l">${l}</span><span class="as-kpi-v">${v}${u?`<span class="as-kpi-u">${u}</span>`:''}</span>${sub?`<span class="as-kpi-sub">${sub}</span>`:''}</div>`;
 return `<div class="as-col-main"><header class="as-head"><h1 class="as-h1">Assistant</h1><span class="as-week">Semaine du ${mStart.getDate()} ${MOIS[mStart.getMonth()]}</span></header>
 <div class="card as-card as-sum"><div class="as-eyebrow">${I('spark',20)}<span>Résumé de la semaine · Mis à jour à ${now.getHours()} h</span></div><p class="as-lead">${sum}</p>
 <div class="as-kpis">${kpi('Temps gagné','~'+s.gain,' min','estimation')}${kpi('Taux de RDV',s.conv,' %','')}${kpi('Hors horaires',nh,' appel'+(nh>1?'s':''),'')}</div></div>
 <div class="card as-card"><h2 class="as-h2">Ce qu'Akno a remarqué</h2>${asInsights(s,ar)}</div>
 <div class="as-duo"><div class="card as-card"><div class="as-rowh"><h2 class="as-h2">Motifs des appels</h2><span class="as-meta">7 jours</span></div>${motifs.length?motifs.map(([l,n],i)=>`<div class="as-mot"><div class="as-mot-h"><span>${esc(l)}</span><span class="as-meta">${n} · ${s.w.length?Math.round(n/s.w.length*100):0} %</span></div><div class="as-bar"><i style="width:${n/mx*100}%;opacity:${i?'.45':'1'}"></i></div></div>`).join(''):'<p class="as-ins-empty">Aucun appel cette semaine</p>'}</div>
 <div class="card as-card"><div class="as-rowh"><h2 class="as-h2">Usage de l'IA</h2><span class="as-meta">Ce mois</span></div><div class="as-usage">${asRing(used,250)}<div class="as-usage-txt"><div class="as-usage-line1"><b>${used}</b><span> / 250 min</span></div><p class="as-usage-rest">${250-used} min restantes</p></div></div>
 <div class="as-usage-kv"><div><span>Appels gérés</span><b>${s.w.length}</b></div><div><span>Transferts urgents</span><b>${xfer}</b></div></div></div></div></div>`}
function asSheet(){return `<div class="as-sheet" role="dialog" aria-label="Assistant"><div class="as-sheet-grab"></div><header class="as-sheet-h"><h2 class="as-h2">Assistant</h2><button type="button" class="as-sheet-x" data-act="asclose" aria-label="Fermer">${I('x',18)}</button></header>${asChatPanel()}</div>`}
function asMobileExtra(){let x='';if(!UI.asOpen)x=`<button type="button" class="as-fab" data-act="asopen">${I('spark',18)}<span>Demander à Akno AI</span></button>`;if(UI.asOpen)x+=`<div class="ov" data-act="asclose"></div>${asSheet()}`;return x}
function vAssistant(){const s=stats(),now=new Date(),ar=aRappeler(),mob=innerWidth<768;
 return `<div class="as-page">${asMain(s,now,ar)}${mob?'':asChatPanel()}${mob?'<div class="as-spacer" aria-hidden="true"></div>':''}</div>`}

/* ---------- Réglages ---------- */
function vReglages(){const tg=(k,l)=>`<div class="kv"><span class="w">${l}</span><button class="tg${DB.notif[k]?' on':''}" data-notif="${k}" role="switch" aria-checked="${!!DB.notif[k]}" aria-label="${l}"></button></div>`;
 const now=new Date(),mois=DB.calls.filter(c=>{const d=new Date(c.created_at);return d.getMonth()==now.getMonth()&&d.getFullYear()==now.getFullYear()}),mins=Math.round(mois.reduce((s,c)=>s+(c.duration||0),0)/60);
 const left=`<div class="set-col"><div class="card prof"><span class="ini xl" style="background:#2a3c6e">${esc(PROFIL.initiales)}</span><div><div class="h22">${esc((PROFIL.prenom+' '+(PROFIL.nom||'')).trim())}</div><div class="t15 mut">${esc(PROFIL.entreprise)}</div></div></div>
 <div class="set-sec">Entreprise</div><div class="card kvs set-card">${[['Nom',PROFIL.entreprise],['Téléphone',PROFIL.telephone],['E-mail',PROFIL.email],['Zone',PROFIL.zone]].map(([k,v])=>`<div class="kv"><span>${k}</span><span class="ell">${esc(v)||'—'}</span></div>`).join('')}</div>
 <div class="set-sec">Notifications</div><div class="card kvs set-card">${tg('nouveaux','Nouveaux appels')}${tg('urgents','Appels urgents')}${tg('resume','Résumé quotidien')}</div>
 <div class="set-sec">Compte</div><div class="card kvs set-card">${CLOUD?`<button class="kv" data-act="logout"><span class="red w">Se déconnecter</span>${I('out2',18)}</button>`:`<button class="kv" data-act="resetdemo"><span class="w">Réinitialiser la démo</span>${I('reset',18)}</button>`}</div>
 <p class="foot">Akno · ${CLOUD?'connecté':'mode démo, données fictives'}</p></div>`;
 const right=`<div class="set-col set-col-side"><div class="set-sec">Mon offre</div><div class="card set-card set-offer"><div class="set-offer-h"><b class="set-offer-t">Akno Pro</b><span class="set-pill-act">Actif</span></div><p class="set-offer-price">298 € HT / mois</p><div class="set-mins-h"><span class="t13 mut">Minutes ce mois-ci</span><span class="set-mins-v">${mins}<small> / 250</small></span></div><span class="bar set-bar"><b style="width:${Math.min(100,mins/250*100)}%"></b></span><p class="set-offer-extra">0,59 €/min au-delà</p></div>
 <div class="set-sec">Ma réceptionniste</div><div class="card set-card set-kvs"><div class="set-row"><span>Numéro Akno</span><span>—</span></div><div class="set-row"><span>Statut</span><span class="set-on"><i class="set-dot-ok"></i>En ligne</span></div><div class="set-row"><span>Horaires</span><span>24 h/24</span></div><a class="set-btn-w" href="#/assistant">Tester mon assistant</a></div>
 <div class="set-sec">Aide</div><div class="card set-card set-help"><a class="set-help-row" href="mailto:aknoweb.contact@gmail.com"><span>Contacter le support</span>${I('chev',18)}</a><a class="set-help-row" href="#"><span>Guide de démarrage</span>${I('chev',18)}</a></div></div>`;
 return head('Réglages')+`<div class="set-page">${left}${right}</div>`}

/* ============================ ROUTEUR ============================ */
let last='',lastTab=-1,_routeKeep=false,_sameTab=false;
let _scrollLockN=0,_scrollLockY=0;
function lockScroll(){if(_scrollLockN++>0)return;_scrollLockY=scrollY;const b=document.body,el=document.documentElement;b.style.position='fixed';b.style.top=`-${_scrollLockY}px`;b.style.left='0';b.style.right='0';b.style.width='100%';b.style.overflow='hidden';el.style.overflow='hidden'}
function unlockScroll(){if(_scrollLockN<=0)return;if(--_scrollLockN>0)return;const b=document.body,el=document.documentElement,y=_scrollLockY;b.style.position='';b.style.top='';b.style.left='';b.style.right='';b.style.width='';b.style.overflow='';el.style.overflow='';scrollTo(0,y)}
function initScrimTouch(){document.addEventListener('touchmove',e=>{if(e.target.closest('.ov'))e.preventDefault()},{passive:false})}
const motionOk=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches;
const tabFromHash=h=>h.startsWith('#/appel/')||h==='#/appels'?1:h==='#/agenda'||/^#\/rdv\//.test(h)?2:h==='#/assistant'?3:h==='#/reglages'?4:0;
function layoutNavPills(tab,instant){const inst=instant??!_pillPrimed;const place=(root,pill,idx,axis)=>{if(!root||!pill)return;const links=[...root.querySelectorAll('a')];if(idx==null||idx<0||idx>=links.length){pill.style.opacity='0';return}pill.style.opacity='1';const link=links[idx];const x=link.offsetLeft,y=link.offsetTop,w=link.offsetWidth,h=link.offsetHeight;if(inst)pill.style.transition='none';pill.style.width=w+'px';pill.style.height=h+'px';pill.style.transform=axis==='x'?`translate3d(${x}px,0,0)`:`translate3d(0,${y}px,0)`;if(inst){pill.offsetHeight;requestAnimationFrame(()=>{pill.style.transition=''})}};
 place($('.snav'),$('.snav-pill'),tab<4?tab:null,'y',inst);place($('.nav'),$('.nav-pill-m'),tab,'x',inst);if(inst)_pillPrimed=true}
let _countRaf=0;const _countAnimated=new Map();
function settleCounts(){document.querySelectorAll('.hero-n,.ak-count-n').forEach(el=>{const t=+(el.dataset.n??el.dataset.countN)||0;el.textContent=String(t)});document.querySelectorAll('.ak-bar-fill').forEach(el=>{el.style.width=(+el.dataset.n||0)+'%'})}
function dashCountAnim(){if(_countRaf){cancelAnimationFrame(_countRaf);_countRaf=0}const items=[],easeOk=motionOk()&&!document.hidden;
 document.querySelectorAll('.hero-n,.ak-count-n').forEach(el=>{const target=+(el.dataset.n??el.dataset.countN)||0;el.textContent=String(target);const key=el.dataset.animKey||'c:'+target;if(_countAnimated.get(key)===target)return;_countAnimated.set(key,target);if(easeOk)items.push({el,target,kind:'text'})});
 document.querySelectorAll('.ak-bar-fill').forEach(el=>{const target=+el.dataset.n||0;el.style.width=target+'%';const key=el.dataset.animKey||'b:'+target;if(_countAnimated.get(key)===target)return;_countAnimated.set(key,target);if(easeOk)items.push({el,target,kind:'bar'})});
 if(!items.length)return;const t0=performance.now(),dur=600,ease=t=>1-Math.pow(1-t,3);items.forEach(it=>{if(it.kind==='text')it.el.textContent='0';else it.el.style.width='0%'});
 const frame=now=>{const p=Math.min(1,(now-t0)/dur),e=ease(p);items.forEach(it=>{if(it.kind==='text')it.el.textContent=String(Math.round(e*it.target));else it.el.style.width=e*it.target+'%'});if(p<1)_countRaf=requestAnimationFrame(frame);else{_countRaf=0;settleCounts()}};_countRaf=requestAnimationFrame(frame)}
function staggerPage(){if(!motionOk())return;const sel='#page .hero,#page .acts,#page .stats .stat,#page .card';[...document.querySelectorAll(sel)].slice(0,6).forEach((el,i)=>{el.style.setProperty('--i',i);el.classList.add('ak-stagger')})}
function afterRouteFx(tab){requestAnimationFrame(()=>layoutNavPills(tab));const page=$('#page');if(!page)return;if(_routeKeep){page.classList.add('noanim');if(tab===0)settleCounts();if(tab===3)requestAnimationFrame(scrollAsChatEnd);initCallRec();return}page.classList.remove('noanim');staggerPage();if(tab===0)dashCountAnim();if(tab===3)requestAnimationFrame(scrollAsChatEnd);initCallRec()}
document.addEventListener('visibilitychange',()=>{if(_countRaf){cancelAnimationFrame(_countRaf);_countRaf=0}settleCounts()});
let _callRecAudio=null;
function pauseCallRec(){document.querySelectorAll('.rec-player audio').forEach(a=>{a.pause();a.currentTime=a.currentTime});if(_callRecAudio){_callRecAudio.pause();_callRecAudio=null}}
function initCallRec(){const wrap=document.querySelector('[data-rec]');if(!wrap||wrap.dataset.recInit)return;wrap.dataset.recInit='1';const audio=wrap.querySelector('audio'),playBtn=wrap.querySelector('.rec-play'),track=wrap.querySelector('.rec-track'),fill=wrap.querySelector('.rec-fill'),timeEl=wrap.querySelector('.rec-time'),spdBtn=wrap.querySelector('.rec-spd'),errEl=wrap.closest('.rec-wrap')?.querySelector('.rec-err');const speeds=[1,1.5,2];let spdI=0,drag=false;
 const setPlayUi=on=>{playBtn.innerHTML=on?Ifill('pause'):Ifill('play');playBtn.setAttribute('aria-label',on?'Pause':'Lecture');if(on){document.querySelectorAll('.rec-player audio').forEach(a=>{if(a!==audio)a.pause()});_callRecAudio=audio}else if(_callRecAudio===audio)_callRecAudio=null};
 const syncUi=()=>{const d=audio.duration||0,cur=audio.currentTime||0,t=d?cur/d*100:0;fill.style.width=t+'%';timeEl.textContent=recFmt(cur)+' / '+recFmt(d);track.setAttribute('aria-valuenow',String(Math.round(t)))};
 const fail=()=>{wrap.style.display='none';if(errEl)errEl.style.display='block'};
 const seek=p=>{if(!audio.duration)return;audio.currentTime=Math.max(0,Math.min(1,p))*audio.duration;syncUi()};
 audio.addEventListener('error',fail);audio.addEventListener('loadedmetadata',syncUi);audio.addEventListener('timeupdate',syncUi);audio.addEventListener('ended',()=>setPlayUi(false));
 playBtn.addEventListener('click',()=>{if(audio.error)return fail();if(audio.paused){audio.play().then(()=>setPlayUi(true)).catch(fail)}else{audio.pause();setPlayUi(false)}});
 spdBtn.addEventListener('click',()=>{spdI=(spdI+1)%speeds.length;audio.playbackRate=speeds[spdI];spdBtn.textContent=speeds[spdI]===1?'1x':speeds[spdI]+'x'});
 const pos=e=>{const r=track.getBoundingClientRect();return r.width?(e.clientX-r.left)/r.width:0};
 track.addEventListener('click',e=>seek(pos(e)));track.addEventListener('pointerdown',e=>{drag=true;track.setPointerCapture(e.pointerId);seek(pos(e))});track.addEventListener('pointermove',e=>{if(drag)seek(pos(e))});track.addEventListener('pointerup',()=>{drag=false});track.addEventListener('pointercancel',()=>{drag=false});
 if(audio.error)fail()}
function routeRender(keep,h,y){pauseCallRec();ensureChrome();const{tab,body,extra}=viewForHash(h);if(!_navLed){syncNavTab(tab);layoutNavPills(tab)}else _navLed=false;
 const openDsheet=!isD()&&h.startsWith('#/appel/'),wasDsheet=!isD()&&last.startsWith('#/appel/');
 if(openDsheet&&!wasDsheet)lockScroll();
 $('#page').innerHTML=`<div class="wrap">${body}</div>`+extra;
 if(wasDsheet&&!openDsheet)unlockScroll();
 if(!openDsheet&&_scrollLockN===0){if(keep||(h.startsWith('#/appel')&&last.startsWith('#/appel'))||(h.startsWith('#/appel/')&&last=='#/appels'))scrollTo(0,y);else scrollTo(0,0)}
 last=h;lastTab=tab;_routeKeep=!!keep;afterRouteFx(tab)}
function route(keep){const h=location.hash||'#/';const y=scrollY;const tab=tabFromHash(h);_sameTab=!keep&&tab===lastTab&&!!last;_routeKeep=!!keep||_sameTab;
 const run=()=>routeRender(keep,h,y);
 const vt=!_routeKeep&&motionOk()&&document.startViewTransition&&!document.body.classList.contains('is-login')&&!h.startsWith('#/appel/');
 if(vt)document.startViewTransition(run);else run()}
addEventListener('hashchange',()=>{if(UI.asOpen){UI.asOpen=false;unlockScroll()}closeLayer();route()});
document.addEventListener('click',e=>{const t=e.target;let x;
 if(x=t.closest('.snav a[href^="#"], .nav a[href^="#"], .side-foot a[href^="#"]')){if(t.closest('[data-stop]'))return;const h=x.getAttribute('href'),tab=tabFromHash(h),cur=location.hash||'#/';if((h===cur||(h==='#/'&&(cur==='#/'||cur==='')))&&tab===lastTab){e.preventDefault();return}e.preventDefault();navLead(tab);location.hash=h;return}
 if(t.closest('[data-stop]'))return;
 if(x=t.closest('[data-f]')){e.preventDefault();UI.f=x.dataset.f;if(location.hash!='#/appels'&&!location.hash.startsWith('#/appel/'))location.hash='#/appels';else route(true);return}
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
 if(x=t.closest('[data-act]')){e.preventDefault();const a=x.dataset.act;
  if(a=='close')closeLayer();
  else if(a=='asopen'){UI.asOpen=true;lockScroll();route(true)}
  else if(a=='asclose'){if(motionOk()&&document.querySelector('.as-sheet')){document.querySelector('.as-sheet').classList.add('ak-out');setTimeout(()=>{UI.asOpen=false;unlockScroll();route(true)},250);return}UI.asOpen=false;unlockScroll();route(true)}
  else if(a=='newrdv')rdvSheet(null,x.dataset.call);
  else if(a=='editrdv')rdvSheet(rdvById(x.dataset.id));
  else if(a=='delrdv')confirmDel(x.dataset.id);
  else if(a=='dodel'){const r=rdvById(x.dataset.id);DB.rdvs=DB.rdvs.filter(y=>y!==r);if(r.call_id){const c=byId(r.call_id);if(c){c.rdv_date=null;if(c.statut=='rdv_pris')c.statut='a_rappeler'}}save();closeLayer();toast('Rendez-vous supprimé');location.hash='#/agenda'}
  else if(a=='clearchat'){DB.chat=[];save();route(true)}
  else if(a=='mic')toast('Dictée : utilisez le micro de votre clavier');
  else if(a=='resetdemo'){DB=demo();save();UI.f='tous';UI.day=sod(new Date());toast('Démo réinitialisée');route()}
  else if(a=='logout')sb.auth.signOut().then(()=>location.reload())}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.matches('[data-go]'))location.hash=e.target.dataset.go;if(e.key=='Escape'){if(UI.asOpen){UI.asOpen=false;unlockScroll();route(true)}else closeLayer()}});
document.addEventListener('submit',e=>{e.preventDefault();if(e.target.id=='rf')submitRdv(e.target);else if(e.target.id=='askf'){const q=$('#askq').value;ask(q)}});
let nt;document.addEventListener('input',e=>{if(e.target.id=='aq'){UI.aq=e.target.value;const p=e.target.selectionStart;route(true);const n=$('#aq');if(n){n.focus();n.setSelectionRange(p,p)}return}if(e.target.id=='note'){const c=byId(e.target.dataset.id);c.note=e.target.value;clearTimeout(nt);nt=setTimeout(()=>{save()},400)}});
document.addEventListener('change',e=>{if(e.target.id=='note'){save();toast('Note enregistrée')}});
const bp=()=>innerWidth>=1024?2:innerWidth>=768?1:0;let _m=bp(),_rzT;addEventListener('resize',()=>{clearTimeout(_rzT);_rzT=setTimeout(()=>{layoutNavPills(lastTab<0?0:lastTab);const m=bp();if(m!==_m){_m=m;route(true)}},150)});
setInterval(()=>{if((location.hash=='#/agenda'||location.hash==''||location.hash=='#/')&&!$('#layer').innerHTML&&!document.activeElement.matches('input,textarea'))route(true)},60000);

/* ===================== Mode réel : Supabase ===================== */
let sb=null,SNAP=null,USER=null;
const CALL_SYNC=['statut','note','rdv_date'];
const rowToCall=r=>({id:r.id,nom_client:r.nom_client||'',telephone_client:r.telephone_client||'',motif:r.motif||'Autre',besoin_detail:r.besoin_detail||'',code_postal:r.code_postal||'',ville:r.ville||'',adresse:r.adresse||'',email_client:r.email_client||'',rdv_date:r.rdv_date,urgence:r.urgence||'normal',duration:r.duration||0,resume:r.resume||r.besoin_detail||'',statut:r.statut=='renseigne'?'traite':(r.statut||'a_rappeler'),note:r.notes||'',created_at:r.created_at,recording_url:r.recording_url||''});
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
let _callsSub=false;
function applyCloudPayload(a,c,r){if(c.error||r.error){toast('Impossible de charger les données');console.warn(c.error||r.error)}
 const pf=a.data||{};const pr=pf.prenom||(USER.email||'').split('@')[0];
 Object.assign(PROFIL,{prenom:pr,nom:'',initiales:ini(pr+' '+(pf.nom_entreprise||'')),entreprise:pf.nom_entreprise||'',telephone:pf.telephone||'',email:pf.email||USER.email||''});
 let p={};try{p=JSON.parse(localStorage.getItem(LS)||'{}')}catch(e){}
 DB={calls:(c.data||[]).map(rowToCall),rdvs:(r.data||[]).map(rowToRdv),chat:p.chat||[],notif:p.notif||{nouveaux:true,urgents:true,resume:false}};SNAP=snap()}
async function fetchCloudRows(){return Promise.all([sb.from('artisans').select('*').eq('id',USER.id).maybeSingle(),sb.from('calls').select('id,nom_client,telephone_client,motif,besoin_detail,code_postal,ville,adresse,email_client,rdv_date,urgence,duration,resume,statut,notes,created_at,recording_url').order('created_at',{ascending:false}).limit(500),sb.from('appointments').select('*').order('start')])}
async function cloudLoad(){const[a,c,r]=await fetchCloudRows();applyCloudPayload(a,c,r);
 if(!_callsSub){_callsSub=true;sb.channel('calls').on('postgres_changes',{event:'INSERT',schema:'public',table:'calls'},e=>{const x=rowToCall(e.new);if(DB.calls.some(y=>y.id==x.id))return;DB.calls.push(x);SNAP=snap();toast('Nouvel appel · '+nomOf(x));if(!$('#layer').innerHTML)route(true)}).subscribe()}}
async function refreshCurrentPage(){const t0=performance.now();if(CLOUD&&sb&&USER){const[a,c,r]=await fetchCloudRows();applyCloudPayload(a,c,r)}else load();route(true);const wait=Math.max(0,500-(performance.now()-t0));if(wait)await new Promise(r=>setTimeout(r,wait))}
function loginView(msg=''){document.body.classList.add('is-login');_chrome=false;_pillPrimed=false;$('#app').innerHTML=`<div class="login"><div class="lbox"><div class="llogo"><i>${MARK(26,19)}</i>Akno</div><h1 class="h1">Connexion</h1><p class="t15 mut">Retrouvez les appels pris par votre assistante.</p>
 <form id="lgf"><label class="lf"><span>E-mail</span><input id="lg_em" type="email" required autocomplete="email" placeholder="vous@entreprise.fr"></label><label class="lf"><span>Mot de passe</span><input id="lg_pw" type="password" autocomplete="current-password" placeholder="Laisser vide pour recevoir un lien"></label>
 <button class="btnw" type="submit">Se connecter</button></form><button class="lnk" id="lg_ml" type="button">Recevoir un lien par e-mail</button>
 <div id="lg_msg" class="t13 mut lmsg">${esc(msg)}</div><p class="foot">Akno · assistante téléphonique IA</p></div></div>`;
 const m=t=>$('#lg_msg').textContent=t;
 const magic=async()=>{const em=$('#lg_em').value.trim();if(!em){m('Indiquez votre e-mail');return}m('Envoi du lien…');const{error}=await sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:false}});m(error?'Envoi impossible : vérifiez votre e-mail':'Lien envoyé. Ouvrez votre boîte mail.')};
 $('#lg_ml').onclick=magic;
 $('#lgf').addEventListener('submit',async e=>{e.preventDefault();e.stopPropagation();const em=$('#lg_em').value.trim(),pw=$('#lg_pw').value;if(!pw)return magic();m('Connexion…');const{error}=await sb.auth.signInWithPassword({email:em,password:pw});if(error)m('E-mail ou mot de passe incorrect');else location.reload()})}
async function boot(){
 if(!CLOUD){load();ensureChrome();route();return}
 await new Promise(r=>{const x=document.createElement('script');x.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';x.onload=x.onerror=r;document.head.appendChild(x)});
 if(!window.supabase){loginView('Connexion impossible : vérifiez votre réseau.');return}
 sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const{data:{session}}=await sb.auth.getSession();
 if(!session){loginView();sb.auth.onAuthStateChange((ev,s)=>{if(ev=='SIGNED_IN'&&s)location.reload()});return}
 USER=session.user;await cloudLoad();ensureChrome();route()}
window.__aknoLoginPreview=()=>loginView();

/* ===================== Mobile : zoom + pull-to-refresh ===================== */
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
let _lastTouchEnd=0;
document.addEventListener('touchend',e=>{const n=Date.now();if(n-_lastTouchEnd<=300)e.preventDefault();_lastTouchEnd=n},{passive:false});
const PTR_MAX=80,PTR_TRIGGER=64,PTR_HOLD=56;
const ptrOk=()=>innerWidth<768&&!document.body.classList.contains('is-login')&&_scrollLockN===0;
let _ptrY0=0,_ptrPull=0,_ptrOn=false,_ptrLoad=false;
const ptrEl=()=>$('#ptr'),ptrApp=()=>$('#app');
function ptrSetY(y,anim){const a=ptrApp();if(!a)return;a.style.transition=anim?'transform .3s cubic-bezier(.2,.8,.2,1)':'';a.style.transform=y?`translateY(${y}px)`:''}
function ptrUi(pull,spin){const p=ptrEl(),ios=p?.querySelector('.ptr-ios');if(!p||!ios)return;if(pull<=0&&!spin&&!_ptrLoad){p.classList.remove('vis','spin');ios.style.transform='';p.style.opacity='';return}p.classList.add('vis');p.classList.toggle('spin',!!spin);if(spin){ios.style.transform='';p.style.opacity='1'}else{const deg=Math.min(1,pull/PTR_MAX)*300;ios.style.transform=`rotate(${deg}deg)`;p.style.opacity=String(Math.min(1,pull/36))}}
function initPullRefresh(){['touchstart','touchmove','touchend','touchcancel'].forEach(ev=>document.addEventListener(ev,ptrTouch,{passive:false}))}
function ptrTouch(e){if(_ptrLoad||!ptrOk())return;
 if(e.type==='touchstart'){if(scrollY!==0)return;_ptrOn=true;_ptrY0=e.touches[0].clientY;_ptrPull=0;return}
 if(!_ptrOn)return;
 if(e.type==='touchmove'){const dy=e.touches[0].clientY-_ptrY0;if(dy>0&&scrollY<=0){e.preventDefault();_ptrPull=Math.min(PTR_MAX,dy*.4);ptrSetY(_ptrPull);ptrUi(_ptrPull,false)}else if(dy<=0){_ptrPull=0;ptrSetY(0);ptrUi(0,false)}return}
 if(e.type==='touchcancel'){_ptrOn=false;_ptrPull=0;ptrSetY(0,true);ptrUi(0,false);return}
 _ptrOn=false;
 if(_ptrPull>=PTR_TRIGGER){_ptrLoad=true;ptrSetY(PTR_HOLD);ptrUi(PTR_HOLD,true);refreshCurrentPage().finally(()=>{ptrSetY(0,true);ptrUi(0,false);_ptrLoad=false;_ptrPull=0;setTimeout(()=>{const p=ptrEl();if(p&&!p.classList.contains('vis'))p.style.opacity=''})})}
 else{ptrSetY(0,true);ptrUi(0,false);_ptrPull=0}}
initPullRefresh();
initScrimTouch();

boot();
