import { html } from "lit-html";
import { RefOrCallback } from "lit-html/directives/ref";
import { component } from "../lib/component";
import { ref } from "../lib/directives/ref";
import { spread } from "../lib/directives/spread";

interface ButtonProps {
  rootRef?: RefOrCallback;
  onClick?: () => void;
  rootAttributes?: Record<string, any>;
  text: string;
}

class ButtonState {
  //constructor(initialProps: ButtonProps) {
  //makeObservable(this);
  //}

  render(props: ButtonProps) {
    return html` <button
      @click=${props.onClick}
      ${ref(props.rootRef)}
      ${spread(props.rootAttributes)}
    >
      ${props.text}
    </button>`;
  }

  disconnected() {}

  reconnected() {}
}
export const Button = component(ButtonState);
