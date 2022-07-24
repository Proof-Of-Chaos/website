import { useEffect, useState } from "react";
import useSWR from 'swr';
import { Dialog } from "@headlessui/react";
import { getQuizById, setTimeoutPromise } from "../../data/vote-service";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';

export default function ReferendumQuizModal( { id, title } ) {
  const { closeModal } = useModal();
  const { data, error } = useSWR('quizzes', async  () => getQuizById( id ) );

  async function onSend() {
    toast.promise(
      setTimeoutPromise(3000),
      {
        pending: `sending your quiz answers for referendum ${ id }`,
        success: 'answers successfully recorded 🗳️',
        error: 'error recording answers 🤯'
      }
    ).then( () => { closeModal() } );
  }

  return(
    <>
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
        Quiz for Referendum { id }
      </Dialog.Title>
      <div className="mt-2">
        { title }
      </div>
      { ! data ?
        <div>Loading...</div>
      :
        <>
          <form className="mt-5">
            { data.map( ( { question, answers }, idx) => {
              const selectOptions = answers.map( a => {
                return {
                  value: idx,
                  label: a,
                }
              })
              console.log( 'so', selectOptions, question, answers );
              return (<Input
                key={ `quiz-${idx}`}
                type="select"
                id={`q${idx}`}
                label="test"
              />)
            })
          }
          </form>

            <div className="mt-6">
              <Button
                className="mr-2 bg-green-500 hover:bg-green-600"
                onClick={ onSend }>
                Submit
              </Button>
              <Button
                variant="warning"
                onClick={ closeModal }>
                Cancel
              </Button>
            </div> 
        </>
      }
    </>
  )
}