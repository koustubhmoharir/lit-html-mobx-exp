import { RenderResult, template, bind, handleEvent, bindArray, makeReactiveLithComponent, ReactiveLithComponent, HtmlTemplate, If, eventData, Model, EventArgs, Bindable, TemplateContent, unbind, html, renderTemplateContent, ComponentTemplate } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { Button } from "mythikal";
import styles from "./RightsPage.module.scss";
import { SearchBox } from "./SearchBox";
import * as session from "./session";
import * as _ from "lodash";
import { Right } from "./AppModel";
import { Expander } from "./Expander";
import { ComponentProps } from "mythikal/components/Component";

const onSelectRight = Symbol();
const SelectRight = eventData<Right>().link(onSelectRight);

const onSelectRefinedRight = Symbol();
const SelectRefinedRight = eventData<{}>().link(onSelectRefinedRight);

class RightItem { // NOTE: This is okay. Since this is leaf of state tree.
    constructor(readonly parent: TableLevelRights | KeyColumnLevelRights, readonly right: Right) {
        
    }

    @action
    selectRight() {
        SelectRight.dispatch(this, this.right);
    }

    /* NOTE:
    DOM events must be handled in the components relevant to them.
    e.g. use our button here instead of div.
    handleEvent should be used as last resort.
    DOM Events handling in state classes is anti pattern.
    Indicates something is missing in component library.
    */
   // TODO: Could have used button here but it introduces too many unwanted styles as of now
    static template = template<RightItem>`
        <div style="cursor: pointer;" @click=${handleEvent((_e, m) => m.selectRight())}>
            <span>${bind(m => m.right.Name)}</span>
            <p style="font-size: 0.875rem; color: grey">${bind(m => m.right.Description)}</p>
        </div>
    `

    render() {
        return RightItem.template.render(this);
    };
}

class KeyColumnLevelRights {
    constructor(readonly parent: TableLevelRights, name: string, rights: Right[]) {
        this.displayName = (name === "") ? "All" : `By ${name}`;
        this.items = rights.map(r => new RightItem(this, r));
    }

    readonly displayName: string;

    readonly items: RightItem[];

    static template = template<KeyColumnLevelRights>`
        ${Expander({
            header: bind(m => m.displayName),
            content: template`<div>${bindArray(m => m.items)}</div>`
        })}
    `

    // NOTE: Explicit type definition is okay for now
    render(): RenderResult {
        return KeyColumnLevelRights.template.render(this);
    }
}

class TableLevelRights { // NOTE: Ancestors can be accessed via events (see index for example).
    // NOTE: Try to keep constructors light, with minimal logic.
    // NOTE: Each child class should take readonly constructor argument for parent.
    constructor(readonly parent: RightsPage_, name: string, rights: Right[]) {
        const hasKeyColumns = this.hasKeyColumns = name !== ".";
        this.displayName = hasKeyColumns ? name : "Miscellaneous";
        if (hasKeyColumns)
            this.keyColumnItems = _.entries(_.groupBy(rights, r => r.KeyColumnName)).map(e => new KeyColumnLevelRights(this, e[0], e[1]));
        else
            this.rightItems = rights.map(r => new RightItem(this, r));
    }

    readonly hasKeyColumns: boolean;

    readonly displayName: string;

    // NOTE: This will be determined at runtime
    readonly keyColumnItems?: KeyColumnLevelRights[];
    readonly rightItems?: RightItem[];

    static template = template<TableLevelRights>`
        ${Expander({
            header: bind(m => m.displayName),
            // NOTE: bindArray does not seem to handle union types. However, the differenciation should be done at runtime.
            // NOTE: the template wrapper is good to have for UI cleanliness
            content: template`<div>${If({
                condition: m => m.hasKeyColumns,
                content: bindArray(m => m.keyColumnItems!),
                altContent: bindArray(m => m.rightItems!)
            })}</div>`
        })}
    `
    
    render(): RenderResult {
        return TableLevelRights.template.render(this);
    }
}

interface DataGridRowProps<M, V> extends ComponentProps<M, V> {
    index: Bindable<M, V, number>
}

class DataGridRow_<M, V> implements ReactiveLithComponent<M, V, DataGridRowProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: DataGridRowProps<M, V>) {
    }

    render() {
        const parent = this.parent;
        const parentView = this.parentView;
        const props = this.props;
        const index = unbind(parent, parentView, props.index)
        return html`
            <div class="${styles.gridCell}"><span>[ ]</span></div>
            <div class="${styles.gridCell}"><span>Abc Bcd ${index}</span></div>
            <div class="${styles.gridCell}"><span>Yes</span></div>
        `;
    };
}

const dataGridRowComp = makeReactiveLithComponent(DataGridRow_);

export function DataGridRow<M, V>(props: DataGridRowProps<M, V>): ComponentTemplate<M, V, DataGridRowProps<M, V>> {
    return new ComponentTemplate(props, dataGridRowComp);
}

interface DataGridProps<M, V> extends ComponentProps<M, V> {
    rows: TemplateContent<M, V>
}

