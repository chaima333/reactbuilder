
export type PathSegment = string | number;
export type Path = PathSegment[];

export const samePath = (a: Path, b: Path): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const isAncestorPath = (ancestor: Path, node: Path): boolean => {
  if (ancestor.length >= node.length) return false;
  for (let i = 0; i < ancestor.length; i++) {
    if (ancestor[i] !== node[i]) return false;
  }
  return true;
};

export const isDirectChildPath = (parent: Path, child: Path): boolean => {
  return parent.length + 1 === child.length && isAncestorPath(parent, child);
};

export const parentPath = (path: Path): Path => {
  return path.length > 0 ? path.slice(0, -1) : [];
};

export const pathDepth = (path: Path): number => {
  return path.length;
};

export const commonPrefixLength = (a: Path, b: Path): number => {
  const limit = Math.min(a.length, b.length);
  let i = 0;
  while (i < limit && a[i] === b[i]) i++;
  return i;
};

export const pathDistance = (a: Path, b: Path): number => {
  const prefix = commonPrefixLength(a, b);
  return a.length + b.length - 2 * prefix;
};