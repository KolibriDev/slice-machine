import * as yup from "yup";
import Form, { FormFields } from "./Form";

import { MdTextFields } from "react-icons/md";

import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { createValidationSchema } from "../../../../forms";

import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";

import { StructuredTextField } from "./type";
import { FieldType } from "../../CustomType/fields";

/**
 * {
    "type": "StructuredText",
    "config": {
      "label": "Title",
      "single": "heading1, heading2, heading3, heading4, heading5, heading6"
    }
  }
*/

const Meta = {
  icon: MdTextFields,
  title: "Rich Text",
  description: "A rich text field with formatting options",
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^StructuredText$/, { excludeEmptyString: true })
    .required(),
  config: createValidationSchema(removeProp(FormFields, "id")), // eslint-disable-line
});

export const StructuredTextWidget: Widget<StructuredTextField, typeof schema> =
  {
    create: (label: string) => new StructuredTextField({ label }),
    handleMockConfig,
    handleMockContent,
    FormFields, // eslint-disable-line
    Meta,
    schema,
    TYPE_NAME: FieldType.StructuredText,
    Form,
    MockConfigForm,
  };
