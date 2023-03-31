import Layout from '../layouts/layout'
import useAppStore from '../zustand';
import Button from '../components/ui/button';
import { useForm } from "react-hook-form";
import { useVoteManager } from '../hooks/use-vote-manager';
import { useIsMounted } from '../hooks/use-is-mounted';
import { useRef, useState } from 'react';
import classNames from 'classnames'
import {
  Slider,
} from '@mui/material';

const VOTE_LOCK_OPTIONS = [
  {
    value: 0.1,
    label: 'No lockup',
  },
  {
    value: 1,
    label: 'Locked for 1 enactment period (8 days)',
  },
  {
    value: 2,
    label: 'Locked for 2 enactment periods (16 days)',
  },
  {
    value: 3,
    label: 'Locked for 4 enactment periods (32 days)',
  },
  {
    value: 4,
    label: 'Locked for 8 enactment periods (64 days)',
  },
  {
    value: 5,
    label: 'Locked for 16 enactment periods (128 days)',
  },
  {
    value: 6,
    label: 'Locked for 32 enactment periods (256 days)',
  },
]

const marks = [
  {
    value: 0,
    label: '0.1x',
  },
  {
    value: 1,
    label: '1x',
  },
  {
    value: 2,
    label: '2x',
  },
  {
    value: 3,
    label: '3x',
  },
  {
    value: 4,
    label: '4x',
  },
  {
    value: 5,
    label: '5x',
  },
  {
    value: 6,
    label: '6x',
  },
]

