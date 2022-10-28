import { html, RenderResult, template, bind, handleEvent, bindArray, makeReactiveLithComponent, ComponentTemplate, ReactiveLithComponent, Bindable, TemplateContent, HtmlTemplate, unbind, renderTemplateContent, If, eventData, Model, EventArgs } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { Button } from "mythikal";
import { ComponentProps } from "mythikal/components/Component";
import styles from "./RightsPage.module.scss";
import { SearchBox } from "./SearchBox";
import { getRights } from "./session";
import * as _ from "lodash";
import { Right } from "./AppModel";
import { ExpandLess, ExpandMore } from "./icons";
import { IconButton } from "./IconButton";

const onSelectRight = Symbol();
const SelectRight = eventData<Right>().link(onSelectRight);

const onSelectRefinedRight = Symbol();
const SelectRefinedRight = eventData<{}>().link(onSelectRefinedRight);

interface ExpanderProps<M, V> extends ComponentProps<M, V> {
    header: Bindable<M, V, string>;
    content: TemplateContent<M, V>;
}

class Expander_<M, V> implements ReactiveLithComponent<M, V, ExpanderProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: ExpanderProps<M, V>) {
        makeObservable(this);
    }

    @observable
    expanded = false;

    render() {
        const parent = this.parent;
        const parentView = this.parentView;
        const props = this.props;
        const content = props.content;
        const header = unbind(parent, parentView, props.header);
        return html`
            <div class="${styles.panel} ${styles.horizontal}" style="fill: grey;">
                ${IconButton({
                    icon: this.expanded ? ExpandLess : ExpandMore,
                    onClick: () => this.expanded = !this.expanded
                }).render(this, this)}
                <div style="padding-top: 0.313rem;">
                    <span style="font-size: 0.875rem; font-weight: 500; text-decoration: ${this.expanded ? "underline" : "none"};">${header}</span>
                </div>
            </div>
            <div style="padding: 0 0 0 2rem; display: ${this.expanded ? "block" : "none"}; transition: max-height 2s;">
                <div style="flex-grow: 1;">
                    ${renderTemplateContent(parent, parentView, content)}
                </div>
            </div>
        `;
    };
}

const expanderComp = makeReactiveLithComponent(Expander_);

export function Expander<M, V>(props: ExpanderProps<M, V>): ComponentTemplate<M, V, ExpanderProps<M, V>> {
    return new ComponentTemplate(props, expanderComp);
}

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

class GrantRights {
    constructor(readonly parent: RightsPage_) {
        
    }

    static template = template<GrantRights>`
    <div class="${styles.panel} ${styles.vertical}" style="padding: 0 0.5rem;">
        <h5>GrantRights Title</h5>
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
            GrantRights Table
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
                RefineRights Table
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
                this.grantRights = new GrantRights(this);
            }
        }
    }

    [onSelectRefinedRight](target: Model, _e: EventArgs<{}>) {
        if (target instanceof RefineRights) {
            this.grantRights = new GrantRights(this);
        }
    }

    @observable.ref
    refineRights?: RefineRights = new RefineRights(this); // TODO: uninitialize

    @observable.ref
    grantRights?: GrantRights = new GrantRights(this); // TODO: uninitialize

    refresh() {
        getRights().then(result => {
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