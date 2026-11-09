import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ANCHORS, createModel } from './model.ts';
import { applyBeam } from './rig.ts';
import { initialState, reactions } from '../simulation/beam.ts';
import { fit, refit } from './camera.ts';
import { saveSceneImage } from './capture.ts';
import type { SceneHandle, ViewState } from './types.ts';

const LANDSCAPE = { bounds: new T.Box3(new T.Vector3(-10.6, -.9, -2.9), new T.Vector3(10.6, 7.4, 2.9)), direction: new T.Vector3(5, 5, 22) };
// Em retrato a ponte entra inteira, com os dois encontros até o fim das alas, num ângulo mais frontal e alto.
const PORTRAIT = { bounds: new T.Box3(new T.Vector3(-12.6, -1.2, -2.6), new T.Vector3(12.6, 5.6, 2.6)), direction: new T.Vector3(4, 7, 20) };
const JOINT_DIRECTION = new T.Vector3(3, 8, 7);
/** Movimento máximo, em pixels, para um toque ainda contar como clique e não como arrasto. */
const TAP_SLOP = { mouse: 5, touch: 10 };
const percent = (value: number) => (value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

export function createScene(host: HTMLElement, onSelect: (id: string) => void, onError: (text: string) => void): SceneHandle {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;renderer.toneMappingExposure = 1;renderer.shadowMap.enabled = true;renderer.shadowMap.type = T.PCFShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Ponte de um vão em 3D, com encontros nas margens de um rio. Arraste para girar ou selecione um conjunto na lista.');
  host.append(canvas);
  const labels = document.createElement('div');labels.className = 'scene-labels';labels.setAttribute('aria-hidden', 'true');
  const leftLabel = document.createElement('span'), rightLabel = document.createElement('span');labels.append(leftLabel, rightLabel);host.append(labels);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, .1, 400);
  const controls = new OrbitControls(camera, canvas);controls.enableDamping = false;controls.minDistance = 1;controls.maxDistance = 180;controls.maxPolarAngle = Math.PI * .48;
  // OrbitControls bloqueia todo gesto de toque; deixamos a rolagem vertical da página com o navegador.
  canvas.style.touchAction = 'pan-y';
  const room = new RoomEnvironment(), pmrem = new T.PMREMGenerator(renderer), env = pmrem.fromScene(room, .04);scene.environment = env.texture;scene.environmentIntensity = .5;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight('#dbe8ff', '#483d30', 1.15));
  const key = new T.DirectionalLight('#fff1d2', 2.5);key.position.set(10, 25, 18);key.castShadow = true;key.shadow.mapSize.set(1024, 1024);key.shadow.camera.left = -30;key.shadow.camera.right = 30;key.shadow.camera.top = 24;key.shadow.camera.bottom = -24;key.shadow.camera.far = 90;key.shadow.bias = -.0005;scene.add(key);
  const rim = new T.DirectionalLight('#b4d3ff', 1.9);rim.position.set(-6, 5, -5);scene.add(rim);
  const model = createModel();scene.add(model.root);
  const highlight = new T.BoxHelper(new T.Object3D(), '#ffd21f');highlight.visible = false;scene.add(highlight);
  let state: ViewState = { beam: initialState(), shapeView: 'compare', amplification: 80, selected: null, isolated: false, wireframe: false, jointClose: false };
  let disposed = false, active = false, contextLost = false, last = -Infinity;
  let previousPose: {position: T.Vector3; target: T.Vector3} | null = null;
  const layout = () => camera.aspect < 1.1 ? PORTRAIT : LANDSCAPE;
  const selectedPart = () => model.parts.find(p => p.id === state.selected);
  const bounds = () => state.isolated && selectedPart() ? new T.Box3().setFromObject(selectedPart()!.group) : layout().bounds;
  /** Direção atual da órbita (do alvo para a câmera). */
  const orbit = () => camera.position.clone().sub(controls.target);
  const invalidate = () => {if (disposed || active || document.hidden || contextLost) return;active = true;renderer.setAnimationLoop(frame);};
  const place = (label: HTMLElement, point: T.Vector3, visible: boolean) => {
    const p = point.clone().project(camera), inside = visible && p.z < 1 && Math.abs(p.x) < 1 && Math.abs(p.y) < 1;
    label.hidden = !inside;
    if (inside) label.style.transform = `translate(${((p.x + 1) / 2 * canvas.clientWidth).toFixed(1)}px, ${((1 - p.y) / 2 * canvas.clientHeight).toFixed(1)}px) translate(-50%, 0)`;
  };
  function frame(time: number) {
    if (time - last < 1000 / 30) return;last = time;
    renderer.render(scene, camera);
    const showLabels = model.helpers.visible;
    place(leftLabel, ANCHORS.leftReaction, showLabels && model.leftReaction.group.visible);
    place(rightLabel, ANCHORS.rightReaction, showLabels && model.rightReaction.group.visible);
    const data = canvas.dataset;data.renderCount = String(Number(data.renderCount ?? 0) + 1);
    data.drawCalls = String(renderer.info.render.calls);data.triangles = String(renderer.info.render.triangles);
    data.cameraPose = JSON.stringify([...camera.position.toArray(), ...controls.target.toArray()]);
    renderer.setAnimationLoop(null);active = false;
  }
  /** Enquadra `box` olhando por `direction`; sem direção, mantém a órbita atual. */
  const frameBox = (box: T.Box3, direction = orbit()) => {controls.target.copy(fit(camera, box, direction));controls.update();invalidate();};
  const home = () => frameBox(bounds(), layout().direction);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();if (width < 1 || height < 1) return;
    const size = renderer.getSize(new T.Vector2()), aspect = width / height, before = camera.aspect;
    if (size.x !== width || size.y !== height) renderer.setSize(width, height);
    if (Math.abs(before - aspect) > .0001) {
      camera.position.copy(refit(camera.position, controls.target, bounds(), before, aspect, camera.fov));
      camera.aspect = aspect;camera.updateProjectionMatrix();controls.update();
    }
    invalidate();
  };
  const observer = new ResizeObserver(resize);observer.observe(host);controls.addEventListener('change', invalidate);
  // Só um toque curto e parado seleciona; arrastar para girar ou rolar a página não muda nada.
  let down: {x: number; y: number; id: number; type: string} | null = null, pointers = 0;
  const pointerDown = (e: PointerEvent) => {pointers++;down = pointers === 1 && e.isPrimary ? {x: e.clientX, y: e.clientY, id: e.pointerId, type: e.pointerType} : null;};
  const pointerCancel = () => {pointers = Math.max(0, pointers - 1);down = null;};
  const pointerUp = (e: PointerEvent) => {
    pointers = Math.max(0, pointers - 1);
    const start = down;down = null;
    if (!start || start.id !== e.pointerId || e.button > 0) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > (start.type === 'mouse' ? TAP_SLOP.mouse : TAP_SLOP.touch)) return;
    const rect = canvas.getBoundingClientRect(), ray = new T.Raycaster(), candidates: T.Mesh[] = [];
    ray.setFromCamera(new T.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), camera);
    for (const group of [model.site, ...model.parts.map(p => p.group)]) if (group.visible) group.traverseVisible(o => {if (o instanceof T.Mesh) candidates.push(o);});
    let current: T.Object3D | null = ray.intersectObjects(candidates, false)[0]?.object ?? null;
    while (current && !current.userData.partId) current = current.parent;
    if (current) onSelect(current.userData.partId);
  };
  // A rodinha rola a página; aproximar fica com Ctrl/⌘ + rodinha, pinça do trackpad e botões.
  const wheel = (e: WheelEvent) => {if (!e.ctrlKey && !e.metaKey) e.stopPropagation();};
  host.addEventListener('wheel', wheel, { capture: true });
  canvas.addEventListener('pointerdown', pointerDown);canvas.addEventListener('pointerup', pointerUp);canvas.addEventListener('pointercancel', pointerCancel);
  const visibility = () => {if (document.hidden) {renderer.setAnimationLoop(null);active = false;} else {last = -Infinity;invalidate();}};
  document.addEventListener('visibilitychange', visibility);
  const lost = (e: Event) => {e.preventDefault();contextLost = true;renderer.setAnimationLoop(null);active = false;onError('A cena 3D foi interrompida. Recarregue para restaurá-la. As explicações e fontes continuam disponíveis.');};
  canvas.addEventListener('webglcontextlost', lost);
  applyBeam(model, initialState(), 'compare', 80);
  {const { width, height } = host.getBoundingClientRect();camera.aspect = width > 0 && height > 0 ? width / height : 1;}
  resize();home();
  return {
    parts: model.parts,
    update(next) {
      const previous = state;state = next;
      applyBeam(model, state.beam, state.shapeView, state.amplification);
      model.helpers.visible = !state.isolated;model.site.visible = !state.isolated;
      for (const part of model.parts) part.group.visible = !state.isolated || part.id === state.selected;
      // De perto na junta, o caminhão sai de cena: parado no fim do vão, ele cobriria o pente.
      if (state.jointClose) {model.vehicle.visible = false;model.force.group.visible = false;}
      if (previous.wireframe !== state.wireframe) model.root.traverse(o => {if (o instanceof T.Mesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m instanceof T.MeshStandardMaterial) m.wireframe = state.wireframe;});
      const r = reactions(state.beam.loadPosition, state.beam.loadLevel);leftLabel.textContent = percent(r.left);rightLabel.textContent = percent(r.right);
      const selected = selectedPart();highlight.visible = Boolean(selected) && !state.isolated;
      if (selected) highlight.setFromObject(selected.group);
      if (!previous.isolated && state.isolated) {previousPose = {position: camera.position.clone(), target: controls.target.clone()};frameBox(bounds());}
      if (previous.isolated && !state.isolated && previousPose) {camera.position.copy(previousPose.position);controls.target.copy(previousPose.target);controls.update();previousPose = null;}
      canvas.dataset.beam = JSON.stringify(state.beam);canvas.dataset.shapeView = state.shapeView;canvas.dataset.amplification = String(state.amplification);invalidate();
    },
    home,
    focus(id) {const part = model.parts.find(p => p.id === id);if (part) frameBox(new T.Box3().setFromObject(part.group));},
    focusJoint() {frameBox(ANCHORS.joint, JOINT_DIRECTION);},
    zoom(factor) {camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();invalidate();},
    capture(portrait = false) {saveSceneImage(renderer, scene, camera, portrait ? PORTRAIT.bounds : bounds(), portrait, state.shapeView === 'original' ? 'Forma original · Modelo idealizado' : `Deformação ×${state.amplification} · Modelo idealizado`);invalidate();},
    dispose() {
      disposed = true;renderer.setAnimationLoop(null);observer.disconnect();controls.removeEventListener('change', invalidate);controls.dispose();
      host.removeEventListener('wheel', wheel, { capture: true });
      canvas.removeEventListener('pointerdown', pointerDown);canvas.removeEventListener('pointerup', pointerUp);canvas.removeEventListener('pointercancel', pointerCancel);canvas.removeEventListener('webglcontextlost', lost);document.removeEventListener('visibilitychange', visibility);
      model.dispose();env.dispose();highlight.geometry.dispose();(highlight.material as T.Material).dispose();renderer.dispose();canvas.remove();labels.remove();
    },
  };
}
