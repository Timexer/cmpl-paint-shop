import React from 'react';
import { BookOpen, CheckSquare, Square, Copy } from 'lucide-react';
import { type Scenario } from '../data/scenarios';
import { clsx } from 'clsx';

interface SidebarProps {
    scenario: Scenario | null;
    completedChecks: Record<string, boolean>;
    onCopyPhrase: (text: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ scenario, completedChecks, onCopyPhrase }) => {
    return (
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-1/2 md:h-full overflow-hidden transition-colors">
            {/* Objectives */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/40">
                <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 text-sm uppercase flex items-center">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Mission Objectives
                </h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {scenario ? (
                        scenario.checklists.map(item => (
                            <div
                                key={item.id}
                                className={clsx(
                                    "flex items-center transition-all duration-300",
                                    completedChecks[item.id] ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-600 dark:text-gray-400"
                                )}
                            >
                                {completedChecks[item.id] ? (
                                    <CheckSquare className="w-5 h-5 mr-2 flex-shrink-0" />
                                ) : (
                                    <Square className="w-5 h-5 mr-2 flex-shrink-0" />
                                )}
                                <span>{item.text}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 italic">Waiting for scenario...</p>
                    )}
                </div>
            </div>

            {/* Phrase Book */}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 flex justify-between items-center">
                <span className="flex items-center"><BookOpen className="w-4 h-4 mr-2" />Phrase Book (A1/A2)</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="mb-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm uppercase border-b dark:border-gray-700 pb-1">General Phrases</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <PhraseItem text='"Could you take a quick look at…?"' sub="Czy mógłbyś sprawdzić...?" onCopy={onCopyPhrase} />
                        <PhraseItem text='"I’m reaching out about…"' sub="Piszę w sprawie..." onCopy={onCopyPhrase} />
                    </ul>
                </div>

                {scenario && (
                    <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-3 border border-orange-100 dark:border-orange-900/30 mb-4">
                        <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 text-sm uppercase">Scenario: {scenario.name}</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="text-xs text-gray-500 dark:text-gray-400 italic">Use the chat to get info, then use email to confirm.</li>
                        </ul>
                    </div>
                )}

                <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm uppercase border-b dark:border-gray-700 pb-1">Car Terminology</h3>
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <TermItem term="Front Bumper" sub="Przedni zderzak" />
                        <TermItem term="Rear Right Door" sub="Prawe tylne drzwi" />
                        <TermItem term="Windshield" sub="Przednia szyba" />
                        <TermItem term="Suspension System" sub="Układ zawieszenia" />
                        <TermItem term="Scratched / Dented" sub="Porysowany / Wgnieciony" />
                        <TermItem term="Catalog Number" sub="Numer katalogowy" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const PhraseItem = ({ text, sub, onCopy }: { text: string, sub: string, onCopy: (t: string) => void }) => (
    <li
        className="group cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition flex flex-col items-start"
        onClick={() => onCopy(text.replace(/"/g, ''))}
    >
        <span className="flex items-center">
            {text} <Copy className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 italic">{sub}</span>
    </li>
);

const TermItem = ({ term, sub }: { term: string, sub: string }) => (
    <div>
        <span className="font-bold">{term}</span>
        <span className="text-gray-400 dark:text-gray-500 italic block ml-1">{sub}</span>
    </div>
);
