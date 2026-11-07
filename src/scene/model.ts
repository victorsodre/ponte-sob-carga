import * as T from 'three';
import {box,mesh,mergeStatic,disposeTree} from './geometry.ts';import {catalog} from '../content/catalog.ts';import {SPAN,DECK_Y} from '../simulation/beam.ts';
const mat=(color:string,metalness=.1,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
export function createModel(){
 const root=new T.Group(),parts=catalog.map(p=>{const group=new T.Group();group.name=p.id;group.userData.partId=p.id;root.add(group);return {...p,group};}),group=(id:string)=>parts.find(p=>p.id===id)!.group;
 const deck=group('deck'),girders=group('girders'),bearings=group('bearings'),piers=group('piers'),joints=group('joints'),vehicle=group('vehicle');
 const concrete=mat('#bbb8a7'),ivory=mat('#e4e0ce'),road=mat('#454e5a'),ochre=mat('#bd693b',.45,.4),steel=mat('#7d919e',.75,.3),dark=mat('#1c2936',.2,.65),yellow=mat('#ffd21f',.2,.35),glass=mat('#284b61',.6,.25),rubber=mat('#171d26'),soil=mat('#4a4746');
 const longitudinal=(parent:T.Group,width:number,height:number,y:number,z:number,m:T.Material)=>mesh(parent,new T.BoxGeometry(SPAN,height,width,96,1,1),m,0,y,z);
 longitudinal(deck,4,.22,DECK_Y-.11,0,concrete);longitudinal(deck,3.5,.025,DECK_Y+.0125,0,road);
 for(const z of [-1.85,1.85]){longitudinal(deck,.18,.2,DECK_Y+.1,z,ivory);longitudinal(deck,.055,.065,DECK_Y+.78,z,steel);longitudinal(deck,.035,.04,DECK_Y+.45,z,steel);for(let i=0;i<=16;i++)box(deck,[.05,.65,.05],[-8+i,DECK_Y+.46,z],steel);}
 for(let i=0;i<10;i++)box(deck,[.65,.006,.055],[-7.2+i*1.6,DECK_Y+.03,0],ivory);
 for(const z of [-1.12,1.12]){longitudinal(girders,.08,.85,3.15,z,ochre);for(const y of [2.72,3.57])longitudinal(girders,.55,.085,y,z,ochre);for(let i=0;i<=8;i++)box(girders,[.06,.8,.5],[-8+i*2,3.15,z],ochre);}
 for(let i=0;i<=8;i++)box(girders,[.09,.25,2.25],[-8+i*2,3.18,0],steel);
 const seats:T.Group[]=[];
 for(const x of [-8,8]){
  box(piers,[3.4,.4,5],[x,-.5,0],soil,.08);box(piers,[2.7,.35,4.1],[x,-.12,0],concrete,.06);
  for(const z of [-1.2,1.2])mesh(piers,new T.CylinderGeometry(.45,.6,1.7,20),concrete,x,.85,z);
  box(piers,[1.5,.42,3.3],[x,1.85,0],ivory,.04);
  for(const z of [-1.12,1.12]){
   box(bearings,[.95,.1,.95],[x,2.12,z],steel,.03);
   if(x<0){const shape=new T.Shape();shape.moveTo(-.42,0);shape.lineTo(.42,0);shape.lineTo(0,.42);shape.closePath();mesh(bearings,new T.ExtrudeGeometry(shape,{depth:.55,bevelEnabled:false}),ochre,x,2.18,z-.275);}
   else for(const dx of [-.28,0,.28]){const roller=mesh(bearings,new T.CylinderGeometry(.13,.13,.7,16),steel,x+dx,2.32,z);roller.rotation.x=Math.PI/2;}
   const pin=mesh(bearings,new T.CylinderGeometry(.085,.085,.72,16),steel,x,2.6,z);pin.rotation.x=Math.PI/2;
   const seat=new T.Group();seat.position.set(x,2.64,z);bearings.add(seat);box(seat,[.95,.08,.82],[0,0,0],steel,.02);seats.push(seat);
  }
  const side=Math.sign(x);box(joints,[2.7,.25,4],[x+side*1.48,DECK_Y-.125,0],concrete);box(joints,[2.7,.026,3.5],[x+side*1.48,DECK_Y+.013,0],road);
  box(joints,[.13,.025,4],[x+side*.065,DECK_Y+.028,0],dark);
  for(let i=0;i<20;i++)box(joints,[.16,.008,.07],[x+side*.06,DECK_Y+.046,-1.9+i*.2],steel);
 }
 // An illustrative truck represents one resultant point load, not an axle-load calculation.
 box(vehicle,[3.2,.22,1.48],[0,.12,0],dark,.04);box(vehicle,[1.05,1.22,1.48],[1,.75,0],yellow,.1);box(vehicle,[.06,.55,1.3],[1.55,1.01,0],glass,.025);
 for(const z of [-.75,.75])box(vehicle,[.75,.5,.025],[1,1.02,z],glass,.025);
 box(vehicle,[1.95,1.32,1.52],[-.55,.89,0],ivory,.07);box(vehicle,[1.96,.12,1.54],[-.55,1.62,0],yellow,.035);
 for(const z of [-.61,.61])box(vehicle,[.05,.14,.24],[1.57,.43,z],mat('#fff5d2'));
 const wheels:T.Group[]=[];
 for(const x of [-.95,.95])for(const z of [-.8,.8]){const wheel=new T.Group();wheel.position.set(x,0,z);vehicle.add(wheel);const tire=mesh(wheel,new T.CylinderGeometry(.36,.36,.19,20),rubber);tire.rotation.x=Math.PI/2;const hub=mesh(wheel,new T.CylinderGeometry(.18,.18,.2,12),steel);hub.rotation.x=Math.PI/2;box(wheel,[.035,.28,.215],[0,0,0],ivory);wheels.push(wheel);}
 for(const g of [deck,girders,piers,joints,vehicle])mergeStatic(g);
 const flex=[deck,girders].flatMap(g=>g.children.filter((o):o is T.Mesh=>o instanceof T.Mesh).map(o=>{o.updateMatrix();o.geometry.applyMatrix4(o.matrix);o.position.set(0,0,0);o.quaternion.identity();o.scale.setScalar(1);return {mesh:o,rest:Float32Array.from(o.geometry.getAttribute('position').array)};}));
 const helpers=new T.Group();root.add(helpers);
 const reference=new T.Group();helpers.add(reference);
 for(const z of [-2,2]){const y=DECK_Y;const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-8,y,z),new T.Vector3(8,y,z)]),new T.LineDashedMaterial({color:'#aeb8d3',dashSize:.25,gapSize:.12,transparent:true,opacity:.9,depthTest:false}));line.renderOrder=5;line.computeLineDistances();line.raycast=()=>{};reference.add(line);}
 const force=new T.ArrowHelper(new T.Vector3(0,-1,0),new T.Vector3(0,7.2,0),1.3,0xffd21f,.32,.22);helpers.add(force);
 const leftReaction=new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(-8,-.1,2.4),1.5,0x81bdce,.25,.2),rightReaction=new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(8,-.1,2.4),1.5,0x81bdce,.25,.2);helpers.add(leftReaction,rightReaction);
 return {root,parts,flex,vehicle,wheels,seats,helpers,reference,force,leftReaction,rightReaction,dispose:()=>disposeTree(root)};
}
export type BridgeModel=ReturnType<typeof createModel>;
