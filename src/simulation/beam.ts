export type BeamState={loadPosition:number;loadLevel:number};
export type ShapeView='original'|'deformed'|'compare';
export type Amplification=1|40|80;
export const SPAN=16,DECK_Y=3.8;
export const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:0));
export const initialState=():BeamState=>({loadPosition:.5,loadLevel:.75});
export const sanitize=(s:BeamState):BeamState=>({loadPosition:clamp(s.loadPosition),loadLevel:clamp(s.loadLevel)});
export function deflection(position:number,loadPosition:number,loadLevel:number){
 let s=clamp(position),a=clamp(loadPosition);const beta=.024*clamp(loadLevel);
 if(s>a){s=1-s;a=1-a;}const b=1-a;
 return -beta*b*s*(1-b*b-s*s)/6;
}
export const reactions=(position:number,level:number)=>({left:clamp(level)*(1-clamp(position)),right:clamp(level)*clamp(position)});
export const visualDeflection=(position:number,state:BeamState,factor:number)=>SPAN*deflection(position,state.loadPosition,state.loadLevel)*clamp(factor,0,80);
export const advance=(s:BeamState,seconds:number,playing:boolean,visible:boolean):BeamState=>!playing||!visible?s:{...sanitize(s),loadPosition:clamp(s.loadPosition+clamp(seconds,0,.1)/14)};
export const slope=(position:number,state:BeamState,factor:number)=>{const h=1e-5,a=clamp(position-h),b=clamp(position+h);return (visualDeflection(b,state,factor)-visualDeflection(a,state,factor))/((b-a)*SPAN);};