function Test() {
  const { voteOnRef } = useVoteManager();

  const [voteChoice, setVoteChoice] = useState('aye') 
  const [sliderValue,setSliderValue] = useState(VOTE_LOCK_OPTIONS[1])
  const sliderRef = useRef()

  function sliderValueText(value) {
    return `${value} KSM`;
  }

  const handleSliderChange = ( e ) => {
   setSliderValue( VOTE_LOCK_OPTIONS[ e.target.value ] )
  }

  function valuetext(value) {
    return `${value}°C`;
  }

  function valueLabelFormat(value) {
    return marks[Math.floor(value)]?.label;
  }

  const { register, getValues, handleSubmit, watch, formState: { errors } } = useForm({
      defaultValues: {
        'vote-amount-aye': '1',
        'vote-amount-nay': '0',
        'vote-amount-abstain': '0',
      }
  });
  const onSubmit = data => console.log({
    ...data,
    voteChoice
  });



  const watchAyeVoteAmount = watch("vote-amount-aye", 0);
  const watchNayVoteAmount = watch("vote-amount-nay", 0);
  const watchAbstainVoteAmount = watch("vote-amount-abstain", 0);

  const userFundsAvailable = 15

  const totalAyeVotes = ! isNaN( parseFloat( watchAyeVoteAmount ) ) ? 
    voteChoice === 'aye' ? 
      (parseFloat(sliderValue.value) * parseFloat(watchAyeVoteAmount)).toFixed(2).replace(/[.,]00$/, "") :
        parseFloat(watchAyeVoteAmount).toFixed(2).replace(/[.,]00$/, "") :
          '-'

  const totalNayVotes = ! isNaN( parseFloat( watchNayVoteAmount ) ) ? 
    voteChoice === 'nay' ? 
      (parseFloat(sliderValue.value) * parseFloat(watchNayVoteAmount)).toFixed(2).replace(/[.,]00$/, "") :
        parseFloat(watchNayVoteAmount).toFixed(2).replace(/[.,]00$/, "") :
          '-'

  const totalAbstainVotes = ! isNaN( parseFloat( watchAbstainVoteAmount ) ) ? 
    (parseFloat(watchAbstainVoteAmount)).toFixed(2).replace(/[.,]00$/, "") :
        '-'

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="m-6"
      >

        <div className="flex">
          <Button
            hoverTranslate={ false }
            className={ classNames(
              "aye vote-button h-10 rounded-none rounded-l-lg mr-0 w-1/4 bg-gradient-to-r from-green-500/20 to-green-700/20 border-y-2 border-l-2 border-green-700 text-black",
              { selected: voteChoice === 'aye'}
            )}
            onClick={ async () => setVoteChoice('aye') }>
            Aye
          </Button>
          <Button
            hoverTranslate={ false }
            className={ classNames(
              "nay vote-button h-10 rounded-none mr-0 w-1/4 bg-gradient-to-r from-red-500/20 to-red-700/20 border-y-2 border-red-700 text-black",
              { selected: voteChoice === 'nay'}
            )}
            onClick={ async () => setVoteChoice('nay') }>
            Nay
          </Button>
          <Button
            hoverTranslate={ false }
            className={ classNames(
              "split vote-button h-10 rounded-none mr-0 w-1/4 bg-gradient-to-r from-yellow-500/20 to-yellow-700/20 border-y-2 border-yellow-500 border-l-gray-500 text-black",
              { selected: voteChoice === 'split'}
            )}
            onClick={ async () => setVoteChoice('split') }>
            Split
          </Button>
          <Button
            hoverTranslate={ false }
            className={ classNames(
              "abstain vote-button h-10 rounded-none rounded-r-lg mr-0 w-1/4 bg-gradient-to-r from-gray-500/20 to-gray-700/20 border-y-2 border-r-2 border-gray-500 text-black",
              { selected: voteChoice === 'abstain'}
            )}
            onClick={ async () => setVoteChoice('abstain') }>
            Abstain
          </Button>
        </div>

        { ['aye', 'split', 'abstain'].includes(voteChoice) && <>
        <label
          htmlFor='vote-amount-aye'
          className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
        >
          Aye Vote Value
        </label>
        <input
          className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg"
          placeholder="0"
          type="number"
          {...register("vote-amount-aye", {
            validate: {
              positiveNumber: (value) => parseFloat(value) >= 0,
              hasEnoughFunds: (value) => userFundsAvailable && parseFloat(value) <= userFundsAvailable
            }
          })}
        />
        {errors['vote-amount-aye'] && errors['vote-amount-aye'].type === "positiveNumber" && (
          <p className="form-error">Your vote amount must be a positive number</p>
        )}
        {errors['vote-amount-aye'] && errors['vote-amount-aye'].type === "hasEnoughFunds" && (
          <p className="form-error">You do not have enough available KSM</p>
        )} 
      </> }

      { ['nay', 'split', 'abstain'].includes(voteChoice) && <>
        <label
          htmlFor='vote-amount-nay'
          className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
        >
          Nay Vote Value
        </label>
        <input
          className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg"
          placeholder="0"
          type="number"
          {...register("vote-amount-nay", {
            validate: {
              positiveNumber: (value) => parseFloat(value) >= 0,
              hasEnoughFunds: (value) => userFundsAvailable && parseFloat(value) <= userFundsAvailable
            }
          })}
        />
        {errors['vote-amount-nay'] && errors['vote-amount-nay'].type === "positiveNumber" && (
          <p className="form-error">Your vote amount must be a positive number</p>
        )}
        {errors['vote-amount-nay'] && errors['vote-amount-nay'].type === "hasEnoughFunds" && (
          <p className="form-error">You do not have enough available KSM</p>
        )} 
      </> }

      { voteChoice === 'abstain' && <>
        <label
          htmlFor='vote-amount-abstain'
          className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
        >
          Abstain Vote Value
        </label>
        <input
          className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg"
          placeholder="0"
          type="number"
          {...register("vote-amount-abstain", {
            validate: {
              positiveNumber: (value) => parseFloat(value) >= 0,
              hasEnoughFunds: (value) => userFundsAvailable && parseFloat(value) <= userFundsAvailable
            }
          })}
        />
        {errors['vote-amount-abstain'] && errors['vote-amount-abstain'].type === "positiveNumber" && (
          <p className="form-error">Your vote amount must be a positive number</p>
        )}
        {errors['vote-amount-abstain'] && errors['vote-amount-abstain'].type === "hasEnoughFunds" && (
          <p className="form-error">You do not have enough available KSM</p>
        )} 
      </> }

      <label
        htmlFor='conviction-slider'
        className={ classNames(
          "mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white",
          {
            hidden: ['split', 'abstain'].includes(voteChoice)
          }
        )}
      >
        Conviction
      </label>
      <Slider
        id="conviction-slider"
        className={ classNames(
          "conviction-slider",
          {
            hidden: ['split', 'abstain'].includes(voteChoice)
          }
        )}
        defaultValue={1}
        min={ 0 }
        max={ 6 }
        marks={ marks }
        value={ sliderValue.value }
        aria-label="Default"
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat}
        getAriaValueText={valuetext}
        onChange={ handleSliderChange }
        ref={ sliderRef }
      />
      {sliderValue.value !== 0 && 
        <p className="text-sm text-right">{ sliderValue.label }</p>
      }

      <div className="mt-4 justify-around items-center rounded-lg form-status bg-gray-300 p-3 px-4 flex flex-row">
        <span className="">Total Votes</span>
        <div className="text-right">
          <p>{ ['aye', 'split', 'abstain'].includes(voteChoice) && <><span className="font-bold">{ totalAyeVotes }</span> Aye Votes</> }</p>
          <p>{ ['nay', 'split', 'abstain'].includes(voteChoice) && <><span className="font-bold">{ totalNayVotes }</span> Nay Votes </> }</p>
          <p>{ voteChoice === 'abstain' && <><span className="font-bold">{ totalAbstainVotes }</span> Abstain Votes </> }</p>
        </div>
      </div>

      <Button 
        type="submit" 
        variant="black"
        className="w-full mt-4"
      >
        Send Votes
      </Button>
    </form>
    </div>
  )
}

Test.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default Test
