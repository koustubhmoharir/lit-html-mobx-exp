import { Bindable, ComponentTemplate, html, KeyOfType, makeReactiveLithComponent, ReactiveLithComponent, ref, RenderResult, unbind } from "realithy";
import { ComponentProps } from "./Component";

interface InputProps<M, V> extends ComponentProps<M, V> {
    value: Bindable<M, V, string>;
    onChange: (value: string, m: M, v: V) => void;
}
class Input_<M, V> implements ReactiveLithComponent<M, V, InputProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: InputProps<M, V>) { }

    handleEvent(event: InputEvent) {
        if (event.target)
            this.props.onChange?.((event.target as any).value, this.parent, this.parentView);
    }

    render() {
        const root = unbind(this.parent, this.parentView, this.props.root);
        const value = unbind(this.parent, this.parentView, this.props.value);
        return html`<input ${ref(root)} .value=${value} @input=${this}></input>`;
    }
}

const inputComp = makeReactiveLithComponent(Input_);

export function Input<M, V>(props: InputProps<M, V>): ComponentTemplate<M, V, InputProps<M, V>> {
    return new ComponentTemplate(props, inputComp);
}
