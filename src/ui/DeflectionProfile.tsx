import {deflection,peakRatio} from '../simulation/beam.ts';import type {BeamState} from '../simulation/beam.ts';
const W=176,H=48,LEFT=6,RIGHT=W-6,BASE=12,DEPTH=30,SAMPLES=48;
// Escala fixa: a flecha com a carga máxima no centro ocupa DEPTH pixels. Assim o tamanho da curva compara posições.
const unit=DEPTH/Math.abs(deflection(.5,.5,1));
const curve=(load:number,level:number)=>Array.from({length:SAMPLES+1},(_,i)=>{const s=i/SAMPLES;return `${(LEFT+s*(RIGHT-LEFT)).toFixed(1)},${(BASE-deflection(s,load,level)*unit).toFixed(1)}`;}).join(' ');

/** Perfil da viga em escala fixa, com a curva da carga no centro como referência tracejada. */
export function DeflectionProfile({beam}:{beam:BeamState}){
 const ratio=Math.round(peakRatio(beam.loadPosition)*100),x=LEFT+beam.loadPosition*(RIGHT-LEFT),loaded=beam.loadLevel>0;
 const label=loaded?`Perfil da viga: a flecha máxima é ${ratio}% da flecha com a mesma carga no centro.`:'Perfil da viga: sem carga, a viga fica reta.';
 return <figure className="profile">
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}>
   <line className="profile-base" x1={LEFT} y1={BASE} x2={RIGHT} y2={BASE}/>
   {loaded&&<polyline className="profile-ghost" points={curve(.5,beam.loadLevel)}/>}
   <polyline className="profile-curve" points={curve(beam.loadPosition,beam.loadLevel)}/>
   {loaded&&<path className="profile-load" d={`M${x.toFixed(1)} 1 L${x.toFixed(1)} 8 M${(x-3).toFixed(1)} 5 L${x.toFixed(1)} 8 L${(x+3).toFixed(1)} 5`}/>}
   {[LEFT,RIGHT].map(p=><path key={p} className="profile-support" d={`M${p} ${BASE+1} l-4 6 h8 z`}/>)}
  </svg>
  <figcaption>{loaded?<><strong>{ratio}%</strong> da flecha do centro</>:'Sem carga'}</figcaption>
 </figure>;
}
