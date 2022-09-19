import { directive, Part } from "lit-html/directive.js";
import { PartInfo } from "lit-html/async-directive.js";
import { ReactiveDirective } from "./ReactiveDirective";

/** @internal */
export function trackDirective(syncDirective: any, skipUpdate?: (prevArgs: any[], args: any[]) => boolean) {
    const OrigDirectiveClass = (syncDirective() as any)["_$litDirective$"];

    class WrappedDirective extends ReactiveDirective<any[]> {
        constructor(partInfo: PartInfo) {
            super(partInfo);
            this.state = new OrigDirectiveClass(partInfo);
        }
        private state: any;
        render(...args: any[]) {
            return this.state.render.apply(this.state, args as any);
        }
        protected get renderCompleteCallback() { return undefined; }
        protected skipUpdate(oldArgs: any[], newArgs: any[]) { return skipUpdate?.(oldArgs, newArgs) ?? false; }
        protected updateActual(part: Part, args: any[]) {
            return this.state.update.call(this.state, part, args);
        }
    }
    
    return directive(WrappedDirective);
}
