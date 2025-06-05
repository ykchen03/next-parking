import { AppBar, Box, Toolbar, Typography, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import React from "react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps): React.JSX.Element {
  return (
    <Box className="flex">
      <AppBar position="static" color="inherit">
        <Toolbar className="flex justify-between items-center gap-5">
          <IconButton edge="start" color="inherit" aria-label="home" href="/">
            <HomeIcon />
          </IconButton>
          <IconButton edge="start" color="inherit" aria-label="assistant" href="/assistant">
            <SmartToyIcon />
          </IconButton>
          <Typography
            className="font-bold text-center grow"
            variant="h6"
            component="div"
          >
            {title}
          </Typography>
          <Box className="flex justify-end">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=ykchen03&repo=next-parking&type=star&count=true&size=large"
              width="170"
              height="30"
              title="GitHub"
              style={{ border: "none", verticalAlign: "middle" }}
            />
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
