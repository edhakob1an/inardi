import subprocess, re, glob, os
A='/mnt/user-data/attachments/3d89754a-3a39-55da-b5f0-137656604ff4/'; O='/home/claude/nardi/assets/sfx/'; T='/tmp/claude-0/-home-claude/3d89754a-3a39-55da-b5f0-137656604ff4/scratchpad/t.wav'
SPEC={'place':['36f04ac1','a7c61916','784b06a2','ab63b346'],'slide':['23828e5b','ece739aa','222d7f54','7844f137'],'bearoff':['ed4a47fa','1051581a','7550d7aa'],'land':['3e05651c','40164a5c','48e6d2bc']}
MANUAL={'ece739aa':(0.232,0.51),'222d7f54':(0.232,0.51)}
def run(a): return subprocess.run(a,capture_output=True,text=True)
def stats(f):
    e=run(['ffmpeg','-hide_banner','-i',f,'-af','volumedetect','-f','null','/dev/null']).stderr
    return float(re.search(r'max_volume: ([-\d.]+)',e).group(1)), float(re.search(r'mean_volume: ([-\d.]+)',e).group(1))
def dur(f): return float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).stdout)
for name,ids in SPEC.items():
    for n,i in enumerate(ids,1):
        src=glob.glob(A+i+'*')[0]
        if i in MANUAL: af=f'atrim=start={MANUAL[i][0]}:end={MANUAL[i][1]},asetpts=N/SR/TB'
        else: af='silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.003,areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.03,areverse'
        run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1',T])
        pk,mean=stats(T); d=dur(T); g=-2-pk
        out=O+f'{name}-{n}.mp3'
        run(['ffmpeg','-v','error','-y','-i',T,'-af',f'afade=t=in:d=0.003,volume={g:.2f}dB,afade=t=out:st={max(0,d-0.05):.3f}:d=0.05','-c:a','libmp3lame','-b:a','96k',out])
        pk2,mean2=stats(out)
        print(f'{name}-{n}: {d:.3f}s  peak {pk:.1f} -> {pk2:.1f} dB, mean {mean2:.1f} dB')
