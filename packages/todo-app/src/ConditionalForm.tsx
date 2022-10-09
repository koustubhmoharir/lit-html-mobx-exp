import { controllerView, html, makeObservable, observable, RenderResult } from "realithy";
import { nothing } from "lit-html";
import { action } from "mobx";
import styles from "./ConditionalForm.module.scss";

//#region SelectField
interface SelectFieldProps {
    label: string;
    options: string[];
    onChange?: (e: Event) => void;
    class?: string;
}
class SelectField {
    render(props: SelectFieldProps) {
        return html`
        <div class=${props.class ?? ""}>
            <div>
                <i>${props.label}</i>
            </div>
            <select @change=${props.onChange}>
                ${
                    props.options.map(c =>
                        html`<option>${c}</option>`
                    )
                }
            </select>
        </div>
        `;
    }
}
const selectField = controllerView(SelectField, 0) as (props: SelectFieldProps) => RenderResult;
//#endregion

//#region ConditionalForm
class ConditionalForm {
    constructor() {
        makeObservable(this);
    }

    async fetchStates(country: string) {
        await new Promise(resolve => setTimeout(resolve, 0));
        return [1, 2, 3, 4, 5].map(n => `${"state in"} ${country} ${n}`);
    }
    
    async fetchCities(state: string) {
        await new Promise(resolve => setTimeout(resolve, 0));
        return [1, 2, 3, 4, 5].map(n => `${"city in a"} ${state} ${n}`);
    }

    @observable.ref
    fetchedStates?: string[] = undefined;

    @observable.ref
    fetchedCities?: string[] = undefined;

    @action.bound
    onChangeCountry(e: Event) {
        this.fetchStates((e.target as HTMLSelectElement).value).then(r => {
            this.fetchedStates = r;
            this.fetchedCities = undefined;
        });
    }

    @action.bound
    onChangeState(e: Event) {
        this.fetchCities((e.target as HTMLSelectElement).value).then(r => {
            this.fetchedCities = r;
        });
    }

    render() {
        return html`
        ${selectField({
            label: "Country",
            onChange: this.onChangeCountry,
            options: ["India", "Pakistan", "Bangladesh", "Nepal", "Sri Lanka"]
        })}
        ${this.fetchedStates ? html`
        ${selectField({
            label: "State",
            onChange: this.onChangeState,
            options: this.fetchedStates,
            class: styles.selectField
        })}
        ` : nothing}
        ${this.fetchedCities ? html`
        ${selectField({
            label: "City",
            options: this.fetchedCities,
            class: styles.selectField
        })}
        ` : nothing}
        `;
    }
}
export const conditionalForm = controllerView(ConditionalForm, 0) as () => RenderResult;
//#endregion