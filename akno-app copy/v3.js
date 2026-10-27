/* ======================= V3 : Dashboard, Appels, Assistant ======================= */
TABS[0][2]='Dashboard';TITLES.resume='Dashboard';UI.f='a_rappeler';UI.per='7';UI.jx=null;UI.jopen=false;
const ago=d=>{const m=Math.max(0,Math.round((Date.now()-new Date(d))/6e4));return m<1?'à l\'instant':m<60?'il y a '+m+' min':m<1440?'il y a '+Math.floor(m/60)+' h':m<2880?'hier':dlabel(d)};
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
 const kp=`<div class="kpis6">${card(K.T,'Appels reçus',trend(K.T,Q.T),'vs '+prl)}${card(K.ia+' %','Traités par l\'IA',trend(K.ia,Q.ia,{pts:1}),'sans rappel nécessaire')}${card(K.rdv,'RDV pris',trend(K.rdv,Q.rdv),'vs '+prl,'blue')}${card(K.conv+' %','Conversion appel → RDV',trend(K.conv,Q.conv,{pts:1}),'vs '+prl)}${card(K.ar,'À rappeler',trend(K.ar,Q.ar,{bad:1}),'sur la période','red')}${card(eur(K.pipe),'Pipeline · estimation',trend(K.pipe,Q.pipe),K.rdv+' RDV × '+eur(panier()))}</div>`;
 // appels par jour
 const nd=Math.max(n,7),days=[...Array(nd)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(nd-1-i));const X=DB.calls.filter(c=>dd(c.created_at,d)==0);return {d,n:X.length,r:X.filter(c=>c.statut=='rdv_pris').length}}),mx=Math.max(1,...days.map(x=>x.n));
 const step=nd>7?5:1;
 const ch1=`<div class="k dcard s8"><div class="f sp ch"><span class="lab">Appels et RDV par jour</span><span class="f t2 lg"><span><i class="dot" style="background:rgba(255,255,255,.4)"></i>Appels</span><span><i class="dot" style="background:#5B8CFF"></i>RDV pris</span></span></div>
 <div class="bars ${nd>7?'dense':''}">${days.map((x,i)=>`<div class="bc" title="${dlabel(x.d)} : ${x.n} appel${x.n>1?'s':''}, ${x.r} RDV"><div class="bt"><div class="bv" style="height:${x.n/mx*100}%">${x.r?`<div class="br" style="height:${x.r/x.n*100}%"></div>`:''}</div></div><span class="bl ${dd(x.d,now)==0?'on':''}">${(nd-1-i)%step==0?(nd>7?x.d.getDate():JOURS[x.d.getDay()].slice(0,3)):''}</span></div>`).join('')}</div>${n==1?'<div class="t3" style="font-size:11px;margin-top:6px">Contexte des 7 derniers jours</div>':''}</div>`;
 // entonnoir
 const qual=L.filter(c=>c.statut=='rdv_pris'||(c.motif!='Information'&&c.statut!='renseigne')).length,dev=L.filter(c=>c.statut=='rdv_pris'&&c.rdv_date&&new Date(c.rdv_date)<now).length;
 const F=[['Appels',K.T,'rgba(255,255,255,.28)'],['Qualifiés',qual,'rgba(255,255,255,.18)'],['RDV',K.rdv,'#5B8CFF'],['Devis (visite faite)',dev,'rgba(91,140,255,.45)']];
 const fun=`<div class="k dcard s4"><span class="lab">Entonnoir</span><div style="margin-top:14px">${F.map(([l,v,c],i)=>`<div class="fr"><div class="f sp" style="font-size:13px"><span>${l}</span><span><b>${v}</b>${i?`<span class="t3"> · ${F[i-1][1]?Math.round(v/F[i-1][1]*100):0} %</span>`:''}</span></div><div class="ft"><div style="width:${K.T?v/K.T*100:0}%;background:${c}"></div></div></div>`).join('')}</div></div>`;
 // motifs
 const mo={};L.forEach(c=>mo[c.motif]=(mo[c.motif]||0)+1);const MO=Object.entries(mo).sort((a,b)=>b[1]-a[1]),mm=Math.max(1,...MO.map(x=>x[1]));
 const hl=(arr,col,mx)=>arr.map(([m,v])=>`<div class="hl"><div class="f sp" style="font-size:13px"><span class="ell">${esc(m)}</span><b>${v}</b></div><div class="ft"><div style="width:${v/mx*100}%;background:${col}"></div></div></div>`).join('')||'<div class="t2" style="font-size:13px;padding:8px 0">Aucune donnée</div>';
 const ch3=`<div class="k dcard s4"><span class="lab">Motifs d'appel</span><div style="margin-top:14px">${hl(MO,'rgba(255,255,255,.45)',mm)}</div></div>`;
 // heures
 const HB=[...Array(16)].map((_,i)=>6+i),hc=HB.map(h=>L.filter(c=>new Date(c.created_at).getHours()==h)),hm2=Math.max(1,...hc.map(x=>x.length)),nh=L.filter(hors).length;
 const ch2=`<div class="k dcard s4"><div class="f sp"><span class="lab">Heures d'appel</span><span class="f t2 lg"><span><i class="dot" style="background:#fff"></i>Hors horaires</span></span></div>
 <div style="font-size:14px;margin-top:10px"><b>${nh}</b> appel${nh>1?'s':''} hors horaires <span class="t2">(${L.length?Math.round(nh/L.length*100):0} %) captés par l'IA</span></div>
 <div class="bars hrs">${HB.map((h,i)=>{const ho=h<8||h>=18;return `<div class="bc" title="${h} h : ${hc[i].length} appel(s)"><div class="bt"><div class="bv" style="height:${hc[i].length/hm2*100}%;background:${ho?'#fff':'rgba(255,255,255,.22)'}"></div></div><span class="bl">${h%3==0?h+'h':''}</span></div>`}).join('')}</div></div>`;
 // blocages
 const bl={};L.forEach(c=>{if(c.raison_blocage&&c.statut!='rdv_pris')bl[c.raison_blocage]=(bl[c.raison_blocage]||0)+1});const BL=Object.entries(bl).sort((a,b)=>b[1]-a[1]),bm=Math.max(1,...BL.map(x=>x[1]));
 const ch4=`<div class="k dcard s4"><span class="lab">Où la conversion bloque</span><div style="margin-top:14px">${hl(BL.slice(0,5),'#F43F5E',bm)}</div></div>`;
 // action + rdv compacts
 const pr=sorted().filter(c=>c.statut=='a_rappeler').sort((a,b)=>(b.urgence=='urgent')-(a.urgence=='urgent'))[0];
 const nx=RDVS().filter(r=>new Date(r.rdv_date)>now).sort((a,b)=>new Date(a.rdv_date)-new Date(b.rdv_date))[0];
 const act=`<div class="k dcard s6 cmp ${pr?'redl':''}">${pr?`<div class="f" style="gap:12px;cursor:pointer" data-go="#/appel/${pr.id}">${AV(ini(pr.nom_client),40)}<div class="fl"><div class="lab" style="color:#FB7185">Action prioritaire</div><div class="ell" style="font-size:16px;font-weight:600;margin-top:3px">${esc(pr.nom_client)}</div><div class="t2 ell" style="font-size:13px">${pr.urgence=='urgent'?'Urgent · ':''}${esc(pr.motif)} · ${ago(pr.created_at)}</div></div><a class="rpb" href="${telHref(pr.telephone_client)}" data-stop>${I('phone',15,'stroke-width:2')}Rappeler</a></div>`:`<div class="f" style="gap:12px"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('check',18,'stroke-width:2.2')}</div><div><div class="lab">Action prioritaire</div><div style="font-size:15px;font-weight:600;margin-top:3px">Tout est traité</div></div></div>`}</div>`;
 const rdv=`<div class="k dcard s6 cmp">${nx?`<div class="f" style="gap:12px;cursor:pointer" data-rdv="${nx.id}"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('cal',18)}</div><div class="fl"><div class="lab">Prochain rendez-vous</div><div class="ell" style="font-size:16px;font-weight:600;margin-top:3px">${esc(nx.nom_client)}</div><div class="t2 ell" style="font-size:13px">${rdvTxt(nx.rdv_date)} · ${esc(nx.motif)}</div></div><a class="rb" href="#/agenda" data-stop aria-label="Agenda">${I('chev',18)}</a></div>`:'<div class="lab">Prochain rendez-vous</div><div class="t2" style="margin-top:6px">Aucun rendez-vous à venir</div>'}</div>`;
 const seg=`<div class="seg per">${Object.entries(PER).map(([k,[,l]])=>`<button class="${UI.per==k?'on':''}" data-per="${k}">${l}</button>`).join('')}</div>`;
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
 return `<div class="sw ${UI.sel==c.id&&isD()?'sel':''}" data-id="${c.id}"><div class="acts"><button data-act="note" style="width:74px;background:#2C2C2E">${I('note',20)}Note</button><button data-act="done" style="width:84px;background:#fff;color:#000;font-weight:700">${I('check',20,'stroke-width:2.2')}Rappelé</button></div>
 <div class="k fg r3 ${ar?'ar':''}"><i class="bar" style="background:${barC(c)}"></i><div class="f" style="gap:12px;align-items:flex-start">${AV(ini(c.nom_client),42)}<div class="fl">
 <div class="f sp" style="gap:10px"><span class="nm ell">${esc(c.nom_client)}</span><span class="ago ${ar?'rd':''}">${nw?'<i class="dot" style="background:#5B8CFF;margin-right:5px"></i>':''}${ago(c.created_at)}</span></div>
 <div class="t2 ell" style="font-size:14px;margin-top:2px">${esc(c.motif)} · ${esc(c.ville)}</div>
 <div class="f" style="gap:6px;margin-top:8px;flex-wrap:wrap">${u?URGB:''}${badgeStat(c)}</div></div></div>
 ${ar?`<div class="ra"><a class="rpb big" href="${telHref(c.telephone_client)}" data-stop>${I('phone',17,'stroke-width:2')}Rappeler</a><button class="mk" data-act="done">${I('check',16,'stroke-width:2.2')}Marquer rappelé</button></div>`:''}</div></div>`}
