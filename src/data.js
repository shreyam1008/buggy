import logo from "./assets/images/logo.jpg";
import me from "./assets/images/me.jpg";

import InboxIcon from "@material-ui/icons/MoveToInbox";

export const data = {
  title: "Welcome to house of buggy",
  name: "Shreyam Adhikari",
  personalPhoto: me,
  logo,
  projects: [
    {
      title: "proj1",
      description: "testing proj",
      thumbnail: logo,
      screenshots: [logo, logo],
      link: "chordyclone.web.app",
      details: "something",
    },
    {
      title: "psdfsdaf",
      description: "testing proj",
      thumbnail: logo,
      screenshots: [logo, logo],
      link: "chordyclone.web.app",
    },
    {
      title: "projfasdfsd",
      description: "testing proj",
      thumbnail: logo,
      screenshots: [logo, logo],
      link: "chordyclone.web.app",
    },
    {
      title: "projfasdfsd",
      description: "testing proj",
      thumbnail: logo,
      screenshots: [logo, logo],
      link: "chordyclone.web.app",
    },
  ],
};

export const blog = [
  {
    title: "soem title",
    description: "some descripton",
    category: "torrent",
    date: "2020-20-20",
    content: "something happend and something is about to happen",
    thumbnail: logo,
    images: [logo, logo],
  },
  {
    title: "soem title",
    description: "some descripton",
    category: "torrent",
    date: "2020-20-20",
    content: "something happend and something is about to happen",
    thumbnail: logo,
    images: [logo, logo],
  },
];

export const resume = [
  {
    companyName: "spaceX",
    workTitle: "software something",
    endYear: "2020",
    workDescription: "shark.dododododo. babay shark . ddodo",
  },
  {
    companyName: "spaceX",
    workTitle: "software something",
    endYear: "2020",
    workDescription: "shark.dododododo. babay shark . ddodo",
  },
  {
    companyName: "spaceX",
    workTitle: "software something",
    endYear: "2020",
    workDescription: "shark.dododododo. babay shark . ddodo",
  },
];

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
