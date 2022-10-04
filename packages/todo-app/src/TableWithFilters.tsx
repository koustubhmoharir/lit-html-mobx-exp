import { controllerView, html, makeObservable, observable, RenderResult, repeat } from "realithy";
import { action } from "mobx";
import styles from "./TableWithFilters.module.scss";

interface TableWithFiltersProps<T> {
    items: { [key in keyof T]: string | number }[];
}

class TableWithFilters<T> {

    filterMap = observable.map<string, string>({});

    @action.bound
    onInputFilter(e: InputEvent, key: string) {
        this.filterMap.set(key, (e.target as HTMLInputElement).value);
    }

    @action.bound
    filterLambda(item: { [key in keyof T]: string | number; }, keys: string[]) {
        return keys.reduce((prev, key) => prev && item[key as keyof T].toString().toLowerCase().includes(this.filterMap.get(key)?.toLowerCase() ?? ""), true);
    }

    render(props: TableWithFiltersProps<T>) {
        const keys = props.items.length > 0 ? Object.keys(props.items[0]) : [];
        return html`
            <u>Table with filters</u>
            <!-- NOTE: Local class names are changed at runtime -->
            <table class=${styles.mainTable}>
                <thead>
                    <tr>
                        ${
                            keys.map(key => html`
                            <th>
                                <div>${key}</div>
                                <input @input=${(e: InputEvent) => this.onInputFilter(e, key)}>
                            </th>
                            `)
                        }
                    </tr>
                </thead>
                <tbody>
                    ${ // TODO: In repeat directive, filter and map won't work, as the objects would get freshly created. To find a working solution.
                    // datagrid row - dg - array of dg row
                    // create new filtered list
                    // WPF - dataview like abstraction
                        props.items
                        .filter(item => this.filterLambda(item, keys)) // filtering on richer item
                        .map(item => html`
                        <tr>
                            ${
                                keys.map(key => html`
                                <td>${item[key as keyof T]}</td>
                                `)
                            }
                        </tr>
                        `)
                    }
                </tbody>
            </table>
        `;
    }
}

export const tableWithFilters: <T>(props: TableWithFiltersProps<T>) => RenderResult = controllerView(TableWithFilters, 0);

interface TableRow {
    satisfiesFilter: (getter: (key: string) => string) => boolean;
    render: () => unknown;
}

export class CustomTableRow implements TableRow {
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    satisfiesFilter(getter: (key: string) => string) {
        return this.id.toString().includes(getter("id").toLowerCase()) && this.name.toLowerCase().includes(getter("name").toLowerCase());
    }

    private id: number;
    private name: string;

    render() {
        return html`
        <tr>
            <td>${this.id}</td>
            <td>${this.name}</td>
        </tr>
        `
    }
}

interface TableWithFilters2Props {
    headers: string[];
    items: TableRow[];
}

class TableWithFilters2 {
    constructor() {
        makeObservable(this);
    }

    filterMap = observable.map<string, string>({});

    @action.bound
    onInputFilter(e: InputEvent, key: string) {
        this.filterMap.set(key, (e.target as HTMLInputElement).value);
        this.filteredItems = this.rowItems.filter(r => r.satisfiesFilter(key => this.filterMap.get(key) ?? ""))
    }

    @observable.ref
    filteredItems?: TableRow[] = undefined;

    rowItems: TableRow[] = [];

    render(props: TableWithFilters2Props) {
        this.rowItems = props.items;
        return html`
            <u>Table with filters</u>
            <!-- NOTE: Local class names are changed at runtime -->
            <table class=${styles.mainTable}>
                <thead>
                    <tr>
                        ${
                            props.headers.map(key => html`
                            <th>
                                <div>${key}</div>
                                <input @input=${(e: InputEvent) => this.onInputFilter(e, key)}>
                            </th>
                            `)
                        }
                    </tr>
                </thead>
                <tbody>
                    ${
                        repeat(this.filteredItems ?? props.items)
                    }
                </tbody>
            </table>
        `;
    }
}

export const tableWithFilters2 = controllerView(TableWithFilters2, 0);