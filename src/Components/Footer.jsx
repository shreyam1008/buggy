import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Facebook from "@material-ui/icons/Facebook";
import Twitter from "@material-ui/icons/Twitter";
import Instagram from "@material-ui/icons/Instagram";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import GitHubIcon from "@material-ui/icons/GitHub";

const useStyles = makeStyles({
  bottomNavContainer: {
    background: "inherit",
  },
  root: {
    "& .MuiSvgIcon-root": {
      fill: "black",
      "&:hover": {
        fill: "blue",
        fontSize: "2rem",
      },
    },
  },
});

const Footer = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <BottomNavigation className={classes.bottomNavContainer}>
        <BottomNavigationAction icon={<Facebook />} className={classes.root} />
        <BottomNavigationAction icon={<Twitter />} className={classes.root} />
        <BottomNavigationAction icon={<Instagram />} className={classes.root} />
      </BottomNavigation>
      {/* <BottomNavigation className={classes.bottomNavContainer}>
        <BottomNavigationAction
          icon={<LinkedInIcon />}
          className={classes.root}
        />
        <BottomNavigationAction
          icon={<GitHubIcon />}
          className={classes.root}
        />
        <BottomNavigationAction icon={<Instagram />} className={classes.root} />
      </BottomNavigation> */}
    </React.Fragment>
  );
};
export default Footer;
