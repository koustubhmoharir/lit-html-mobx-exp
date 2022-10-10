import { noChange } from "lit-html";
import { AsyncDirective, Part, PartInfo } from "lit-html/async-directive.js";
import { Reaction } from "mobx";
import { pushCompleteRender, renderInContext, RenderResult } from "./render";

interface LifecycleMethods {
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}

/** @internal */
export abstract class ReactiveLithDirective<RenderArgs extends unknown[]> extends AsyncDirective {
    constructor(partInfo: PartInfo) {
        super(partInfo);
        this._rerender = this._rerender.bind(this);
    }
    private _reaction?: Reaction;
    protected _connect() {
        this._reaction = new Reaction(this.displayName, this._rerender);
    }
    protected _part?: Part;
    protected _isDirty: boolean | undefined = undefined;
    abstract get displayName(): string;
    abstract storeArgs(args: RenderArgs): void;
    abstract haveArgsChanged(args: RenderArgs): boolean;
    abstract renderUntracked(): RenderResult;
    get lifecycleMethods(): LifecycleMethods | undefined { return undefined; };
    render(...args: RenderArgs) {
        if (this._isDirty === undefined || this.haveArgsChanged(args))
            this.storeArgs(args);
        this.renderUntracked();
    }
    update(part: Part, args: RenderArgs) {
        if (this._part && part !== this._part) {
            throw new Error("part changed"); // TODO: When does this occur?
        }
        this._part = part;
        const first = this._isDirty === undefined;
        this._isDirty = first || this.haveArgsChanged(args);
        if (this._isDirty) {
            if (!first)
                this.lifecycleMethods?.disconnected?.();
            this.storeArgs(args);
        }
        if (!this.isConnected)
            return noChange;
        if (first)
            this._connect();
        if (this._isDirty)
            return this.updateReactive();
        return noChange;
    }

    protected updateReactive() {
        this._isDirty = false;
        const lm = this.lifecycleMethods;
        if (lm?.renderCompleted) {
            pushCompleteRender(lm);
        }
        let result;
        this._reaction!.track(() => {
            result = this.renderUntracked();
        });
        return result;
    }
    private _rerender() {
        if (!this.isConnected) {
            this._isDirty = true;
            return;
        }
        this._rerenderActual();
    }
    private _rerenderActual() {
        renderInContext(this._updateValue, this);
    }
    private _updateValue() {
        this.setValue(this.updateReactive())
    }

    disconnected() {
        this.lifecycleMethods?.disconnected?.();
        this._reaction?.dispose();
        this._reaction = undefined;
    }
    reconnected() {
        this._connect();
        this.lifecycleMethods?.reconnected?.();
        if (this._isDirty) this._rerenderActual();
    }
}