function appelsList(){if(!FIL3[UI.f])UI.f='a_rappeler';const L=sorted().filter(c=>match(c,UI.q));
 $('#pills').outerHTML=`<div class="seg tabs3" id="pills">${Object.entries(FIL3).map(([k,[l,f]])=>`<button class="${UI.f==k?'on':''} ${k=='a_rappeler'?'red':''}" data-f="${k}">${l} <span class="cnt">${L.filter(f).length}</span></button>`).join('')}</div>`;
 const F=L.filter(FIL3[UI.f][1]);
 if(UI.f=='a_rappeler'){$('#list').innerHTML=F.length?`<div class="hint">${I('flame',13,'stroke-width:2.2;color:#FB7185')}Les urgences sont en haut. Rappelez puis marquez l'appel comme rappelé.</div>`+[...F].sort(prio).map(row).join(''):`<div class="k emp"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF;margin:0 auto">${I('check',20,'stroke-width:2.2')}</div><div style="font-size:17px;font-weight:600;margin-top:12px">Tout est traité</div><div class="t2" style="font-size:14px;margin-top:4px">${UI.q?'Aucun appel à rappeler pour cette recherche.':'Aucun client n\'attend de rappel. Akno vous prévient au prochain appel.'}</div><button class="pill" style="margin-top:14px" data-f="tous">Voir tous les appels</button></div>`}
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
 const S=t=>`<div class="lab" style="margin:18px 4px 8px">${t}</div>`;
 return `${S('Ce que veut le client')}<div class="k" style="padding:14px 16px"><div class="f" style="gap:6px;flex-wrap:wrap">${c.urgence=='urgent'?URGB:''}<span class="chip">${esc(c.motif)}</span><span class="chip">${esc({devis:'Devis',depannage:'Dépannage',entretien:'Entretien',information:'Information'}[c.type_demande]||c.type_demande)}</span></div><div style="font-size:17px;font-weight:600;line-height:23px;margin-top:10px">${esc(c.besoin_detail)}</div></div>
 ${S('Résumé IA')}<div style="padding:1px;border-radius:22px;background:linear-gradient(135deg,#5B8CFF88,rgba(255,255,255,.08) 55%)"><div style="border-radius:21px;background:#18181B;padding:14px 16px"><div class="f sp"><span class="f" style="gap:8px;font-size:13px;font-weight:600"><svg width="18" height="13" style="color:#fff"><use href="#mark"/></svg>Akno</span><span style="font-size:12px;color:var(--t3)">Appel de ${esc(c.duree||'')}</span></div><div style="font-size:15px;line-height:21px;margin-top:8px;color:#E4E4E7">${esc(c.resume)}</div>${c.raison_blocage&&c.statut!='rdv_pris'?`<div class="t2" style="font-size:13px;margin-top:8px">Frein détecté : <span class="rd">${esc(c.raison_blocage)}</span></div>`:''}</div></div>
 ${S('Infos')}<div class="k" style="padding:2px 16px">${info('phone','Téléphone',esc(c.telephone_client),telHref(c.telephone_client))}<div class="sep"></div>${info('pin','Adresse',esc(c.adresse),maps)}<div class="sep"></div>${info('t-home','Code postal · Ville',esc(c.code_postal)+' · '+esc(c.ville))}<div class="sep"></div>${info('mail','E-mail',esc(c.email_client),'mailto:'+c.email_client)}</div>
 ${S('Rendez-vous')}<div class="k" style="padding:2px 16px">${rv?`<div class="irow" data-rdv="${rv.id}" style="cursor:pointer"><div class="tile" style="background:rgba(91,140,255,.14);color:#5B8CFF">${I('cal',17)}</div><div class="fl"><div class="t2" style="font-size:12px">${new Date(rv.rdv_date)<new Date()?'Rendez-vous passé':'Rendez-vous confirmé'}</div><div style="font-size:15px;font-weight:500;margin-top:2px">${rdvTxt(rv.rdv_date)} · ${esc(rv.motif)}</div></div>${I('chev',16,'color:var(--t3)')}</div>`:`<div class="irow" data-act="addrdv" data-call="${c.id}" style="cursor:pointer"><div class="tile">${I('plus',17)}</div><div class="fl" style="font-size:15px;font-weight:500">Planifier un rendez-vous</div>${I('chev',16,'color:var(--t3)')}</div>`}</div>
 ${S('Note')}<div class="k" style="padding:12px 16px"><div class="t2 f sp" style="font-size:12px">Visible uniquement par vous<span id="nsv" style="color:var(--t3);opacity:0;transition:opacity .3s">Enregistré</span></div><textarea class="nt" id="ntxt" rows="1" placeholder="Ajouter une note…">${esc(c.note)}</textarea></div>
 ${S('Statut')}<div class="seg" id="seg">${['a_rappeler','rappele','rdv_pris','renseigne'].map(s=>`<button class="${c.statut==s?'on':''}" data-st="${s}">${STL[s]}</button>`).join('')}</div>
 ${S('Historique'+(hist.length?' · '+hist.length:''))}<div class="k" style="padding:4px 8px">${hist.map(x=>`<div class="trow" data-go="#/appel/${x.id}"><div class="fl" style="min-width:0"><div class="ell" style="font-size:14px;font-weight:600">${esc(x.motif)} · ${dlabel(x.created_at)}</div><div class="t2 ell" style="font-size:12px;margin-top:2px">${esc(x.resume)}</div></div>${badgeStat(x)}</div>`).join('')||'<div class="t2" style="font-size:13px;padding:12px 8px">Premier appel de ce client</div>'}</div>`}
