import React from 'react';
import { TrendingUpIcon as ArrowTrendingUpIcon, BarChartIcon as ChartBarIcon, BanknoteIcon as BanknotesIcon } from 'lucide-react';

function ROIStatistics() {
  return (
    <div className="bg-gradient-to-b from-white to-white py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-noraml text-navy-900 mb-6 text-black">
            Increase ROI by testing more ads with less effort
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto">
            Creatify helps you generate unlimited ad variations to test and find the ones that resonate most with 
            your audience, maximizing your revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* More Leads Stat */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <ArrowTrendingUpIcon className="w-12 h-12 text-purple-600" />
              </div>
              <div className="text-6xl font-noraml text-blue-600 mb-3">2.7x</div>
              <div className="text-xl text-gray-700 font-medium">More leads*</div>
            </div>
          </div>

          {/* Higher ROI Stat */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <ChartBarIcon className="w-12 h-12 text-purple-600" />
              </div>
              <div className="text-6xl ont-noraml text-blue-600 mb-3">1.7x</div>
              <div className="text-xl text-gray-700 font-medium">Higher ROI*</div>
            </div>
          </div>

          {/* Cost Savings Stat */}
          <div className="bg-white rounded-2xl p-8 shadow-lg ">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <BanknotesIcon className="w-12 h-12 text-purple-600" />
              </div>
              <div className="text-6xl ont-noraml text-blue-600 mb-3">90%</div>
              <div className="text-xl text-gray-700 font-medium">Cheaper than UGC ads</div>
            </div>
          </div>
        </div>

        {/* <div className="text-center mt-8 text-sm text-gray-500">
          *Compared to image ads: <a href="#" className="text-purple-600 hover:underline">source</a>
        </div> */}
      </div>
    </div>
  );
}

export default ROIStatistics;