import { useEffect } from 'react';

import useGlobalStore from './useGlobalStore';

export function useIsHuman() {

  const [isHuman, setHuman] = useGlobalStore((state) => [state.isHuman, state.setHuman]);
  const [isVerifying, setVerifying] = useGlobalStore((state) => [state.isVerifying, state.setVerifying]);

  useEffect(() => {

    const checkHumanity = async () => {

      if (!isHuman) {

        setVerifying(true);

        


      }

    };

    checkHumanity();

  }, [isHuman, setHuman, setVerifying]);

}

