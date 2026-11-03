# Checks that each click ring in the recorded clips shows within a few frames of the logged click.
# Prints, per click, the change in orange pixels around the click for the 11 frames around it.
# Needs numpy. Usage: python check-sync.py
import json, subprocess, os, numpy as np
CLIPS=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public','clips')
d=json.load(open(os.path.join(CLIPS,'clips.json')))
sc=2880/1920
res=[]
for name,c in d['clips'].items():
    for k in c['clicks']:
        f0=round(k['t']*30); x=int(k['x']*sc); y=int(k['y']*sc); r=75
        s=max(0,f0-5)
        raw=subprocess.run(['ffmpeg','-v','error','-ss',f'{s/30:.4f}','-i',os.path.join(CLIPS,f'{name}.mp4'),'-frames:v','12','-vf',f'crop={2*r}:{2*r}:{max(0,x-r)}:{max(0,y-r)}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
        fr=np.frombuffer(raw,np.uint8).reshape(-1,2*r,2*r,3).astype(int)
        diffs=[np.abs(fr[i]-fr[i-1]).sum(axis=2) for i in range(1,len(fr))]
        # ring = many changed pixels that are orange-ish in the new frame
        cnt=[int(((dd>60)&(fr[i+1][:,:,0]>200)&(fr[i+1][:,:,2]<140)).sum()) for i,dd in enumerate(diffs)]
        first=next((s+i+1 for i,v in enumerate(cnt) if v>150),None)
        res.append((name,f0,first,cnt))
        print(name,k['t'],'click',f0,'ring',first,'diff',None if first is None else first-f0,cnt)
