import { controllerView, html, KeyOfType, ref, RenderResult } from "realithy";
import { ComponentProps } from "./Component";

interface InputProps extends ComponentProps {
    className?: string;
}

type TextProperty<M> = KeyOfType<M, string>;

class Input<M> {
    constructor(private source: M, private textProperty: TextProperty<M>) {

    }

    render(props?: InputProps) {
        const onChange = (e: { target: { value: string } }) => {
            this.source[this.textProperty] = e.target.value as any;
        }

        const value = this.source[this.textProperty];
        return html`<input ${ref(props?.root)} .value=${value} @input=${onChange}></input>`;
    }
}

export const input: <M>(source: M, textProperty: TextProperty<M>, props?: InputProps) => RenderResult = controllerView(Input, 2);
