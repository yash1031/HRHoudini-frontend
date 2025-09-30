// components/AmplifyProvider.tsx
'use client';
import { useEffect } from 'react';
import { Amplify, ResourcesConfig } from 'aws-amplify';
import amplifyConfig from '../lib/amplify-config';

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('Configuring Amplify...');
    Amplify.configure(amplifyConfig as ResourcesConfig);
    console.log('Amplify configured successfully!');
  }, []);

  return <>{children}</>;
}