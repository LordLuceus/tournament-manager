'use client';

import { useState } from 'react';
import { marked } from 'marked';

interface MatchReportEditorProps {
  initialReport?: string;
  isOpen: boolean;
  onSave: (report: string) => void;
  onCancel: () => void;
  matchTitle: string;
}

export default function MatchReportEditor({
  initialReport = '',
  isOpen,
  onSave,
  onCancel,
  matchTitle,
}: MatchReportEditorProps) {
  const [report, setReport] = useState(initialReport);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(report);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Match Report - {matchTitle}
          </h2>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`px-4 py-2 rounded transition-colors ${
                  !isPreviewMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📝 Write
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`px-4 py-2 rounded transition-colors ${
                  isPreviewMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                👁️ Preview
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {!isPreviewMode ? (
              <div className="h-full">
                <textarea
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  placeholder="Write your match report in Markdown format...

Examples:
**Bold text**
*Italic text*
`Code or highlight`
# Heading 1
## Heading 2
### Heading 3

Match Summary:
- Winner demonstrated excellent strategy
- Close match with several lead changes
- Notable plays or moments"
                  className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            ) : (
              <div className="h-full bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-auto">
                {report ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: marked(report),
                    }}
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No content to preview. Switch to Write mode to add content.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
}