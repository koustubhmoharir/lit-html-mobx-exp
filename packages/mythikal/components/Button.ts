import { component, html } from "realithy";

interface ButtonProps {
    text: string;
    onClick: () => void;
}

class ButtonState {
    render(props: ButtonProps) {
        return html`<button @click=${props.onClick}>${props.text}</button>`;
    }
}

export const Button = component(ButtonState);