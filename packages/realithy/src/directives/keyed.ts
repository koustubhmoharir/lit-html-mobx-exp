import { nothing } from 'lit-html';
import { Directive, ChildPart, DirectiveParameters, } from 'lit-html/directive.js';
import { setCommittedValue } from 'lit-html/directive-helpers.js';
import { shallowEqual } from '../shallowEqual';
import { contentDirective } from './contentDirective';

class Keyed extends Directive {
    key: unknown = nothing;

    render(v: unknown, k: unknown) {
        this.key = k;
        return v;
    }

    override update(part: ChildPart, [v, k]: DirectiveParameters<this>) {
        if (k !== this.key) {
            // Clear the part before returning a value. The one-arg form of
            // setCommittedValue sets the value to a sentinel which forces a
            // commit the next render.
            setCommittedValue(part);
            this.key = k;
        }
        return v;
    }
}

/**
 * Associates a renderable value with a unique key. When the key changes, the
 * previous DOM is removed and disposed before rendering the next value, even
 * if the value - such as a template - is the same.
 *
 * This is useful for forcing re-renders of stateful components, or working
 * with code that expects new data to generate new HTML elements, such as some
 * animation techniques.
 */
export const keyed = contentDirective(Keyed);

export type { Keyed };

class MultiKeyed extends Directive {
    key?: unknown[];

    render(v: unknown, k: unknown[]) {
        this.key = k;
        return v;
    }

    override update(part: ChildPart, [v, k]: DirectiveParameters<this>) {
        if (!shallowEqual(k, this.key)) {
            // Clear the part before returning a value. The one-arg form of
            // setCommittedValue sets the value to a sentinel which forces a
            // commit the next render.
            setCommittedValue(part);
            this.key = k;
        }
        return v;
    }
}

/**
 * Associates a renderable value with a unique key. When the key changes, the
 * previous DOM is removed and disposed before rendering the next value, even
 * if the value - such as a template - is the same.
 *
 * This is useful for forcing re-renders of stateful components, or working
 * with code that expects new data to generate new HTML elements, such as some
 * animation techniques.
 */
export const multiKeyed = contentDirective(MultiKeyed);

export type { MultiKeyed };