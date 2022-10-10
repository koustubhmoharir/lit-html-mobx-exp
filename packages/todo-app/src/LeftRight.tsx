import { controllerView, html, makeObservable, observable, RenderResult, repeat } from "realithy";
import styles from "./LeftRight.module.scss";

//#region Wrapper
interface WrapperProps {
    child: RenderResult;
}
class Wrapper {
    render(props: WrapperProps) {
        return html`
        <div class=${styles.wrapper}>
            <i>This is a wrapper</i>
            <div class=${styles.child}>
                ${props.child}
            </div>
        </div>
        `;
    }
}
const wrapper = controllerView(Wrapper, 0) as (props: WrapperProps) => RenderResult; // TODO: do innerview in place of controllerView
//#endregion

//#region Row
class Row {
    constructor(serial: number, value: number) {
        this.serial = serial;
        this.value = value;
    }

    serial: number;
    value: number;

    render() {
        return html`
        <div>
            <i>Row ${this.serial}:</i> ${this.value}
        </div>
        `;
    }
}
//#endregion

//#region Clickable
interface ClickableProps {
    postClick?: (value: number) => void;
    postClear?: () => void;
}
class Clickable {
    constructor() {
        makeObservable(this);
    }

    @observable.ref // TODO: Use observable array only
    rows: Row[] = [];

    render(props: ClickableProps) {
        return html`
        <button @click=${() => { // TODO: Put out
            let rand = Math.trunc(Math.random() * 100);
            this.rows = [...this.rows, new Row(this.rows.length + 1, rand)];
            props.postClick?.(rand);
        }}>Add</button>
        <button @click=${() => { // TODO: Put out
            this.rows = [];
            props.postClear?.();
        }}>Clear</button>
        ${repeat(this.rows)}
        `;
    }
}
const clickable = controllerView(Clickable, 0) as (props: ClickableProps) => RenderResult; // TODO: This can't be a controller view
//#endregion

//#region TotalAndAverage
interface TotalAndAverageProps {
    valueArray: number[]
}
class TotalAndAverage {
    render(props: TotalAndAverageProps) {
        const total = props.valueArray.reduce((prev, num) => prev + num, 0);
        return html`
        <div>
            <div>Total: ${total}</div>
            <div>Average: ${Math.round(total / (props.valueArray.length || 1) * 100) / 100}</div>
        </div>
        `;
    }
}
const totalAndAverage = controllerView(TotalAndAverage, 0);
//#endregion

//#region LeftRight
class LeftRight { // TODO: Make state tree different from UI tree
    // TODO: Two properties (Not props) named left and right
    constructor() { // TODO: e.g. URL params are inputs to page
        makeObservable(this); // TODO: API response will have properties - process it to create state - use to create state tree
    }

    @observable.ref // TODO: Use observable arrays only
    valueArray: number[] = [];
    
    render() {
        return html`
        ${wrapper({ // UI components are leafs, won't be used in between
            child: wrapper({
                child: clickable({
                    postClick: v => this.valueArray = [...this.valueArray, v],
                    postClear: () => this.valueArray = [] })
            })
        })}
        <!-- NOTE: In the below line, the wrappers will also rerender -->
        ${wrapper({
            child: wrapper({
                child: totalAndAverage({
                    valueArray: this.valueArray
                })
            })
        })}
        `;
    }
}
// TODO: Make nesting in the state tree
export const leftRight = controllerView(LeftRight, 0) as () => RenderResult; // TODO: NOTE: ControllerView means view is coming from UI
//#endregion