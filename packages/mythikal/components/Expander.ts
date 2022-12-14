import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, template, TemplateContent, unbind } from 'realithy';
import { ComponentProps } from './Component';
import styles from "./Expander.module.scss";
import stylesg from "./Global.module.scss";
import { IconButton } from './IconButton';
import { ExpandLess, ExpandMore } from './Icons';

// TODO: Control if content render on collapsed prop (boolean)

interface ExpanderProps<M, V> extends ComponentProps<M, V> {
    header: TemplateContent<M, V>;
    content: TemplateContent<M, V>;
}

class Expander_<M, V> implements ReactiveLithComponent<M, V, ExpanderProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: ExpanderProps<M, V>) {
        makeObservable(this);
    }

    @observable
    expanded = false;

    render() {
        const parent = this.parent;
        const parentView = this.parentView;
        const props = this.props;
        const header = props.header;
        const content = props.content;
        return html`
            <div class="${styles.expander} ${this.expanded ? styles.expanded : ""} ${stylesg.panel} ${stylesg.vertical}">
                <div class="${stylesg.panel} ${stylesg.horizontal}">
                    <div @click=${() => this.expanded = !this.expanded}>
                        ${ExpandMore}
                    </div>
                    ${renderTemplateContent(parent, parentView, header)}
                </div>
                ${renderTemplateContent(parent, parentView, content)}
            </div>
        `;
    };
}

const expanderComp = makeReactiveLithComponent(Expander_);

export function Expander<M, V>(props: ExpanderProps<M, V>): ComponentTemplate<M, V, ExpanderProps<M, V>> {
    return new ComponentTemplate(props, expanderComp);
}