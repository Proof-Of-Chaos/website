import { useEffect, useRef, useState } from "react";
import useSWR from 'swr';
import { Dialog } from "@headlessui/react";
import { getQuizAnswers, getQuizById, storeQuizAnswers } from "../../data/vote-service";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';
import useAppStore from "../../zustand";
import { useQuizzes } from "../../lib/hooks/use-quizzes";
import { every } from "lodash";
import { validate } from "graphql";

export default function ReferendumQuizModal( { id, title } ) {
  const { closeModal } = useModal();
  const fieldsetRef = useRef();
  const validationRef = useRef();
  const { data: initialAnswers } = useSWR( 'answers', async () => getQuizAnswers() );
  // const { data: questions, error } = useSWR( 'questions', async () => getQuizById( id ) );
  const [ userAnswers, setUserAnswers ] = useState({});

  const { quizzes } = useQuizzes();
  const questions = quizzes?.[id];

  const updateQuiz = useAppStore( ( state ) => state.updateQuiz );
  const currentQuiz = useAppStore(( ( state ) => state.user.quizAnswers[id] ) )

  const isFormFilled = currentQuiz?.answers && Object.keys(currentQuiz.answers).length === questions.length

  async function onSend() {
    if ( ! isFormFilled ) {
      return
    }

    toast.promise(
      storeQuizAnswers( userAnswers ),
      {
        pending: `sending your quiz answers for referendum ${ id }`,
        success: 'answers successfully recorded 🗳️',
        error: 'error recording answers 🤯'
      }
    ).then( () => { closeModal() } );
  }

  useEffect( () => {
    if ( initialAnswers ) {
      console.log( 'retrieved answers from storage', initialAnswers )
      setUserAnswers( initialAnswers )
      onLoadAnswers()
    }
  }, [ initialAnswers ] )

  function onLoadAnswers( loadedAnswers ){
    console.log( 'onloadanswers' );
    loadedAnswers?.map( (a) => {
      console.log( a );
    })
  }

  function onChangeInputs( e, questionIndex, multiple ) {
    let qAnswer = null;
    if ( multiple ) {
      const checkboxes = document.querySelectorAll(`[name=ref${id}question${questionIndex}]`)
      qAnswer = [ ...checkboxes ].reduce(
        ( prev, cur, idx ) => {
        return [ ...prev, cur.checked ];
       },
       []
      )
    } else {
      qAnswer = e.target.value
    }

    const newUserAnswers = {
      [`${ questionIndex }`]: qAnswer,
    }
    console.log( `user changed answer for ref ${ id } question ${ questionIndex } to ${ qAnswer }` )
    // setUserAnswers( newUserAnswers );
    updateQuiz( id, newUserAnswers );
  }

  return(
    <>
      <Dialog.Title as="h3" className="text-xl font-medium leg-6 text-gray-900">
        Quiz for Referendum { id }
      </Dialog.Title>
      <div className="mt-1 text-sm">
        { title }
      </div>
      { ! questions ?
        <div className="min-h-[200px] flex justify-center items-center">Loading...</div>
      :
        <>
          <form className="mt-4 pr-4 overflow-y-scroll flex-1">
            { questions.map( ( { question, answers, multiple }, i) => {
              const selectOptions = answers.map( (a, j) => {
                return {
                  value: j,
                  label: a,
                }
              })
              return (
                <fieldset
                  key={ `quiz-${i}`}
                  className="px-4 pt-2 pb-3 font-semibold border-2 border-gray-400 hover:border-gray-500 hover:shadow-lg transition rounded-md my-6"
                >
                  <legend className="px-3">{ question }</legend>
                  <Input
                    type={ multiple ? 'checkbox' : 'radio' }
                    id={`r${id}q${i}`}
                    name={ `ref${id}question${i}` }
                    options={ selectOptions }
                    onChange={ (e) => onChangeInputs( e, i, multiple ) }
                  />
                </fieldset>
              )
            })
          }
          </form>

            <div className="mt-4">
              <Button
                className="mr-2"
                variant={ isFormFilled ? 'primary' : 'disabled' }
                disabled={ ! isFormFilled }
                onClick={ onSend }
              >
                Submit
              </Button>
              <Button
                variant="calm"
                onClick={ closeModal }>
                Cancel
              </Button>
            </div>
        </>
      }
    </>
  )
}