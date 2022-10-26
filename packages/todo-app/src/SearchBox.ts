import { html, makeReactiveLithComponent, ReactiveLithComponent, ComponentTemplate, TemplateContent, renderTemplateContent } from "realithy";
import { ComponentProps } from "mythikal/components/Component";

interface SearchBoxProps<M, V> extends ComponentProps<M, V> {
}

class SearchBox_<M, V> implements ReactiveLithComponent<M, V, SearchBoxProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: SearchBoxProps<M, V>) {
        //makeObservable(this);
    }

    render() {
        return html`
            <input type="text">
        `;
    }
}

const searchBoxComp = makeReactiveLithComponent(SearchBox_);

export function SearchBox<M, V>(props: SearchBoxProps<M, V>): ComponentTemplate<M, V, SearchBoxProps<M, V>> {
    return new ComponentTemplate(props, searchBoxComp);
}