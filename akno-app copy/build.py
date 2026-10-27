t=open('tpl.html').read().replace('<script src="app.js"></script>','<script>\n'+open('app.js').read()+'</script>')
open('index.html','w').write(t)
