import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import clsx from "clsx";

const Center = styled("div")({
  height: "100%",
  display: "flex",
  alignItems: "center",
});

const Element = styled("div")(({ theme }) => ({
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
  position: "relative",
  overflow: "hidden",
  width: "100%",
  height: 26,
  borderRadius: 2,
}));

const Value = styled("div")({
  position: "absolute",
  lineHeight: "24px",
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

const Bar = styled("div")({
  height: "100%",
  "&.low": {
    backgroundColor: "#f44336",
  },
  "&.medium": {
    backgroundColor: "#efbb5aa3",
  },
  "&.high": {
    backgroundColor: "#088208a3",
  },
});

const ProgressBar = React.memo(function ProgressBar(props) {
  const { value } = props;
  const valueInPercent = value * 100;

  return (
    <Element>
      <Value>{`${valueInPercent.toLocaleString()} %`}</Value>
      <Bar
        className={clsx({
          low: valueInPercent < 30,
          medium: valueInPercent >= 30 && valueInPercent <= 70,
          high: valueInPercent > 70,
        })}
        style={{ maxWidth: `${valueInPercent}%` }}
      />
    </Element>
  );
});

export function renderProgress(params) {
  if (params.value == null) {
    return "";
  }

  return (
    <Center>
      <ProgressBar value={params.value} />
    </Center>
  );
}

export default function ParkingDataGrid(data) {
  /*
    id: lot.id,
    name: lot.name,
    fullRate: lot.fullRate,
    price: lot.price,
    distance: lot.distance,
    hasRecharge: lot.hasRecharge,
    score: totalScore,*/
    console.log(data.data);
  const GridData = {
    rows: data.data,
    columns: [
      { field: "name", headerName: "名稱", flex: 1 },
      {
        field: "fullRate",
        headerName: "額滿率",
        flex: 1,
        type: "number",
        renderCell: renderProgress,
        /*availableAggregationFunctions: ["min", "max", "avg", "size"],*/
      },
      {
        field: "price",
        headerName: "價格",
        flex: 1,
        type: "number",
        valueFormatter: (v) => {return `$${v}/H`},
      },
      {
        field: "distance",
        headerName: "距離",
        flex: 1,
        type: "number",
        valueFormatter: (v) => {`${Number(v).toFixed(2)}m`},
      },
      {
        field: "hasRecharge",
        headerName: "可充電",
        flex: 1,
        type: "boolean",
        valueFormatter: (v) => {return (v ? "⚡" : "❌")},
      },
      {
        field: "score",
        headerName: "分數",
        flex: 1,
        type: "number",
        valueFormatter: (v) => {return `${Number(v).toFixed(2)}`},
      }
    ],
  };

  return <DataGrid {...GridData} />;
}
