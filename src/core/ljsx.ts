export function ljsx<Props>(comp: (props: Props) => void, props: Props) {
  return comp(props);
}
