import { pascalize } from "sm-commons/utils/str";
import { formatThemeProps } from "./theme";
import NotFoundView from "./NotFound";
import EmptyState from "./EmptyState";

const invert = (p) => new Promise((resolve, reject) => p.then(reject, resolve));
const firstOf = (ps) => invert(Promise.all(ps.map(invert)));

const toArr = (elem) => (Array.isArray(elem) ? elem : [elem]);
const isPromise = (elem) =>
  elem instanceof Promise ||
  (elem instanceof Array && elem.every((e) => e instanceof Promise));

const promisify = (elem) => (isPromise(elem) ? elem : Promise.resolve(elem));

export default {
  name: "SliceZone",
  props: {
    components: {
      required: false,
      default() {
        return {};
      },
    },
    debug: {
      required: false,
      type: Boolean,
      default: false,
    },
    slices: {
      required: false,
    },
    pathToDocs: {
      required: false,
      type: String,
    },
    resolver: {
      required: false,
      type: Function,
      description:
        "Resolver takes slice information and returns a dynamic import",
    },
    wrapper: {
      required: false,
      type: String,
      default: "div",
      description: "Wrapper tag (div, section, main...)",
    },
    NotFound: {
      type: Function,
      required: false,
      default() {
        return NotFoundView;
      },
    },
    theme: {
      type: [Object, Function],
      required: false,
      default() {
        return {};
      },
    },
  },
  computed: {
    computedImports: ({ components, resolver, slices, NotFound, debug }) => {
      const names = (slices || []).map((e) => pascalize(e.slice_type));

      const resolve = (payload) => {
        if (!resolver) {
          const err =
            'SliceZone expects a "resolver" function to properly index components';
          if (process.env.NODE_ENV === "development" && !debug) {
            throw new Error(err);
          }
          return null;
        }
        return resolver(payload);
      };

      return (slices || []).map((_, i) => () => {
        const promises = toArr(
          promisify(
            components[names[i]] || resolve({ sliceName: names[i], index: i })
          )
        );
        return firstOf(promises).catch(NotFound);
      });
    },
    computedSlices: ({ slices, theme, computedImports }) => {
      return (slices || []).map((slice, i) => ({
        import: computedImports[i],
        data: {
          props: {
            theme: formatThemeProps(theme, {
              i,
              slice,
              sliceName: pascalize(slice.slice_type),
            }),
            slice,
          },
          key: slice.id,
        },
        name: pascalize(slice.slice_type),
      }));
    },
  },
  render(h) {
    const scopedSlots = {};
    const slotNames = Object.keys(this.$scopedSlots);
    for (const name of slotNames) {
      const [sliceName, sliceSlot] = name.split(".");
      // skip if not parsed correctly
      if (!sliceName) continue;
      scopedSlots[sliceName] = scopedSlots[sliceName] || {};
      // TODO: dev warning if found duplicate entries for the same slot
      scopedSlots[sliceName][sliceSlot || "default"] = this.$scopedSlots[name];
    }

    if (!this.computedSlices || !this.computedSlices.length) {
      return h(EmptyState, {
        props: {
          uid: this.uid,
          type: this.type,
          pathToDocs: this.pathToDocs,
        },
      });
    }

    return h(
      this.wrapper,
      {},
      this.computedSlices.map((e) => {
        return h(
          e.import,
          {
            ...e.data,
            scopedSlots: scopedSlots[e.name],
          },
          []
        );
      })
    );
  },
};
