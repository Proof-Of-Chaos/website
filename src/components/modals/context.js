import { atom, useAtom } from 'jotai';

const modalAtom = atom({ isOpen: false, view: '' });

export function useModal() {
  const [state, setState] = useAtom(modalAtom);
  const openModal = (view) => {
    console.log( 'will open modal', view );
    setState({ ...state, isOpen: true, view });
  }
  const closeModal = () => setState({ ...state, isOpen: false });

  return {
    ...state,
    openModal,
    closeModal,
  };
}
