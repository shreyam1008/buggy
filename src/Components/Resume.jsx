import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: { display: "flex" },
  text: {
    backgroundColor: "red",
    flexGrow: 1,
    padding: theme.spacing(5),
  },
}));

const Resume = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Container>
        <Typography variant="h5" className={classes.text}>
          Resume is something to be revered from the unique and unpredictable
          mind of buggy
        </Typography>
      </Container>
    </div>
  );
};

export default Resume;
