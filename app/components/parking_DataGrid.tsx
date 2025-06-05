import React from "react";
import { DataGrid, GridColDef, GridRowParams, GridRenderCellParams } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import clsx from "clsx";

// Type definitions
interface ParkingData {
  id: string;
  name: string;
  fullRate: number;
  price: number;
  distance: number;
  hasRecharge: boolean;
  score: number;
}

interface ProgressBarProps {
  value: number;
}

interface ParkingDataGridProps {
  data: ParkingData[] | null;
  setHighlight: (data: ParkingData) => void;
}

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

const ProgressBar = React.memo<ProgressBarProps>(function ProgressBar({ value }: ProgressBarProps): React.JSX.Element {
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

export function renderProgress(params: GridRenderCellParams): React.JSX.Element | string {
  if (params.value == null) {
    return "";
  }

  return (
    <Center>
      <ProgressBar value={params.value as number} />
    </Center>
  );
}

export default function ParkingDataGrid({ data, setHighlight }: ParkingDataGridProps): React.JSX.Element {
  const columns: GridColDef[] = [
    { 
      field: "name", 
      headerName: "名稱",
      headerAlign: 'center', 
      filterable: false,
      sortable: false,
      flex: 2,
      minWidth: 120,
    },
    {
      field: "fullRate",
      headerName: "額滿率",
      type: "number",
      renderCell: renderProgress,
      headerAlign: 'center',
      flex: 2,
      minWidth: 100,
    },
    {
      field: "price",
      headerName: "價格",
      type: "number",
      valueFormatter: (value: number) => {
        return `$${value}/H`;
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
      valueFormatter: (value: number) => {
        return `${Number(value).toFixed(0)}m`;
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
      minWidth: 80,
    },
    {
      field: "score",
      headerName: "分數",
      type: "number",
      valueFormatter: (value: number) => {
        return `${(Number(value) * 100).toFixed(2)}`;
      },
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      minWidth: 70,
    },
  ];

  const handleRowClick = (params: GridRowParams<ParkingData>): void => {
    setHighlight(params.row);
  };

  return (
    <DataGrid
      rows={data || []}
      columns={columns}
      density="compact"
      onRowClick={handleRowClick}
      getRowId={(row: ParkingData) => row.id}
    />
  );
}