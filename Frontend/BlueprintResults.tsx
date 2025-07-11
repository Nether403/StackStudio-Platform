import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CostProjection, CostBreakdown } from '../Engine/cost-projection-engine';

interface BlueprintResultsProps {
  blueprint: {
    summary: string;
    recommendedStack: Array<{
      name: string;
      category: string;
      reason: string;
      compatibilityScore: number;
    }>;
    warnings: Array<{
      type: string;
      message: string;
    }>;
    projectPrompt: string;
    costProjection?: CostProjection;
  };
  onCreateRepository?: () => void;
  isCreatingRepo?: boolean;
  projectName?: string;
}

export default function BlueprintResults({ 
  blueprint, 
  onCreateRepository, 
  isCreatingRepo = false,
  projectName = 'Untitled Project'
}: BlueprintResultsProps) {
  const { data: session } = useSession();
  const [isExportingToOrganizer, setIsExportingToOrganizer] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const costProjection = blueprint.costProjection;

  const handleExportToOrganizer = async () => {
    if (!session) {
      alert('Please log in to export to organizer');
      return;
    }

    setIsExportingToOrganizer(true);
    setExportSuccess(false);

    try {
      // For now, we'll use a simple session-based auth approach
      // This would need to be updated based on your Firebase integration
      const response = await fetch('/api/organizer/create-from-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer session-token`
        },
        body: JSON.stringify({
          blueprintData: blueprint,
          projectName: projectName
        })
      });

      if (response.ok) {
        const result = await response.json();
        setExportSuccess(true);
        alert(`Successfully exported to organizer! Created ${result.summary.tasksCreated} tasks across ${result.summary.columnsCreated} columns.`);
      } else {
        const error = await response.json();
        if (response.status === 409) {
          alert('A board for this project already exists. Please check your organizer.');
        } else {
          throw new Error(error.error || 'Failed to export to organizer');
        }
      }
    } catch (error) {
      console.error('Export to organizer error:', error);
      alert('Failed to export to organizer. Please try again.');
    } finally {
      setIsExportingToOrganizer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Blueprint Summary</h3>
        <p className="text-blue-800">{blueprint.summary}</p>
      </div>

      {/* Cost Projection */}
      {costProjection && (
        <CostProjectionDisplay costProjection={costProjection} />
      )}

      {/* Recommended Stack */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-3">
            🎯
          </span>
          Recommended Technology Stack
        </h3>
        
        <div className="grid gap-4">
          {blueprint.recommendedStack.map((tool, index) => (
            <ToolCard 
              key={index} 
              tool={tool} 
              costInfo={costProjection?.breakdown.find(b => b.toolName === tool.name)}
            />
          ))}
        </div>
      </div>

      {/* Warnings */}
      {blueprint.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            Important Considerations
          </h3>
          <ul className="space-y-1">
            {blueprint.warnings.map((warning, index) => (
              <li key={index} className="text-yellow-800">
                <span className="font-medium">{warning.type}:</span> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
        <div className="space-y-3">
          {onCreateRepository && (
            <button
              onClick={onCreateRepository}
              disabled={isCreatingRepo}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreatingRepo ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Repository...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create GitHub Repository
                </>
              )}
            </button>
          )}
          
          {/* Export to Organizer Button */}
          <button
            onClick={handleExportToOrganizer}
            disabled={isExportingToOrganizer || !session}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isExportingToOrganizer ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting to Organizer...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Export to Organizer
              </>
            )}
          </button>
          
          {exportSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
              ✅ Successfully exported to organizer! Check your boards to start managing tasks.
            </div>
          )}
          
          {!session && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
              ⚠️ Please log in to export your blueprint to the organizer.
            </div>
          )}
          
          <button
            onClick={() => {
              const element = document.createElement('textarea');
              element.value = blueprint.projectPrompt;
              document.body.appendChild(element);
              element.select();
              document.execCommand('copy');
              document.body.removeChild(element);
              // Show toast notification
              alert('Project prompt copied to clipboard!');
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Implementation Guide
          </button>
        </div>
      </div>
    </div>
  );
}

function CostProjectionDisplay({ costProjection }: { costProjection: CostProjection }) {
  const confidenceColor = {
    high: 'text-green-600',
    medium: 'text-yellow-600',
    low: 'text-red-600'
  }[costProjection.confidence];

  const confidenceIcon = {
    high: '✅',
    medium: '⚠️',
    low: '❌'
  }[costProjection.confidence];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
          💰
        </span>
        Monthly Cost Projection
      </h3>

      {/* Cost Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${costProjection.totalMonthlyMin}
            </div>
            <div className="text-sm text-gray-600">Minimum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${costProjection.totalMonthlyEstimate}
            </div>
            <div className="text-sm text-gray-600">Estimated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${costProjection.totalMonthlyMax}
            </div>
            <div className="text-sm text-gray-600">Maximum</div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${confidenceColor}`}>
            {confidenceIcon} {costProjection.confidence.toUpperCase()} confidence
          </span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown by Tool</h4>
        {costProjection.breakdown.map((item, index) => (
          <CostBreakdownItem key={index} item={item} />
        ))}
      </div>

      {/* Scaling Factors */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Scaling Factors Applied</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="font-medium text-blue-800">
              {Math.round(costProjection.scalingFactors.development * 100)}%
            </div>
            <div className="text-blue-600">Development</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-800">
              {Math.round(costProjection.scalingFactors.production * 100)}%
            </div>
            <div className="text-blue-600">Production</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-800">
              {Math.round(costProjection.scalingFactors.scale * 100)}%
            </div>
            <div className="text-blue-600">Scale</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {costProjection.notes.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {costProjection.notes.map((note, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ToolCard({ 
  tool, 
  costInfo 
}: { 
  tool: {
    name: string;
    category: string;
    reason: string;
    compatibilityScore: number;
  };
  costInfo?: CostBreakdown;
}) {
  const scoreColor = tool.compatibilityScore >= 80 ? 'text-green-600' : 
                    tool.compatibilityScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{tool.name}</h4>
          <span className="text-sm text-gray-600">{tool.category}</span>
        </div>
        <div className="text-right">
          <div className={`font-medium ${scoreColor}`}>
            {tool.compatibilityScore}%
          </div>
          <div className="text-xs text-gray-500">fit score</div>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">{tool.reason}</p>
      
      {costInfo && (
        <div className="bg-gray-50 rounded p-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{costInfo.costType}</span>
            <div className="font-medium">
              {costInfo.monthlyMin === costInfo.monthlyMax ? (
                <span className="text-green-600">
                  ${costInfo.monthlyEstimate}/mo
                </span>
              ) : (
                <span className="text-blue-600">
                  ${costInfo.monthlyMin}-${costInfo.monthlyMax}/mo
                </span>
              )}
            </div>
          </div>
          {costInfo.notes && (
            <div className="text-xs text-gray-500 mt-1">{costInfo.notes}</div>
          )}
        </div>
      )}
    </div>
  );
}

function CostBreakdownItem({ item }: { item: CostBreakdown }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{item.toolName}</div>
        <div className="text-sm text-gray-600">{item.category} • {item.costType}</div>
        {item.notes && (
          <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
        )}
      </div>
      <div className="text-right">
        {item.monthlyMin === item.monthlyMax ? (
          <div className="font-medium text-green-600">
            ${item.monthlyEstimate}/mo
          </div>
        ) : (
          <div className="font-medium text-blue-600">
            ${item.monthlyMin}-${item.monthlyMax}/mo
          </div>
        )}
      </div>
    </div>
  );
}
