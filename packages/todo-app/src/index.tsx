/** @jsxImportSource realithy */
import { html, render, component, } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { Button } from "mythikal";

class State {
    constructor() {
        makeObservable(this);
    }
    @observable
    name = "";

    @observable
    dispName = "";

    @action.bound
    onChange(e: { target: { value: string } }) {
        this.name = e.target.value;
        App();
    }

    @action.bound
    onUpdate() {
        this.dispName = this.name;
    }

    render(props: { i: number }) {
        return html`<div>
<input @input=${this.onChange} .value=${this.name}>
${<Button text="Update" onClick={this.onUpdate}/>}
<span>
Hello, ${this.dispName}</span>`
    }
}

const Comp = component(State);

function App() {
    render(html`${<Comp i={1} />}`, document.body);
}
App();