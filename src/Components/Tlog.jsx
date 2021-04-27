import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent, Grid, Typography } from "@material-ui/core";

import { blog } from "../data";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    padding: 10,
  },
  card: {
    margin: 20,
  },
}));

const Tlog = () => {
  const classes = useStyles();
  return (
    <div>
      <Grid className={classes.root}>
        {blog.map((post, i) => (
          <Card index={i} className={classes.card}>
            <CardContent>
              <Typography variant="headline">{post.title}</Typography>
              <Typography variant="subheading">{post.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </div>
  );
};

export default Tlog;
