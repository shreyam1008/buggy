import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

import { data } from "../data";
import { red } from "@material-ui/core/colors";
import ReviewCard from "./ReviewCard.component";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
  },
}));

const Portfolio = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container justify="center">
        {data.projects.map((project, i) => (
          <Grid item xs={12} sm={8} md={4} key={i}>
            <ReviewCard project={project} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Portfolio;
