export type BeamState={loadPosition:number;loadLevel:number;temperature:number};
export type ShapeView='original'|'deformed'|'compare';
export type Amplification=1|40|80;
/** Distância entre os apoios, saliência da viga além de cada apoio e cota do tabuleiro (unidades de cena). */
export const SPAN=16,OVERHANG=.35,DECK_Y=3.8;
export const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:0));
export const initialState=():BeamState=>({loadPosition:.5,loadLevel:.75,temperature:0});
export const sanitize=(s:BeamState):BeamState=>({loadPosition:clamp(s.loadPosition),loadLevel:clamp(s.loadLevel),temperature:clampTemperature(s.temperature)});

/** Flecha (fração do vão, negativa para baixo) da viga simplesmente apoiada sob carga pontual relativa. */
export function deflection(position:number,loadPosition:number,loadLevel:number){
 let s=clamp(position),a=clamp(loadPosition);const beta=.024*clamp(loadLevel);
 if(s>a){s=1-s;a=1-a;}const b=1-a;
 return -beta*b*s*(1-b*b-s*s)/6;
}
/** Inclinação adimensional d(flecha/L)/d(x/L), analítica. */
export function deflectionSlope(position:number,loadPosition:number,loadLevel:number){
 const s=clamp(position),a=clamp(loadPosition),beta=.024*clamp(loadLevel);
 if(s<=a){const b=1-a;return -beta*b*(1-b*b-3*s*s)/6;}
 const t=1-s;return beta*a*(1-a*a-3*t*t)/6;
}
/** Flecha máxima com a carga em `loadPosition`, como fração da flecha com a carga no centro (mesma intensidade). */
export function peakRatio(loadPosition:number){
 const b=Math.min(clamp(loadPosition),1-clamp(loadPosition));
 return 48*b*Math.pow(1-b*b,1.5)/(9*Math.sqrt(3));
}
/** Momento fletor sob a carga, como fração do momento com a carga no centro: 4a(1−a). */
export const momentRatio=(loadPosition:number)=>4*clamp(loadPosition)*(1-clamp(loadPosition));
export const reactions=(position:number,level:number)=>({left:clamp(level)*(1-clamp(position)),right:clamp(level)*clamp(position)});

/** Deslocamento vertical visual de um ponto x da cena. Além dos apoios, a saliência acompanha a rotação da ponta. */
export function visualDeflection(x:number,state:BeamState,factor:number){
 const s=(x+SPAN/2)/SPAN,k=SPAN*clamp(factor,0,80);
 if(s<0)return k*deflectionSlope(0,state.loadPosition,state.loadLevel)*s;
 if(s>1)return k*deflectionSlope(1,state.loadPosition,state.loadLevel)*(s-1);
 return k*deflection(s,state.loadPosition,state.loadLevel);
}
export const slope=(x:number,state:BeamState,factor:number)=>deflectionSlope(clamp((x+SPAN/2)/SPAN),state.loadPosition,state.loadLevel)*clamp(factor,0,80);

export const advance=(s:BeamState,seconds:number,playing:boolean,visible:boolean):BeamState=>!playing||!visible?s:{...sanitize(s),loadPosition:clamp(s.loadPosition+clamp(seconds,0,.1)/14)};

// Dilatação térmica: ΔL = α·L·ΔT. α do aço: 0,0000065 por °F (WisDOT Bridge Manual, cap. 28, Tabela 28.1-1).
export const STEEL_ALPHA=.0000065*1.8;
/** Variação de temperatura do aço entre uma madrugada fria e uma tarde de sol, na conta do vídeo (EP231, b06). */
export const TEMPERATURE_RANGE=15;
export const clampTemperature=(t:number)=>clamp(t,-TEMPERATURE_RANGE,TEMPERATURE_RANGE);
/** Variação de comprimento real, em milímetros, de `meters` metros de aço com ΔT em °C. */
export const expansionMm=(meters:number,temperature:number)=>STEEL_ALPHA*meters*1000*temperature;
/** Deslocamento horizontal visual de um ponto x: o apoio fixo (esquerdo) fica parado e o resto cresce a partir dele. */
export const thermalShift=(x:number,temperature:number,factor:number)=>(x+SPAN/2)*STEEL_ALPHA*clampTemperature(temperature)*clamp(factor,0,80);
/** Abertura da junta do lado do rolete, em unidades de cena, a partir da abertura de referência. */
export const JOINT_GAP=.42;
export const jointGap=(temperature:number,factor:number)=>JOINT_GAP-thermalShift(SPAN/2+OVERHANG,temperature,factor);

/** Ciclo do dia ilustrativo: começa na madrugada mais fria e volta a ela a cada `DAY_SECONDS`. */
export const DAY_SECONDS=12;
export const dayTemperature=(phase:number)=>-TEMPERATURE_RANGE*Math.cos(2*Math.PI*phase);
export const advanceDay=(phase:number,seconds:number)=>{const next=(Number.isFinite(phase)?phase:0)+clamp(seconds,0,.1)/DAY_SECONDS;return next-Math.floor(next);};
/** Fase do ciclo que corresponde a uma temperatura, na metade em que ela está subindo (para retomar sem salto). */
export const phaseForTemperature=(temperature:number)=>Math.acos(clamp(-clampTemperature(temperature)/TEMPERATURE_RANGE,-1,1))/(2*Math.PI);
