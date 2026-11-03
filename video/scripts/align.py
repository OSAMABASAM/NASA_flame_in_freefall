# Word timings for the karaoke captions: forced alignment of the known words against docs/demo/voice.mp3.
# Needs: pip install pocketsphinx. Usage: python align.py voice16k.raw ../src/data/lines.json
# (voice16k.raw = ffmpeg -i docs/demo/voice.mp3 -ac 1 -ar 16000 -f s16le voice16k.raw)
# Text in {shown|spoken} is shown as the left part and aligned with the right part (words the dictionary spells differently).
import sys, json, re
from pocketsphinx import Decoder
raw=open(sys.argv[1],'rb').read()
# Display text per line, with the spoken tokens used for alignment where they differ.
# "{display|spoken tokens}" ; "{|see}" = spoken but not shown.
PIECES=[(0.0,2.37),(2.74,6.18),(6.39,13.39),(13.61,22.26),(22.51,29.51),(29.68,37.19),(37.34,44.25),(44.32,49.40),(49.59,57.16)]
LINES=[
 (0.0,2.52,"What happens to a flame when there's no gravity?"),
 (2.52,6.25,"On Earth, fire rises. In space, it doesn't."),
 (6.25,13.47,"NASA has run years of combustion experiments in {microgravity,|micro gravity} but most of that data sits in long reports that are hard to read."),
 (13.47,22.35,"So I built Flame in Freefall, an AI dashboard that turns NASA's {microgravity|micro gravity} combustion data into answers anyone can understand."),
 (22.35,29.56,"First, experiment summaries. Every experiment explained in plain language, with its key results at a glance."),
 (29.56,37.23,"Second, the data graph. Experiments, materials and findings, all connected. {See,|see} you can see how one result leads to another."),
 (37.23,44.25,"And third, ask the data. Type any question, and the answer comes straight from NASA's data, not from guesses."),
 (44.25,49.46,"Space research shouldn't be locked inside reports. It should be open to every curious mind."),
 (49.46,57.16,"I'm Osama Saleh, a computer science student. This is Flame in Freefall, my project for NASA Space Apps {2026.|twenty twenty six}"),
]
def tokens(text):
    out=[]  # (display, [spoken])
    for m in re.finditer(r"\{([^|}]*)\|([^}]*)\}|(\S+)",text):
        if m.group(3): out.append((m.group(3),[re.sub(r"[^a-z']","",m.group(3).lower())]))
        else: out.append((m.group(1),m.group(2).split()))
    return out
res=[]
for i,(t0,t1,text) in enumerate(LINES):
    seg=raw[int(t0*16000)*2:int(t1*16000)*2]
    toks=tokens(text)
    spoken=" ".join(w for _,s in toks for w in s)
    d=Decoder(samprate=16000)
    d.set_align_text(spoken)
    d.start_utt();d.process_raw(seg,full_utt=True);d.end_utt()
    segs=[(s.word,s.start_frame/100+t0,s.end_frame/100+t0) for s in d.seg() if s.word not in('<s>','</s>','<sil>','(NULL)')]
    k=0;words=[]
    for disp,sp in toks:
        st=segs[k][1];en=segs[k+len(sp)-1][2];k+=len(sp)
        if disp: words.append({"w":disp,"start":round(st,3),"end":round(en,3)})
    assert k==len(segs),(i,k,len(segs),segs)
    p0,p1=PIECES[i]
    for w in words: w["start"]=round(max(0,w["start"]-p0),3); w["end"]=round(min(p1-p0,w["end"]-p0),3)
    res.append({"line":i+1,"from":p0,"to":p1,"duration":round(p1-p0,3),"text":" ".join(w["w"] for w in words),"words":words})
    print(i+1,res[-1]["duration"],words[0]["start"],res[-1]["text"])
json.dump(res,open(sys.argv[2],'w'),indent=1)
