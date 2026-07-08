/**
 * Gerador de escolhas determinístico por seed.
 * Dois vídeos com a mesma seed produzem o mesmo storyboard.
 * Sementes diferentes = câmeras, efeitos e transições diferentes.
 */
export class SeededRandom {
  private state: number;
  constructor(seed: number) {
    // Mulberry32
    this.state = seed >>> 0 || 1;
  }
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  pickN<T>(arr: readonly T[], n: number): T[] {
    const pool = [...arr];
    const out: T[] = [];
    while (out.length < n && pool.length > 0) {
      const i = Math.floor(this.next() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
