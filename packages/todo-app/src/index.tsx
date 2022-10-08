/** @jsxImportSource realithy */
import { html, render, controllerView, innerView, repeat, eventData, EventArgs, Handler, Model, RenderResult, KeyOfType, Test } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { input, button, menu } from "mythikal";


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

    render(): RenderResult {
        return Item.view(this);
    }
}


class List implements Model {
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
            ${button(this, m => m.addNewItem(), {content: "Add" })}
            ${repeat(this.items)}
        </div>`;

    });

    // static template = template<List>`
    //     <div style="display: flex; flex-direction: column">
    //         ${inp({text: "newItemText"})}
    //         ${btn({onClick: m => m.addNewItem(), content: "Add"})}
    //         ${mnu({
    //             target: btn({onClick: m => m.toggle(), content: "Menu", root: m.targetRef}),
    //             items: props => []
    //         })}
    //         <span></span>
    //     </div>
    // `;

    render(): RenderResult {
        return List.view(this);
    }
}


// abstract class Template<T> {
//     abstract render(m: T): RenderResult;
// }

// class HtmlTemplate<T> extends Template<T> {
//     constructor(readonly strings: TemplateStringsArray, readonly values: TemplateExpression<T>[]) {
//         super();
//     }
    
//     render(m: T): RenderResult {
//         return html(this.strings, ...this.values.map(v => {
//             if (v instanceof HtmlTemplate)
//                 return v.render(m);
//             if (v instanceof Function) {
//                 const r = v(m);
//                 const render = (r as any).render;
//                 if (render) return render.call(r);
//                 return r;
//             }
//             return v;
//         }));
//     }
// }

// interface MnuProps<T> {
//     target: Template<Menu<T>>;
//     items: (props: unknown) => Template<T>[];
// }
// class MenuTemplate<T> extends Template<T> {
//     constructor(readonly props: MnuProps<T>) {
//         super();
//     }
//     menuTarget(m: T, props: { toggle: () => void; ref: unknown }) {
//         this.props.target(props).render(m)
//     }
//     render(m: T) {
//         return menu(m, {target:});
//     }
// }
// function mnu<T>(props: MnuProps<T>): Template<T> {
//     return {};
// }

// interface InpProps<T> {
//     text: KeyOfType<T, string>
// }
// class InputTemplate<T> extends Template<T> {
//     constructor(readonly props: InpProps<T>) { super(); }
//     render(m: T) {
//         return input(m, this.props.text);
//     }
// }
// function inp<T>(props:InpProps<T>): Template<T> {
//     return new InputTemplate(props);
// }

// interface BtnProps<T> {
//     onClick: (m: T) => void;
//     content: string;
//     root?: unknown;
// }
// class ButtonTemplate<T> extends Template<T> {
//     constructor(readonly props: BtnProps<T>) { super(); }
//     render(m: T) {
//         return button(m, this.props.onClick, {content: this.props.content, root: this.props.root});
//     }
// }
// function btn<T>(props: BtnProps<T>): Template<T> {
//     return new ButtonTemplate(props);
// }

// type TemplateExpression<T> = string | number | boolean | Template<T> | ((t: T) => string | number | boolean | Model);

// function template<T>(strings: TemplateStringsArray, ...values: TemplateExpression<T>[]): HtmlTemplate<T> {
//     return new HtmlTemplate<T>(strings, values);
// }

class KeyedTest {
    constructor(readonly parent: PageState) {
        this.id = ++KeyedTest.id;
    }
    id: number;
    static id = 0;

    static view = innerView<KeyedTest>(function render() {
        return html`${String(this.id)}`;
    });

    render(): RenderResult {
        return KeyedTest.view(this);
    }
}

class PageState implements Handler<typeof DropItem> {
    constructor() {
        this.k = new KeyedTest(this);
        makeObservable(this);
    }

    get parent() { return undefined; }

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

    @observable.ref
    k: KeyedTest;

    render() {
        return html`
        <div style="display: flex; flex-direction: column">
            ${this.test.render()}
            ${button(this, m => m.k = new KeyedTest(this), {content:"Change"})}
            ${this.k.render()}
            <div style="display: flex; flex-direction: row">
                ${this.list1.render()}
                ${this.list2.render()}
            </div>
        </div>`
    }
}

const Page = controllerView(PageState, 0) as () => RenderResult;

function App() {
    render(Page(), document.body);
}
App();
