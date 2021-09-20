import { AsArray, AsObject, Variation } from "./Variation";

interface Slice<F extends AsArray | AsObject> {
  id: string;
  type: "SharedSlice";
  name: string;
  description?: string;
  variations: ReadonlyArray<Variation<F>>;
}

const Slice = {
  toObject(slice: Slice<AsArray>): Slice<AsObject> {
    return {
      ...slice,
      variations: slice.variations.map(Variation.toObject),
    };
  },

  toArray(slice: Slice<AsObject>): Slice<AsArray> {
    return {
      ...slice,
      variations: slice.variations.map(Variation.toArray),
    };
  },
};

export default Slice;
