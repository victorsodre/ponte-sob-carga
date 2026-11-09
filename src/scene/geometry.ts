import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function mesh(parent: T.Object3D, geometry: T.BufferGeometry, material: T.Material, x = 0, y = 0, z = 0) {
  const item = new T.Mesh(geometry, material);
  item.position.set(x, y, z); item.castShadow = true; item.receiveShadow = true;
  parent.add(item); return item;
}

export function box(parent: T.Object3D, dimensions: [number, number, number], position: [number, number, number], material: T.Material, radius = 0) {
  const geometry = radius ? new RoundedBoxGeometry(...dimensions, 2, radius) : new T.BoxGeometry(...dimensions);
  return mesh(parent, geometry, material, ...position);
}

export function disposeTree(root: T.Object3D) {
  const geometries = new Set<T.BufferGeometry>(), mats = new Set<T.Material>();
  root.traverse(object => { if (object instanceof T.Mesh || object instanceof T.Line) {
    geometries.add(object.geometry);
    for (const m of Array.isArray(object.material) ? object.material : [object.material]) mats.add(m);
  }});
  for (const g of geometries) g.dispose();
  for (const m of mats) {
    for (const v of Object.values(m)) if (v instanceof T.Texture) v.dispose();
    m.dispose();
  }
}

/** Batch only static siblings. Moving meshes and independently hidden panels stay separate. */
export function mergeStatic(group: T.Group) {
  const batches = new Map<T.Material, T.Mesh[]>();
  for (const child of group.children) if (child instanceof T.Mesh && !Array.isArray(child.material)) {
    const items = batches.get(child.material) ?? []; items.push(child); batches.set(child.material, items);
  }
  for (const [material, items] of batches) {
    if (items.length < 2) continue;
    const geometries = items.map(item => {
      item.updateMatrix();
      const geometry = item.geometry.index ? item.geometry.toNonIndexed() : item.geometry.clone();
      return geometry.applyMatrix4(item.matrix);
    });
    const merged = mergeGeometries(geometries, false);
    if (!merged) throw new Error('Não foi possível combinar a geometria estática.');
    for (const item of items) { group.remove(item); item.geometry.dispose(); }
    for (const geometry of geometries) geometry.dispose();
    mesh(group, merged, material);
  }
}
