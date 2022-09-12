import { noChange, nothing } from "lit-html";
import {
  directive,
  Directive,
  DirectiveParameters,
  ElementPart,
  Part
} from "lit-html/directive";
import { unsafeStatic } from "lit-html/static";
import _ from "lodash";

class SpreadDirective extends Directive {
  prevProps = new Map();
  render(props: Record<string, any> | undefined) {
    if (!props) return nothing;
    return unsafeStatic(
      Object.entries(props)
        .filter(([k, v]) => v != null && v !== nothing && v !== false)
        .map(([k, v]) => (v === true ? k : `${k}="${_.escape(String(v))}"`))
        .join(" ")
    );
  }
  update(part: Part, [props]: DirectiveParameters<this>) {
    const newProps: Map<string, any> = new Map(Object.entries(props ?? {}));
    const element = (part as ElementPart).element;
    this.prevProps.forEach((v, k) => {
      const vn = newProps.get(k);
      if (vn == null || vn === nothing || vn === false)
        element.removeAttribute(k);
    });

    newProps.forEach((vn, k) => {
      const v = this.prevProps!.get(k);
      if (vn != null && vn !== nothing && v !== vn && vn !== false)
        element.setAttribute(k, vn === true ? "" : String(vn));
    });
    this.prevProps = newProps;
    return noChange;
  }
}
export const spread = directive(SpreadDirective);
