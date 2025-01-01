import React from 'react';
import { DashboardCard } from './DashboardCard';
import { Film, Clock, Zap } from 'lucide-react';

const mockVideos = [
  { id: '1', title: 'Product Showcase', duration: '2:30', status: 'completed' },
  { id: '2', title: 'Tutorial Video', duration: '5:45', status: 'processing' },
  { id: '3', title: 'Company Introduction', duration: '3:15', status: 'failed' },
];

export const MainDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Total Videos"
          value={42}
          icon={Film}
          description="Videos created this month"
        />
        <DashboardCard
          title="Processing Time"
          value="1. 5 minutes"
          icon={Clock}
          description="Average processing time"
        />
        <DashboardCard
          title="Credits Used"
          value={85}
          icon={Zap}
          description="Out of 100 monthly credits"
        />
      </div>
    </div>
  );
};
