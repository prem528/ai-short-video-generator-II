'use client';

import { useState } from 'react';
import CustomLoading from '@/components/CustomLoading';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    setLoading(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Test CustomLoading Component</h1>
      <Button onClick={toggleLoading}>
        {loading ? 'Hide Loading' : 'Show Loading'}
      </Button>
      <CustomLoading loading={loading} />
    </div>
  );
}