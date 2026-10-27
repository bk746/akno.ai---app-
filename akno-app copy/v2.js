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
 <div class="g2"><label class="fld"><span>Motif</span><select id="r_mot">${MOTIFS.map(m=>`<option ${m==base.motif?'selected':''}>${m}</option>`).join('')}</select></label><label class="fld"><span>Durée</span><select id="r_dur">${[30,60,90,120,180].map(m=>`<option value="${m}" ${m==base.duree?'selected':''}>${m<60?m+' min':m/60+' h'+(m%60?' 30':'')}</option>`).join('')}</select></label></div>
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
