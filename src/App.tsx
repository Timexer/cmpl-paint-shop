import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/Chat/ChatWindow';
import { EmailInterface } from './components/Email/EmailInterface';
import { useScenario } from './hooks/useScenario';
import { RefreshCw, SprayCan } from 'lucide-react';

function App() {
  const {
    currentScenario,
    step,
    messages,
    completedChecks,
    suggestions,
    systemMessage,
    startNewScenario,
    processUserMessage,
    handleTransition,
    validateEmail
  } = useScenario();

  const [inputValue, setInputValue] = useState('');

  // Start initial scenario
  useEffect(() => {
    startNewScenario();
  }, [startNewScenario]);

  const handleSendMessage = (text: string) => {
    if (step === 'CHAT') {
      processUserMessage(text);
    } else if (step === 'TRANSITION') {
      handleTransition(text);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center z-20">
        <div className="flex items-center">
          <div className="bg-orange-600 p-2 rounded-lg mr-3">
            <SprayCan className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CMPL Paint Shop Simulation</h1>
            <p className="text-xs text-gray-400 font-medium">Role: Darek (Deputy Manager) | Context: BYD Repairs</p>
          </div>
        </div>
        <button
          onClick={startNewScenario}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition border border-gray-700 flex items-center group"
        >
          <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          New Scenario
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

        {/* Sidebar (Objectives & Reference) */}
        <Sidebar
          scenario={currentScenario}
          completedChecks={completedChecks}
          onCopyPhrase={(text) => setInputValue(text)}
        />

        {/* Right Panel (Chat / Email) */}
        <div className="w-full md:w-2/3 flex flex-col h-1/2 md:h-full relative transition-all duration-500 ease-in-out">

          {/* System Message Banner */}
          {systemMessage && (
            <div className="bg-yellow-50 border-b border-yellow-100 p-2 text-center text-xs font-medium text-yellow-800 flex justify-center items-center shadow-sm z-10">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              {systemMessage}
            </div>
          )}

          {/* View Switcher */}
          <div className="flex-1 relative overflow-hidden">
            {step === 'EMAIL' || step === 'COMPLETE' ? (
              <EmailInterface
                clientName={currentScenario?.clientName || ''}
                instruction={currentScenario?.emailTask.instruction || ''}
                onSend={validateEmail}
              />
            ) : (
              <ChatWindow
                messages={messages}
                suggestions={suggestions}
                onSendMessage={handleSendMessage}
                inputDisabled={step === 'TRANSITION'}
                inputValue={inputValue}
                setInputValue={setInputValue}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
