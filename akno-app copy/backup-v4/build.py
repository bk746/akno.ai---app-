t=open('tpl.html').read().replace('__SYM__',open('sym.txt').read()).replace('<script src="app.js"></script>','<script>\n'+open('app.js').read()+'</script>')
open('index.html','w').write(t)
