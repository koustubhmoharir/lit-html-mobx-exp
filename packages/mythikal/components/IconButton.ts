import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing, TemplateResult } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, TemplateContent, unbind } from 'realithy';
import { ComponentProps } from './Component';

interface IconButtonProps<M, V> extends ComponentProps<M, V> {
    icon: TemplateResult<1>;
    onClick: () => void;
}

class IconButton_<M, V> implements ReactiveLithComponent<M, V, IconButtonProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: IconButtonProps<M, V>) {
        //makeObservable(this);
    }

    render() {
        return html`
            <button @click=${this.props.onClick} style="min-width: 2rem; background:none; border:none; margin:0; padding:0.25rem; cursor: pointer;">
                ${this.props.icon}
            </button>
        `;
    }
}

const iconButtonComp = makeReactiveLithComponent(IconButton_);

export function IconButton<M, V>(props: IconButtonProps<M, V>): ComponentTemplate<M, V, IconButtonProps<M, V>> {
    return new ComponentTemplate(props, iconButtonComp);
}
