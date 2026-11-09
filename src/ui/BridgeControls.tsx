import {Pause,Play,RotateCcw,Sun,Focus,ArrowUpRight} from 'lucide-react';import type {CSSProperties} from 'react';
import {TEMPERATURE_RANGE,expansionMm,reactions} from '../simulation/beam.ts';import type {BeamState,Amplification} from '../simulation/beam.ts';
import {JOINT_SHORT} from '../content/project.ts';import {DeflectionProfile} from './DeflectionProfile.tsx';
export type ControlTab='load'|'temperature';
type Props={tab:ControlTab;setTab:(tab:ControlTab)=>void;beam:BeamState;playing:boolean;cycling:boolean;amplification:Amplification;disabled:boolean;
 setPlaying:(v:boolean)=>void;setCycling:(v:boolean)=>void;setAmplification:(v:Amplification)=>void;onPosition:(v:number)=>void;onLoad:(v:number)=>void;onTemperature:(v:number)=>void;onFocusJoint:()=>void;reset:()=>void};

const pct=(v:number)=>Math.round(v*100);
const decimal=(v:number,digits=1)=>v.toLocaleString('pt-BR',{maximumFractionDigits:digits,minimumFractionDigits:digits});
const signed=(v:number,digits=0)=>(v>0?'+':v<0?'−':'')+decimal(Math.abs(v),digits);

export function placeLabel(position:number){return position<.05?'Sobre o apoio esquerdo':position>.95?'Sobre o apoio direito':Math.abs(position-.5)<.05?'Centro do vão':'Ao longo do vão';}
/** Por que a viga dobra mais ou menos: a carga perto do apoio desce quase toda para ele e tem pouco braço de alavanca. */
export function loadExplanation(beam:BeamState){
 if(beam.loadLevel<=0)return 'Sem carga, a viga não dobra.';
 const near=Math.min(beam.loadPosition,1-beam.loadPosition),r=reactions(beam.loadPosition,1);
 if(near<.15)return `Perto do apoio, ${pct(Math.max(r.left,r.right))}% da carga desce direto para ele e sobra pouco braço de alavanca: a viga quase não dobra.`;
 if(near>.45)return 'No centro, o braço de alavanca até os apoios é o maior possível: é onde a viga mais dobra.';
 return 'Quanto mais longe dos apoios, maior o braço de alavanca e mais a viga dobra.';
}
export function jointState(temperature:number){
 if(temperature>=.5)return {label:'Junta mais fechada',text:'No calor, o aço cresce e os dentes do pente se aproximam.'};
 if(temperature<=-.5)return {label:'Junta mais aberta',text:'No frio, o aço encolhe e a mesma junta fica mais aberta.'};
 return {label:'Junta na abertura de referência',text:'Mude a temperatura ou veja um dia inteiro passar.'};
}

