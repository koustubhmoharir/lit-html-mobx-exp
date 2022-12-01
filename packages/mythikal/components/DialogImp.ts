import { render, RenderResult } from "realithy";

export abstract class DialogBase {
    abstract resolver: (value: unknown) => void;
    abstract render(): RenderResult;
}

export async function openDialog(dialog: DialogBase) {
    // TODO: Can pass an argument for container ref. If undefined, the container defaults to body.
    const dialogElem = document.createElement("dialog");
    document.body.insertAdjacentElement("beforeend", dialogElem);
    render(dialog.render(), dialogElem)
    dialogElem.showModal();
    dialogElem.addEventListener('close', dialogElem.remove);
    const result = await new Promise(resolve => dialog.resolver = resolve);
    dialogElem.remove();
    return result;
}