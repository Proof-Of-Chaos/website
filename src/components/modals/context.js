import { atom, useAtom } from 'jotai';

const modalAtom = atom({ isOpen: false, view: '', props:{} });

export function useModal() {
  const [state, setState] = useAtom(modalAtom);
  const openModal = (view, props) => {
    console.log( 'will open modal', view, 'with props', props );
    setState({ ...state, isOpen: true, view, props });
  }
  const closeModal = () => setState({ ...state, isOpen: false });

  return {
    ...state,
    openModal,
    closeModal,
  };
}
