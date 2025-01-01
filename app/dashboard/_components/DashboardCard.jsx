import React from 'react';
import PropTypes from 'prop-types';

export const DashboardCard = ({header, amount, title, value, icon: Icon, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  description: PropTypes.string.isRequired,
};
