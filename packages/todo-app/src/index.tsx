/** @jsxImportSource realithy */
import { html, render, repeat, eventData, EventArgs, Handler, Model, RenderResult, template, bind, handleEvent, bindArray, makeReactiveLithComponent, If } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { Input, Button, Menu, MenuItem } from "mythikal";

interface DropItemData { itemId: number; }
const onDropItem = Symbol();
const DropItem = eventData<DropItemData>().link(onDropItem);

class DraggableDiv {

}

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

    @action
    dropItem(id: number) {
        DropItem.dispatch(this, { itemId: id });
    }

    @action
    dragStart(e: DragEvent) {
        console.log(`Drag start: ${this.id}`);
        if (!e.dataTransfer) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text", String(this.id));
    }

    @action
    drop(e: DragEvent) {
        e.preventDefault();
        const idStr = e.dataTransfer?.getData("text");
        console.log(`Dropped: ${idStr}`);
        if (!idStr) return;
        const id = Number(idStr);
        this.dropItem(id);
    }

    static template = template<Item>`
        <div style="padding: 1rem" draggable="true" @dragstart=${handleEvent((e, m) => m.dragStart(e as DragEvent))} @dragover=${handleEvent(e => e.preventDefault())}
            @drop=${handleEvent((e, m) => m.drop(e as DragEvent))}>
            ${bind(m => m.id)} - ${bind(m => m.text)}
        </div>
    `.displayName("Item");

    render(): RenderResult {
        return Item.template.render(this);
    }
}


class List implements Model {
    constructor(readonly parent: PageState, readonly id: number) {
        makeObservable(this);
    }

    @observable
    newItemText = "";
    @action
    addNewItem() {
        if (!this.newItemText) return;
        this.addItem(this.newItemText);
        this.newItemText = "";
    }

    @action
    onChangeNewText(text: string) {
        this.newItemText = text;
    }

    @action
    addItem(text: string) {
        this.items.push(new Item(this, text));
    }

    @action
    moveItem(item: Item, index: number) {
        const pList = item.parent;
        const srcInd = pList.items.indexOf(item);
        pList.items.splice(srcInd, 1);
        this.items.splice(index, 0, pList === this ? item : new Item(this, item.text, item.id));
    }

    readonly items = observable.array([] as Item[], { deep: false });

    static template = template<List>`
        <div style="display: flex; flex-direction: column">
            ${Input({value: bind(m => m.newItemText), onChange: (value, m) => m.newItemText = value })}
            ${Button({onClick: m => m.addNewItem(), label: "Add"})}
            ${bindArray(m => m.items)}
        </div>
    `.displayName("List");

    render(): RenderResult {
        return List.template.render(this);
    }
}


class Test {
    constructor() {
        for (let index = 0; index < 5; index++) {
            this.options.push(String(Math.random()));
        }
        this.selectedOption = this.options[0];
        makeObservable(this);
    }

    @observable
    counter = 0;

    @observable
    step = 1;

    @observable
    showButton = true;

    @observable
    options = observable.array([] as string[]);

    @observable
    selectedOption = "";

    @action
    increment() {
        this.counter += this.step;
        const i = Math.round(Math.random() * this.options.length + 2);
        if (i >= this.options.length || this.options.length < 3)
            this.options.push(String(Math.random()));
        else if (i < 2)
            this.options.splice(i, 1);
        else
            this.options[i] = String(Math.random());
    }

    static template = template<Test>`
        <div>
            <span>Click count is:</span>
            <span>${bind(m => m.counter)}</span>
            <br>
            ${Button({
                onClick: m => m.showButton = !m.showButton,
                label: bind(m => m.showButton ? "Hide Increment" : "Show Increment")
            })}
            ${If({
                condition: m => m.showButton,
                content: Button({ onClick: m => m.increment(), label: "Increment" })
            })}
            <br>
            <span>Increment by: </span>
            ${Menu({
                content: Button({ label: bind(m => String(m.step)), onClick: (_, v) => v.toggle(), root: bind((_, v) => v.contentRef) }),
                items: [1, 2, 3].map(i => 
                    MenuItem({ content: String(i), onClick: m => m.step = i })
                )
            })}
            <br>
            <span>Random options (generated on each increment): </span>
            ${Menu<Test, any, string>({
                content: Button({ label: bind(m => m.selectedOption || "(None)"), onClick: (_, v) => v.toggle(), root: bind((_, v) => v.contentRef) }),
                items: repeat(m => m.options, MenuItem({ content: bind(item => item.value), onClick: item => item.parent.selectedOption = item.value }))
            })}
        </div>
    `.displayName("Test");

    render() {
        return Test.template.render(this);
    }
}

class PageState implements Handler<typeof DropItem> {
    constructor(readonly parent: undefined, readonly parentView: undefined, readonly props: undefined) {
        //makeObservable(this);
    }

    readonly list1 = new List(this, 1);

    readonly list2 = new List(this, 2);

    readonly test = new Test();

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
        <div style="display: flex; flex-direction: column">
            ${this.test.render()}
            <div style="display: flex; flex-direction: row">
                ${this.list1.render()}
                ${this.list2.render()}
            </div>
        </div>`
    }
}

const Page = makeReactiveLithComponent(PageState) as unknown as () => RenderResult;

function App() {
    render(Page(), document.body);
}
App();
