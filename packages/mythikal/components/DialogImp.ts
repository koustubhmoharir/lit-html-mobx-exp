import { render, RenderResult } from "realithy";

// TODO: Title, subtitle (optional), Action - for placement - in the interface

export abstract class DialogBase { // TODO: have interface
    abstract resolver: (value: unknown) => void;
    abstract render(): RenderResult;
}

// Dialog class we make, which implements the interface, will raise an event which will bubble up to the host.
// Dialog host, when it recieves that event will show the dialog and create another placeholder.
// Event name: ShowDialog - DialogHost knows to handle this. Pass the instance of the dialog class as the event argument.

// TODO: Have additional declarative dialog host component to host the dialog. This will host an HTML dialog.

export async function openDialog(dialog: DialogBase) {
    // TODO: Can pass an argument for container ref. If undefined, the container defaults to body.
    const dialogElem = document.createElement("dialog");
    document.body.insertAdjacentElement("beforeend", dialogElem);
    render(dialog.render(), dialogElem);
    dialogElem.showModal();
    dialogElem.addEventListener('close', dialogElem.remove);
    const result = await new Promise(resolve => dialog.resolver = resolve); // TODO: Don't assign resolver from outside.
    dialogElem.remove();
    return result;
}