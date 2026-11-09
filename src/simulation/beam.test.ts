import test from 'node:test';import assert from 'node:assert/strict';
import {deflection,deflectionSlope,peakRatio,momentRatio,reactions,initialState,sanitize,advance,visualDeflection,SPAN,STEEL_ALPHA,expansionMm,thermalShift,jointGap,JOINT_GAP,OVERHANG,TEMPERATURE_RANGE,dayTemperature,advanceDay,phaseForTemperature,DAY_SECONDS} from './beam.ts';
const near=(a:number,b:number,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const state=(loadPosition:number,loadLevel=1,temperature=0)=>({loadPosition,loadLevel,temperature});
test('equilíbrio e apoios: reações fecham força e momento',()=>{for(const a of [0,.1,.3,.5,.9,1])for(const u of [0,.4,1]){const r=reactions(a,u);near(r.left+r.right,u);near(r.right,u*a);near(deflection(0,a,u),0);near(deflection(1,a,u),0);}});
test('caso central conhecido, linearidade e simetria',()=>{near(deflection(.5,.5,1),-.024/48);near(deflection(.5,.5,.5),-.024/96);for(let i=0;i<=100;i++){const s=i/100;near(deflection(s,.27,.8),deflection(1-s,.73,.8));assert.ok(deflection(s,.5,1)>=deflection(.5,.5,1)-1e-10);}});
test('continuidade de flecha e inclinação sob a carga; carga no apoio não curva',()=>{for(const a of [.1,.33,.5,.8]){const h=1e-5,d=deflection(a,a,1),left=deflection(a-h,a,1),right=deflection(a+h,a,1);near(left,right,1e-6);near((d-left)/h,(right-d)/h,1e-6);for(const x of [.05,.2,.6,.95]){if(Math.abs(x-a)<.01)continue;const step=1e-4,curvature=(deflection(x+step,a,1)-2*deflection(x,a,1)+deflection(x-step,a,1))/(step*step),moment=(1-a)*x-Math.max(0,x-a);near(curvature,.024*moment,1e-7);}}for(let i=0;i<=100;i++){near(deflection(i/100,0,1),0);near(deflection(i/100,1,1),0);near(deflection(i/100,.5,0),0);}});
test('inclinação analítica confere com a derivada numérica',()=>{for(const a of [.05,.3,.5,.9])for(const s of [0,.02,.25,.5,.77,1]){const h=1e-6,lo=Math.max(0,s-h),hi=Math.min(1,s+h);near(deflectionSlope(s,a,1),(deflection(hi,a,1)-deflection(lo,a,1))/(hi-lo),1e-6);}});
test('flecha perto do apoio: razão analítica, máximo no centro e queda junto ao apoio',()=>{
 for(const a of [.02,.05,.15,.3,.5,.7,.95]){let peak=0;for(let i=0;i<=4000;i++)peak=Math.min(peak,deflection(i/4000,a,1));near(peakRatio(a),peak/deflection(.5,.5,1),1e-5);}
 near(peakRatio(.5),1,1e-12);near(peakRatio(0),0);near(peakRatio(1),0);near(peakRatio(.2),peakRatio(.8),1e-12);
 assert.ok(peakRatio(.05)<.16&&peakRatio(.05)>.15,'carga a 5% do vão dobra ~15% do caso central');
 for(let i=1;i<50;i++)assert.ok(peakRatio(i/100)<peakRatio((i+1)/100));
 near(momentRatio(.5),1);near(momentRatio(.05),.19,1e-12);
});
test('ampliação é somente visual; saliência acompanha a rotação da ponta',()=>{const s=state(.5);near(visualDeflection(0,s,80),visualDeflection(0,s,1)*80);near(visualDeflection(0,s,0),0);assert.deepEqual(reactions(s.loadPosition,s.loadLevel),{left:.5,right:.5});
 near(visualDeflection(-SPAN/2,s,80),0);near(visualDeflection(SPAN/2,s,80),0);
 const lift=visualDeflection(-SPAN/2-OVERHANG,s,80);assert.ok(lift>0,'a ponta em balanço sobe quando o vão desce');near(lift,-OVERHANG*deflectionSlope(0,.5,1)*80,1e-12);
 near(visualDeflection(SPAN/2+OVERHANG,s,80),lift,1e-12);});
test('estado finito, pausa, tempo limitado e fim sem salto',()=>{assert.deepEqual(initialState(),initialState());const s=initialState();assert.deepEqual(advance(s,2,false,true),s);assert.deepEqual(advance(s,2,true,false),s);near(advance(s,10,true,true).loadPosition-s.loadPosition,.1/14);assert.equal(advance({...s,loadPosition:.999},.1,true,true).loadPosition,1);assert.equal(advance({...s,loadPosition:1},.1,true,true).loadPosition,1);assert.deepEqual(sanitize({loadPosition:NaN,loadLevel:Infinity,temperature:NaN}),{loadPosition:0,loadLevel:0,temperature:0});assert.equal(advance({...s,temperature:7},.05,true,true).temperature,7);});
test('dilatação: coeficiente do WisDOT, conta da Rio–Niterói e apoio fixo parado',()=>{
 near(STEEL_ALPHA,.0000117,1e-12);
 near(expansionMm(1,1),.0117,1e-9);near(expansionMm(100,15),17.55,1e-9);near(expansionMm(100,-15),-17.55,1e-9);
 const rioNiteroi=expansionMm(848,30)/10;assert.ok(rioNiteroi>29&&rioNiteroi<31,`~30 cm: ${rioNiteroi}`);
 near(thermalShift(-SPAN/2,15,80),0);assert.ok(thermalShift(SPAN/2,15,80)>0&&thermalShift(SPAN/2,-15,80)<0);
 near(thermalShift(SPAN/2,10,40),thermalShift(SPAN/2,10,80)/2);near(thermalShift(SPAN/2,10,0),0);
 near(thermalShift(SPAN/2,99,80),thermalShift(SPAN/2,TEMPERATURE_RANGE,80),1e-12);
});
test('junta: fecha no calor, abre no frio e os pentes nunca batem nem se soltam',()=>{
 near(jointGap(0,80),JOINT_GAP);assert.ok(jointGap(15,80)<JOINT_GAP&&jointGap(-15,80)>JOINT_GAP);near(jointGap(15,1),JOINT_GAP-thermalShift(SPAN/2+OVERHANG,15,1));
 // Raízes dos pentes recuadas .22 de cada face; dentes de .6 (model.ts).
 for(const t of [-15,-7,0,7,15]){const roots=jointGap(t,80)+.44;assert.ok(roots>.6,`dente bate no pente oposto a ${t} °C`);assert.ok(1.2-roots>.05,`pentes se soltam a ${t} °C`);}
});
test('ciclo do dia: começa na madrugada fria, passa pela tarde de sol e retoma sem salto',()=>{
 near(dayTemperature(0),-TEMPERATURE_RANGE);near(dayTemperature(.5),TEMPERATURE_RANGE);near(dayTemperature(1),dayTemperature(0));
 let phase=0;for(let i=0;i<DAY_SECONDS*10;i++)phase=advanceDay(phase,.1);near(Math.min(phase,1-phase),0,1e-9);
 near(advanceDay(.2,10),.2+.1/DAY_SECONDS);assert.equal(advanceDay(NaN,.05),.05/DAY_SECONDS);
 for(const t of [-15,-8,0,6,15])near(dayTemperature(phaseForTemperature(t)),t,1e-9);
 assert.ok(dayTemperature(phaseForTemperature(4)+.01)>4,'retoma subindo');
});
