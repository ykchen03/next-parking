import { AppBar, Box, Toolbar, Typography, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

export default function Header({title}) {
    return (<Box className="flex">
        <AppBar position="static" color="inherit">
            <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="home" href="/">
                <HomeIcon />
            </IconButton>
            <Box width={170} className="shrink-0"/>
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
                ></iframe>
            </Box>
            </Toolbar>
        </AppBar>
    </Box>)
}