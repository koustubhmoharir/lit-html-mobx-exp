type PrimitiveName = "string" | "boolean" | "number";
interface PrimitiveTypeMap {
    string: string;
    boolean: boolean;
    number: number;
}

interface PrimitivePropSpec<P extends PrimitiveName, Opt extends boolean> {
    t: P;
    o: Opt;
}

type UnderlyingSpec = PrimitivePropSpec<PrimitiveName, false> | DtoSpec;

interface ArrayPropSpec<U extends UnderlyingSpec, Opt extends boolean> {
    t: "array";
    o: Opt;
    u: () => U;
}
interface RefPropSpec<U extends DtoSpec, Opt extends boolean> {
    t: "reference";
    o: Opt;
    u: () => U;
}

//type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type PropSpec = PrimitivePropSpec<PrimitiveName, boolean> | ArrayPropSpec<any, boolean> | RefPropSpec<any, boolean>;
type PropType<P extends PropSpec> = { "0": BasePropType<P> | (P["o"] extends true ? undefined : never) }["0"];
type BasePropType<P extends PropSpec> =
    P["t"] extends PrimitiveName ? (PrimitiveTypeMap[P["t"]]) :
    P extends ArrayPropSpec<infer U extends UnderlyingSpec, boolean> ? (
        U extends DtoSpec ? DtoSpecType<U>[] :
        U extends PrimitivePropSpec<PrimitiveName, boolean> ? BasePropType<U>[] : never) :
    P extends RefPropSpec<infer U extends DtoSpec, boolean> ? DtoSpecType<U> :
    never;

const makePrimitive = <P extends PrimitiveName>(p: P) => {
    const pt_p = () => ({ t: p, o: false }) as PrimitivePropSpec<P, false>;
    pt_p.optional = () => ({ t: p, o: true }) as PrimitivePropSpec<P, true>;
    const pt_p_array = () => ({ t: "array", o: false, u: pt_p }) as ArrayPropSpec<PrimitivePropSpec<P, false>, false>;
    pt_p_array.optional = () => ({ t: "array", o: true, u: pt_p }) as ArrayPropSpec<PrimitivePropSpec<P, false>, true>;
    pt_p.array = pt_p_array;
    return pt_p;
}

const pt_ref = <U extends DtoSpec>(underlying: () => U) => {
    const f = () => ({ t: "reference", o: false, u: underlying }) as RefPropSpec<U, false>;
    f.optional = () => ({ t: "reference", o: true, u: underlying }) as RefPropSpec<U, true>;
    const f_array = () => ({ t: "array", o: false, u: underlying }) as ArrayPropSpec<U, false>;
    f_array.optional = () => ({ t: "array", o: true, u: underlying }) as ArrayPropSpec<U, true>;
    f.array = f_array;
    return f;
}

type DtoSpec = Record<string, () => PropSpec>;

export const pt = {
    string: makePrimitive("string"),
    boolean: makePrimitive("boolean"),
    number: makePrimitive("number"),
    ref: pt_ref
}

type DtoSpecType<S extends DtoSpec> = { [K in keyof S]: PropType<ReturnType<S[K]>> };

export type DtoType<D extends () => DtoSpec> = DtoSpecType<ReturnType<D>>;
