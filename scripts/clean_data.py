#!/usr/bin/env python3
"""Normalize optional public internship CSV data into a conservative import format."""
import csv,sys
from pathlib import Path
if len(sys.argv)<3: raise SystemExit('Usage: python scripts/clean_data.py input.csv output.csv')
src,dst=map(Path,sys.argv[1:3]);fields=['company','title','industry','location','work_mode','stipend','duration_weeks','deadline','description']
with src.open(encoding='utf-8-sig',newline='') as i,dst.open('w',encoding='utf-8',newline='') as o:
 r=csv.DictReader(i);w=csv.DictWriter(o,fieldnames=fields);w.writeheader()
 for row in r:
  clean={k:(row.get(k,'') or '').strip() for k in fields};clean['work_mode']=clean['work_mode'].lower()
  if clean['company'] and clean['title']:w.writerow(clean)
print(dst)
