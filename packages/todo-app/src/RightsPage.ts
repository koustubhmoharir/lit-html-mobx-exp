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

interface SpecificInfoIdentifier {
    rightName: string;
    keyColumnName: string;
    keyColumnValue: string;
}

const onSelectRefinedRight = Symbol();
const SelectRefinedRight = eventData<SpecificInfoIdentifier>().link(onSelectRefinedRight);

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

class UserGrantRow {
    constructor(readonly parent: GrantRights, readonly name: string, readonly email: string, readonly hasAccess: number) {        
    }

    static template = template<UserGrantRow>`
        <div class="${styles.gridCell}" style="text-align: center"><input type="checkbox"></div>
        <div class="${styles.gridCell}"><span>${bind(m => m.name)}</span></div>
        <div class="${styles.gridCell}"><span>${bind(m => m.email)}</span></div>
        <div class="${styles.gridCell}"><span>${bind(m => m.hasAccess)}</span></div>
    `
    
    render(): RenderResult {
        return UserGrantRow.template.render(this);
    }
}

class GrantRights {
    constructor(readonly parent: RightsPage_, readonly rightName: string, readonly keyColumnName: string, readonly keyColumnValue: string) {
        makeObservable(this);
        if (keyColumnName === "") {
            session.getRightsByRightName(rightName).then(r =>
                this.rows = r.UserGrants.map(ug => new UserGrantRow(this, `${ug.FirstName} ${ug.LastName}`, ug.Email, ug.OverallAccess))
            )
        }
        else { // TODO: There are empty rows in the result
            session.getRightsByKeyColumnValue(rightName, keyColumnName, keyColumnValue).then(r =>
                this.rows = r.UserGrants.map(ug => new UserGrantRow(this, `${ug.FirstName} ${ug.LastName}`, ug.Email, ug.OverallAccess))
            )
        }
    }

    @observable.ref
    rows: UserGrantRow[] = [];

    static template = template<GrantRights>`
    <div class="${styles.panel} ${styles.vertical}" style="padding: 0 0.5rem;">
        <h5>access ${If({
            condition: m => m.keyColumnName === "",
            content: template`to ${bind(m => m.rightName)} at global scope`,
            altContent: template`for ${bind(m => m.keyColumnName)} = ${bind(m => m.keyColumnValue)}`
        })}</h5>
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
        <div class="${styles.gridContainer}" style="grid-template-columns: repeat(4, auto [col-start]);">
            <div class="${styles.gridCell} ${styles.gridHeader}"><span>Select</span></div>
            <div class="${styles.gridCell} ${styles.gridHeader}"><span>Name</span></div>
            <div class="${styles.gridCell} ${styles.gridHeader}"><span>Email</span></div>
            <div class="${styles.gridCell} ${styles.gridHeader}"><span>Rights Granted</span></div>
            ${bindArray(m => m.rows)}
        </div>
    </div>
`
    
    render(): RenderResult {
        return GrantRights.template.render(this);
    }
}

class SpecificInfoRow {
    constructor(readonly parent: RefineRights, readonly id: string, readonly name: string, readonly description: string, readonly grantStatus: string, readonly internetAccess: string) {
        makeObservable(this);
    }

    @action
    selectRefinedRight() {
        SelectRefinedRight.dispatch(this, {
            rightName: this.parent.rightName,
            keyColumnName: this.parent.keyColumn,
            keyColumnValue: this.id
        });
    }

    static template = template<SpecificInfoRow>`
        <div class="${styles.gridCell}" @click=${handleEvent((_e, m) => m.selectRefinedRight())}><span>${bind(m => m.id)}</span></div>
        <div class="${styles.gridCell}"><span>${bind(m => m.name)}</span></div>
        <div class="${styles.gridCell}"><span>${bind(m => m.description)}</span></div>
        <div class="${styles.gridCell}"><span>${bind(m => m.grantStatus)}</span></div>
        <div class="${styles.gridCell}"><span>${bind(m => m.internetAccess)}</span></div>
    `
    
    render(): RenderResult {
        return SpecificInfoRow.template.render(this);
    }
}

class RefineRights {
    constructor(readonly parent: RightsPage_, readonly rightName: string, readonly keyColumn: string) {
        makeObservable(this);
        session.getRightsByKeyColumn(rightName, keyColumn).then(r => {
            this.rows = r.SpecificInfos.filter(s => s.ForUsers).map(s => new SpecificInfoRow(this, s.KeyColumnValue, s.DisplayValue1, s.DisplayValue2, `${s.RoleCount} ${s.UserCount}`, s.InternetAccess ?? ""))
        })
    }

    @observable.ref
    rows: SpecificInfoRow[] = [];

    static template = template<RefineRights>`
        <div class="${styles.panel} ${styles.vertical}" style="padding: 0 0.5rem; border-right: 1px solid lightgrey;">
            <h5>${bind(m => m.rightName)} by ${bind(m => m.keyColumn)}</h5>
            <div class="${styles.gridContainer}" style="grid-template-columns: repeat(5, auto [col-start]);">
                <div class="${styles.gridCell} ${styles.gridHeader}"><span>Id</span></div>
                <div class="${styles.gridCell} ${styles.gridHeader}"><span>Name</span></div>
                <div class="${styles.gridCell} ${styles.gridHeader}"><span>Description</span></div>
                <div class="${styles.gridCell} ${styles.gridHeader}"><span>Grant Status</span></div>
                <div class="${styles.gridCell} ${styles.gridHeader}"><span>Internet Access</span></div>
                ${bindArray(m => m.rows)}
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
                this.refineRights = new RefineRights(this, e.data.Name, e.data.KeyColumnName);
                this.grantRights = undefined;
            }
            else {
                this.refineRights = undefined;
                this.grantRights = new GrantRights(this, e.data.Name, "", "");
            }
        }
    }

    [onSelectRefinedRight](target: Model, e: EventArgs<SpecificInfoIdentifier>) {
        if (target instanceof SpecificInfoRow) {
            this.grantRights = new GrantRights(this, e.data.rightName, e.data.keyColumnName, e.data.keyColumnValue);
        }
    }

    @observable.ref
    refineRights?: RefineRights = new RefineRights(this, "", ""); // TODO: uninitialize

    @observable.ref
    grantRights?: GrantRights = new GrantRights(this, "", "", ""); // TODO: uninitialize

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