import { Ref } from "lit-html/directives/ref";
import { controllerView, html, ref, RenderResult } from "realithy";
import styles from "./Button.module.scss";
import "./Button.scss";
import { ComponentProps } from "./Component";

interface ClickAwayListenerProps extends ComponentProps {
    content: () => RenderResult;
    onClickAway: () => unknown;
    nodeRef: Ref<Element>;
}

class ClickAwayListener {
    constructor() {
        this.addListeners();
    }
    
    nodeRef?: Ref<Element>;
    onClickAway?: () => unknown;

    handleClickAway = (e: Event) => {
        if (this.nodeRef?.value && (e.composedPath().indexOf(this.nodeRef.value) === -1)) {
            this.onClickAway?.();
        }
    }

    events = ['click', 'touchend']; // TODO: What about ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup']
    addListeners() {
        setTimeout(() => { // To ensure the triggering event is not unintentionally listened to
            this.events.forEach(e => {
                document.addEventListener(e, this.handleClickAway);
            }, 0);
        });
    }
    removeListeners() {
        this.events.forEach(e => {
            document.removeEventListener(e, this.handleClickAway);
        })
    }

    render(props: ClickAwayListenerProps) {
        this.nodeRef = props.nodeRef;
        this.onClickAway = props.onClickAway;
        return html`${props.content()}`
    }

    reconnected() {
        this.addListeners();
    }

    disconnected() {
        this.removeListeners();
    }
}

export const clickAwayListener = controllerView(ClickAwayListener, 0) as (props: ClickAwayListenerProps) => RenderResult;