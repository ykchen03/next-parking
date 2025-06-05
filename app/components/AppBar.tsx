"use client";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LocalParkingIcon from '@mui/icons-material/LocalParking';

export default function ReAppBar(): React.JSX.Element {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: "transparent", height: "56px" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters className="justify-center">
          <LocalParkingIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Parking Assistant
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
}