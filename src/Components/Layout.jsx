import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
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

import Footer from "./Footer";
import { Avatar, Button } from "@material-ui/core";

import { data, sidebarMenu } from "../data";
import Routing from "../Routing";

import useStyles from "./Layout.style";

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
          {/* logo avatar put here */}
          <Avatar src={data.logo} alt="tophats" className={classes.avatar} />
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          {/* primary menu */}
          {sidebarMenu.primaryMenu.map((item, index) => (
            <ListItem button key={index} component={Link} to={item.listPath}>
              <ListItemIcon>{item.listIcon}</ListItemIcon>
              <ListItemText primary={item.listText} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {/* secondary menu of side bar */}
          {sidebarMenu.secondaryMenu.map((item, index) => (
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
