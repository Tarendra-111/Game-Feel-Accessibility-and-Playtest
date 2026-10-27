const DX=[1,0,-1,0],DY=[0,1,0,-1],SL=[3,2,1,0],BS=[1,0,3,2];
function trace(g){const N=g.length,seen=new Set(),segs=[],hit=new Set(),vis=new Set(),q=[];
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d='RDLU'.indexOf(g[y][x]);if(d>=0)q.push([x,y,d])}
while(q.length){let[x,y,d]=q.pop(),px=x,py=y;
for(;;){x+=DX[d];y+=DY[d];
if(x<0||y<0||x>=N||y>=N){segs.push([px,py,px+DX[d]*.5,py+DY[d]*.5]);break}
const c=g[y][x],k=x+','+y+','+d;if(seen.has(k))break;seen.add(k);vis.add(x+','+y);
if(c=='#'||'RDLU'.includes(c)){segs.push([px,py,x-DX[d]*.5,y-DY[d]*.5]);break}
if(c=='T'){hit.add(x+','+y);segs.push([px,py,x,y]);break}
if(c=='C')hit.add(x+','+y);
if('mnabS'.includes(c)){segs.push([px,py,x,y]);px=x;py=y;
if(c=='S')q.push([x,y,SL[d]]);else d=(c=='m'||c=='a')?SL[d]:BS[d]}}}
return{segs,hit,vis}}
