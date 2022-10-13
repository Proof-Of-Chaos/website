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
import { getLuckMultiplier, lucksForConfig, microToKSM } from '../utils';
import { isNumber } from 'lodash';

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
  const { data: userDistributions } = useUserDistributions( 229 )

  const userDistribution = userDistributions?.[0]

  const [ values, setValues ] = useState({
    ksm: 5,
    babyEquipped: false,
    toddlerEquipped: false,
    adolescentEquipped: false,
    adultEquipped: false,
    quizCorrect: false,
    luckMultiplier: 1.0,
  })

  useEffect(() => {
    let dragonBools = {}
    switch (userDistribution?.dragonEquipped) {
      case "Adult":
        dragonBools.adultEquipped = true;
        break;
      case "Adolescent":
        dragonBools.adolescentEquipped = true;
        break;
      case "Toddler":
        dragonBools.toddlerEquipped = true;
        break;
      case "Baby":
        dragonBools.babyEquipped = true;
        break;
      default:
    }

    console.log( 'useEffect', userDistribution, microToKSM( userDistribution?.amountConsidered ))

    setValues({
      ...values,
      ...dragonBools,
      ksm: microToKSM( userDistribution?.amountConsidered ),
    })
  }, [ userDistribution ])

  //TODO the current values are equal to what the user voted / had when voting
  const isWalletSettingsShowing = false

  const currentLuckMultiplier = getLuckMultiplier( values, refConfig )
  const lucks = lucksForConfig( values.ksm, refConfig, currentLuckMultiplier )
  const chartData = [
    { x: `${ parseFloat(lucks['common']).toFixed(2) }% Common `, y: lucks['common'] },
    { x: `${ parseFloat(lucks['rare']).toFixed(2) }% Rare`, y: lucks['rare'] },
    { x: `${ parseFloat(lucks['epic']).toFixed(2) }% Epic`, y: lucks['epic'] },
  ]

  const handleCheckBoxChange = ( e ) => {
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

  const sliderValue = values.ksm

  const marks = userDistribution ? [
    {
      value: 0,
      label: '0',
    },
    {
      value: microToKSM( userDistribution.amountConsidered ),
      label: 'Your Vote',
    },
    {
      value: refConfig?.maxValue,
      label: `${ refConfig?.maxValue } KSM`,
    },
  ] : [
    {
      value: 0,
      label: '0',
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
                    min={ 0 }
                    max={ refConfig?.maxValue ? refConfig.maxValue + 10 : 50 }
                    marks={ marks }
                    value={ sliderValue }
                    step={ 0.1 }
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
        <pre className="text-xs">user distribution{JSON.stringify(userDistribution, null, 2) }</pre>
      </div>
    </>
  )
}

Test.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default Test
