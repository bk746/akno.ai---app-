import asyncio,sys
from playwright.async_api import async_playwright
U='file:///workspace/akno-app/index.html'
OV="""()=>{const r=[];if(document.documentElement.scrollWidth>innerWidth+1)r.push('page');document.querySelectorAll('.k,.phd,.pbd,#tbar,#side,.wk').forEach(e=>{if(e.scrollWidth>e.clientWidth+2)r.push((e.id||e.className).slice(0,30)+':'+e.scrollWidth+'>'+e.clientWidth)});return r}"""
async def run(b,w,h,tag,shots):
    pg=await b.new_page(viewport={'width':w,'height':h},device_scale_factor=2 if shots else 1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto(U);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(500)
    ov={}
    async def S(n):
        await pg.wait_for_timeout(350);ov[n]=await pg.evaluate(OV)
        if shots: await pg.screenshot(path=f'shots/desktop-{n}.png')
        else: await pg.screenshot(path=f'shots/t{tag}-{n}.png')
    D=w>=768
    await S('resume')
    await pg.goto(U+'#/appels');await S('appels')
    if D:
        await pg.click('.sw[data-id="2"] .fg');await S('appels-selection')
        await pg.keyboard.press('ArrowDown');await pg.wait_for_timeout(200);print(tag,'kbd',await pg.evaluate('location.hash'))
        await pg.hover('.sw[data-id="1"] .fg');await S('appels-hover')
        await pg.click('.sw[data-id="1"] .qk.dq');await pg.wait_for_timeout(350);await pg.fill('#snote','Apporter le catalogue');await S('note-modal');await pg.click('[data-act=savenote]')
        await pg.hover('.sw[data-id="1"] .fg');await pg.click('.sw[data-id="1"] .qk:not(.dq)');await S('rappele')
        await pg.fill('#gq','villeurbanne');await S('recherche-globale');await pg.fill('#gq','')
        await pg.click('[data-f=urgent]');await S('filtre-urgents');await pg.click('[data-f=tous]')
        await pg.click('.sw[data-id="3"] .fg');await pg.fill('#ntxt','Code portail 2468, chien');await pg.click('[data-st=renseigne]');await S('detail-statut')
        await pg.click('.sn[title=Agenda]');await S('agenda')
        await pg.click('[data-act=wnext]');await S('agenda-semaine-suivante');await pg.click('[data-act=today]')
        n=await pg.locator('.wb').count()
        if n: await pg.locator('.wb').first.click();print(tag,'blk',await pg.evaluate('location.hash'))
        await pg.click('.sn[title=Clients]');await S('clients')
        await pg.locator('.trow').nth(2).click();await S('client-fiche')
        await pg.fill('#cq','lyon');await pg.wait_for_timeout(200)
        await pg.click('.sn[title=Réglages]');await S('reglages')
        await pg.click('[data-tg=resume]');await pg.click('[data-act=reset]');await S('reset')
    else:
        await pg.click('.sw[data-id="1"] .fg');await S('detail');await pg.click('[data-act=back]')
        for t in ['Agenda','Clients','Réglages','Résumé']:
            await pg.click(f'.tbb[aria-label={t}]');await S(t)
    print(tag,'errors',errs);print(tag,'overflow',{k:v for k,v in ov.items() if v})
    await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    await run(b,1440,900,'1440',True)
    for w,h in [(390,844),(1024,768),(1920,1080),(800,1000)]:
        await run(b,w,h,str(w),False)
    await b.close()
asyncio.run(main())
