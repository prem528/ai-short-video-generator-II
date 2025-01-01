import React from 'react';
import { Wand2, FileVideo, Presentation, Code } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { icon: <Wand2 className="w-6 h-6" />, title: 'AI Generation', description: 'Generate from text' },
    { icon: <FileVideo className="w-6 h-6" />, title: 'Video Templates', description: '20+ templates' },
    { icon: <Presentation className="w-6 h-6" />, title: 'Presentations', description: 'Auto convert' },
    { icon: <Code className="w-6 h-6" />, title: 'API Access', description: 'Developer tools' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div className="p-3 bg-purple-50 rounded-lg text-primary mb-3">
            {action.icon}
          </div>
          <h3 className="font-medium text-gray-900">{action.title}</h3>
          <p className="text-sm text-gray-500">{action.description}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;