import { noChange } from "lit-html";
import { AsyncDirective, Part, PartInfo } from "lit-html/async-directive.js";
import { Reaction } from "mobx";
import { pushCompleteRenderCallback, renderInContext } from "./render";

/** @internal */
export abstract class ReactiveDirective<Args extends any[]> extends AsyncDirective {
    constructor(partInfo: PartInfo) {
        super(partInfo);
        this._connect();
    }
    private reaction!: Reaction;
    private _connect() {
        this.reaction = new Reaction(this.constructor.name, this.rerender);
    }
    private _part?: Part;
    private _args?: Args;
    abstract render(...args: Args): unknown;
    protected updateActual(_part: Part, args: Args) {
        return this.render.apply(this, args);
    }
    
    update(part: Part, args: Args) {
        const oldPart = this._part;
        const oldArgs = this._args;
        this._part = part;
        this._args = args;
        if (oldPart) {
            if (part !== oldPart) {
                console.log("part changed"); // TODO: When does this occur?
            }

            if (this.skipUpdate(oldArgs!, args))
                return noChange;
        }
        return this.updateReactive();
    }
    protected skipUpdate(oldArgs: Args, newArgs: Args) { return false; }
    protected abstract get renderCompleteCallback(): (() => void) | undefined;
    protected updateReactive() {
        const rc = this.renderCompleteCallback;
        if (rc) {
            pushCompleteRenderCallback(rc);
        }
        let result;
        this.reaction.track(() => {
            result = this.updateActual(this._part!, this._args!);
        });
        return result;
    }
    readonly rerender = () => {
        renderInContext(() => this.setValue(this.updateReactive()));
    };

    disconnected() {
        this.reaction.dispose();
    }
    reconnected() {
        this._connect();
    }
}