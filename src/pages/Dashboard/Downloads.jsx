import React from 'react';
import { Download } from 'lucide-react';

const Downloads = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Download className="h-6 w-6 text-zan-cyan" />
        Downloads
      </h2>
      <div className="bg-background border border-white/10 rounded-lg p-8 text-center">
        <p className="text-gray-300">You have no downloadable products yet.</p>
      </div>
    </div>
  );
};

export default Downloads;

