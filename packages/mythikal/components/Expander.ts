import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, template, TemplateContent, unbind } from 'realithy';
import { ComponentProps } from './Component';
import styles from "./Expander.module.scss";
import stylesg from "./Global.module.scss";
import { IconButton } from './IconButton';
import { ExpandLess, ExpandMore } from './Icons';

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
            <div class="${stylesg.panel} ${stylesg.horizontal}" style="fill: grey;">
                <div class="${styles.expander} ${this.expanded ? styles.expanded : ""}">
                    ${IconButton({
                        icon: ExpandMore,
                        onClick: () => this.expanded = !this.expanded
                    }).render(this, this)}
                </div>
                <div style="display: table;">
                    <div style="display:table-cell; vertical-align:middle;">
                        ${renderTemplateContent(parent, parentView, header)}
                    </div>
                </div>
            </div>
            <div class="${styles.expanderContent} ${this.expanded ? styles.expanded : ""}" style="padding: 0 0 0 2rem;">
                <div style="flex-grow: 1;">
                    ${renderTemplateContent(parent, parentView, content)}
                </div>
            </div>
        `;
    };
}

const expanderComp = makeReactiveLithComponent(Expander_);

export function Expander<M, V>(props: ExpanderProps<M, V>): ComponentTemplate<M, V, ExpanderProps<M, V>> {
    return new ComponentTemplate(props, expanderComp);
}