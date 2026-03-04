/**
 * Jaccard-based proximity calculation for rubros.
 *
 * proximity(A, B) = |ancestors(A) ∩ ancestors(B)| / |ancestors(A) ∪ ancestors(B)|
 *                   + hierarchical bonus
 */

interface RubroNode {
  id: number;
  padres: number[];
}

export function getAncestors(id: number, rubrosMap: Map<number, RubroNode>): Set<number> {
  const ancestors = new Set<number>();
  const queue = [id];

  while (queue.length > 0) {
    const current = queue.pop()!;
    const rubro = rubrosMap.get(current);
    if (!rubro) continue;

    for (const padreId of rubro.padres) {
      if (!ancestors.has(padreId)) {
        ancestors.add(padreId);
        queue.push(padreId);
      }
    }
  }

  return ancestors;
}

export function jaccardSimilarity(setA: Set<number>, setB: Set<number>): number {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

export function calculateProximity(
  idA: number,
  idB: number,
  rubrosMap: Map<number, RubroNode>
): number {
  const ancestorsA = getAncestors(idA, rubrosMap);
  const ancestorsB = getAncestors(idB, rubrosMap);

  // Include self in ancestor sets for Jaccard
  ancestorsA.add(idA);
  ancestorsB.add(idB);

  const jaccard = jaccardSimilarity(ancestorsA, ancestorsB);

  // Hierarchical bonus: +0.20 if parent-child, +0.10 if siblings
  const rubroA = rubrosMap.get(idA);
  const rubroB = rubrosMap.get(idB);
  let bonus = 0;

  if (rubroA && rubroB) {
    const isParentChild = rubroA.padres.includes(idB) || rubroB.padres.includes(idA);
    if (isParentChild) {
      bonus = 0.2;
    } else {
      // Check siblings (share a parent)
      const sharedParent = rubroA.padres.some((p) => rubroB.padres.includes(p));
      if (sharedParent) {
        bonus = 0.1;
      }
    }
  }

  return Math.min(1.0, jaccard + bonus);
}
