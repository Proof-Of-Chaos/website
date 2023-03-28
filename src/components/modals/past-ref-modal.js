import { useConfig } from '../../hooks/use-config';
import { useUserDistributions } from '../../hooks/use-distributions';
import { getLuckMultiplier, lucksForConfig, microToKSM } from '../../utils';
import { useModal } from "./context";
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
import { isEqual } from 'lodash';
import Button from '../../components/ui/button';
import ConfigTable from '../../components/ui/ConfigTable'
import Loader from '../../components/ui/loader';
import { Dialog } from '@headlessui/react';
import useAppStore from '../../zustand';
import WalletConnect from '../nft/wallet-connect';
import { useUserNfts } from '../../hooks/use-nfts';
import { SingleNFT } from '../nft/ref-nfts';


const theme = createTheme({
  typography: {
    fontFamily: [
      'Ubuntu Mono',
      'monospace'
    ].join(','),
  },
})

//the default value the slider shows when nothing is loaded
const DEFAULT_KSM = 5

export default function PastReferendumModal( { id } ) {
  const { data: refConfig, isFetching: isRefConfigLoading } = useConfig( id )
  const { data: userDistributions, isFetching: isUserDistributionLoading } = useUserDistributions( id )

  const { data: userNFTs, isFetching: isUserNFTsFetching, error: userNFTsError } = useUserNfts()

  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])

  const userDistribution = userDistributions?.[0]

  const [ values, setValues ] = useState({
    ksm: DEFAULT_KSM,
    dragon: {
      babyEquipped: false,
      toddlerEquipped: false,
      adolescentEquipped: false,
      adultEquipped: false,
    },
    quizCorrect: false,
  })

  const resetToUserVote = () => {
    setValues( {
      ksm: userDistribution?.amountConsidered ?
        microToKSM( userDistribution?.amountConsidered ) :
        DEFAULT_KSM,
      dragon: {
        ...dragonEquippedStringToBools( userDistribution?.dragonEquipped )
      }
    })
  }

  const dragonEquippedStringToBools = ( equippedString ) => {
    let dragonBools = {
      babyEquipped: false,
      toddlerEquipped: false,
      adolescentEquipped: false,
      adultEquipped: false,
    }

    switch ( equippedString ) {
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
    return dragonBools
  }

  const isWalletSettingsShowing =
    values.ksm === microToKSM( userDistribution?.amountConsidered ) &&
    isEqual( values.dragon, dragonEquippedStringToBools( userDistribution?.dragonEquipped ) )

  useEffect(() => {
    const dragonBools = dragonEquippedStringToBools( userDistribution?.dragonEquipped )
    setValues({
      ...values,
      dragon: {
        ...dragonBools,
      },
      ksm: userDistribution?.amountConsidered ? microToKSM( userDistribution.amountConsidered ) : refConfig.median,
    })
  }, [ userDistribution ])


  if ( isRefConfigLoading || isUserDistributionLoading ) {
    return <Loader />
  }

  const isVoteBelowMinValue = values.ksm < refConfig?.minValue
  const currentLuckMultiplier = getLuckMultiplier( values.dragon, refConfig )
  const lucks = lucksForConfig( values.ksm, refConfig, currentLuckMultiplier )

  const chartData = ! isVoteBelowMinValue ? [
    { x: `common\n${ parseFloat(lucks['common']).toFixed(2) }%`, y: lucks['common'] },
    { x: `rare\n${ parseFloat(lucks['rare']).toFixed(2) }%`, y: lucks['rare'] },
    { x: `epic\n${ parseFloat(lucks['epic']).toFixed(2) }%`, y: lucks['epic'] },
  ] : [
    { x: `common\n${ parseFloat(lucks['common']).toFixed(2) }%`, y: lucks['common'] }
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
      dragon: {
        ...values.dragon,
        babyEquipped: clickedDragonBonus ? false : values.dragon.babyEquipped,
        toddlerEquipped: clickedDragonBonus ? false : values.dragon.toddlerEquipped,
        adolescentEquipped: clickedDragonBonus ? false : values.dragon.adolescentEquipped,
        adultEquipped: clickedDragonBonus ? false : values.dragon.adultEquipped,
        [e.target.name]: e.target.checked,
      },
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

  function sliderValueText(value) {
    return `${value} KSM`;
  }

  const marks = userDistribution ? [
    {
      value: 0,
      label: '0',
    },
    {
      value: microToKSM( userDistribution.amountConsidered ),
      label: 'Your Vote',
    },
  ] : [
    {
      value: 0,
      label: '0',
    },
    {
      value: refConfig?.maxValue,
      label: refConfig?.maxValue && `${ parseFloat( refConfig.maxValue ).toFixed(2) } KSM`,
    },
  ]

  return (
    <div className="overflow-scroll">
      <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-gray-900 pb-2">
        Past Referendum Sendout Details for #{ id }
      </Dialog.Title>
      <div className="flex flex-wrap justify-center pt-4">
        <div className="form-wrap w-full md:w-1/2">
          <h3 className="text-xl">Wallet Properties when voting / sendout</h3>
          <ThemeProvider theme={ theme }>
            <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
              <FormGroup>
                {/* <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ values.quizCorrect }
                      onChange={handleCheckBoxChange}
                      name="quizCorrect"
                    />
                  }
                  label="Quiz Answered Correctly"
                /> */}
                <FormHelperText>See how the luck distribution differs for different values</FormHelperText>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ values.dragon.babyEquipped }
                      onChange={handleCheckBoxChange}
                      name="babyEquipped"
                    />
                  }
                  label="Baby Dragon Equipped"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ values.dragon.toddlerEquipped }
                      onChange={handleCheckBoxChange}
                      name="toddlerEquipped"
                    />
                  }
                  label="Toddler Dragon Equipped"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ values.dragon.adolescentEquipped }
                      onChange={handleCheckBoxChange}
                      name="adolescentEquipped"
                    />
                  }
                  label="Adolescent Dragon Equipped"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ values.dragon.adultEquipped }
                      onChange={handleCheckBoxChange}
                      name="adultEquipped"
                    />
                  }
                  label="Adult Dragon Equipped"
                />
                <FormHelperText>Your Luck Multiplier is: { currentLuckMultiplier }</FormHelperText>
                <div className="pt-5">
                  Vote Amount With Conviction
                  { isVoteBelowMinValue && <FormHelperText>Your chance of getting a common NFT is 100% as your vote amount considered is below the minValue set for this referendum</FormHelperText> }
                  <Slider
                    min={ 0 }
                    max={ refConfig?.maxValue ? refConfig.maxValue + 10 : 50 }
                    marks={ marks }
                    value={ sliderValue }
                    step={0.1}
                    aria-label="Default"
                    valueLabelDisplay="auto"
                    getAriaValueText={ sliderValueText }
                    onChange={ handleSliderChange }
                  />
                </div>
              </FormGroup>
              { connectedAccount ? <>
                { userDistribution?.amountConsidered ?
                      <Button
                    onClick={ resetToUserVote }
                    variant={ isWalletSettingsShowing ? 'disabled' : 'calm' }
                    size={ 'small' }
                    className={ 'mt-2' }
                    disabled={ isWalletSettingsShowing ? true : false }
                  >
                    Reset to your considered values
                  </Button> : <></>
                }
                </>
              :
              <WalletConnect
                  className="w-full mt-4"
                  variant={ 'calm' }
                  title="Connect wallet to see your settings"
                  onAccountSelected={ resetToUserVote }
                />
            }
            </FormControl>
          </ThemeProvider>
        </div>
        <div className="chart-wrap w-full md:w-1/2 flex flex-col">
          <h3 className="text-xl md:text-right">Your Chances for NFTs</h3>
          <VictoryPie
            padAngle={2}
            data={ chartData }
            colorScale={["lavender", "turquoise", "gold", "cyan" ]}
            className="overflow-visible px-10"
            innerRadius={60}
            labelRadius={({ radius }) => radius - 70 }
            style={{ labels: { fontSize: 18 }, overflow: 'visible', minHeight: '200px' }}
          />
          <div className="nfts flex justify-between pr-2">
            { refConfig?.options?.map( opt => {
              const thumb = opt.resources[0].thumbCid.replace('ipfs://ipfs/', '')

              if ( ! isUserNFTsFetching && userNFTs && ! userNFTsError ) {
                const userReceivedNFT =
                  refConfig?.options[ userDistribution?.indexItemReceived ]?.rarity === opt.rarity

                return <div key={ opt.id } className="flex flex-col relative">
                  <SingleNFT 
                    nft={ {
                      ref: refConfig.referendumIndex,
                      rarity: opt.rarity,
                      thumb,
                    } }
                    owned={ userReceivedNFT }
                    ownedText={ 'received' }
                    dimensions={ 150 }
                    showFloor={ false }
                  />
                </div>
              }
            })}
          </div>
        </div>
        </div>
      <div>
      <h3 className="text-xl mt-8 mb-4">Config for sendout</h3>
        <ConfigTable json={ refConfig } />
      </div>
    </div>
  )
}