"use client";

import { Contestant, Match } from "@/types/tournament";
import { useState } from "react";
import { marked } from "marked";
import MatchReportEditor from "./MatchReportEditor";

interface MatchCardProps {
  match: Match;
  onSelectWinner: (matchId: string, winner: Contestant) => void;
  onUpdateReport?: (matchId: string, report: string) => void;
  isReadOnly?: boolean;
}

export default function MatchCard({
  match,
  onSelectWinner,
  onUpdateReport,
  isReadOnly = false,
}: MatchCardProps) {
  const [isReportEditorOpen, setIsReportEditorOpen] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  if (match.isBye) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 min-w-[200px]">
        <div className="text-center">
          <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            {match.winner?.name}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            (BYE)
          </div>
        </div>
      </div>
    );
  }

  if (!match.contestant1 && !match.contestant2) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-w-[200px]">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Waiting for contestants...
        </div>
      </div>
    );
  }

  const isActive = match.contestant1 && match.contestant2 && !match.isFinished;

  return (
    <div
      className={`border rounded-lg p-4 min-w-[200px] ${
        match.isFinished
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : isActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
      }`}
    >
      <div className="space-y-2">
        {/* Contestant 1 */}
        <div
          className={`p-2 rounded cursor-pointer transition-colors ${
            match.isFinished && match.winner?.id === match.contestant1?.id
              ? "bg-green-200 dark:bg-green-800 font-medium"
              : isActive
              ? "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              : "bg-gray-50 dark:bg-gray-700"
          }`}
          onClick={() => {
            if (isActive && match.contestant1) {
              onSelectWinner(match.id, match.contestant1);
            }
          }}
        >
          <div className="text-center">{match.contestant1?.name || "TBD"}</div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          vs
        </div>

        {/* Contestant 2 */}
        <div
          className={`p-2 rounded cursor-pointer transition-colors ${
            match.isFinished && match.winner?.id === match.contestant2?.id
              ? "bg-green-200 dark:bg-green-800 font-medium"
              : isActive
              ? "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              : "bg-gray-50 dark:bg-gray-700"
          }`}
          onClick={() => {
            if (isActive && match.contestant2) {
              onSelectWinner(match.id, match.contestant2);
            }
          }}
        >
          <div className="text-center">{match.contestant2?.name || "TBD"}</div>
        </div>
      </div>

      {match.isFinished && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center text-sm text-green-700 dark:text-green-300 font-medium mb-3">
            Winner: {match.winner?.name}
          </div>

          {/* Match Report Section */}
          {match.report ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                📝 Match Report
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
                <div
                  className={`text-gray-700 dark:text-gray-300 prose prose-xs max-w-none dark:prose-invert ${
                    !showFullReport && "line-clamp-3"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: marked(
                      match.report.length > 100 && !showFullReport
                        ? `${match.report.substring(0, 100)}...`
                        : match.report
                    ),
                  }}
                />
                {match.report.length > 100 && (
                  <button
                    onClick={() => setShowFullReport(!showFullReport)}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-xs mt-1"
                  >
                    {showFullReport ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
              {!isReadOnly && onUpdateReport && (
                <button
                  onClick={() => setIsReportEditorOpen(true)}
                  className="w-full text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  ✏️ Edit Report
                </button>
              )}
            </div>
          ) : (
            !isReadOnly &&
            onUpdateReport && (
              <button
                onClick={() => setIsReportEditorOpen(true)}
                className="w-full text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                📝 Add Match Report
              </button>
            )
          )}
        </div>
      )}

      {isActive && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center text-sm text-blue-600 dark:text-blue-400">
            Click contestant to select winner
          </div>
        </div>
      )}

      {/* Match Report Editor */}
      <MatchReportEditor
        initialReport={match.report || ""}
        isOpen={isReportEditorOpen}
        onSave={(report) => {
          if (onUpdateReport) {
            onUpdateReport(match.id, report);
          }
          setIsReportEditorOpen(false);
        }}
        onCancel={() => setIsReportEditorOpen(false)}
        matchTitle={`${match.contestant1?.name || "TBD"} vs ${
          match.contestant2?.name || "TBD"
        }`}
      />
    </div>
  );
}
