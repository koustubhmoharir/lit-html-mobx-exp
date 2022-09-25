import { controllerView, html } from "realithy";
import styles from "./Button.module.scss";
import "./Button.scss";

interface ButtonProps {
    text: string;
    onClick: () => void;
}

class ButtonState {
    render(props: ButtonProps) {
        return html`<button class="${styles.test} gtest" @click=${props.onClick}>${props.text}</button>`;
    }
}

export const Button = controllerView(ButtonState, 0);