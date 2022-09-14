export function jsx<Props>(comp: (props: Props) => unknown, props: Props) {
  return comp(props);
}
export const jsxs = jsx;
