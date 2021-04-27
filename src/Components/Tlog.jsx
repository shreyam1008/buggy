import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@material-ui/core";

import { blog } from "../data";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  cardGrid: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    padding: 10,
  },
  card: {
    display: "flex",
    margin: theme.spacing.unit * 1,
  },
  cardContent: { display: "flex", flexDirection: "column" },
  cardMedia: {
    justifyContent: "right",
    width: 30,
    paddingTop: "56.25%", // 16:9
  },
}));

const Tlog = () => {
  const classes = useStyles();
  return (
    <div>
      <Grid container spacing={40} className={classes.cardGrid}>
        {blog.map((post, i) => (
          <Card index={i} className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography variant="headline">{post.title}</Typography>
              <Typography variant="subheading" color="textSecondary">
                {post.date}
              </Typography>
              <Typography variant="subheading">{post.description}</Typography>
              <Typography variant="subheading" color="primary">
                Continue reading...
              </Typography>
            </CardContent>
            {/* fix image not showing */}
            <CardMedia
              component="img"
              className={classes.cardMedia}
              image={post.thumbnail}
              title="something"
            />
          </Card>
        ))}
      </Grid>
    </div>
  );
};

export default Tlog;
