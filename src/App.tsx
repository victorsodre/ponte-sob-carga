import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Box, ChevronRight, Download, Focus, Layers3, Maximize, Minus, Plus, Search, X } from 'lucide-react';
import { Brand } from './ui/Brand.tsx';
import { Sources } from './ui/Sources.tsx';
import { CycleControls } from './ui/CycleControls.tsx';
import { createScene } from './scene/runtime.ts';
import { advance, initialState, reactions } from './simulation/beam.ts';
import type {ShapeView,Amplification} from './simulation/beam.ts';
import { project } from './content/project.ts';
import { catalog } from './content/catalog.ts';
import type { Part, SceneHandle } from './scene/types.ts';

export function App() {
  const host = useRef<HTMLDivElement>(null), scene = useRef<SceneHandle | null>(null), inspector = useRef<HTMLElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const [parts,setParts]=useState<Part[]>([]),[beam,setBeam]=useState(initialState),[shapeView,setShapeView]=useState<ShapeView>('compare'),[amplification,setAmplification]=useState<Amplification>(80),[playing,setPlaying]=useState(false);
  const [selected,setSelected]=useState<string|null>(null),[isolated,setIsolated]=useState(false),[wireframe,setWireframe]=useState(false);
  const [sources, setSources] = useState(false), [drawer, setDrawer] = useState(false), [search, setSearch] = useState(''), [tour, setTour] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null), [notice, setNotice] = useState('');
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const select = useCallback((id: string | null) => {setSelected(id);setIsolated(false);setTour(null);setPlaying(false);}, []);
  const current = catalog.find(p => p.id === selected);
  const normalize = (value: string) => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  useEffect(() => {
    if (!host.current) return;
    let cancelled=false;
    document.fonts.ready.then(()=>{
      if(cancelled||!host.current)return;
      try{scene.current=createScene(host.current,select,text=>{setError(text);setPlaying(false);});setParts(scene.current.parts);}
      catch{setError('Seu navegador não conseguiu abrir a cena 3D. As explicações e fontes continuam disponíveis.');}
    });
    return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};
  }, [select]);
  useEffect(() => {scene.current?.update({beam, shapeView, amplification, selected, isolated, wireframe});}, [beam, shapeView, amplification, selected, isolated, wireframe, parts]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {setReduced(media.matches);if (media.matches) setPlaying(false);};
    media.addEventListener('change', change);return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if(!playing)return;let id=0,last=performance.now();
    const tick=(now:number)=>{if(now-last>=32){const dt=(now-last)/1000;last=now;setBeam(s=>advance(s,dt,true,!document.hidden));}if(!document.hidden)id=requestAnimationFrame(tick);};
    const visibility=()=>{cancelAnimationFrame(id);last=performance.now();if(!document.hidden)id=requestAnimationFrame(tick);};
    visibility();document.addEventListener('visibilitychange',visibility);return()=>{cancelAnimationFrame(id);document.removeEventListener('visibilitychange',visibility);};
  },[playing]);
  useEffect(()=>{if(beam.loadPosition>=1)setPlaying(false);},[beam.loadPosition]);
  useEffect(() => {if (drawer) dialog.current?.showModal();else dialog.current?.close();}, [drawer]);
  useEffect(() => {if (selected && innerWidth <= 900) {const id = requestAnimationFrame(() => inspector.current?.scrollIntoView({block: 'nearest', behavior: reduced ? 'instant' : 'smooth'}));return () => cancelAnimationFrame(id);}}, [selected, reduced]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || sources || drawer) return;
      if (e.key.toLowerCase() === 'r') scene.current?.home();
      if (e.key === 'Escape') select(null);
    };
    document.addEventListener('keydown', key);return () => document.removeEventListener('keydown', key);
  }, [select, sources, drawer]);
  function reset(){setBeam(initialState());setShapeView('compare');setAmplification(80);setPlaying(false);setSelected(null);setIsolated(false);setWireframe(false);setTour(null);setSearch('');requestAnimationFrame(()=>scene.current?.home());setNotice('Experiência reiniciada.');}
  function guide(index: number) {const p = parts[index];if (!p) return;setTour(index);setSelected(p.id);setIsolated(false);setPlaying(false);requestAnimationFrame(() => scene.current?.focus(p.id));}
  async function fullscreen() {try {if (document.fullscreenElement) await document.exitFullscreen();else await document.documentElement.requestFullscreen();} catch {setNotice('Tela cheia não disponível neste navegador.');}}
  const list = () => <><label className="search"><Search size={16}/><input aria-label="Encontrar conjunto" placeholder="Encontrar conjunto" value={search} onChange={e => setSearch(e.target.value)}/><span>06</span></label><div className="parts-list">{catalog.filter(p => normalize(p.label).includes(normalize(search))).map((p) => <button className={'part-row' + (p.id === selected ? ' selected' : '')} key={p.id} aria-pressed={p.id === selected} onClick={() => {select(p.id);setDrawer(false);}}><span>{String(catalog.indexOf(p) + 1).padStart(2, '0')}</span><strong>{p.label}</strong><ChevronRight size={14}/></button>)}{!catalog.some(p => normalize(p.label).includes(normalize(search))) && <small className="search-hint">Nenhum conjunto encontrado.</small>}</div></>;
  return <div className="app"><header className="header"><Brand/><div className="collection-label">ESTRUTURAS EM MOVIMENTO <span>/</span> LAB 10</div><a className="video-link" href={project.video} target="_blank" rel="noreferrer">Ver o vídeo <ArrowUpRight size={16}/></a></header>
    <main className="workspace engine-workspace"><div className="heading"><p className="eyebrow"><span/> EXPERIMENTO 10 <i>—</i> UMA CARGA. DOIS APOIOS.</p><h1>PONTE<br/>SOB CARGA<span>.</span></h1><p className="intro">{project.intro}</p></div>
      <div className="canvas-region"><div className="scene-host" ref={host}/>{error && <div className="scene-error" role="alert"><Box size={28}/><h2>Cena indisponível</h2><p>{error}</p><button className="primary" onClick={() => location.reload()}>Tentar novamente</button></div>}<div className="scene-mode"><span className={'status-dot' + (playing ? ' active' : '')}/>{isolated ? 'CONJUNTO ISOLADO' : 'VIGA SIMPLESMENTE APOIADA'}<span className="mode-divider"/>MODELO IDEALIZADO</div><div className="orbit-hint">Arraste para girar <span>·</span> Modelo educativo</div></div>
      <aside className="sidebar"><div className="sidebar-label">O CAMINHO DA CARGA.</div>{list()}<div className="sidebar-foot"><span className="mini-line"/><p>Do tabuleiro aos apoios.<br/>Dos pilares ao solo.</p><button className="text-button" disabled={!parts.length || Boolean(error)} onClick={() => guide(0)}>Conhecer a estrutura <ArrowRight size={15}/></button></div></aside>
      <nav className="view-switch" aria-label="Comparar deformação">{([['original','Original'],['deformed','Deformada'],['compare','Comparar']] as const).map(([id,label])=><button key={id} aria-pressed={shapeView===id} className={shapeView===id?'active':''} onClick={()=>{setShapeView(id);setIsolated(false);}}>{label}</button>)}</nav>
      <div className="bridge-legend"><strong>{shapeView==='original'?'FORMA ORIGINAL':`DEFORMAÇÃO AMPLIADA ×${amplification}`}</strong><span>{shapeView==='compare'?'TRACEJADO · FORMA ORIGINAL':'VIGA EQUIVALENTE · SEM ESCALA REAL'}</span></div>
      <div className="camera-tools"><button aria-label="Aproximar" disabled={!parts.length} onClick={() => scene.current?.zoom(.85)}><Plus size={18}/></button><button aria-label="Afastar" disabled={!parts.length} onClick={() => scene.current?.zoom(1.15)}><Minus size={18}/></button><span/><button aria-label="Reenquadrar" onClick={() => scene.current?.home()}><Focus size={18}/></button><button aria-label="Mostrar malha" aria-pressed={wireframe} onClick={() => setWireframe(v => !v)}><Box size={18}/></button><span/><button aria-label="Salvar imagem PNG" disabled={!parts.length || Boolean(error)} onClick={() => scene.current?.capture()}><Download size={18}/></button><button className="format-button" aria-label="Salvar imagem vertical 9 por 16" disabled={!parts.length || Boolean(error)} onClick={() => scene.current?.capture(true)}>9:16</button>{Boolean(document.documentElement.requestFullscreen) && <button aria-label="Tela cheia" onClick={fullscreen}><Maximize size={17}/></button>}</div>
      {current && <section className="inspector" ref={inspector} aria-label="Conjunto selecionado"><div className="inspector-top"><span className="eyebrow">{tour === null ? 'EM DETALHE' : `CONHEÇA A ESTRUTURA · ${tour + 1}/6`}</span><button className="icon-button" aria-label="Fechar detalhe" onClick={() => select(null)}><X size={16}/></button></div><h2>{current.label}</h2><p>{current.detail}</p><small>{current.note}</small><a className="part-source" href={current.source} target="_blank" rel="noreferrer">Consultar a fonte <ArrowUpRight size={12}/></a><div className="inspector-actions"><button disabled={!parts.length || Boolean(error)} aria-pressed={isolated} onClick={() => {setIsolated(v => !v);setPlaying(false);}}><Layers3 size={14}/>{isolated ? 'Ver ponte inteira' : 'Isolar'}</button><button disabled={!parts.length || Boolean(error)} onClick={() => scene.current?.focus(current.id)}><Focus size={14}/>Aproximar</button></div>{tour !== null && <div className="inspector-actions"><button disabled={tour === 0} onClick={() => guide(tour - 1)}><ArrowLeft size={14}/>Anterior</button><button onClick={() => tour < 5 ? guide(tour + 1) : setTour(null)}>{tour < 5 ? 'Próximo conjunto' : 'Concluir'}<ArrowRight size={14}/></button></div>}</section>}
      <div className="mobile-actions"><button onClick={() => setDrawer(true)}><Layers3 size={16}/>Conjuntos <span>6</span></button><button disabled={!parts.length || Boolean(error)} onClick={() => guide(0)}>Conhecer a estrutura <ArrowRight size={16}/></button></div>
      <CycleControls beam={beam} playing={playing} amplification={amplification} disabled={!parts.length||Boolean(error)} setPlaying={value=>{if(value&&beam.loadPosition>=1)setBeam(s=>({...s,loadPosition:0}));setPlaying(value);setIsolated(false);}} setAmplification={setAmplification} onPosition={value=>{setPlaying(false);setIsolated(false);setBeam(s=>({...s,loadPosition:value}));}} onLoad={value=>setBeam(s=>({...s,loadLevel:value}))} reset={reset}/>
      <div className="reaction-strip" aria-label="Distribuição da carga"><span>APOIO ESQUERDO <b>{(reactions(beam.loadPosition,beam.loadLevel).left*100).toLocaleString('pt-BR',{maximumFractionDigits:1})}%</b></span><span>APOIO DIREITO <b>{(reactions(beam.loadPosition,beam.loadLevel).right*100).toLocaleString('pt-BR',{maximumFractionDigits:1})}%</b></span><small>DA CARGA DE REFERÊNCIA · SOMENTE O VEÍCULO</small></div>
    </main><footer><span>UM EXPERIMENTO DO OVICTORLAB <i>© 2026</i></span><button onClick={() => setSources(true)}>Como funciona · Fontes e créditos <ArrowUpRight size={13}/></button></footer>
    <Sources open={sources} onClose={() => setSources(false)}/><dialog ref={dialog} className="parts-dialog" aria-label="Conjuntos da ponte" onClose={() => setDrawer(false)}><div className="dialog-top"><span className="eyebrow">CONHEÇA A ESTRUTURA</span><button className="icon-button" aria-label="Fechar conjuntos" onClick={() => setDrawer(false)}><X size={18}/></button></div>{list()}</dialog><span className="sr-only" role="status" aria-live="polite">{notice}</span>
  </div>;
}
