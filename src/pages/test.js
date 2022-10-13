
import Layout from '../layouts/layout'
import { useConfig } from '../hooks/use-config';
import { VictoryPie } from 'victory';
import { Checkbox,
  createTheme,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Slider,
  ThemeProvider
} from '@mui/material';
import { useState } from 'react';
import { useUserVotes } from '../hooks/use-votes';
import { useUserDistributions } from '../hooks/use-distributions';

const EXPONENT_CONSTANTS = [3, 0.4]

const theme = createTheme({
  typography: {
    fontFamily: [
      'Ubuntu Mono',
      'monospace'
    ].join(','),
  },
})

const getLuckMultiplier = ( options ) => {
  let walletProps = {
    babyDragon: false,
    toddlerDragon: false,
    adolecentDragon: false,
    adultDragon: false,
    quizCorrect: false,
    ...options,
  }

  return {}
}
function Test() {
  const { data: refConfig, isLoading: isRefConfigLoading } = useConfig( 229 )
  const { data: userVotes, isLoading: isLoadingUserVotes } = useUserVotes()
  const { data: userDistributions } = useUserDistributions( 229 )

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
    //do not calc luck for the last to items (common, default)
    //will be done below
    //TODO will have to find a filter that will filter the correct items
    const optionsToConsider = options.filter( opt => opt.rarity !== 'common' )
    optionsToConsider.forEach( option => {
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
    lucks.rare = (100 - lucks.epic) / 100 * lucks.rare
    lucks.common = 100 - lucks.rare - lucks.epic
    return lucks
  }

  const handleSliderChange = ( e ) => {
    const luckMultiplier = 1.0
    const voteAmountWithConviction = parseInt( e.target.value )

    const lucks = lucksForConfigAndOptions( voteAmountWithConviction, ref229Config, rarityOptions229 )

    console.log( 'lucks', lucks )

    const newChartData = [
      { x: `${ parseFloat(lucks['common']).toFixed(2) } Common `, y: lucks['common'] },
      { x: `${ parseFloat(lucks['rare']).toFixed(2) } Rare`, y: lucks['rare'] },
      { x: `${ parseFloat(lucks['epic']).toFixed(2) } Epic`, y: lucks['epic'] },
    ]

    setChartData( newChartData )
  }

  const marks = [
    {
      value: 0,
      label: '0',
    },
    {
      value: 5,
      label: 'Your Vote',
    },
    {
      value: ref229Config.maxValue,
      label: `${ ref229Config.maxValue } KSM`,
    },
  ]

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="max-w-2xl px-6">
          <VictoryPie
            padAngle={2}
            data={ chartData }
            colorScale={["lavender", "turquoise", "gold", "cyan" ]}
            animate={{
              duration: 1000
            }}
            className="overflow-visible px-6"
            innerRadius={60}
          />
        </div>
        <div className="flex flex-col">
          <ThemeProvider theme={ theme }>
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
                  Vote Amount With Conviction
                  <Slider
                    defaultValue={50}
                    min={ 0 }
                    max={ ref229Config.maxValue }
                    marks={ marks }
                    aria-label="Default"
                    valueLabelDisplay="auto"
                    onChange={ handleSliderChange }
                  />
                </div>
              </FormGroup>
              <FormHelperText>See how the luck distribution differs for different values</FormHelperText>
            </FormControl>
          </ThemeProvider>
        </div>
      </div>
      <div>
        <pre className="text-xs">{JSON.stringify(refConfig, null, 2) }</pre>
      </div>
      <div>
        <pre className="text-xs">{JSON.stringify(userDistributions, null, 2) }</pre>
      </div>
    </>
  )
}

Test.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Test