function vDetail(id){const c=byId(id);if(!c)return '<div class="empty">Appel introuvable</div>';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse);
 return `<div class="top">${RB('back','data-act="back"','Retour')}<span style="font-size:15px;font-weight:600;margin-left:50px" class="t2">Appel · ${hm(c.created_at)}</span><div class="f" style="gap:10px">${RB('more','data-act="share"','Copier le numéro')}${ACC}</div></div>
 <div class="f" style="gap:14px;margin:6px 0 14px">${AV(ini(c.nom_client),56)}<div class="fl"><div class="ell" style="font-size:24px;font-weight:700;letter-spacing:-.03em">${esc(c.nom_client)}</div><div class="f" style="gap:8px;margin-top:6px;flex-wrap:wrap">${badgeStat(c)}<span class="t2" style="font-size:13px">${esc(c.telephone_client)} · ${ago(c.created_at)}</span></div></div></div>
 <div class="f" style="gap:8px">${c.statut=='a_rappeler'?`<button class="sec mk2" data-act="done" data-id="${c.id}">${I('check',18,'stroke-width:2.2')}Marquer rappelé</button>`:''}<a class="sec" href="sms:${c.telephone_client.replace(/\s/g,'')}">${I('msg',18)}SMS</a><a class="sec" href="${maps}" target="_blank" rel="noopener">${I('nav',18)}Itinéraire</a></div>
 ${detailBody(c)}<div style="height:110px"></div>`}
