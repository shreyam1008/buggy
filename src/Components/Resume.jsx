import React from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import useStyles from "./Resume.style";

import { resume } from "../data";

const Resume = () => {
  const classes = useStyles();
  return (
    <Box component="header" className={classes.mainContainer}>
      <Typography variant="h4" align="center" className={classes.heading}>
        Timeline
      </Typography>
      <Box component="div" className={classes.timeLine}>
        {resume.map((work, i) => (
          <>
            <Typography
              variant="h2"
              className={`${classes.timeLineYear} ${classes.timeLineItem}`}
            >
              {work.endYear}
            </Typography>
            <Box component="div" className={classes.timeLineItem}>
              <Typography
                variant="h5"
                align="center"
                className={classes.subHeading}
              >
                {work.workTitle}
              </Typography>
              <Typography
                variant="body1"
                align="center"
                className={classes.body1}
              >
                {work.companyName}
              </Typography>
              <Typography
                variant="subtitle1"
                align="center"
                className={classes.subtitle1}
              >
                {work.workDescription}
              </Typography>
            </Box>
          </>
        ))}
      </Box>
    </Box>
  );
};

export default Resume;
