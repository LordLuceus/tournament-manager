'use client';

import { useState, useRef, useCallback } from 'react';
import { Contestant } from '@/types/tournament';

interface ManualBracketSetupProps {
  contestants: Contestant[];
  onConfirm: (orderedContestants: Contestant[]) => void;
  onBack: () => void;
}

export default function ManualBracketSetup({ contestants, onConfirm, onBack }: ManualBracketSetupProps) {
  const [orderedContestants, setOrderedContestants] = useState<Contestant[]>([...contestants]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [liveRegionMessage, setLiveRegionMessage] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const updateLiveRegion = useCallback((message: string) => {
    setLiveRegionMessage(message);
    setTimeout(() => setLiveRegionMessage(''), 3000);
  }, []);

  const moveContestant = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newOrder = [...orderedContestants];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setOrderedContestants(newOrder);
    
    updateLiveRegion(
      `${movedItem.name} moved to position ${toIndex + 1} of ${newOrder.length}`
    );
  }, [orderedContestants, updateLiveRegion]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    updateLiveRegion(`Started dragging ${orderedContestants[index].name}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      moveContestant(draggedIndex, dropIndex);
      setDraggedIndex(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (selectedIndex === null) {
          setSelectedIndex(index);
          updateLiveRegion(
            `${orderedContestants[index].name} selected. Navigate to desired position and press Enter to place, or Escape to cancel.`
          );
        } else if (selectedIndex === index) {
          setSelectedIndex(null);
          updateLiveRegion('Selection cancelled');
        } else {
          moveContestant(selectedIndex, index);
          setSelectedIndex(null);
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
          if (selectedIndex !== null) {
            // Provide feedback about potential placement when in selection mode
            updateLiveRegion(
              `Would place ${orderedContestants[selectedIndex].name} at position ${index}. Press Enter to confirm.`
            );
          }
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (index < orderedContestants.length - 1) {
          (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
          if (selectedIndex !== null) {
            // Provide feedback about potential placement when in selection mode
            updateLiveRegion(
              `Would place ${orderedContestants[selectedIndex].name} at position ${index + 2}. Press Enter to confirm.`
            );
          }
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(null);
        updateLiveRegion('Selection cancelled');
        break;
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveContestant(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < orderedContestants.length - 1) {
      moveContestant(index, index + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {liveRegionMessage}
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        Arrange Tournament Bracket
      </h2>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
        Drag and drop contestants to reorder them, or use keyboard navigation: 
        Arrow keys or Tab to navigate, Enter to select, navigate to destination, Enter to place.
        The first two contestants will face each other in the first match.
      </p>

      <div 
        ref={containerRef}
        className="space-y-2 mb-6"
        role="list"
        aria-label="Tournament bracket order"
      >
        {orderedContestants.map((contestant, index) => (
          <div
            key={contestant.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="listitem"
            aria-label={`${contestant.name}, position ${index + 1} of ${orderedContestants.length}`}
            aria-describedby={`contestant-${contestant.id}-instructions`}
            className={`
              flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-move
              ${selectedIndex === index 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                : draggedIndex === index
                ? 'border-gray-400 bg-gray-100 dark:bg-gray-700 opacity-50'
                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="font-mono font-semibold">#{index + 1}</span>
                <div className="text-gray-400 dark:text-gray-500">⋮⋮</div>
              </div>
              
              <div>
                <div className="font-medium text-gray-800 dark:text-white">
                  {contestant.name}
                </div>
                {index % 2 === 0 && index + 1 < orderedContestants.length && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    First match vs {orderedContestants[index + 1]?.name}
                  </div>
                )}
                {index % 2 === 1 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    First match vs {orderedContestants[index - 1]?.name}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                aria-label={`Move ${contestant.name} up one position`}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedContestants.length - 1}
                aria-label={`Move ${contestant.name} down one position`}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ▼
              </button>
            </div>
            
            <div id={`contestant-${contestant.id}-instructions`} className="sr-only">
              Press Enter or Space to select this contestant for moving. Then navigate to the desired position and press Enter again to place.
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Tournament Preview
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div className="font-medium">First Round Matches:</div>
          {Array.from({ length: Math.ceil(orderedContestants.length / 2) }, (_, i) => {
            const contestant1 = orderedContestants[i * 2];
            const contestant2 = orderedContestants[i * 2 + 1];
            return (
              <div key={i} className="ml-4">
                Match {i + 1}: {contestant1?.name} vs {contestant2?.name || 'BYE'}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(orderedContestants)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Start Tournament
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <div><strong>Keyboard shortcuts:</strong></div>
        <div>• Tab/Shift+Tab or Arrow keys: Navigate between contestants</div>
        <div>• Enter/Space: Select contestant, then navigate to destination and Enter to place</div>
        <div>• Escape: Cancel selection</div>
      </div>
    </div>
  );
}