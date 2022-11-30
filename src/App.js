import React, { useState, useCallback } from "react";
import "./styles.css";
import Stream from "./Stream";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import Grid from "@mui/material/Grid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const web3 = require("web3");
const cAbi = require("./abi/abi.json");

const ethMantissa = 1e18;
const blocksPerDay = 7200; // 15 seconds per block
const daysPerMonth = 30;
const cAddr = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";
const web3js = new web3("https://cloudflare-eth.com"); // this is the ethereum mainnet

const calculateApy = async () => {
  const cToken = new web3js.eth.Contract(cAbi, cAddr);
  const supplyRatePerBlock = await cToken.methods.supplyRatePerBlock().call();
  const supplyApy =
    (Math.pow(
      (supplyRatePerBlock / ethMantissa) * blocksPerDay + 1,
      daysPerMonth
    ) -
      1) *
    100;
  return supplyApy;
};

export default function App() {
  const [initialEuro, setInitialEuro] = useState(0);
  const [initialEth, setInitialEth] = useState(0);

  const interestChange = useCallback(
    async (chart) => {
      const apy = await calculateApy();
      const rate = await fetch(
        "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR"
      ).then((res) => res.json());
      console.log("APY - ", apy);
      console.log("Ether - ", rate.EUR);
      chart.data.datasets[0].data.push({
        x: Date.now(),
        y: apy * initialEth * rate.EUR,
      });
    },
    [initialEth]
  );

  const handleClick = async () => {
    const exchange_rate = await fetch(
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR"
    ).then((res) => res.json());
    setInitialEth((1 / exchange_rate.EUR) * initialEuro);
  };

  return (
    <div className="App">
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <FormControl sx={{ m: 1, width: "20ch" }} variant="standard">
            <InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>
            <Input
              id="standard-adornment-amount"
              value={initialEuro}
              onChange={(e) => setInitialEuro(e.target.value)}
              startAdornment={
                <InputAdornment position="start">€</InputAdornment>
              }
            />
          </FormControl>
          <Button size="small" variant={"contained"} onClick={handleClick}>
            View
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            justifyContent={"center"}
          >
            <Grid item xs={8}>
              <div>
                <Stream label={"Interest"} handleRefresh={interestChange} />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
