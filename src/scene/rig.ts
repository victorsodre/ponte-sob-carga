import {SPAN,DECK_Y,clamp,visualDeflection,slope,reactions} from '../simulation/beam.ts';import type {BeamState,ShapeView,Amplification} from '../simulation/beam.ts';import type {BridgeModel} from './model.ts';
export function applyBeam(model:BridgeModel,state:BeamState,view:ShapeView,amplification:Amplification){
 const factor=view==='original'?0:amplification;
 for(const {mesh,rest} of model.flex){const p=mesh.geometry.getAttribute('position');for(let i=0;i<p.count;i++)p.setY(i,rest[i*3+1]!+visualDeflection(clamp((rest[i*3]!+SPAN/2)/SPAN),state,factor));p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();mesh.geometry.computeBoundingBox();}
 model.reference.visible=view==='compare';
 const x=-SPAN/2+SPAN*state.loadPosition,left=visualDeflection(clamp((x-.95+SPAN/2)/SPAN),state,factor),right=visualDeflection(clamp((x+.95+SPAN/2)/SPAN),state,factor);
 model.vehicle.position.set(x,DECK_Y+.36+(left+right)/2,0);model.vehicle.rotation.z=Math.atan2(right-left,1.9);for(const w of model.wheels)w.rotation.z=-x/.36;
 for(const seat of model.seats)seat.rotation.z=Math.atan(slope(seat.position.x<0?0:1,state,factor));
 model.force.position.set(x,model.vehicle.position.y+3.1,0);model.force.visible=state.loadLevel>0;model.force.setLength(.6+state.loadLevel*.8,.25,.2);
 const r=reactions(state.loadPosition,state.loadLevel);for(const [arrow,value] of [[model.leftReaction,r.left],[model.rightReaction,r.right]] as const){arrow.visible=value>0;arrow.setLength(.4+value*1.6,.23,.18);}
}
