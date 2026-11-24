export function dependencyOrder(deps: Record<string, string[]>): string[] {
  const pending = new Map<string, Set<string>>();
  for (const [task, needs] of Object.entries(deps)) {
    pending.set(task, new Set(needs));
    for (const need of needs) if (!pending.has(need) && !(need in deps)) pending.set(need, new Set());
  }
  const order: string[] = [];
  while (pending.size) {
    const ready = [...pending]
      .filter(([, needs]) => needs.size === 0)
      .map(([task]) => task)
      .sort();
    if (!ready.length) throw new Error('dependency cycle');
    const next = ready[0];
    order.push(next);
    pending.delete(next);
    for (const needs of pending.values()) needs.delete(next);
  }
  return order;
}