export function BridgeControls(p:Props){
 const {tab,beam,amplification,disabled}=p,joint=jointState(beam.temperature),temperature=Math.round(beam.temperature);
 const amplificationControl=<label className="amplification-control"><span>Ampliação</span><select value={amplification} onChange={e=>p.setAmplification(Number(e.target.value) as Amplification)}><option value="1">×1</option><option value="40">×40</option><option value="80">×80</option></select></label>;
 const resetButton=<button className="icon-button" aria-label="Reiniciar experiência" onClick={p.reset}><RotateCcw size={18}/></button>;
 return <section className="control-dock" aria-label="Controles da ponte">
  <div className="dock-tabs" role="tablist" aria-label="O que mudar na ponte">
   {([['load','Carga'],['temperature','Temperatura']] as const).map(([id,label])=><button key={id} role="tab" id={`tab-${id}`} aria-controls="dock-panel" aria-selected={tab===id} tabIndex={tab===id?0:-1} className={tab===id?'active':''}
    onClick={()=>p.setTab(id)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const next=id==='load'?'temperature':'load';p.setTab(next);document.getElementById(`tab-${next}`)?.focus();}}}>{label}</button>)}
  </div>
  <div id="dock-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
  {tab==='load'?<>
   <div className="dock-top">
    <button className="primary" disabled={disabled} onClick={()=>p.setPlaying(!p.playing)}>{p.playing?<Pause size={16}/>:<Play size={16}/>} {p.playing?'Pausar':beam.loadPosition>=1?'Atravessar novamente':'Mover a carga'}</button>
    <div className="phase-copy"><strong>{placeLabel(beam.loadPosition)}</strong><span>{loadExplanation(beam)}</span></div>
    <DeflectionProfile beam={beam}/>
    {amplificationControl}{resetButton}
   </div>
   <div className="timeline"><label htmlFor="load-position">Posição no vão <span>{pct(beam.loadPosition)}%</span></label><input id="load-position" type="range" min="0" max="100" step="1" value={pct(beam.loadPosition)} aria-valuetext={`${pct(beam.loadPosition)}%, ${placeLabel(beam.loadPosition).toLocaleLowerCase('pt-BR')}`} style={{'--progress':`${beam.loadPosition*100}%`} as CSSProperties} onChange={e=>p.onPosition(Number(e.target.value)/100)}/></div>
   <div className="phase-markers">{([['Apoio esquerdo',0],['Centro do vão',.5],['Apoio direito',1]] as const).map(([label,t])=><button key={label} aria-pressed={Math.abs(beam.loadPosition-t)<.005} onClick={()=>p.onPosition(t)}>{label}</button>)}</div>
   <div className="load-control"><label htmlFor="load-level">Carga relativa <strong>{pct(beam.loadLevel)}%</strong></label><input id="load-level" type="range" min="0" max="100" step="5" value={pct(beam.loadLevel)} aria-valuetext={`${pct(beam.loadLevel)}% da carga de referência`} onChange={e=>p.onLoad(Number(e.target.value)/100)}/><small>Escala ilustrativa, sem tonelagem.</small></div>
  </>:<>
   <div className="dock-top">
    <button className="primary" disabled={disabled} onClick={()=>p.setCycling(!p.cycling)}>{p.cycling?<Pause size={16}/>:<Sun size={16}/>} {p.cycling?'Pausar o dia':'Ver a junta respirar'}</button>
    <div className="phase-copy"><strong>{joint.label}</strong><span>{joint.text}</span></div>
    <button className="secondary" disabled={disabled} onClick={p.onFocusJoint}><Focus size={16}/>Ver a junta de perto</button>
    {amplificationControl}{resetButton}
   </div>
   <div className="timeline"><label htmlFor="temperature">Temperatura do aço <span>{signed(temperature)} °C</span></label><input id="temperature" type="range" min={-TEMPERATURE_RANGE} max={TEMPERATURE_RANGE} step="1" value={temperature} aria-valuetext={`${signed(temperature)} graus em relação à referência; ${joint.label.toLocaleLowerCase('pt-BR')}`} style={{'--progress':`${(temperature+TEMPERATURE_RANGE)/(2*TEMPERATURE_RANGE)*100}%`} as CSSProperties} onChange={e=>p.onTemperature(Number(e.target.value))}/></div>
   <div className="phase-markers">{([['Madrugada fria',-TEMPERATURE_RANGE],['Referência',0],['Tarde de sol',TEMPERATURE_RANGE]] as const).map(([label,t])=><button key={label} aria-pressed={temperature===t} onClick={()=>p.onTemperature(t)}>{label}</button>)}</div>
   <div className="thermal-facts">
    <p><strong>{signed(expansionMm(100,temperature),1)} mm</strong> a cada 100 m de aço, com α = 0,0117 mm por metro a cada °C.</p>
    <p>Na conta do vídeo, os 848 m de aço da Rio–Niterói crescem cerca de 30 cm com 30 °C de diferença.</p>
    <a href={JOINT_SHORT} target="_blank" rel="noreferrer">Short: a fresta da ponte <ArrowUpRight size={14}/></a>
   </div>
  </>}
  </div>
 </section>;
}
