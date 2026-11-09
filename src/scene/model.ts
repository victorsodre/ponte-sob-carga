import * as T from 'three';
import {box,mesh,mergeStatic,disposeTree} from './geometry.ts';import {catalog} from '../content/catalog.ts';import {SPAN,OVERHANG,DECK_Y,JOINT_GAP} from '../simulation/beam.ts';
const mat=(color:string,metalness=.1,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
const HALF=SPAN/2,END=HALF+OVERHANG,WALL=END+JOINT_GAP,REAR=WALL+.28,EDGE=12.6,GROUND=1.2,DEPTH=4.2;

/** Seta sólida (haste e ponta) que continua legível no celular; o comprimento muda sem recriar a geometria. */
export function solidArrow(color:string,direction:1|-1){
 const group=new T.Group(),material=new T.MeshBasicMaterial({color});
 const shaft=new T.Mesh(new T.CylinderGeometry(.07,.07,1,12),material),head=new T.Mesh(new T.ConeGeometry(.2,.38,16),material);
 if(direction<0)head.rotation.z=Math.PI;group.add(shaft,head);
 const setLength=(length:number)=>{const body=Math.max(.01,length-.38);shaft.scale.y=body;shaft.position.y=direction*body/2;head.position.y=direction*(body+.19);};
 setLength(1);return {group,setLength};
}

/** Pente da junta: base sobre a peça e dentes em balanço sobre a fresta, intercalados com o pente oposto. */
function comb(parent:T.Object3D,material:T.Material,root:number,toward:1|-1,offset:number){
 const y=DECK_Y+.041,base=.33,length=.6;
 box(parent,[base,.03,3.5],[root-toward*base/2,y,0],material);
 for(let z=-1.75+.05+offset;z<1.75-.04;z+=.2)box(parent,[length,.03,.08],[root+toward*length/2,y,z],material);
}

export function createModel(){
 const root=new T.Group(),parts=catalog.map(p=>{const group=new T.Group();group.name=p.id;group.userData.partId=p.id;root.add(group);return {...p,group};}),group=(id:string)=>parts.find(p=>p.id===id)!.group;
 const deck=group('deck'),girders=group('girders'),bearings=group('bearings'),abutments=group('abutments'),joints=group('joints'),vehicle=group('vehicle');
 const concrete=mat('#bbb8a7'),ivory=mat('#e4e0ce'),road=mat('#454e5a'),ochre=mat('#bd693b',.45,.4),steel=mat('#7d919e',.75,.3),dark=mat('#1c2936',.2,.65),yellow=mat('#ffd21f',.2,.35),glass=mat('#284b61',.6,.25),rubber=mat('#171d26'),earth=mat('#5b4d3f',0,.95),wall=mat('#a9a594');
 const longitudinal=(parent:T.Group,width:number,height:number,y:number,z:number,m:T.Material,length=2*END)=>mesh(parent,new T.BoxGeometry(length,height,width,Math.round(length*6),1,1),m,0,y,z);
 longitudinal(deck,4,.22,DECK_Y-.11,0,concrete);longitudinal(deck,3.5,.025,DECK_Y+.0125,0,road);
 for(const z of [-1.85,1.85]){longitudinal(deck,.18,.2,DECK_Y+.1,z,ivory);longitudinal(deck,.055,.065,DECK_Y+.78,z,steel,SPAN);longitudinal(deck,.035,.04,DECK_Y+.45,z,steel,SPAN);for(let i=0;i<=16;i++)box(deck,[.05,.65,.05],[-HALF+i,DECK_Y+.46,z],steel);}
 for(let i=0;i<10;i++)box(deck,[.65,.006,.055],[-7.2+i*1.6,DECK_Y+.03,0],ivory);
 for(const z of [-1.12,1.12]){longitudinal(girders,.08,.85,3.15,z,ochre);for(const y of [2.72,3.57])longitudinal(girders,.55,.085,y,z,ochre);for(let i=0;i<=8;i++)box(girders,[.06,.8,.5],[-HALF+i*2,3.15,z],ochre);}
 for(let i=0;i<=8;i++)box(girders,[.09,.25,2.25],[-HALF+i*2,3.18,0],steel);

 // Margens, leito e água: maquete em corte, fora do catálogo (não é peça da ponte).
 const site=new T.Group();site.name='site';root.add(site);
 const valley=new T.Shape([[-EDGE,-1.8],[-EDGE,GROUND],[-7,GROUND],[-4.6,-.9],[4.6,-.9],[7,GROUND],[EDGE,GROUND],[EDGE,-1.8]].map(([x,y])=>new T.Vector2(x,y)));
 const ground=mesh(site,new T.ExtrudeGeometry(valley,{depth:2*DEPTH,bevelEnabled:false}),mat('#3a3833',0,.95),0,0,-DEPTH);ground.castShadow=false;
 const river=new T.Shape([[-5.29,-.3],[-4.6,-.9],[4.6,-.9],[5.29,-.3]].map(([x,y])=>new T.Vector2(x,y)));
 const water=mesh(site,new T.ExtrudeGeometry(river,{depth:2*DEPTH-.02,bevelEnabled:false}),new T.MeshStandardMaterial({color:'#1f4a63',roughness:.15,metalness:.1,transparent:true,opacity:.82}),0,0,-DEPTH+.01);water.castShadow=false;

 const seats:T.Group[]=[],rollers:T.Mesh[]=[],pins:T.Mesh[]=[],movingCombs:T.Group[]=[];
 for(const side of [-1,1] as const){
  const x=side*HALF,at=(from:number,to:number)=>side*(from+to)/2;
  // Encontro: banco dos apoios, cortina que segura o aterro, alas e laje de acesso sobre o aterro.
  box(abutments,[WALL-7.35,1.87,4.8],[at(7.35,WALL),.2+1.87/2,0],concrete,.04);
  box(abutments,[REAR-WALL,DECK_Y-.45,4.8],[at(WALL,REAR),.2+(DECK_Y-.45)/2,0],wall);
  for(const z of [-2.3,2.3])box(abutments,[EDGE-REAR,DECK_Y+.15-GROUND,.2],[at(REAR,EDGE),(GROUND+DECK_Y+.15)/2,z],wall);
  box(abutments,[EDGE-REAR,DECK_Y-.25-GROUND,4.4],[at(REAR,EDGE),(GROUND+DECK_Y-.25)/2,0],earth);
  box(joints,[EDGE-WALL,.25,4],[at(WALL,EDGE),DECK_Y-.125,0],concrete);box(joints,[EDGE-WALL,.026,3.5],[at(WALL,EDGE),DECK_Y+.013,0],road);
  comb(joints,steel,side*(WALL+.22),-side as 1|-1,.1);
  const moving=new T.Group();moving.userData.end=side*END;joints.add(moving);comb(moving,steel,side*(END-.22),side,0);movingCombs.push(moving);
  for(const z of [-1.12,1.12]){
   box(bearings,[.6,.1,.95],[x,2.12,z],steel,.03);
   if(side<0){const shape=new T.Shape();shape.moveTo(-.28,0);shape.lineTo(.28,0);shape.lineTo(0,.42);shape.closePath();mesh(bearings,new T.ExtrudeGeometry(shape,{depth:.55,bevelEnabled:false}),ochre,x,2.18,z-.275);}
   else for(const dx of [-.2,0,.2]){const roller=mesh(bearings,new T.CylinderGeometry(.13,.13,.7,16),steel,x+dx,2.3,z);roller.rotation.x=Math.PI/2;roller.userData.baseX=x+dx;rollers.push(roller);}
   const pin=mesh(bearings,new T.CylinderGeometry(.085,.085,.72,16),steel,x,2.6,z);pin.rotation.x=Math.PI/2;pin.userData.baseX=x;if(side>0)pins.push(pin);
   const seat=new T.Group();seat.position.set(x,2.64,z);seat.userData.baseX=x;bearings.add(seat);box(seat,[.6,.08,.82],[0,0,0],steel,.02);seats.push(seat);
  }
 }
 // An illustrative truck represents one resultant point load, not an axle-load calculation.
 box(vehicle,[3.2,.22,1.48],[0,.12,0],dark,.04);box(vehicle,[1.05,1.22,1.48],[1,.75,0],yellow,.1);box(vehicle,[.06,.55,1.3],[1.55,1.01,0],glass,.025);
 for(const z of [-.75,.75])box(vehicle,[.75,.5,.025],[1,1.02,z],glass,.025);
 box(vehicle,[1.95,1.32,1.52],[-.55,.89,0],ivory,.07);box(vehicle,[1.96,.12,1.54],[-.55,1.62,0],yellow,.035);
 for(const z of [-.61,.61])box(vehicle,[.05,.14,.24],[1.57,.43,z],mat('#fff5d2'));
 const wheels:T.Group[]=[];
 for(const x of [-.95,.95])for(const z of [-.8,.8]){const wheel=new T.Group();wheel.position.set(x,0,z);vehicle.add(wheel);const tire=mesh(wheel,new T.CylinderGeometry(.36,.36,.19,20),rubber);tire.rotation.x=Math.PI/2;const hub=mesh(wheel,new T.CylinderGeometry(.18,.18,.2,12),steel);hub.rotation.x=Math.PI/2;box(wheel,[.035,.28,.215],[0,0,0],ivory);wheels.push(wheel);}
 for(const g of [deck,girders,abutments,joints,vehicle,...movingCombs])mergeStatic(g);
 const flex=[deck,girders].flatMap(g=>g.children.filter((o):o is T.Mesh=>o instanceof T.Mesh).map(o=>{o.updateMatrix();o.geometry.applyMatrix4(o.matrix);o.position.set(0,0,0);o.quaternion.identity();o.scale.setScalar(1);return {mesh:o,rest:Float32Array.from(o.geometry.getAttribute('position').array)};}));
 const helpers=new T.Group();root.add(helpers);
 const reference=new T.Group();helpers.add(reference);
 for(const z of [-2,2]){const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-END,DECK_Y,z),new T.Vector3(END,DECK_Y,z)]),new T.LineDashedMaterial({color:'#aeb8d3',dashSize:.25,gapSize:.12,transparent:true,opacity:.9,depthTest:false}));line.renderOrder=5;line.computeLineDistances();line.raycast=()=>{};reference.add(line);}
 const force=solidArrow('#ffd21f',-1),leftReaction=solidArrow('#81bdce',1),rightReaction=solidArrow('#81bdce',1);
 leftReaction.group.position.set(-HALF,GROUND+.05,2.75);rightReaction.group.position.set(HALF,GROUND+.05,2.75);
 helpers.add(force.group,leftReaction.group,rightReaction.group);
 for(const arrow of [force,leftReaction,rightReaction])arrow.group.traverse(o=>{o.raycast=()=>{};});
 return {root,parts,site,flex,vehicle,wheels,seats,rollers,pins,movingCombs,helpers,reference,force,leftReaction,rightReaction,dispose:()=>disposeTree(root)};
}
export type BridgeModel=ReturnType<typeof createModel>;
/** Pontos de cena onde ficam os rótulos das reações e a junta do lado do rolete. */
export const ANCHORS={leftReaction:new T.Vector3(-HALF,GROUND-.15,2.75),rightReaction:new T.Vector3(HALF,GROUND-.15,2.75),joint:new T.Box3(new T.Vector3(END-.9,DECK_Y-.6,-2),new T.Vector3(WALL+1,DECK_Y+.3,2))};
