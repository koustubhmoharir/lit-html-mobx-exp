import { controllerView, html, RenderResult } from "realithy";
import { CustomTableRow, tableWithFilters, tableWithFilters2 } from "./TableWithFilters";

class WorkItems {
    render() {
        return html`
            <div>
                <hr style="margin: 1rem 0">
                <!-- ${tableWithFilters({
                    items: [
                        { // objects of class - dg row
                            name: "Alex",
                            id: 123
                        },
                        {
                            name: "Bob",
                            id: 234
                        },
                        {
                            name: "Chad",
                            id: 345
                        }
                    ]
                })} -->
                ${tableWithFilters2({
                    headers: ["id", "name"],
                    items: [
                        new CustomTableRow(123, "Alex"),
                        new CustomTableRow(234, "Bob"),
                        new CustomTableRow(345, "Chad"),
                    ]
                })}
            </div>
            `;
    }
}

export const workItems = controllerView(WorkItems, 0) as () => RenderResult;