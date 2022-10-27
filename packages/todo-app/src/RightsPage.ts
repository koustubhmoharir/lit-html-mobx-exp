import { html, RenderResult, template, bind, handleEvent, bindArray, makeReactiveLithComponent, ComponentTemplate, ReactiveLithComponent, Bindable, TemplateContent, HtmlTemplate, unbind, renderTemplateContent } from "realithy";
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

    static template = template<RightItem>`
        <div style="cursor: pointer;" @click=${handleEvent(() => alert("hi"))}>
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

    // TODO: Try to remove explicit type definition (introduced due to bindArray)
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
        this.items = hasKeyColumns ?
            _.entries(_.groupBy(rights, r => r.KeyColumnName)).map(e => new KeyColumnLevelRights(this, e[0], e[1])) :
            rights.map(r => new RightItem(this, r));
    }

    readonly hasKeyColumns: boolean;

    readonly displayName: string;

    readonly items: KeyColumnLevelRights[] | RightItem[];

    static template = template<TableLevelRights>`
        ${Expander({
            header: bind(m => m.displayName),
            // TODO: bindArray does not seem to handle union types
            // NOTE: the template wrapper is good to have for UI cleanliness
            content: template`<div>${bindArray(m => m.items as any[])}</div>`
        })}
    `
    
    render() {
        return TableLevelRights.template.render(this);
    }
}

class CentralContent {
}

class RightsPage_ implements ReactiveLithComponent<undefined, undefined, {}> {
    constructor(readonly parent: undefined, readonly parentView: undefined, readonly props: {}) {
        makeObservable(this);
        this.refresh();
    }

    readonly centralContent = new CentralContent();

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
                <div>Right panel or null</div>
            </div>
        </div>
    `;

    render() {
        return RightsPage_.template.render(this);
    }
}

export const rightsPageComp = makeReactiveLithComponent(RightsPage_);