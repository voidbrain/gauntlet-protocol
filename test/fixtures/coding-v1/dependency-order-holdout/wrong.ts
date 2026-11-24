export function dependencyOrder(deps: Record<string, string[]>): string[] {
  // Seeded defects: leaves out dependencies that are not keys and returns a partial order on a cycle instead of throwing.
  const order: string[] = [];
  const keys = Object.keys(deps).sort();
  for (let round = 0; round < keys.length; round++)
    for (const task of keys)
      if (!order.includes(task) && deps[task].every((need) => order.includes(need) || !(need in deps)))
        order.push(task);
  return order;
}
