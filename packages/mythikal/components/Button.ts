import { controllerView, html, ref, RenderResult } from "realithy";
import styles from "./Button.module.scss";
import "./Button.scss";
import { ComponentProps } from "./Component";

interface ButtonProps extends ComponentProps {
    content: string | (() => RenderResult);
}

class Button<M> {
    constructor(private source: M, private onClick: (m: M) => void) {

    }
    handleEvent() {
        this.onClick(this.source);
    }
    render(props?: ButtonProps) {
        return html`
        <button ${ref(props?.root)} class="${styles.test} gtest" @click=${this}>
            ${typeof props?.content === "function" ? props.content() : props?.content}
        </button>`;
    }
}

export const button: <M>(source: M, onClick: (m: M) => void, props?: ButtonProps) => RenderResult = controllerView(Button, 2);