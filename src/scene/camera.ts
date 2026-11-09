import { Box3, PerspectiveCamera, Vector3 } from 'three';

/** Distância e centro que enquadram `bounds` olhando na direção `direction` (do alvo para a câmera). */
export function framing(bounds: Box3, aspect: number, direction: Vector3, fov = 38) {
  const center = bounds.getCenter(new Vector3());
  const forward = direction.clone().normalize();
  // Match lookAt's vertical-view adjustment before measuring projected corners.
  if (Math.abs(forward.y) > .9999) forward.z += .001;
  forward.normalize();
  const right = new Vector3(0, 1, 0).cross(forward).normalize();
  const up = forward.clone().cross(right).normalize();
  const tanV = Math.tan(fov * Math.PI / 360), tanH = tanV * Math.max(.1, aspect);
  let distance = 1;
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
    const p = new Vector3(x, y, z).sub(center), toward = p.dot(forward);
    distance = Math.max(distance, Math.abs(p.dot(right)) / tanH + toward, Math.abs(p.dot(up)) / tanV + toward);
  }
  distance *= 1.08;
  return { center, distance, position: center.clone().addScaledVector(forward, distance) };
}

export function fit(camera: PerspectiveCamera, bounds: Box3, direction: Vector3) {
  const pose = framing(bounds, camera.aspect, direction, camera.fov);
  camera.position.copy(pose.position); camera.lookAt(pose.center); camera.updateProjectionMatrix();
  return pose.center;
}

/**
 * Nova posição da câmera quando só a proporção da tela muda (resize, tela cheia, giro do celular):
 * mantém alvo e direção escolhidos pela pessoa e a aproximação relativa, ajustando apenas a distância.
 */
export function refit(position: Vector3, target: Vector3, bounds: Box3, fromAspect: number, toAspect: number, fov = 38) {
  const offset = position.clone().sub(target);
  if (offset.lengthSq() < 1e-12) return position.clone();
  const before = framing(bounds, fromAspect, offset, fov).distance, after = framing(bounds, toAspect, offset, fov).distance;
  return target.clone().addScaledVector(offset, after / before);
}
