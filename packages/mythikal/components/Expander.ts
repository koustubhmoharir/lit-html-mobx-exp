import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { Bindable, ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, TemplateContent, unbind } from 'realithy';
import { ComponentProps } from './Component';
import styles from "./Expander.module.scss";
import stylesg from "./Global.module.scss";
import { IconButton } from './IconButton';
import { ExpandLess, ExpandMore } from './Icons';

interface ExpanderProps<M, V> extends ComponentProps<M, V> {
    header: Bindable<M, V, string>;
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
        const content = props.content;
        const header = unbind(parent, parentView, props.header);
        return html`
            <div class="${stylesg.panel} ${stylesg.horizontal}" style="fill: grey;">
                ${IconButton({
                    icon: this.expanded ? ExpandLess : ExpandMore,
                    onClick: () => this.expanded = !this.expanded
                }).render(this, this)}
                <div style="padding-top: 0.313rem;">
                    <span style="font-size: 0.875rem; font-weight: 500; text-decoration: ${this.expanded ? "underline" : "none"};">${header}</span>
                </div>
            </div>
            <div style="padding: 0 0 0 2rem; display: ${this.expanded ? "block" : "none"}; transition: max-height 2s;">
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