function dDetail(id){const c=byId(id);if(!c)return '<div class="empty">Sélectionnez un appel</div>';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.adresse),ar=c.statut=='a_rappeler';
 return `<div class="phd"><div class="f" style="gap:16px;min-width:0">${AV(ini(c.nom_client),56)}<div class="fl" style="min-width:0"><div class="ell" style="font-size:24px;font-weight:700;letter-spacing:-.03em">${esc(c.nom_client)}</div><div class="f" style="gap:8px;margin-top:6px;flex-wrap:wrap"><a href="${telHref(c.telephone_client)}" data-stop style="font-size:14px;font-weight:600">${esc(c.telephone_client)}</a>${badgeStat(c)}${c.urgence=='urgent'?URGB:''}<span class="t2" style="font-size:12px">${ago(c.created_at)}</span></div></div></div>
 <div class="f" style="gap:8px;flex:none;flex-wrap:wrap"><a class="rb" href="sms:${c.telephone_client.replace(/\s/g,'')}" title="SMS">${I('msg',19)}</a><a class="rb" href="mailto:${c.email_client}" title="E-mail">${I('mail',19)}</a><a class="rb" href="${maps}" target="_blank" rel="noopener" title="Itinéraire">${I('nav',19)}</a>${ar?`<button class="sec mk2" style="height:44px;padding:0 14px" data-act="done" data-id="${c.id}">${I('check',17,'stroke-width:2.2')}Marquer rappelé</button>`:''}<a class="${ar?'rpb big':'bw'}" href="${telHref(c.telephone_client)}" data-act="call" style="${ar?'height:44px;padding:0 18px':''}">${I('phone',18,'stroke-width:2')}Rappeler</a></div></div>
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
 const B=[`<b>${S.td.length} appel${S.td.length>1?'s':''}</b> aujourd'hui (${y} hier), <b style="color:#8DB0FF">${S.rdvTd} RDV pris</b>.`,
  S.ar.length?`<b class="rd">${S.ar.length} client${S.ar.length>1?'s':''} à rappeler</b>${S.urg.length?`, dont ${S.urg.length} urgent${S.urg.length>1?'s':''}`:''} — le plus ancien attend depuis ${ago(old.created_at).replace('il y a ','')}.`:'Aucun client n\'attend de rappel.',
  S.bl[0]?`Premier frein sur 7 jours : <b>${esc(S.bl[0][0].toLowerCase())}</b> (${S.bl[0][1]} cas).`:'Aucun frein relevé sur 7 jours.',
  nx?`Prochain RDV : <b>${esc(nx.nom_client)}</b>, ${rdvTxt(nx.rdv_date)}.${nh?` ${nh} appels hors horaires captés cette semaine.`:''}`:`${nh} appels hors horaires captés cette semaine.`];
 const A=actions(),D=doneMap(),nd=A.filter(a=>D[a.k]).length;
 return `<div class="aib"><div class="aibi"><div class="f sp"><span class="f" style="gap:8px;font-size:14px;font-weight:600"><svg width="18" height="13" style="color:#fff"><use href="#mark"/></svg>Briefing du jour</span><span class="t2" style="font-size:12px">${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]}</span></div>
 <ul class="bul">${B.map(b=>`<li>${b}</li>`).join('')}</ul>
 <div class="f sp" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)"><span class="lab">Prochaines actions</span><span class="t2" style="font-size:12px" id="acnt">${nd}/${A.length} faites</span></div>
 <div class="chk">${A.map(a=>`<div class="ci ${D[a.k]?'dn':''}"><button class="cb" data-chk="${a.k}" aria-label="Cocher">${I('check',13,'stroke-width:3')}</button><div class="fl" style="min-width:0;cursor:pointer" ${a.rdv?`data-rdv="${a.rdv}"`:`data-go="${a.go}"`}><div class="ell ct ${a.red&&!D[a.k]?'rd':''}">${esc(a.t)}</div><div class="t2 ell" style="font-size:12px">${esc(a.s)}</div></div>${a.tel&&!D[a.k]?`<a class="rb" style="width:34px;height:34px;color:#FB7185" href="${telHref(a.tel)}" data-stop aria-label="Appeler">${I('phone',16,'stroke-width:2')}</a>`:''}</div>`).join('')||'<div class="t2" style="font-size:13px;padding:8px 0">Rien à faire pour le moment.</div>'}</div></div></div>`}
function answersHtml(){const C=DB.chat,P=[];for(let i=0;i<C.length;i+=2)if(C[i+1])P.push([C[i].t,C[i+1].t]);
 return P.reverse().slice(0,4).map(([q,a],i)=>`<div class="ans ${i?'old':''}"><div class="aq">${I('t-ai',13)}${esc(q)}</div><div class="ma2">${a}</div></div>`).join('')}
function chatHtml(){return `<div class="askb k"><div class="f sp"><span style="font-size:17px;font-weight:700">Demander à Akno</span>${DB.chat.length?'<button class="t2 clr" data-act="clearchat">Effacer</button>':''}</div>
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
