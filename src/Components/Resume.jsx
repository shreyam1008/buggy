import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: { display: "flex" },
  text: {},
}));

const Resume = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
     
        <Typography variant="h5" className={classes.text}>
          Resume is something to be revered from the unique and unpredictable
          mind of buggy
        </Typography>
   
    </div>
  );
};

export default Resume;
