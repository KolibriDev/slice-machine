import { Field } from "../../../lib/models/common/CustomType/fields";
import { Variation, AsArray, WidgetsArea } from "@lib/models/common/Variation";
import { ComponentMetadata } from "@lib/models/common/Component";

import {
  ActionType as VariationActions,
  updateWidgetMockConfig,
  deleteWidgetMockConfig,
  generateCustomScreenShot,
  generateScreenShot,
} from "./variation/actions";

import { ActionType as SliceActions, saveSlice, pushSlice } from "./actions";

import Store from "@lib/models/ui/Store";

export default class SliceStore implements Store {
  constructor(
    readonly dispatch: ({
      type,
      payload,
    }: {
      type: string;
      payload?: any; // eslint-disable-line
    }) => void
  ) {}

  reset = (): void => {
    this.dispatch({ type: SliceActions.Reset });
  };
  save = saveSlice(this.dispatch);
  push = pushSlice(this.dispatch);
  updateMetadata = (value: ComponentMetadata): void =>
    this.dispatch({ type: SliceActions.UpdateMetadata, payload: value });
  copyVariation = (
    key: string,
    name: string,
    copied: Variation<AsArray>
  ): void =>
    this.dispatch({
      type: SliceActions.CopyVariation,
      payload: { key, name, copied },
    });

  variation = (variationId: string): Record<string, Function> => {
    // eslint-disable-line
    return {
      generateScreenShot: generateScreenShot(this.dispatch)(variationId),
      generateCustomScreenShot: generateCustomScreenShot(this.dispatch)(
        variationId
      ),
      addWidget: (
        widgetsArea: WidgetsArea,
        key: string,
        value: Field
      ): void => {
        this.dispatch({
          type: VariationActions.AddWidget,
          payload: { variationId, widgetsArea, key, value },
        });
      },
      replaceWidget: (
        widgetsArea: WidgetsArea,
        previousKey: string,
        newKey: string,
        value: Field
      ): void => {
        this.dispatch({
          type: VariationActions.ReplaceWidget,
          payload: { variationId, widgetsArea, previousKey, newKey, value },
        });
      },
      reorderWidget: (
        widgetsArea: WidgetsArea,
        start: number,
        end: number
      ): void => {
        this.dispatch({
          type: VariationActions.ReorderWidget,
          payload: { variationId, widgetsArea, start, end },
        });
      },
      removeWidget: (widgetsArea: WidgetsArea, key: string): void => {
        this.dispatch({
          type: VariationActions.RemoveWidget,
          payload: { variationId, widgetsArea, key },
        });
      },
      updateWidgetMockConfig: updateWidgetMockConfig(this.dispatch)(
        variationId
      ),
      deleteWidgetMockConfig: deleteWidgetMockConfig(this.dispatch)(
        variationId
      ),
    };
  };
}
