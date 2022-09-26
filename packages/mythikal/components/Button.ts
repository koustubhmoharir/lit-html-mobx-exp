import { controllerView, html, ref, RenderResult } from "realithy";
import styles from "./Button.module.scss";
import "./Button.scss";
import { ComponentProps } from "./Component";

interface ButtonProps extends ComponentProps {
    content: string | (() => RenderResult);
    onClick: () => void;
}

class Button {
    render(props: ButtonProps) {
        return html`
        <button ${ref(props.root)} class="${styles.test} gtest" @click=${props.onClick}>
            ${typeof props.content === "function" ? props.content() : props.content}
        </button>`;
    }
}

export const button = controllerView(Button, 0) as (props: ButtonProps) => RenderResult;