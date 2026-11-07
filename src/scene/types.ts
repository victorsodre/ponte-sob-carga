import type * as T from 'three';import type {BeamState,ShapeView,Amplification} from '../simulation/beam.ts';import type {PartId} from '../content/catalog.ts';
export type Part={id:PartId;label:string;detail:string;note:string;source:string;group:T.Group};
export type ViewState={beam:BeamState;shapeView:ShapeView;amplification:Amplification;selected:string|null;isolated:boolean;wireframe:boolean};
export type SceneHandle={parts:Part[];update:(state:ViewState)=>void;home:()=>void;focus:(id:string)=>void;zoom:(factor:number)=>void;capture:(portrait?:boolean)=>void;dispose:()=>void};
