#!/usr/bin/env python3
"""Turn the artifact page (index.html, body-only) into a complete web page for GitHub Pages,
and copy the game files into the repository folder given as argument."""
import pathlib, shutil, sys
SRC = pathlib.Path(__file__).parent
DST = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/inardi')
page = (SRC / 'index.html').read_text()
cut = page.index('<!-- ============ MENU')
head, body = page[:cut], page[cut:]
head = head.replace('<meta charset="utf-8">\n', '')
doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#17100b">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="iNardi">
<meta name="description" content="iNardi: Armenian nardi, short and long. Play friends online, coin rooms and bots on carved wooden boards.">
<link rel="icon" href="assets/coin.webp">
<link rel="apple-touch-icon" href="assets/coin.webp">
<style>:root{{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
{head.strip()}
</head>
<body>
{body.strip()}
</body>
</html>
'''
(DST / 'index.html').write_text(doc)
for f in ['engine.js', 'bot.js']: shutil.copy(SRC / f, DST / f)
for d in ['assets', 'vendor']:
    shutil.copytree(SRC / d, DST / d, dirs_exist_ok=True)
shutil.copy(SRC / 'server/schema.sql', DST / 'server/schema.sql')
for f in ['index.ts', 'engine.js']:
    shutil.copy(SRC / 'server/supabase/functions/game' / f, DST / 'server/supabase/functions/game' / f)
print('built', DST / 'index.html', len(doc), 'bytes')
