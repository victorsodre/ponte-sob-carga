import {SPAN,DECK_Y,visualDeflection,slope,reactions,thermalShift} from '../simulation/beam.ts';import type {BeamState,ShapeView,Amplification} from '../simulation/beam.ts';import type {BridgeModel} from './model.ts';
/** Aplica flexão e dilatação a partir dos vértices de origem: nada acumula entre chamadas. */
export function applyBeam(model:BridgeModel,state:BeamState,view:ShapeView,amplification:Amplification){
 const factor=view==='original'?0:amplification,shift=(x:number)=>thermalShift(x,state.temperature,factor);
 for(const {mesh,rest} of model.flex){const p=mesh.geometry.getAttribute('position');for(let i=0;i<p.count;i++){const x=rest[i*3]!;p.setX(i,x+shift(x));p.setY(i,rest[i*3+1]!+visualDeflection(x,state,factor));}p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();mesh.geometry.computeBoundingBox();}
 model.reference.visible=view==='compare';
 for(const comb of model.movingCombs){const end=comb.userData.end as number;comb.position.set(shift(end),visualDeflection(end,state,factor),0);}
 // O assento e o pino do rolete andam com a viga; o rolete, rolando entre as chapas, anda a metade.
 for(const seat of model.seats){const x=seat.userData.baseX as number;seat.position.x=x+shift(x);seat.rotation.z=Math.atan(slope(x,state,factor));}
 for(const pin of model.pins){const x=pin.userData.baseX as number;pin.position.x=x+shift(x);}
 for(const roller of model.rollers){const x=roller.userData.baseX as number;roller.position.x=x+shift(x)/2;}
 const x=-SPAN/2+SPAN*state.loadPosition,onSpan=(v:number)=>Math.min(SPAN/2,Math.max(-SPAN/2,v)),left=visualDeflection(onSpan(x-.95),state,factor),right=visualDeflection(onSpan(x+.95),state,factor);
 model.vehicle.position.set(x+shift(x),DECK_Y+.36+(left+right)/2,0);model.vehicle.rotation.z=Math.atan2(right-left,1.9);for(const w of model.wheels)w.rotation.z=-x/.36;
 model.force.group.position.set(model.vehicle.position.x,model.vehicle.position.y+3.1,0);model.force.group.visible=state.loadLevel>0;model.force.setLength(.6+state.loadLevel*.8);
 const r=reactions(state.loadPosition,state.loadLevel);for(const [arrow,value] of [[model.leftReaction,r.left],[model.rightReaction,r.right]] as const){arrow.group.visible=value>0;arrow.setLength(.4+value*1.6);}
}
