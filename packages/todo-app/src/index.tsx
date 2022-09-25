/** @jsxImportSource realithy */
import { html, render, controllerView, innerView, repeat, eventData, EventArgs, Handler, Model } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { input, Button } from "mythikal";


interface DropItemData { itemId: number; }
const onDropItem = Symbol();
const DropItem = eventData<DropItemData>().link(onDropItem);

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

    @action.bound
    dropItem(id: number) {
        DropItem.dispatch(this, { itemId: id });
    }

    static view = innerView(
        function render(viewState) {
            console.log("render item: ", this.id);
            return html`
            <div style="padding: 1rem" draggable="true" @dragstart=${viewState.dragStart} @dragover=${viewState.dragOver}
                @drop=${viewState.drop}>
                ${this.id} - ${this.text}
            </div>`
        },
        class ItemViewState {
            constructor(readonly model: Item) { }

            dragStart = (e: DragEvent) => {
                console.log(`Drag start: ${this.model.id}`);
                if (!e.dataTransfer) return;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text", String(this.model.id));
            }

            dragOver = (e: DragEvent) => e.preventDefault();

            drop = (e: DragEvent) => {
                e.preventDefault();
                const idStr = e.dataTransfer?.getData("text");
                console.log(`Dropped: ${idStr}`);
                if (!idStr) return;
                const id = Number(idStr);
                this.model.dropItem(id);
            }
        }
    );

    render() {
        return Item.view(this);
    }
}


class List {
    constructor(readonly parent: PageState, readonly id: number) {
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
    moveItem(item: Item, index: number) {
        const pList = item.parent;
        const srcInd = pList.items.indexOf(item);
        pList.items.splice(srcInd, 1);
        this.items.splice(index, 0, pList === this ? item : new Item(this, item.text, item.id));
    }

    readonly items = observable.array([] as Item[], { deep: false });

    static view = innerView<List>(function render() {
        console.log("rendering List", this.id);
        return html`
        <div style="display: flex; flex-direction: column">
            ${input(this, "newItemText")}
            <button @click=${this.addNewItem}>Add</button>
            ${repeat(this.items)}
        </div>`;

    })

    render() {
        return List.view(this);
    }
}

class PageState implements Handler<typeof DropItem> {
    constructor() {
        //makeObservable(this);
    }

    get parent() { return undefined; }

    readonly list1 = new List(this, 1);

    readonly list2 = new List(this, 2);

    getItemById(id: number) {
        let item = this.list1.items.find(i => i.id === id);
        if (item) return item;
        item = this.list2.items.find(i => i.id === id);
        return item;
    }

    [onDropItem](target: Model, e: EventArgs<DropItemData>) {
        if (target instanceof Item) {
            const list = target.parent;
            const item = this.getItemById(e.data.itemId);
            if (!item) return;
            list.moveItem(item, list.items.indexOf(target));
        }
    }

    render() {
        return html`
        <div style="display: flex; flex-direction: row">
            ${this.list1.render()}
            ${this.list2.render()}
        </div>`
    }
}

const Page = controllerView(PageState);

function App() {
    render(html`${<Page  />}`, document.body);
}
App();
