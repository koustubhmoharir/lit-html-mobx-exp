import { Model } from "./Model";

export interface ModelEvent<K extends symbol, EventData> {
    readonly key: K;
    readonly dispatch: (target: Model, data: EventData) => void;
}
export interface EventArgs<EventData> {
    data: EventData;
    stop: boolean;
}

function dispatchEvent(key: symbol, target: Model, data: any) {
    const e = {
        data,
        stop: false
    };
    let t: Model | undefined = target;
    while (t != null && !e.stop) {
        const handler = (t as any)[key];
        if (handler)
            handler.call(t, target, e);
        t = t.parent;
    }
}

export function eventData<EventData>() {
    return ({
        link: <S extends symbol>(key: S) => ({
            key,
            dispatch(target: Model, data: EventData) {
                dispatchEvent(key, target, data);
            }
        })
    });
}
export type Handler<E extends ModelEvent<symbol, any>> = E extends ModelEvent<infer K, infer EventData> ? Record<K, (target: Model, data: EventArgs<EventData>) => void> : never;
