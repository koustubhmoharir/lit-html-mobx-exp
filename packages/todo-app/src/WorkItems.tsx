import { controllerView, html, RenderResult } from "realithy";
import { conditionalForm } from "./ConditionalForm";
import { leftRight } from "./LeftRight";
import { CustomTableRow, tableWithFilters } from "./TableWithFilters";
import styles from "./WorkItems.module.scss";

//#region WorkItem
interface WorkItemProps {
    title: string;
    item: RenderResult;
}
class WorkItem {
    render({title, item }: { title: string, item: RenderResult }) {
        return html`
        <hr class=${styles.workItemHr}>
        <div class=${styles.workItemDiv}>
            <u>${title}</u>
        </div>
        ${item}
        `;
    }
}
const workItem = controllerView(WorkItem, 0) as (props: WorkItemProps) => RenderResult;
//#endregion

//#region WorkItems
class WorkItems {
    render() {
        return html`
        ${workItem({
            title: "Table With Filters",
            item: tableWithFilters({
                headers: {
                    "id": "ID",
                    "name": "Name"
                },
                items: [
                    new CustomTableRow(123, "Alex"),
                    new CustomTableRow(234, "Bob"),
                    new CustomTableRow(345, "Chad"),
                ]
            })
        })}
        ${workItem({
            title: "Conditional Form",
            item: conditionalForm()
        })}
        ${workItem({
            title: "Sum and Average",
            item: leftRight()
        })}
        `;
    }
}
export const workItems = controllerView(WorkItems, 0) as () => RenderResult;
//#endregion