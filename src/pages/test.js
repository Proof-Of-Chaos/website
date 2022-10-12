
import Layout from '../layouts/layout'
import * as V from 'victory';
import { useUserNfts } from '../hooks/use-nfts'
import { useUserVotes, useVotes } from '../hooks/use-votes'
import { useConfig } from '../hooks/use-config';
import { VictoryPie } from 'victory';
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Slider, Typography } from '@mui/material';
import { useState } from 'react';

const EXPONENT_CONSTANTS = [3, 0.4]
function Test() {
  const { data } = useVotes();
  const { data: config } = useConfig()

  const [ values, setValues ] = useState({
    ksm: 5,
    babyDragon: false,
    toddlerDragon: true,
    quizCorrect: false,
  })

  const [ chartData, setChartData ] = useState([
    { x: "Common", y: 35 },
    { x: "Rare", y: 40 },
    { x: "Epic", y: 55 }
  ])

  const handleCheckBoxChange = ( e ) => {
    console.log( e.target.name)
    setValues({
      ...values,
      [e.target.name]: e.target.checked,
    });
  }

  const calculateLuck = (
      n,
      minIn,
      maxIn,
      minOut,
      maxOut,
      exponent,
      minAmount,
      luckMultiplier = 1.0,
    ) => {
      minOut = parseInt(minOut);
      maxOut = parseInt(maxOut);
      if (n > maxIn) {
          n = maxOut;
      }
      else if (n < minAmount) {
          n = minOut;
      }
      else {
          // unscale input
          n -= minIn
          n /= maxIn - minIn
          n = Math.pow(n, exponent)
          // scale output
          n *= maxOut - minOut
          n += minOut
      }
      return n * luckMultiplier
  }

  /**
   * return the chances array
   */
  const lucksForConfigAndOptions = ( ksm, refConfig, options ) => {
    const lucks = {}
    options.forEach( option => {
      if ( ksm < refConfig.median ) {
        lucks[`${ option.rarity }`] = calculateLuck(
          ksm,
          refConfig.minValue,
          refConfig.median,
          option.minProbability,
          option.sweetspotProbability,
          EXPONENT_CONSTANTS[0],
          refConfig.minAmount,
        )
      } else {
        lucks[`${ option.rarity }`] = calculateLuck(
            ksm,
            refConfig.median,
            refConfig.maxValue,
            option.sweetspotProbability,
            option.maxProbability,
            EXPONENT_CONSTANTS[1],
            refConfig.minAmount,
          )
      }
    })
    return lucks
  }

  const handleSliderChange = ( e ) => {
    const luckMultiplier = 1.0
    const voteAmountWithConviction = parseInt( e.target.value )

    const rarityOptions229 = [
      {
        "minProbability": 28,
        "sweetspotProbability": 40,
        "rarity": "common",
        "configId": "229-00000001",
        "id": "229-00000001-00000002",
        "maxProbability": 67
      },
      {
        "minProbability": 15,
        "sweetspotProbability": 30,
        "rarity": "rare",
        "configId": "229-00000001",
        "id": "229-00000001-00000001",
        "maxProbability": 45
      },
      {
        "minProbability": 3,
        "sweetspotProbability": 16,
        "rarity": "epic",
        "configId": "229-00000001",
        "id": "229-00000001-00000000",
        "maxProbability": 30
      }
    ]

    const ref229Config = {
      median: 9.4,
      minValue: 0,
      minAmount: 0,
      maxValue: 31.65,
    }

    const lucks = lucksForConfigAndOptions( voteAmountWithConviction, ref229Config, rarityOptions229 )

    console.log( 'lucks', lucks )

    const newChartData = [
      { x: `${ parseFloat(lucks['common']).toFixed(2) } Common `, y: lucks['common'] },
      { x: `${ parseFloat(lucks['rare']).toFixed(2) } Rare`, y: lucks['rare'] },
      { x: `${ parseFloat(lucks['epic']).toFixed(2) } Epic`, y: lucks['epic'] },
    ]

    setChartData( newChartData )
  }

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="max-w-2xl">
          <VictoryPie
            padAngle={2}
            data={ chartData }
            colorScale={["tomato", "orange", "gold", "cyan" ]}
            animate={{
              duration: 1000
            }}
            innerRadius={70}
          />
        </div>
        <div className="flex flex-col">
          <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
            <FormLabel component="legend">Wallet Properties when voting</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={ values.quizCorrect }
                    onChange={handleCheckBoxChange}
                    name="quizCorrect"
                  />
                }
                label="Quiz Answered Correctly"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ values.babyDragon }
                    onChange={handleCheckBoxChange}
                    name="babyDragon"
                  />
                }
                label="Baby Dragon"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={ values.toddlerDragon }
                    onChange={handleCheckBoxChange}
                    name="toddlerDragon"
                  />
                }
                label="Toddler Dragon"
              />
              <div className="pt-5">
                <Typography gutterBottom>Vote Amount With Conviction</Typography>
                <Slider
                  defaultValue={50}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChange={ handleSliderChange }
                />
              </div>
            </FormGroup>
            <FormHelperText>See how the luck distribution differs for different values</FormHelperText>
          </FormControl>
        </div>
      </div>
      Test Page { JSON.stringify(config) }
    </>
  )
}

Test.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Test
