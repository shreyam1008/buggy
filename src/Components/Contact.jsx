import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: { display: "flex" },
  text: {},
}));

const Contact = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.text}>
        Contact is something to be revered from the unique and unpredictable
        mind of buggy
      </Typography>
    </div>
  );
};

export default Contact;
