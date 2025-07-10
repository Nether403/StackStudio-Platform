import React, { useState, useMemo } from 'react';

// --- Helper UI Components ---

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex justify-center items-center mb-8">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <React.Fragment key={index}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep > index ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{index + 1}</div>
        {index < totalSteps - 1 && <div className={`flex-auto h-1 mx-2 ${currentStep > index + 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>}
      </React.Fragment>
    ))}
  </div>
);

const ToolPill = ({ tool, onRemove }) => (
    <div className="bg-indigo-100 text-indigo-800 text-sm font-medium me-2 px-3 py-1.5 rounded-full flex items-center animate-fade-in-fast">
        {tool.name}
        <button onClick={() => onRemove(tool)} className="ml-2 text-indigo-500 hover:text-indigo-800 focus:outline-none">&#x2715;</button>
    </div>
);

const WarningIcon = () => (
    <svg className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ErrorIcon = () => (
    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// --- Main App Component ---

export default function App() {
  // --- State Management ---
  const [step, setStep] = useState(1);
  const [projectIdea, setProjectIdea] = useState('');
  const [skillSelection, setSkillSelection] = useState('');
  const [preferredTools, setPreferredTools] = useState([]);
  const [toolSearch, setToolSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [apiError, setApiError] = useState(null);

  // --- Mock Data for UI ---
  const MOCK_TOOL_PROFILES_FOR_SEARCH = [
    { id: "openai_gpt-4", name: "OpenAI GPT-4", category: "Language Model" },
    { id: "anthropic_claude-3", name: "Anthropic Claude 3", category: "Language Model" },
    { id: "replit_ghostwriter", name: "Replit Ghostwriter", category: "Code Generation" },
    { id: "github_copilot", name: "GitHub Copilot", category: "Code Generation" },
    { id: "pinecone", name: "Pinecone", category: "Database" },
    { id: "supabase", name: "Supabase", category: "Database" },
    { id: "netlify", name: "Netlify", category: "Deployment Platform" },
    { id: "vercel", name: "Vercel", category: "Deployment Platform" },
  ];
  
  // --- Mappers & Derived State ---
  const skillMap = {
      'Beginner': { setup: 1, daily: 1 },
      'Intermediate': { setup: 2, daily: 2 },
      'Expert': { setup: 3, daily: 3 },
  };

  const filteredTools = useMemo(() => {
    if (!toolSearch) return [];
    return MOCK_TOOL_PROFILES_FOR_SEARCH.filter(tool => 
      tool.name.toLowerCase().includes(toolSearch.toLowerCase()) &&
      !preferredTools.some(pt => pt.id === tool.id)
    );
  }, [toolSearch, preferredTools]);

  // --- Event Handlers ---
  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => s - 1);
  
  const addTool = (tool) => {
    setPreferredTools(prev => [...prev, tool]);
    setToolSearch('');
  };

  const removeTool = (toolToRemove) => {
    setPreferredTools(prev => prev.filter(tool => tool.id !== toolToRemove.id));
  };
  
  const handleGenerateBlueprint = async () => {
      setIsGenerating(true);
      setApiError(null);
      
      const input = {
          projectIdea,
          skillProfile: skillMap[skillSelection],
          preferredToolIds: preferredTools.map(t => t.id)
      };
      
      try {
        const response = await fetch('/api/generate-blueprint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const result = await response.json();
        setBlueprint(result);

      } catch (error) {
        console.error("API call failed:", error);
        setApiError(error.message);
      } finally {
        setIsGenerating(false);
      }
  };

  const handleStartOver = () => {
    setStep(1);
    setProjectIdea('');
    setSkillSelection('');
    setPreferredTools([]);
    setToolSearch('');
    setBlueprint(null);
    setApiError(null);
  };

  // --- Render Logic ---
  const renderInputForm = () => (
    <main className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in">
        <StepIndicator currentStep={step} totalSteps={3} />
        <div className="min-h-[200px]">
            {step === 1 && ( <div> <h2 className="text-2xl font-semibold text-gray-800 mb-2">First, what's your big idea?</h2> <p className="text-gray-500 mb-6">Briefly describe the application you want to build.</p> <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="4" placeholder="e.g., 'A web app that uses AI to generate marketing copy...'" value={projectIdea} onChange={(e) => setProjectIdea(e.target.value)} /> </div> )}
            {step === 2 && ( <div> <h2 className="text-2xl font-semibold text-gray-800 mb-2">What's your technical comfort level?</h2> <p className="text-gray-500 mb-6">This helps us recommend tools that fit your experience.</p> <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {['Beginner', 'Intermediate', 'Expert'].map(level => ( <button key={level} onClick={() => setSkillSelection(level)} className={`p-6 border rounded-lg text-left transition ${skillSelection === level ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}> <h3 className="font-bold text-lg text-gray-800">{level}</h3> </button> ))} </div> </div> )}
            {step === 3 && ( <div> <h2 className="text-2xl font-semibold text-gray-800 mb-2">Any preferred tools?</h2> <p className="text-gray-500 mb-6">Select any technologies you'd like to include. Skip if you're open to suggestions.</p> <div className="relative"> <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Search for tools like 'OpenAI', 'Netlify', etc." value={toolSearch} onChange={(e) => setToolSearch(e.target.value)} /> {filteredTools.length > 0 && ( <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg"> {filteredTools.map(tool => <li key={tool.id} className="p-3 hover:bg-indigo-100 cursor-pointer" onClick={() => addTool(tool)}>{tool.name} <span className="text-sm text-gray-500">- {tool.category}</span></li>)} </ul> )} </div> <div className="mt-4 flex flex-wrap gap-2 min-h-[40px]">{preferredTools.map(tool => <ToolPill key={tool.id} tool={tool} onRemove={removeTool} />)}</div> </div> )}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button onClick={handlePrevStep} disabled={step === 1} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
            {step < 3 ? (
                <button onClick={handleNextStep} disabled={(step === 1 && !projectIdea) || (step === 2 && !skillSelection)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            ) : (
                <button onClick={handleGenerateBlueprint} disabled={isGenerating} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center">
                    {isGenerating ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>) : 'Generate Blueprint'}
                </button>
            )}
        </div>
    </main>
  );
  
  const renderBlueprint = () => (
    <main className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in w-full">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Project Blueprint</h2>
                <p className="text-gray-600 mt-1">A recommended technology stack tailored to your project.</p>
            </div>
            <button onClick={handleStartOver} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Start Over</button>
        </div>

        {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                <ErrorIcon />
                <div>
                    <h4 className="font-semibold text-red-900">An Error Occurred</h4>
                    <p className="text-red-800">{apiError}</p>
                </div>
            </div>
        )}

        {blueprint && (
            <>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-lg text-indigo-900 mb-2">Blueprint Summary</h3>
                    <p className="text-indigo-800">{blueprint.summary}</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-3">Recommended Stack</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blueprint.recommendedStack.map(tool => (
                            <div key={tool.name} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">{tool.category}</p>
                                <h4 className="font-bold text-xl text-gray-900">{tool.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
                {blueprint.warnings.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Considerations & Warnings</h3>
                        <div className="space-y-3">
                            {blueprint.warnings.map((warning, index) => (
                                <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                                   <WarningIcon />
                                   <div>
                                        <h4 className="font-semibold text-amber-900">{warning.type}</h4>
                                        <p className="text-amber-800">{warning.message}</p>
                                   </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )}
    </main>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900">StackFast</h1>
            <p className="text-lg text-gray-600">Let's build your project blueprint.</p>
        </header>
        {isGenerating || blueprint || apiError ? renderBlueprint() : renderInputForm()}
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by StackStudio</p>
        </footer>
      </div>
    </div>
  );
}