class DataGrid_<M, V> implements ReactiveLithComponent<M, V, DataGridProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: DataGridProps<M, V>) {
    }

    render() {
        const parent = this.parent;
        const parentView = this.parentView;
        const props = this.props;
        return html`
            <div class="${styles.gridContainer}">
                <div class="${styles.gridCell}"><span>Select</span></div>
                <div class="${styles.gridCell}"><span>Name</span></div>
                <div class="${styles.gridCell}"><span>Rights Granted</span></div>
                ${renderTemplateContent(parent, parentView, props.rows)}
            </div>
        `;
    };
}

const dataGridComp = makeReactiveLithComponent(DataGrid_);

export function DataGrid<M, V>(props: DataGridProps<M, V>): ComponentTemplate<M, V, DataGridProps<M, V>> {
    return new ComponentTemplate(props, dataGridComp);
}

class GrantRights {
    constructor(readonly parent: RightsPage_, readonly rightName: string) {
        makeObservable(this);
        session.getRightsByRightName(rightName).then(r =>
            this.rows = r.UserGrants
        )
    }

    @observable.ref
    rows: Object[] = [];

    static template = template<GrantRights>`
    <div class="${styles.panel} ${styles.vertical}" style="padding: 0 0.5rem;">
        <h5>access to ${bind(m => m.rightName)}</h5>
        <div class="${styles.panel} ${styles.horizontal}">
            ${SearchBox({})}
            ${Button({
                label: "Grant",
                onClick: () => {}
            })}
            ${Button({
                label: "Delete",
                onClick: () => {}
            })}
            ${Button({
                label: "Deny",
                onClick: () => {}
            })}
        </div>
        <div>
            ${DataGrid({
                rows: template`
                    ${bind(m => m.rows.map((r, i) => DataGridRow({ index: i }).render(m, m)))}
                `
            })}
        </div>
    </div>
`
    
    render(): RenderResult {
        return GrantRights.template.render(this);
    }
}

class RefineRights {
    constructor(readonly parent: RightsPage_) {
        
    }

    @action
    selectRefinedRight() {
        SelectRefinedRight.dispatch(this, {});
    }

    static template = template<RefineRights>`
        <div class="${styles.panel} ${styles.vertical}" style="padding: 0 0.5rem; border-right: 1px solid lightgrey;">
            <h5>RefineRights Title</h5>
            <div @click=${handleEvent((_e, m) => m.selectRefinedRight())}>
                DataGrid
            </div>
        </div>
    `
    
    render(): RenderResult {
        return RefineRights.template.render(this);
    }
}

class RightsPage_ implements ReactiveLithComponent<undefined, undefined, {}> {
    constructor(readonly parent: undefined, readonly parentView: undefined, readonly props: {}) {
        makeObservable(this);
        this.refresh();
    }

    [onSelectRight](target: Model, e: EventArgs<Right>) {
        if (target instanceof RightItem) {
            if (e.data.KeyColumnName !== "") {
                this.refineRights = new RefineRights(this);
                this.grantRights = undefined;
            }
            else {
                this.refineRights = undefined;
                this.grantRights = new GrantRights(this, e.data.Name);
            }
        }
    }

    [onSelectRefinedRight](target: Model, _e: EventArgs<{}>) {
        if (target instanceof RefineRights) {
            this.grantRights = new GrantRights(this, ""); // TODO: remove empty string hack
        }
    }

    @observable.ref
    refineRights?: RefineRights = new RefineRights(this); // TODO: uninitialize

    @observable.ref
    grantRights?: GrantRights = new GrantRights(this, ""); // TODO: uninitialize

    refresh() {
        session.getRights().then(result => {
            const rights = result.Items as unknown as Right[];
            this.tableLevelRights = _.entries(_.groupBy(rights, r => r.SchemaName + "." + r.TableName)).map(e => new TableLevelRights(this, e[0], e[1]))
        });
    }

    matchRight = (r: Right) => {
        return r.Name.toLowerCase().includes(this.searchTextLower) || r.Description.toLowerCase().includes(this.searchTextLower);
    }

    @observable.ref
    tableLevelRights?: TableLevelRights[];

    @observable
    searchTextLower = "";

    static template: HtmlTemplate<RightsPage_, any> = template<RightsPage_>`
        <div class="${styles.panel} ${styles.vertical}" style="height: 100%;">
            <div class=${styles.toolbar}>
                <span>icon</span>
                <span>Rights Page</span>
                <span>Refresh button</span>
                <span style="flex:auto"></span>
                <span>minimize</span>
                <span>close</span>
            </div>
            <div class="${styles.panel} ${styles.horizontal}" style="overflow: auto;">
                <div class="${styles.panel} ${styles.vertical}" style="max-width: 250px; border-right: 1px solid lightgrey; padding: 0 0.5rem;">
                    ${SearchBox({})}
                    <div style="overflow: auto;">
                        ${
                            bindArray(m => m.tableLevelRights ?? []) // NOTE: avoid .map in UI
                        }
                    </div>
                </div>
                ${If({
                    condition: m => !!m.refineRights,
                    content: bind(m => m.refineRights)
                })}
                ${If({
                    condition: m => !!m.grantRights,
                    content: bind(m => m.grantRights)
                })}
            </div>
        </div>
    `;

    render() {
        return RightsPage_.template.render(this);
    }
}

export const rightsPageComp = makeReactiveLithComponent(RightsPage_);