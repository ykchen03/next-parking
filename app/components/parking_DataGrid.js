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
  "&.high": {
    backgroundColor: "#f44336",
  },
  "&.medium": {
    backgroundColor: "#efbb5aa3",
  },
  "&.low": {
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

export default function ParkingDataGrid({data, setHighlight}) {
  const GridData = {
    rows: data || [],
    columns: [
      { 
        field: "name", 
        headerName: "名稱",
        headerAlign: 'center', 
        filterable: false,
        sortable: false,
      },
      {
        field: "fullRate",
        headerName: "額滿率",
        type: "number",
        renderCell: renderProgress,
        headerAlign: 'center',
      },
      {
        field: "price",
        headerName: "價格",
        type: "number",
        valueFormatter: (v) => {
          return `$${v}/H`;
        },
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        minWidth: 70,
      },
      {
        field: "distance",
        headerName: "距離",
        type: "number",
        valueFormatter: (v) => {
          return `${Number(v).toFixed(0)}m`;
        },
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        minWidth: 70,
      },
      {
        field: "hasRecharge",
        headerName: "可充電",
        type: "boolean",
        headerAlign: 'center', 
        filterable: false,
        sortable: false,
        flex: 1,
      },
      {
        field: "score",
        headerName: "分數",
        type: "number",
        valueFormatter: (v) => {
          return `${Number(v).toFixed(2) * 100}`;
        },
        headerAlign: 'center',
        align: 'center',
        flex: 1,
      },
    ],
  };

  return <DataGrid {...GridData} density="compact" onRowClick={(p)=> setHighlight(p.row)}/>;
}
