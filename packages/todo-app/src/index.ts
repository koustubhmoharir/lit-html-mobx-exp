import { html, render, component } from "realithy";
import { observable, makeObservable, action } from "mobx";

class State {
    constructor() {
        makeObservable(this);
    }
    @observable
    name = "";

    @action.bound
    onChange(e: { target: { value: string } }) {
        this.name = e.target.value;
        App();
    }

    render(props: {}) {
        return html`<div>
<input @input=${this.onChange} .value=${this.name}>
<span>
Hello, ${this.name}</span>`
    }
}

const Comp = component(State);

function App() {
    render(html`${Comp({})}`, document.body);
}
App();