import { Avatar, Box, Typography } from "@material-ui/core";
import React from "react";
import { data } from "../data";

const Home = () => {
  return (
    <div>
      <Box color="text.secondary">
        <Avatar src={data.personalPhoto} alt="Shreyam Adhikari" />
        <Typography variant="h3">{data.name}</Typography>
      </Box>
    </div>
  );
};

export default Home;
