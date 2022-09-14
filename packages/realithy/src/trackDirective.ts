import { directive } from "lit-html/directive.js";
import { AsyncDirective, PartInfo } from "lit-html/async-directive.js";
import { Reaction } from "mobx";

/** @internal */
export function trackDirective(syncDirective: any) {
  const OrigDirectiveClass = (syncDirective(
    undefined as any,
    undefined as any
  ) as any)["_$litDirective$"];

  class WrappedDirective extends AsyncDirective {
    constructor(partInfo: PartInfo) {
      super(partInfo);
      this.state = new OrigDirectiveClass(partInfo);
      this._connect();
    }
    private state: any;
    private reaction!: Reaction;
    private _connect() {
      this.reaction = new Reaction(this.constructor.name, this.rerender);
    }

    render(...args: any[]) {
      this.state.render.apply(this.state, args as any);
    }

    private _prevArgs!: any[];
    update(...args: any[]) {
      this._prevArgs = args;
      let result: any = undefined;
      this.reaction.track(() => {
        result = this.state.update.apply(this.state, args as any);
      });
      return result;
    }
    readonly rerender = () => {
      this.setValue(this.update.apply(this, this._prevArgs));
    };

    disconnected() {
      this.reaction.dispose();
    }
    reconnected() {
      this._connect();
    }
  }
  return directive(WrappedDirective);
}
