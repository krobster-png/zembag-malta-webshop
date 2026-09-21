#!/usr/bin/env python3
from __future__ import annotations
import html, json, re, time
from pathlib import Path
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
products=json.loads((ROOT/'docs/source-products.json').read_text())['products']

def fetch(url):
    req=Request(url,headers={'User-Agent':'Zembag-Malta-Webshop-content-import/1.0'})
    return urlopen(req,timeout=30).read().decode('utf-8','ignore')

def meta(page, key, attr='name'):
    pattern=rf'<meta[^>]+{attr}=["\']{re.escape(key)}["\'][^>]+content=["\'](.*?)["\']'
    match=re.search(pattern,page,re.I|re.S)
    if not match:
        pattern=rf'<meta[^>]+content=["\'](.*?)["\']["\'][^>]+{attr}=["\']{re.escape(key)}["\']'
        match=re.search(pattern,page,re.I|re.S)
    return html.unescape(re.sub(r'\s+',' ',match.group(1)).strip()) if match else ''

result={'source':'https://www.zembag.cz','retrieved_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'products':[]}
for item in products:
    try:
        page=fetch(item['source_url'])
        result['products'].append({'path':item['path'],'source_url':item['source_url'],'title':meta(page,'og:title','property') or meta(page,'description'),'description':meta(page,'og:description','property') or meta(page,'description'),'html_bytes':len(page)})
    except Exception as exc:
        result['products'].append({'path':item['path'],'source_url':item['source_url'],'title':'','description':'','error':str(exc)[:200]})
home=fetch('https://www.zembag.cz/')
result['homepage']={'title':meta(home,'og:title','property'),'description':meta(home,'og:description','property'),'html_bytes':len(home)}
(ROOT/'docs/source-content.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'products':len(result['products']),'descriptions':sum(bool(x.get('description')) for x in result['products']),'homepage_description':bool(result['homepage']['description']),'errors':sum('error' in x for x in result['products'])}))
