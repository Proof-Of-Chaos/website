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
import { Todos } from '../components/ui/todos';
import ReferendumDetail from '../components/ui/referendum/referendum-detail';
import { ReferendumVoteForm } from '../components/ui/referendum/referendum-vote-form';

function Test() {
  return <ReferendumVoteForm />
}

Test.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default Test
