import { controllerView, html, makeObservable, observable, RenderResult, repeat } from "realithy";
import { action } from "mobx";

interface TableRow<T> {
    satisfiesFilter: (getter: (key: keyof T) => string) => boolean;
    render: () => unknown;
}

interface IdName {
    id: string;
    name: string
}

export class CustomTableRow implements TableRow<IdName> {
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    satisfiesFilter(getter: (key: keyof IdName) => string) {
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

//#region TableWithFilters
interface TableWithFiltersProps<T> {
    headers: { [key in keyof T]: string };
    items: TableRow<T>[];
}
class TableWithFilters<T> {
    constructor() {
        makeObservable(this);
    }

    filterMap = observable.map<string, string>({});

    @action.bound
    onInputFilter(e: InputEvent, key: keyof T) {
        this.filterMap.set(key as string, (e.target as HTMLInputElement).value);
        this.filteredItems = this.rowItems.filter(r => r.satisfiesFilter(key => this.filterMap.get(key as string) ?? ""))
    }

    @observable.ref
    filteredItems?: TableRow<T>[] = undefined;

    rowItems: TableRow<T>[] = [];

    render(props: TableWithFiltersProps<T>) {
        this.rowItems = props.items;
        return html`
            <!-- NOTE: Local class names are changed at runtime -->
            <table>
                <thead>
                    <tr>
                        ${
                            (Object.keys(props.headers) as (keyof T)[]).map(key => html`
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
export const tableWithFilters = controllerView(TableWithFilters, 0);
//#endregion