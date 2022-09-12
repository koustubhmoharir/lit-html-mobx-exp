/** @jsxRuntime classic */
/** @jsx ljsx */
import { html } from "lit-html";
import { action, makeObservable, observable } from "mobx";
import { Button } from "../components/Button";
import { component } from "../lib/component";
import { ljsx } from "../lib/ljsx";

class PageState {
  constructor() {
    makeObservable(this);
  }

  @observable
  disabled = false;

  @action.bound
  toggleEnabled() {
    this.disabled = !this.disabled;
  }

  render({ name }: { name: string }) {
    return html`<div>
      Hello ${name} ${(<Child pageState={this} />)}
      <p>The button is ${this.disabled ? "disabled" : "enabled"}</p>
    </div>`;
  }
}
export const Page = component(PageState);

class ChildState {
  constructor() {
    makeObservable(this);
  }

  @observable
  _counter = 0;

  @action.bound
  onClick() {
    this._counter++;
  }

  render({ pageState }: { pageState: PageState }) {
    return html`<div
      style="display:flex;flex-direction:column; align-items: flex-start"
    >
      ${(
        <Button
          text={pageState.disabled ? "Enable" : "Disable"}
          onClick={pageState.toggleEnabled}
        />
      )}
      ${(
        <Button
          text={`Click (${this._counter})`}
          onClick={this.onClick}
          rootAttributes={{ disabled: pageState.disabled }}
        />
      )}
    </div>`;
  }
}
const Child = component(ChildState);
