import asyncio,sys
from playwright.async_api import async_playwright
U='file:///workspace/akno-app/index.html'
R=sys.argv[1]
async def run(b,w,h,t):
    pg=await b.new_page(locale='fr-FR',viewport={'width':w,'height':h},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto(U);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(500)
    ov=[]
    async def S(n):
        await pg.wait_for_timeout(350);o=await pg.evaluate("document.documentElement.scrollWidth>innerWidth+1||[...document.querySelectorAll('.k,.phd,.lr,.db')].some(e=>e.scrollWidth>e.clientWidth+2)")
        if o: ov.append(n)
        await pg.screenshot(path=f'shots/v4-{t}-{n}.png')
    await pg.goto(U+'#/appels');await S('appels')
    if w>=768:
        await pg.hover('.sw[data-id="2"] .fg');await S('appels-hover')
    else:
        await pg.click('.sw[data-id="1"] .fg');await S('detail');await pg.evaluate("$('#scr').scrollTop=800");await S('detail-bas');await pg.click('[data-act=back]')
    await pg.goto(U+'#/appels');await pg.click('[data-f=tous]');await S('appels-tous')
    await pg.goto(U+'#/resume');await S('dashboard')
    if w<768: await pg.evaluate("$('#scr').scrollTop=900");await S('dashboard-bas')
    await pg.goto(U+'#/assistant');await S('assistant')
    await pg.click('[data-ask="Qui dois-je rappeler ?"]');await S('assistant-reponse')
    await pg.goto(U+'#/agenda');await S('agenda')
    print(t,'errors',errs,'overflow',ov)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,t in [(1440,900,'d'),(390,844,'m')]: await run(b,w,h,t)
    await b.close()
asyncio.run(main())
