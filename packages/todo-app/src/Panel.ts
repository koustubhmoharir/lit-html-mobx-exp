import { html, makeReactiveLithComponent, ReactiveLithComponent, ComponentTemplate, TemplateContent, renderTemplateContent } from "realithy";
import { ComponentProps } from "mythikal/components/Component";

type Globals = "-moz-initial" | "inherit" | "initial" | "revert" | "unset";
type FlexDirectionProperty = Globals | "column" | "column-reverse" | "row" | "row-reverse";
type PanelDirection = "vertical" | "horizontal";

interface PanelProps<M, V> extends ComponentProps<M, V> {
    direction: PanelDirection;
    items: ReadonlyArray<TemplateContent<M, V>>;
}

class Panel_<M, V> implements ReactiveLithComponent<M, V, PanelProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: PanelProps<M, V>) {
        //makeObservable(this);
    }

    render() {
        const flexDirection: FlexDirectionProperty =
        this.props.direction === "vertical" ? "column" : "row";
        return html`
        <div style="display: flex; flex-direction: ${flexDirection}; align-content: flex-start;">
            ${
                this.props.items.map(item => renderTemplateContent(this.parent, this.parentView, item))
            }
        </div>
    `;
    }
}

const panelComp = makeReactiveLithComponent(Panel_);

export function Panel<M, V>(props: PanelProps<M, V>): ComponentTemplate<M, V, PanelProps<M, V>> {
    return new ComponentTemplate(props, panelComp);
}