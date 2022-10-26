import { html, render, repeat, eventData, EventArgs, Handler, Model, RenderResult, template, bind, handleEvent, bindArray, makeReactiveLithComponent, If, ComponentTemplate, ReactiveLithComponent } from "realithy";
import { observable, makeObservable, action } from "mobx";
import { Input, Button, Menu, MenuItem } from "mythikal";
import { Toolbar } from "./Toolbar";
import { Panel } from "./Panel";
import { ComponentProps } from "mythikal/components/Component";
import styles from "./RightsPage.module.scss";
import { SearchBox } from "./SearchBox";
import { getRights } from "./session";
import * as _ from "lodash";
import { KeyColumnRights, Right, TableRights } from "./AppModel";
import { ExpandLess, ExpandMore } from "./icons";
import { IconButton } from "./IconButton";
import { nothing } from "lit-html";

interface ParentProps<M, V> extends ComponentProps<M, V> {
    header: string;
    headerKey: string;
    children: ComponentTemplate<any, any, any>[];
}

class Parent_<M, V> implements ReactiveLithComponent<M, V, ParentProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: ParentProps<M, V>) {
        makeObservable(this);
    }

    @observable
    expanded = false;

    render() {
        return html`
            <div class="${styles.panel} ${styles.horizontal}" style="fill: grey;">
                ${IconButton({
                    icon: this.expanded ? ExpandLess : ExpandMore,
                    onClick: () => this.expanded = !this.expanded
                }).render(this, this)}
                <div style="padding-top: 0.313rem;">
                    <span style="font-size: 0.875rem; font-weight: 500; text-decoration: ${this.expanded ? "underline" : "none"};">${this.props.header}</span>
                </div>
            </div>
            <div style="padding: 0 0 0 2rem; display: ${this.expanded ? "block" : "none"}; transition: max-height 2s;">
                <div style="flex-grow: 1;">
                    ${this.props.children?.map(c => c.render(this, this))}
                </div>
            </div>
        `;
    };
}

const parentComp = makeReactiveLithComponent(Parent_);

export function Parent<M, V>(props: ParentProps<M, V>): ComponentTemplate<M, V, ParentProps<M, V>> {
    return new ComponentTemplate(props, parentComp);
}

interface RightItemsProps<M, V> extends ComponentProps<M, V> {
    rights: Right[];
}

class RightItems_<M extends RightsPage_, V> implements ReactiveLithComponent<M, V, RightItemsProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: RightItemsProps<M, V>) {
        //makeObservable(this);
    }

    render() {
        return html`
            ${
                this.props.rights.map(r => html`
                    <div style="cursor: pointer;" @click=${() => alert("hi")}>
                        <span>${r.Name}</span>
                        <p style="font-size: 0.875rem; color: grey">${r.Description}</p>
                    </div>
                `)
            }
        `;
    };
}

const rightItemsComp = makeReactiveLithComponent(RightItems_);

export function RightItems<M extends RightsPage_, V>(props: RightItemsProps<M, V>): ComponentTemplate<M, V, RightItemsProps<M, V>> {
    return new ComponentTemplate(props, rightItemsComp);
}

interface KeyColumnLevelRights {
    name: string;
    items: Right[];
}

interface ITableLevelRights {
    name: string;
    items: KeyColumnLevelRights[] | Right[];
}

class TableLevelRights {
    constructor(readonly name: string, items: KeyColumnLevelRights[] | Right[]) {

    }

    static template = template<TableLevelRights>`
        <div>
            ${bind(m => m.name)}
        </div>
    `

    render() {
        return TableLevelRights.template.render(this);
    }
}

class RightsNavigation {
    constructor(rights: Right[]) {

        this.tableLevelRights = _.entries(_.groupBy(rights, r => r.SchemaName + "." + r.TableName)).map(e => {
            if (e[0] === ".") return new TableLevelRights("Miscellaneous", e[1]);
            return new TableLevelRights(e[0], _.entries(_.groupBy(e[1], r => r.KeyColumnName)).map(e => {
                    return {
                        name: e[0] === "" ? "All" : `By ${e[0]}`,
                        items: e[1]
                    }
                }))
            })
        console.log(this.tableLevelRights);

        makeObservable(this);

        _.groupBy(rights, r => r.SchemaName + "." + r.TableName)

        this._rightsByTableColumn = _.mapValues(
            _.groupBy(rights, r => r.SchemaName + "." + r.TableName),
            (tr, _tn): TableRights => {
                let searchCount = 0;
                return observable.object({
                    byColumn: _.mapValues(
                        _.groupBy(tr, r => r.KeyColumnName),
                        (cr, _cn): KeyColumnRights => {
                            const searchResults = this.searchTextLower ? cr.filter(this.matchRight) : cr;
                            searchCount += searchResults.length;
                            return observable.object({
                                rights: cr,
                                isExpanded: false,
                                isSearchExpanded: false,
                                searchResults: searchResults
                            }, {}, { deep: false })
                        }
                    ),
                    isExpanded: false,
                    isSearchExpanded: false,
                    searchResultCount: this.searchTextLower ? searchCount : undefined
                }, {}, {deep: false});
            });
    }

    matchRight = (r: Right) => {
        return r.Name.toLowerCase().includes(this.searchTextLower) || r.Description.toLowerCase().includes(this.searchTextLower);
    }

    tableLevelRights: TableLevelRights[];

    @observable
    searchTextLower = "";

    @observable.ref
    private _rightsByTableColumn: _.Dictionary<TableRights> = {};
    get rightsByTableColumn() { return this._rightsByTableColumn; }

    static template1 = template<RightsNavigation>`
        ${
            bind(m => _.map(m.rightsByTableColumn, (tr, tn) => {
                const name: string = tn == "." ? "Miscellaneous" : tn;
                if (tr.searchResultCount === 0) return null;
                return (
                    html`
                        ${Parent({
                            header: name,
                            headerKey: name,
                            children: _.map(tr.byColumn, (cr, cn) => {
                                if (cr.searchResults?.length === 0) return Parent({
                                    header: "nothing",
                                    headerKey: "nothing",
                                    children: [Button({label: "Nothing", onClick: () => {}})]
                                });
                                const columnName = cn ? ("By " + cn) : "All";
                                if (tn == ".") return RightItems({
                                    rights: cr.searchResults!
                                });
                                return (
                                    Parent({
                                        header: columnName,
                                        headerKey: columnName,
                                        children: [RightItems({
                                            rights: cr.searchResults!
                                        })]
                                    })
                                )
                            })
                        }).render(this, this)}
                    `
                )
            }))
        }
    `;

    static template = template<RightsNavigation>`
        ${
            bind(m => m.tableLevelRights.map(r => r.render()))
        }
    `

    render() {
        return RightsNavigation.template.render(this);
    }
}

class CentralContent {
}

class RightsPage_ implements ReactiveLithComponent<undefined, undefined, {}> {
    constructor(readonly parent: undefined, readonly parentView: undefined, readonly props: {}) {
        makeObservable(this);
        this.refresh();
    }

    @observable.ref
    rightsNavigation = new RightsNavigation([]); // TODO: leaving it uninitialized gives mobx exception

    readonly centralContent = new CentralContent();

    refresh() {
        getRights().then(result => {
            const rights = result.Items as unknown as Right[];
            this.rightsNavigation = new RightsNavigation(rights);
        });
    }

    static template = template<RightsPage_>`
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
                        ${html``/*RightsList({})*/}
                        ${bind(m => m.rightsNavigation == undefined ? nothing : m.rightsNavigation.render())}
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