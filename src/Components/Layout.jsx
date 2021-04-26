import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";

import Footer from "./Footer";
import { Avatar, Button } from "@material-ui/core";

import data from "../data";
import Routing from "../Routing";
const drawerWidth = 240;

const primaryMenu = [
  { listIcon: <InboxIcon />, listText: "Home", listPath: "/" },
  { listIcon: <InboxIcon />, listText: "Resume", listPath: "/resume" },
  { listIcon: <InboxIcon />, listText: "Portfolio", listPath: "/portfolio" },
  { listIcon: <InboxIcon />, listText: "Contact", listPath: "/contact" },
];
const secondaryMenu = [
  { listIcon: <InboxIcon />, listText: "TOLG(tech blog)", listPath: "/tlog" },
  { listIcon: <InboxIcon />, listText: "Media", listPath: "/media" },
  { listIcon: <InboxIcon />, listText: "Life", listPath: "/life" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  avatar: {
    margin: "0.5rem auto",
    width: theme.spacing(10),
    height: theme.spacing(10),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function Layout() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {/* title of the page . make it change with page change later */}
            {data.title}
          </Typography>
          {/* put button on this end for theme change */}
          {/* <Button> THEME CHANGE</Button> */}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <Avatar src={data.personalPhoto} className={classes.avatar} />
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          {primaryMenu.map((item, index) => (
            <ListItem button key={index} component={Link} to={item.listPath}>
              <ListItemIcon>{item.listIcon}</ListItemIcon>
              <ListItemText primary={item.listText} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {secondaryMenu.map((item, index) => (
            <ListItem button key={index} component={Link} to={item.listPath}>
              <ListItemIcon>{item.listIcon}</ListItemIcon>
              <ListItemText primary={item.listText} />
            </ListItem>
          ))}
        </List>
        <Divider />
        {/* manage styling of footer to bottom */}
        <Footer />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Routing />
      </main>
    </div>
  );
}
