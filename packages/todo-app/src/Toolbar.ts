import { html, makeReactiveLithComponent, ReactiveLithComponent, ComponentTemplate, TemplateContent, renderTemplateContent } from "realithy";
import { ComponentProps } from "mythikal/components/Component";

interface ToolbarProps<M, V> extends ComponentProps<M, V> {
    items: ReadonlyArray<TemplateContent<M, V>>;
}

class Toolbar_<M, V> implements ReactiveLithComponent<M, V, ToolbarProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: ToolbarProps<M, V>) {
        //makeObservable(this);
    }

    render() {
        return html`
        <div style="position: relative; display: flex; align-items: center;">
            ${
                this.props.items.map(item => renderTemplateContent(this.parent, this.parentView, item))
            }
        </div>
    `;
    }
}

const toolbarComp = makeReactiveLithComponent(Toolbar_);

export function Toolbar<M, V>(props: ToolbarProps<M, V>): ComponentTemplate<M, V, ToolbarProps<M, V>> {
    return new ComponentTemplate(props, toolbarComp);
}