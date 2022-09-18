/** @jsxImportSource realithy */
import { html, render, component, repeat, } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { Button } from "mythikal";

class Item {
    constructor(readonly parent: List, text: string, id?: number) {
        this.text = text;
        this.id = id ?? (Item.id++);
        makeObservable(this);
    }
    private static id = 0;
    readonly id: number;

    @observable
    text: string;
}

class List {
    constructor(readonly parent: State) {
        makeObservable(this);
    }

    @observable
    newItemText = "";
    @action.bound
    addNewItem() {
        if (!this.newItemText) return;
        this.addItem(this.newItemText);
        this.newItemText = "";
    }

    @action.bound
    onChangeNewText(text: string) {
        this.newItemText = text;
    }

    @action.bound
    addItem(text: string) {
        this.items.push(new Item(this, text));
    }

    @action.bound
    moveItem(item: Item, other: List, index: number) {
        const selfInd = this.items.indexOf(item);
        if (selfInd < 0) return;
        this.items.splice(selfInd, 1);
        other.items.splice(index, 0, new Item(other, item.text, item.id));
    }

    readonly items = observable.array([] as Item[], { deep: false });
}

class ListViewState {
    constructor({state}: {state: List}) {
        this.list = state;
    }
    private list: List;

    render({ state }: { state: List }) {
        return html`<div style="display: flex; flex-direction: column">
            <input .value=${state.newItemText} @input=${(e: any) => state.newItemText = e.target.value}></input>
            <button @click=${state.addNewItem}>Add</button>
            ${repeat(state.items, i => i.id, i => this.renderItem(i))}
        </div>`
    }

    dragStart(e: DragEvent, item: Item) {
        console.log(`Drag start: ${item.id}`);
        if (!e.dataTransfer) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text", String(item.id));
    }

    drop(e: DragEvent, onItem: Item) {
        e.preventDefault();
        const idStr = e.dataTransfer?.getData("text");
        console.log(`Dropped: ${idStr}`);
        if (!idStr) return;
        const id = Number(idStr);

        const listParent = this.list.parent;
        const item = listParent.getItemById(id);
        if (!item) return;
        const tList = listParent.list1 === item.parent ? listParent.list2 : listParent.list1;
        item.parent.moveItem(item, tList, tList.items.indexOf(onItem));
    }

    renderItem(item: Item) {
        return html`
        <div style="padding: 1rem" draggable="true"
            @dragstart=${(e: DragEvent) => this.dragStart(e, item)}
            @dragover=${(e: DragEvent) => e.preventDefault()}
            @drop=${(e: DragEvent) => this.drop(e, item)}
            >
            ${item.id} - ${item.text}
        </div>`;
    }
}

const ListView = component(ListViewState);

class State {
    constructor() {
        //makeObservable(this);
    }

    readonly list1 = new List(this);

    readonly list2 = new List(this);

    getItemById(id: number) {
        let item = this.list1.items.find(i => i.id === id);
        if (item) return item;
        item = this.list2.items.find(i => i.id === id);
        return item;
    }

    render() {
        return html`<div style="display: flex; flex-direction: row">
        ${<ListView state={this.list1}/>}
        ${<ListView state={this.list2}/>}
        </div>`
    }
}

const Comp = component(State);

function App() {
    render(html`${<Comp />}`, document.body);
}
App();