import { RefOrCallback } from "lit-html/directives/ref";
import { bind, Bindable, ComponentTemplate, html, makeReactiveLithComponent, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, TemplateContent, unbind } from "realithy";
import styles from "./Dropdown.module.scss";
import { ComponentProps } from "./Component";
import { Menu1, Menu1Item } from "./Menu1";

// TODO: Replicate behaviour and expand API from current SK react implementation

interface DropdownProps<M, V> extends ComponentProps<M, V> {
    onClick: (m: M, v: V) => void;
    label: Bindable<M, V, string>;
    content?: TemplateContent<M, V>;
    root?: Bindable<M, V, RefOrCallback>;
}

class Dropdown_<M, V> implements ReactiveLithComponent<M, V, DropdownProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: DropdownProps<M, V>) {
    }
    handleEvent() {
        this.props.onClick?.(this.parent, this.parentView);
    }
    render() {
        const parent = this.parent;
        const parentView = this.parentView;
        const props = this.props;
        const content = props.content;
        const label = unbind(parent, parentView, props.label);
        const root = unbind(parent, parentView, props.root);
        const menuItems = Array(50).fill(0).map((_, i) => Menu1Item({ onClick: () => {}, content: `Item ${i + 1}` }));
        return html`
            ${Menu1({
                content: new ComponentTemplate({}, (_, v) => html`<input @focus=${() => (v as any).toggle()}>`),
                items: menuItems
            }).render(this, this)}
        `;
    }
}

const dropdownComp = makeReactiveLithComponent(Dropdown_);

export function Dropdown<M, V>(props: DropdownProps<M, V>): ComponentTemplate<M, V, DropdownProps<M, V>> {
    return new ComponentTemplate(props, dropdownComp);
}