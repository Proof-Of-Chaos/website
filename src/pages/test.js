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
import { useEffect, useState } from 'react';
import { useUserVotes } from '../hooks/use-votes';
import { useUserDistributions } from '../hooks/use-distributions';
import { current } from 'tailwindcss/colors';

const EXPONENT_CONSTANTS = [3, 0.4]

const theme = createTheme({
  typography: {
    fontFamily: [
      'Ubuntu Mono',
      'monospace'
    ].join(','),
  },
})

function Test() {
  const { data: refConfig, isLoading: isRefConfigLoading } = useConfig( 229 )
  const { data: userVotes, isLoading: isLoadingUserVotes } = useUserVotes()
  const { data: userDistributions } = useUserDistributions( 229 )

  const [ values, setValues ] = useState({
    ksm: 5,
    babyEquipped: false,
    toddlerEquipped: false,
    adolescentEquipped: false,
    adultEquipped: false,
    quizCorrect: false,
    luckMultiplier: 1.0,
  })
  //TODO
  const isWalletSettingsShowing = false

  const calculateLuck = (
    n,
    minIn,
    maxIn,
    minOut,
    maxOut,
    exponent,
    minAmount,
    luckMultiplier,
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

  const getLuckMultiplier = ( options, config ) => {
    let luckMultiplier = 1.0;

    if ( options.babyEquipped ) {
      luckMultiplier = (1 + (config.babyBonus / 100))
    } else if ( options.toddlerEquipped ) {
      luckMultiplier = (1 + (config.toddlerBonus / 100))
    } else if ( options.adolescentEquipped ) {
      luckMultiplier = (1 + (config.adolescentBonus / 100))
    } else if ( options.adultEquipped ) {
      luckMultiplier = (1 + (config.adultBonus / 100))
    }

    return luckMultiplier
  }

  /**
   * return the chances array
   */
   const lucksForConfig = ( ksm, refConfig, luckMultiplier ) => {
    const lucks = {}
    //do not calc luck for the last to items (common, default)
    //will be done below
    //TODO will have to find a filter that will filter the correct items
    const optionsToConsider = refConfig?.options.filter( opt => opt.rarity !== 'common' )
    optionsToConsider?.forEach( option => {
      if ( ksm < refConfig.median ) {
        lucks[`${ option.rarity }`] = calculateLuck(
          ksm,
          refConfig.minValue,
          refConfig.median,
          option.minProbability,
          option.sweetspotProbability,
          EXPONENT_CONSTANTS[0],
          refConfig.minAmount,
          luckMultiplier,
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
            luckMultiplier,
          )
      }
    })
    lucks.rare = (100 - lucks.epic) / 100 * lucks.rare
    lucks.common = 100 - lucks.rare - lucks.epic
    return lucks
  }

  const currentLuckMultiplier = getLuckMultiplier( values, refConfig )
  const lucks = lucksForConfig( values.ksm, refConfig, currentLuckMultiplier )
  const chartData = [
    { x: `${ parseFloat(lucks['common']).toFixed(2) }% Common `, y: lucks['common'] },
    { x: `${ parseFloat(lucks['rare']).toFixed(2) }% Rare`, y: lucks['rare'] },
    { x: `${ parseFloat(lucks['epic']).toFixed(2) }% Epic`, y: lucks['epic'] },
  ]

  const handleCheckBoxChange = ( e ) => {
    console.log( e.target.name )
    const clickedDragonBonus = [
      'babyEquipped',
      'toddlerEquipped',
      'adolescentEquipped',
      'adultEquipped'
    ].includes(e.target.name)
    setValues({
      ...values,
      babyEquipped: clickedDragonBonus ? false : values.babyEquipped,
      toddlerEquipped: clickedDragonBonus ? false : values.toddlerEquipped,
      adolescentEquipped: clickedDragonBonus ? false : values.adolescentEquipped,
      adultEquipped: clickedDragonBonus ? false : values.adultEquipped,
      [e.target.name]: e.target.checked,
    });
  }

  const handleSliderChange = ( e ) => {
    const voteAmountWithConviction = parseInt( e.target.value )
    setValues( {
      ...values,
      ksm: voteAmountWithConviction,
    } )
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
      value: refConfig?.maxValue,
      label: `${ refConfig?.maxValue } KSM`,
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
            className="overflow-visible px-6"
            innerRadius={60}
          />
        </div>
        <div className="flex flex-col">
          <ThemeProvider theme={ theme }>
            <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
              <FormLabel component="legend">Wallet Properties when voting / sendout</FormLabel>
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
                      checked={ values.babyEquipped }
                      onChange={handleCheckBoxChange}
                      name="babyEquipped"
                    />
                  }
                  label="Baby Dragon Equipped"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ values.toddlerEquipped }
                      onChange={handleCheckBoxChange}
                      name="toddlerEquipped"
                    />
                  }
                  label="Toddler Dragon Equipped"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ values.adolescentEquipped }
                      onChange={handleCheckBoxChange}
                      name="adolescentEquipped"
                    />
                  }
                  label="Adolescent Dragon Equipped"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ values.adultEquipped }
                      onChange={handleCheckBoxChange}
                      name="adultEquipped"
                    />
                  }
                  label="Adult Dragon Equipped"
                />
                <FormHelperText>Your Luck Multiplier is: { currentLuckMultiplier }</FormHelperText>
                <div className="pt-5">
                  Vote Amount With Conviction
                  <Slider
                    defaultValue={50}
                    min={ 0 }
                    max={ refConfig?.maxValue }
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
