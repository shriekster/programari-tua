// TODO: subscribe to client events (SSE) 
import { useState, useEffect } from 'react';

import { useGlobalStore } from '../useGlobalStore';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setLoading,
  setSubcriptionId,
  setDates,
  setTimeRanges,
} = useGlobalStore.getState();

export default function Home() {

  const loading = useGlobalStore((state) => state.loading);
  const subscriptionId = useGlobalStore((state) => state.subcriptionId);

  return (
    <>
    HOME
    </>
  )
}
