import { video } from './content/video.ts';
import { VideoSection } from './kit/VideoSection.tsx';
import { CollectionNav } from './kit/CollectionNav.tsx';
import { labNumber } from './kit/collection.ts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Box, ChevronRight, Download, Focus, Layers3, Maximize, Minus, Plus, Search, X } from 'lucide-react';
import { Brand } from './kit/Brand.tsx';
import { Sources } from './ui/Sources.tsx';
import { BridgeControls, jointState, placeLabel } from './ui/BridgeControls.tsx';
import type { ControlTab } from './ui/BridgeControls.tsx';
import { createScene } from './scene/runtime.ts';
import { advance, advanceDay, clampTemperature, dayTemperature, initialState, peakRatio, phaseForTemperature, reactions } from './simulation/beam.ts';
import type { ShapeView, Amplification } from './simulation/beam.ts';
import { project } from './content/project.ts';
import { catalog } from './content/catalog.ts';
import type { Part, SceneHandle } from './scene/types.ts';

const SLUG = 'ponte-sob-carga', NUMBER = labNumber(SLUG);
const percent = (value: number) => (value * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + '%';

export function App() {
  const host = useRef<HTMLDivElement>(null), workspace = useRef<HTMLElement>(null), scene = useRef<SceneHandle | null>(null), inspector = useRef<HTMLElement>(null), dialog = useRef<HTMLDialogElement>(null), dayPhase = useRef(0), announced = useRef(false);
  const [parts, setParts] = useState<Part[]>([]), [beam, setBeam] = useState(initialState), [shapeView, setShapeView] = useState<ShapeView>('compare'), [amplification, setAmplification] = useState<Amplification>(80);
  const [playing, setPlaying] = useState(false), [cycling, setCycling] = useState(false), [tab, setTab] = useState<ControlTab>('load');
  const [selected, setSelected] = useState<string | null>(null), [isolated, setIsolated] = useState(false), [wireframe, setWireframe] = useState(false), [jointClose, setJointClose] = useState(false);
  const [sources, setSources] = useState(false), [drawer, setDrawer] = useState(false), [search, setSearch] = useState(''), [tour, setTour] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null), [notice, setNotice] = useState(''), [summary, setSummary] = useState('');
  const select = useCallback((id: string | null) => {setJointClose(false);setSelected(id);setIsolated(false);setTour(null);setPlaying(false);setCycling(false);}, []);
  // Toque no modelo só escolhe a peça: não pausa a travessia nem o ciclo do dia, e tocar no vazio não desmarca.
  const pick = useCallback((id: string) => {setJointClose(false);setSelected(id);setIsolated(false);setTour(null);}, []);
  const current = catalog.find(p => p.id === selected);
  const normalize = (value: string) => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  useEffect(() => {
    if (!host.current) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled || !host.current) return;
      try {scene.current = createScene(host.current, pick, text => {setError(text);setPlaying(false);setCycling(false);});setParts(scene.current.parts);}
      catch {setError('Seu navegador não conseguiu abrir a cena 3D. As explicações e fontes continuam disponíveis.');}
    });
    return () => {cancelled = true;scene.current?.dispose();scene.current = null;};
  }, [pick]);
  useEffect(() => {scene.current?.update({beam, shapeView, amplification, selected, isolated, wireframe, jointClose});}, [beam, shapeView, amplification, selected, isolated, wireframe, jointClose, parts]);
  // No desktop o painel flutua sobre o palco: o canvas e a dica terminam acima dele, qualquer que seja a aba.
  useEffect(() => {
    const root = workspace.current, dock = root?.querySelector<HTMLElement>('.control-dock');
    if (!root || !dock) return;
    const observer = new ResizeObserver(() => root.style.setProperty('--dock-height', dock.offsetHeight + 'px'));
    observer.observe(dock);return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {if (media.matches) {setPlaying(false);setCycling(false);}};
    media.addEventListener('change', change);return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!playing && !cycling) return;let id = 0, last = performance.now();
    const tick = (now: number) => {
      if (now - last >= 32) {
        const dt = (now - last) / 1000;last = now;
        if (cycling) dayPhase.current = advanceDay(dayPhase.current, dt);
        setBeam(s => {const next = advance(s, dt, playing, !document.hidden);return cycling ? {...next, temperature: dayTemperature(dayPhase.current)} : next;});
      }
      if (!document.hidden) id = requestAnimationFrame(tick);
    };
    const visibility = () => {cancelAnimationFrame(id);last = performance.now();if (!document.hidden) id = requestAnimationFrame(tick);};
    visibility();document.addEventListener('visibilitychange', visibility);return () => {cancelAnimationFrame(id);document.removeEventListener('visibilitychange', visibility);};
  }, [playing, cycling]);
  useEffect(() => {if (beam.loadPosition >= 1) setPlaying(false);}, [beam.loadPosition]);
  // Leitor de tela: um resumo só quando a pessoa para de mexer, sem anunciar cada passo do slider.
  useEffect(() => {
    if (!announced.current) {announced.current = true;return;}
    if (playing || cycling) return;
    const r = reactions(beam.loadPosition, beam.loadLevel), t = Math.round(beam.temperature);
    const text = tab === 'load'
      ? `${placeLabel(beam.loadPosition)}: apoio esquerdo ${percent(r.left)}, apoio direito ${percent(r.right)}.${beam.loadLevel > 0 ? ` Flecha máxima de ${Math.round(peakRatio(beam.loadPosition) * 100)}% da flecha com a carga no centro.` : ''}`
      : `Temperatura do aço ${t > 0 ? '+' : ''}${t} °C: ${jointState(t).label.toLocaleLowerCase('pt-BR')}.`;
    const id = setTimeout(() => setSummary(text), 700);return () => clearTimeout(id);
  }, [beam, tab, playing, cycling]);
  useEffect(() => {if (drawer) dialog.current?.showModal();else dialog.current?.close();}, [drawer]);
  useEffect(() => {if (selected && innerWidth <= 900) {const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;const id = requestAnimationFrame(() => inspector.current?.scrollIntoView({block: 'nearest', behavior: reduced ? 'instant' : 'smooth'}));return () => cancelAnimationFrame(id);}}, [selected]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open]') || e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || sources || drawer) return;
      if (e.key.toLowerCase() === 'r') home();
      if (e.key === 'Escape') select(null);
    };
    document.addEventListener('keydown', key);return () => document.removeEventListener('keydown', key);
  }, [select, sources, drawer]);
  function home() {setJointClose(false);scene.current?.home();}
  function reset() {setJointClose(false);setBeam(initialState());dayPhase.current = 0;setShapeView('compare');setAmplification(80);setPlaying(false);setCycling(false);setSelected(null);setIsolated(false);setWireframe(false);setTour(null);setSearch('');requestAnimationFrame(() => scene.current?.home());setNotice('Experiência reiniciada.');}
  function guide(index: number) {const p = parts[index];if (!p) return;setJointClose(false);setTour(index);setSelected(p.id);setIsolated(false);setPlaying(false);setCycling(false);requestAnimationFrame(() => scene.current?.focus(p.id));}
  function startCycle(value: boolean) {
    if (value) {dayPhase.current = phaseForTemperature(beam.temperature);if (shapeView === 'original') setShapeView('compare');setIsolated(false);}
    setCycling(value);
  }
  async function fullscreen() {try {if (document.fullscreenElement) await document.exitFullscreen();else await document.documentElement.requestFullscreen();} catch {setNotice('Tela cheia não disponível neste navegador.');}}
  const ready = parts.length > 0 && !error;
  const list = () => <><label className="search"><Search size={16}/><input aria-label="Encontrar conjunto" placeholder="Encontrar conjunto" value={search} onChange={e => setSearch(e.target.value)}/><span>06</span></label><div className="parts-list">{catalog.filter(p => normalize(p.label).includes(normalize(search))).map((p) => <button className={'part-row' + (p.id === selected ? ' selected' : '')} key={p.id} aria-pressed={p.id === selected} onClick={() => {select(p.id);setDrawer(false);}}><span>{String(catalog.indexOf(p) + 1).padStart(2, '0')}</span><strong>{p.label}</strong><ChevronRight size={14}/></button>)}{!catalog.some(p => normalize(p.label).includes(normalize(search))) && <small className="search-hint">Nenhum conjunto encontrado.</small>}</div></>;
  const r = reactions(beam.loadPosition, beam.loadLevel), thermal = Math.round(beam.temperature);
  return <div className="app"><header className="header"><Brand/><div className="collection-label">ESTRUTURAS EM MOVIMENTO <span>/</span> LAB {NUMBER}</div><a className="video-link" href="#video">Ver o vídeo <ArrowUpRight size={16}/></a></header>
    <main className="workspace" ref={workspace}><div className="heading"><p className="eyebrow"><span/>EXPERIMENTO {NUMBER}<i>—</i><b>UM VÃO. DOIS ENCONTROS.</b></p><h1>PONTE<br/>SOB CARGA<span>.</span></h1><p className="intro">{project.intro}</p></div>
      <div className="canvas-region">
        <nav className="view-switch" aria-label="Comparar deformação">{([['original', 'Original'], ['deformed', 'Deformada'], ['compare', 'Comparar']] as const).map(([id, label]) => <button key={id} aria-pressed={shapeView === id} className={shapeView === id ? 'active' : ''} onClick={() => {setShapeView(id);setIsolated(false);}}>{label}</button>)}</nav>
        <div className="scene-host" ref={host}/>
        {error && <div className="scene-error" role="alert"><Box size={28}/><h2>Cena indisponível</h2><p>{error}</p><button className="primary" onClick={() => location.reload()}>Tentar novamente</button></div>}
        <div className="scene-mode"><span className={'status-dot' + (playing || cycling ? ' active' : '')}/>{isolated ? 'CONJUNTO ISOLADO' : jointClose ? 'JUNTA DE DILATAÇÃO' : 'VIGA SIMPLESMENTE APOIADA'}<span className="mode-divider"/>MODELO IDEALIZADO</div>
        <div className="bridge-legend"><strong>{shapeView === 'original' ? 'FORMA ORIGINAL' : `DEFORMAÇÃO AMPLIADA ×${amplification}`}</strong><span>{shapeView === 'compare' ? 'TRACEJADO · FORMA ORIGINAL' : 'VIGA EQUIVALENTE · SEM ESCALA REAL'}</span>{jointClose && <span>SEM O CAMINHÃO NESTA VISTA</span>}{shapeView !== 'original' && thermal !== 0 && <span>DILATAÇÃO ×{amplification} · ΔT {thermal > 0 ? '+' : '−'}{Math.abs(thermal)} °C</span>}</div>
        <div className="orbit-hint"><span className="hint-fine">Arraste para girar · Ctrl ou ⌘ + rodinha aproxima</span><span className="hint-touch">Arraste na horizontal para girar</span></div>
        <div className="camera-tools"><button aria-label="Aproximar" disabled={!parts.length} onClick={() => scene.current?.zoom(.85)}><Plus size={18}/></button><button aria-label="Afastar" disabled={!parts.length} onClick={() => scene.current?.zoom(1.15)}><Minus size={18}/></button><span/><button aria-label="Reenquadrar" onClick={home}><Focus size={18}/></button><button className="wireframe-button" aria-label="Mostrar malha" aria-pressed={wireframe} onClick={() => setWireframe(v => !v)}><Box size={18}/></button><span/><button aria-label="Salvar imagem PNG" disabled={!ready} onClick={() => scene.current?.capture()}><Download size={18}/></button><button className="format-button" aria-label="Salvar imagem vertical 9 por 16" disabled={!ready} onClick={() => scene.current?.capture(true)}>9:16</button>{Boolean(document.documentElement.requestFullscreen) && <button className="fullscreen-button" aria-label="Tela cheia" onClick={fullscreen}><Maximize size={17}/></button>}</div>
      </div>
      <aside className="sidebar"><div className="sidebar-label">O CAMINHO DA CARGA.</div>{list()}<div className="sidebar-foot"><span className="mini-line"/><p>Do tabuleiro aos apoios.<br/>Dos encontros ao solo.</p><button className="text-button" disabled={!ready} onClick={() => guide(0)}>Conhecer a estrutura <ArrowRight size={15}/></button></div></aside>
      {current && <section className="inspector" ref={inspector} aria-label="Conjunto selecionado"><div className="inspector-top"><span className="eyebrow">{tour === null ? 'EM DETALHE' : `CONHEÇA A ESTRUTURA · ${tour + 1}/6`}</span><button className="icon-button" aria-label="Fechar detalhe" onClick={() => select(null)}><X size={16}/></button></div><h2>{current.label}</h2><p>{current.detail}</p><small>{current.note}</small><a className="part-source" href={current.source} target="_blank" rel="noreferrer">Consultar a fonte <ArrowUpRight size={12}/></a><div className="inspector-actions"><button disabled={!ready} aria-pressed={isolated} onClick={() => {setIsolated(v => !v);setJointClose(false);setPlaying(false);setCycling(false);}}><Layers3 size={14}/>{isolated ? 'Ver ponte inteira' : 'Isolar'}</button><button disabled={!ready} onClick={() => scene.current?.focus(current.id)}><Focus size={14}/>Aproximar</button></div>{tour !== null && <div className="inspector-actions"><button disabled={tour === 0} onClick={() => guide(tour - 1)}><ArrowLeft size={14}/>Anterior</button><button onClick={() => tour < 5 ? guide(tour + 1) : setTour(null)}>{tour < 5 ? 'Próximo conjunto' : 'Concluir'}<ArrowRight size={14}/></button></div>}</section>}
      <div className="mobile-actions"><button onClick={() => setDrawer(true)}><Layers3 size={16}/>Conjuntos <span>6</span></button><button disabled={!ready} onClick={() => guide(0)}>Conhecer a estrutura <ArrowRight size={16}/></button></div>
      <BridgeControls tab={tab} setTab={value => {if (value === 'load' && jointClose) home();setTab(value);}} beam={beam} playing={playing} cycling={cycling} amplification={amplification} disabled={!ready} jointClose={jointClose}
        setPlaying={value => {if (value && beam.loadPosition >= 1) setBeam(s => ({...s, loadPosition: 0}));setPlaying(value);setIsolated(false);}}
        setCycling={startCycle} setAmplification={setAmplification}
        onPosition={value => {setJointClose(false);setPlaying(false);setIsolated(false);setBeam(s => ({...s, loadPosition: value}));}}
        onLoad={value => setBeam(s => ({...s, loadLevel: value}))}
        onTemperature={value => {setCycling(false);setIsolated(false);setBeam(s => ({...s, temperature: clampTemperature(value)}));}}
        onFocusJoint={() => {
          if (jointClose) {home();return;}
          setIsolated(false);setSelected(null);setTour(null);setJointClose(true);setNotice('Junta de perto. O caminhão sai de cena para não cobrir o pente.');requestAnimationFrame(() => scene.current?.focusJoint());
        }} reset={reset}/>
      <div className="reaction-strip"><span>APOIO ESQUERDO <b>{percent(r.left)}</b></span><span>APOIO DIREITO <b>{percent(r.right)}</b></span><small>DA CARGA DE REFERÊNCIA · SOMENTE O VEÍCULO</small></div>
    </main><VideoSection video={video}/><footer><span>UM EXPERIMENTO DO OVICTORLAB <i>© 2026</i></span><button onClick={() => setSources(true)}>Como funciona · Fontes e créditos <ArrowUpRight size={13}/></button><CollectionNav current={SLUG}/></footer>
    <Sources open={sources} onClose={() => setSources(false)}/><dialog ref={dialog} className="parts-dialog" aria-label="Conjuntos da ponte" onClose={() => setDrawer(false)}><div className="dialog-top"><span className="eyebrow">CONHEÇA A ESTRUTURA</span><button className="icon-button" aria-label="Fechar conjuntos" onClick={() => setDrawer(false)}><X size={18}/></button></div>{list()}</dialog>
    <span className="sr-only" role="status" aria-live="polite">{notice}</span><span className="sr-only" aria-live="polite">{summary}</span>
  </div>;
}
