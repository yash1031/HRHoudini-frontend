'use client';

import { useEffect, useState } from 'react';

export default function Healthz() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/healthz')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <>
      {data?.ok && <h1>Success</h1>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}


