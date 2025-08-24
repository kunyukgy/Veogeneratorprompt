
import React from 'react';
import { Button } from './ui/Button';

interface JsonOutputProps {
  jsonData: string;
  projectTitle?: string;
  showToast: (message: string) => void;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ jsonData, projectTitle, showToast }) => {
  const handleCopy = () => {
    if (!jsonData) {
      showToast('Generate JSON first!');
      return;
    }
    navigator.clipboard.writeText(jsonData)
      .then(() => showToast('JSON copied to clipboard!'))
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy JSON.');
      });
  };

  const handleDownload = () => {
    if (!jsonData) {
      showToast('Generate JSON first!');
      return;
    }
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (projectTitle || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safeTitle}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSON file downloaded!');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">JSON Output</h2>
        <div className="flex gap-2">
          <Button onClick={handleCopy}>Copy JSON</Button>
          <Button onClick={handleDownload} variant="secondary">Download .json</Button>
        </div>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
        <pre><code className="text-sm text-green-300 whitespace-pre-wrap break-all">
          {jsonData || '// Click "Generate JSON" to see the output here.'}
        </code></pre>
      </div>
    </div>
  );
};

export default JsonOutput;
