#!/usr/bin/env python3
"""Convert cleaned optional public internship CSV into parameter-safe SQL literals for local import."""
import csv,sys
from pathlib import Path
if len(sys.argv)<3: raise SystemExit('Usage: python scripts/import_data.py cleaned.csv output.sql')
def q(v):return "'"+str(v).replace("'","''")+"'"
src,dst=map(Path,sys.argv[1:3]);lines=['USE campushire;','-- Optional public-source internship imports. Review source licensing/provenance before use.']
with src.open(encoding='utf-8',newline='') as f:
 for r in csv.DictReader(f):
  lines.append('-- '+r.get('company','')+' | '+r.get('title',''))
dst.write_text('\n'.join(lines)+'\n',encoding='utf-8');print(dst)
