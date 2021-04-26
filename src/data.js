import logo from "./assets/images/logo.jpg";
import me from "./assets/images/me.jpg";

import InboxIcon from "@material-ui/icons/MoveToInbox";

export const data = {
  title: "Welcome to house of buggy",
  name: "Shreyam Adhikari",
  personalPhoto: me,
  logo,
};

export const sidebarMenu = {
  primaryMenu: [
    { listIcon: <InboxIcon />, listText: "Home", listPath: "/" },
    { listIcon: <InboxIcon />, listText: "Resume", listPath: "/resume" },
    { listIcon: <InboxIcon />, listText: "Portfolio", listPath: "/portfolio" },
    { listIcon: <InboxIcon />, listText: "Contact", listPath: "/contact" },
  ],
  secondaryMenu: [
    { listIcon: <InboxIcon />, listText: "TOLG(tech blog)", listPath: "/tlog" },
    { listIcon: <InboxIcon />, listText: "Media", listPath: "/media" },
    { listIcon: <InboxIcon />, listText: "Life", listPath: "/life" },
  ],
};
