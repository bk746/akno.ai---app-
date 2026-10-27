import asyncio,sys
from playwright.async_api import async_playwright
U='file:///workspace/akno-app/index.html'
OV="""()=>{const r=[];if(document.documentElement.scrollWidth>innerWidth+1)r.push('page');document.querySelectorAll('.k,.kpi,.phd,.pbd,#tbar,#side,.wk,.sheet,.ra,.db').forEach(e=>{if(e.scrollWidth>e.clientWidth+2)r.push((e.id||e.className).slice(0,30)+':'+e.scrollWidth+'>'+e.clientWidth)});
const p=document.querySelectorAll('.r3');p.forEach(x=>{const a=x.querySelector('.ago').getBoundingClientRect(),n=x.querySelector('.nm').getBoundingClientRect();if(n.right>a.left+1)r.push('row-overlap')});return r}"""
async def run(b,w,h,tag):
    pg=await b.new_page(locale='fr-FR',viewport={'width':w,'height':h},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto(U);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(500)
    ov={};D=w>=768
    async def S(n,full=False):
        await pg.wait_for_timeout(350);ov[n]=await pg.evaluate(OV);await pg.screenshot(path=f'shots/v3-{tag}-{n}.png')
    print(tag,'calls',await pg.evaluate('DB.calls.length'),'rdvs cette sem+',await pg.evaluate("DB.rdvs.filter(r=>new Date(r.rdv_date)>monday(new Date())).length"))
    await S('dashboard-7j')
    kv=lambda: pg.evaluate("[...document.querySelectorAll('.kv')].map(e=>e.textContent).join('|')")
    k7=await kv()
    await pg.click('[data-per=j]');k1=await kv();await S('dashboard-jour')
    await pg.click('[data-per="30"]');k30=await kv();await S('dashboard-30j')
    print(tag,'kpi j',k1,'| 7',k7,'| 30',k30,'bars30',await pg.locator('.bars:not(.hrs) .bc').count())
    if not D:
        await pg.evaluate("$('#scr').scrollTop=700");await S('dashboard-30j-bas')
        await pg.evaluate("$('#scr').scrollTop=1500");await S('dashboard-30j-bas2')
    await pg.goto(U+'#/appels');await S('appels-a-rappeler')
    print(tag,'tab on',await pg.evaluate("$('#pills .on').textContent"),'rows',await pg.locator('.r3').count())
    if D:
        await pg.hover('.sw[data-id="2"] .fg');await S('appels-hover')
        await pg.click('.sw[data-id="2"] .fg');await S('appels-detail')
        await pg.evaluate("$('.pane').scrollTop=2000");await S('appels-detail-bas')
        await pg.click('.sw[data-id="1"] .fg');await pg.wait_for_timeout(200)
    else:
        await pg.click('.sw[data-id="1"] .fg');await S('appel-detail');await pg.evaluate("$('#scr').scrollTop=900");await S('appel-detail-bas');await pg.click('[data-act=back]');await pg.wait_for_timeout(300)
    for i in range(6):
        b2=pg.locator('.r3 .mk')
        if await b2.count()==0: break
        await b2.first.click();await pg.wait_for_timeout(250)
    await S('appels-vide')
    print(tag,'empty',await pg.locator('.emp').count())
    await pg.click('[data-f=traites]');await S('appels-traites')
    await pg.click('[data-f=tous]');await pg.wait_for_timeout(200)
    await pg.click('[data-act=reset]') if False else None
    await pg.evaluate("localStorage.clear()");await pg.goto(U+'#/assistant');await pg.reload();await pg.wait_for_timeout(500)
    await S('assistant')
    await pg.locator('[data-chk]').first.click();await pg.wait_for_timeout(200)
    print(tag,'chk',await pg.evaluate("$('#acnt').textContent"))
    for q in ['Qui dois-je rappeler ?','Mes RDV demain','Pourquoi je perds des clients ?']:
        await pg.click(f'[data-ask="{q}"]');await pg.wait_for_timeout(150)
    await pg.fill('#askq','Martin Durand');await pg.press('#askq','Enter');await S('assistant-reponses')
    if not D: await pg.click('[data-act=jtog]')
    await pg.click('[data-ff=notes]');await pg.locator('[data-jx]').first.click();await pg.wait_for_timeout(200)
    print(tag,'journal notes',await pg.locator('.jr').count(),'open',await pg.locator('.jr.open').count())
    await pg.locator('.jn').scroll_into_view_if_needed();await S('assistant-journal')
    await pg.reload();await pg.wait_for_timeout(400);print(tag,'persist chk',await pg.evaluate("$('#acnt').textContent"),'chat',await pg.evaluate('DB.chat.length'))
    await pg.goto(U+'#/agenda');await S('agenda')
    await pg.goto(U+'#/reglages');await pg.fill('#panier','15000');await pg.dispatch_event('#panier','change');await S('reglages')
    await pg.goto(U+'#/resume');await pg.wait_for_timeout(300);print(tag,'pipe',await pg.evaluate("[...document.querySelectorAll('.kv')].pop().textContent"))
    print(tag,'errors',errs);print(tag,'overflow',{k:v for k,v in ov.items() if v})
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,t in [(390,844,'m'),(1440,900,'d'),(1024,768,'1024')]: await run(b,w,h,t)
    await b.close()
asyncio.run(main())
