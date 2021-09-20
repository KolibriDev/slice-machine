import { Fragment } from "react";
import { useThemeUI } from "theme-ui";
import { Flex as FlexGrid, Col } from "components/Flex";

import PreviewCard from "components/Card/Preview";

import * as dataset from "./dataset";

const ImageInput = ({ src, onChange, selected }) => (
  <input
    style={{
      padding: "0",
      marginBottom: "8px",
      maxWidth: "100%",
      border: selected
        ? "5px solid rgba(81, 99, 186, 1)"
        : "5px solid transparent",
    }}
    onClick={onChange}
    type="image"
    src={src}
  />
);

const RenderCol = ({ elements, cols, onSelect }) => (
  <Col cols={cols}>
    {elements.map(([key, value]) => (
      <PreviewCard
        key={key}
        title={key}
        imageUrl={`${value[0].raw}&q=20&w=120`}
        onClick={() => onSelect(key)}
      />
    ))}
  </Col>
);

export const ImagesListCards = ({ onSelect }) => {
  const entries = Object.entries(dataset);
  const Cols = [
    entries.slice(0, entries.length / 3),
    entries.slice(entries.length / 3, (entries.length / 3) * 2),
    entries.slice((entries.length / 3) * 2),
  ];

  return (
    <FlexGrid mt={3} px={0} sx={{ display: "flex" }}>
      <RenderCol onSelect={onSelect} cols={3} elements={Cols[0]} />
      <RenderCol onSelect={onSelect} cols={3} elements={Cols[1]} />
      <RenderCol onSelect={onSelect} cols={3} elements={Cols[2]} />
    </FlexGrid>
  );
};

export const ImagesList = ({ listName, images, value, onChange }) => {
  const { theme } = useThemeUI();

  return (
    <Fragment>
      <div
        style={{
          ...theme.styles.fixedHeader,
          display: "flex",
          background: theme.colors.background,
          padding: "0 8px",
          borderBottom: `1px solid ${theme.colors.borders}`,
        }}
      >
        <h3>{listName}</h3>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          padding: "64px 8px 20px",
        }}
      >
        <div
          style={{
            flex: `0 ${100 / 2 - 1}%`,
            marginBottom: "4px",
          }}
        >
          {images.slice(0, images.length / 2).map((image) => (
            <ImageInput
              key={image.raw}
              src={`${image.raw}&q=80&w=400`}
              onChange={onChange}
              selected={image.raw.indexOf(value) === 0}
            />
          ))}
        </div>
        <div
          style={{
            flex: `0 ${100 / 2 - 1}%`,
            marginBottom: "4px",
          }}
        >
          {images.slice(images.length / 2).map((image) => (
            <ImageInput
              key={image.raw}
              src={`${image.raw}&q=80&w=400`}
              onChange={onChange}
              selected={image.raw.indexOf(value) === 0}
            />
          ))}
        </div>
      </div>
    </Fragment>
  );
};
