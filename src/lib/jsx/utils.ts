export function childrenToArray(children: any) {
  if (children == null) return [];

  return Array.isArray(children) ? children.flat(Infinity) : [children];
}
