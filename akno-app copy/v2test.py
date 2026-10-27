import asyncio
from playwright.async_api import async_playwright
U='file:///workspace/akno-app/index.html'
OV=open('dtest.py').read().split('OV="""')[1].split('"""')[0].replace(".k,.phd",".k,.aich,.sheet,.phd")
async def run(b,w,h,tag):
    pg=await b.new_page(locale='fr-FR',viewport={'width':w,'height':h},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto(U);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(500)
    ov={}
    async def S(n):
        await pg.wait_for_timeout(400);ov[n]=await pg.evaluate(OV);await pg.screenshot(path=f'shots/v2-{tag}-{n}.png')
    D=w>=768
    await S('resume')
    await pg.goto(U+'#/appels');await S('appels')
    await pg.goto(U+'#/assistant');await S('assistant')
    for q in ['Qui dois-je rappeler ?','Mes RDV demain','Résumé de la semaine','Pourquoi je perds des clients ?']:
        await pg.click(f'[data-ask="{q}"]');await pg.wait_for_timeout(150)
    await S('assistant-questions')
    await pg.fill('#askq','Martin Durand');await pg.press('#askq','Enter');await S('assistant-client')
    await pg.click('[data-ff=bloques]');print(tag,'bloques',await pg.locator('#feed .fi').count())
    await pg.click('[data-ff=notes]');print(tag,'notes',await pg.locator('#feed .fi').count())
    await pg.click('[data-ff=a_rappeler]');await pg.locator('#feed').scroll_into_view_if_needed();await S('assistant-filtre')
    await pg.goto(U+'#/agenda');await pg.wait_for_timeout(300)
    n0=await pg.evaluate('DB.rdvs.length')
    if D: await pg.locator('.wc').nth(2).click(position={'x':40,'y':8+60*6+10})
    else: await pg.click('[data-act=addrdv]')
    await pg.wait_for_timeout(400);await pg.select_option('#r_cli','__new');await pg.fill('#r_nom','Claire Test');await pg.fill('#r_tel','06 11 22 33 44')
    if not D: await pg.fill('#r_h','14:00')
    await pg.fill('#r_adr','3 rue Neuve 69002 Lyon');await pg.select_option('#r_dur','90');await pg.fill('#r_note','Portail bleu');await S('rdv-form')
    await pg.click('[data-act=saverdv]');await pg.wait_for_timeout(500);await S('rdv-ajoute')
    print(tag,'add',n0,'->',await pg.evaluate('DB.rdvs.length'))
    rid=await pg.evaluate("DB.rdvs.find(r=>r.nom_client=='Claire Test').id")
    await pg.evaluate(f"rdvSheet('{rid}')");await pg.wait_for_timeout(400);await pg.select_option('#r_mot','Entretien');await pg.click('[data-act=saverdv]');await pg.wait_for_timeout(500)
    print(tag,'edit',await pg.evaluate(f"rdvById('{rid}').motif"))
    await pg.evaluate(f"rdvSheet('{rid}')");await pg.wait_for_timeout(400);await pg.click('[data-act=delrdv]');await S('rdv-suppression')
    await pg.click('[data-act=delyes]');await pg.wait_for_timeout(300)
    print(tag,'del',await pg.evaluate('DB.rdvs.length'))
    # existing client rdv from detail
    await pg.goto(U+'#/appel/2');await pg.wait_for_timeout(300);await pg.click('[data-act=addrdv]');await pg.wait_for_timeout(300);await pg.click('[data-act=saverdv]');await pg.wait_for_timeout(500);await pg.wait_for_timeout(300)
    print(tag,'call2',await pg.evaluate('byId(2).statut'))
    await pg.goto(U+'#/resume');await S('resume-apres')
    await pg.reload();await pg.wait_for_timeout(300);print(tag,'persist',await pg.evaluate('DB.rdvs.length'))
    await pg.goto(U+'#/clients');await S('clients')
    await pg.goto(U+'#/reglages');await S('reglages')
    print(tag,'errors',errs);print(tag,'overflow',{k:v for k,v in ov.items() if v})
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    await run(b,390,844,'m');await run(b,1440,900,'d')
    for w in (1024,800): await run(b,w,800,str(w))
    await b.close()
asyncio.run(main())
