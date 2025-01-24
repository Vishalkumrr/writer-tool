import React, { useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  X, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Undo,
  Redo,
  CheckSquare,
  Square,
  Image,
  FileImage,
  SpellCheck,
  Clock,
  Share,
  Mail,
  Bell,
  Send,
  Target,
  Sparkles,
  PenTool,
  Save,
  Upload,
  Download,
  AlertTriangle,
  Heading,
  Percent,
  PartyPopper,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Play,
  Timer
} from 'lucide-react';

interface KeywordStats {
  keyword: string;
  count: number;
  percentage: number;
}

interface KeywordSection {
  id: 'main' | 'supporting';
  title: string;
  keywords: string[];
  icon: React.ReactNode;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  icon: React.ReactNode;
}

function App() {
  const [content, setContent] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [activeSection, setActiveSection] = useState<'main' | 'supporting'>('main');
  const [keywordSections, setKeywordSections] = useState<KeywordSection[]>([
    { 
      id: 'main',
      title: 'Main Keywords',
      keywords: [],
      icon: <Target size={16} />
    },
    { 
      id: 'supporting',
      title: 'Supporting Keywords',
      keywords: [],
      icon: <Sparkles size={16} />
    }
  ]);
  const [stats, setStats] = useState<KeywordStats[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'length', label: 'Article length (1000+ words)', checked: false, icon: <List size={16} /> },
    { id: 'keyword_heading', label: 'Use Main Keyword in subheading(s)', checked: false, icon: <Heading size={16} /> },
    { id: 'keyword_density', label: 'Keyword Density ~1%', checked: false, icon: <Percent size={16} /> },
    { id: 'proofread', label: 'Proofread', checked: false, icon: <SpellCheck size={16} /> },
    { id: 'featured', label: 'Add a featured image', checked: false, icon: <FileImage size={16} /> },
    { id: 'images', label: 'Add related images in the post', checked: false, icon: <Image size={16} /> },
    { id: 'schedule', label: 'Schedule/Publish', checked: false, icon: <Clock size={16} /> },
    { id: 'newsletter', label: 'Send email newsletter', checked: false, icon: <Mail size={16} /> },
    { id: 'push', label: 'Send push notification', checked: false, icon: <Bell size={16} /> },
    { id: 'facebook', label: 'Share on Facebook', checked: false, icon: <Share size={16} /> },
    { id: 'twitter', label: 'Share on Twitter', checked: false, icon: <Share size={16} /> },
    { id: 'whatsapp', label: 'Share in WhatsApp group', checked: false, icon: <Send size={16} /> },
    { id: 'telegram', label: 'Share in Telegram Channel', checked: false, icon: <Send size={16} /> }
  ]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [hasShownCongrats, setHasShownCongrats] = useState(false);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(2 * 60 * 60); // 2 hours in seconds
  const [typingComplete, setTypingComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTypingComplete(true);
    }, 2000); // Match the typing animation duration

    return () => clearTimeout(timer);
  }, []);

  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const addKeyword = useCallback(() => {
    if (newKeyword && !keywordSections.find(s => s.id === activeSection)?.keywords.includes(newKeyword)) {
      setKeywordSections(prev => prev.map(section => 
        section.id === activeSection
          ? { ...section, keywords: [...section.keywords, newKeyword.toLowerCase()] }
          : section
      ));
      setNewKeyword('');
    }
  }, [newKeyword, activeSection, keywordSections]);

  const removeKeyword = useCallback((sectionId: 'main' | 'supporting', keyword: string) => {
    setKeywordSections(prev => prev.map(section => 
      section.id === sectionId
        ? { ...section, keywords: section.keywords.filter(k => k !== keyword) }
        : section
    ));
  }, []);

  const countKeywordOccurrences = useCallback((text: string, keyword: string): number => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }, []);

  const getWordCount = useCallback((text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  const getParagraphCount = useCallback((text: string) => {
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  }, []);

  const getAverageParagraphLength = useCallback((text: string) => {
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    if (paragraphs.length === 0) return 0;
    const totalWords = paragraphs.reduce((sum, para) => sum + getWordCount(para), 0);
    return Math.round(totalWords / paragraphs.length);
  }, [getWordCount]);

  const analyzeParagraphs = useCallback(() => {
    const paragraphs = content.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    return paragraphs.map((para, index) => {
      const wordCount = para.trim().split(/\s+/).filter(word => word.length > 0).length;
      return { index, wordCount, text: para };
    }).filter(para => para.wordCount > 40);
  }, [content]);

  const analyzeContent = useCallback(() => {
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;

    const lengthItem = checklist.find(item => item.id === 'length');
    if (lengthItem && lengthItem.checked !== (totalWords >= 1000)) {
      setChecklist(prev => prev.map(item => 
        item.id === 'length' 
          ? { ...item, checked: totalWords >= 1000 }
          : item
      ));
    }

    const allStats = keywordSections.flatMap(section => 
      section.keywords.map(keyword => {
        const count = countKeywordOccurrences(content, keyword);
        const percentage = totalWords > 0 ? (count / totalWords) * 100 : 0;
        return {
          keyword,
          count,
          percentage: Number(percentage.toFixed(2))
        };
      })
    );

    setStats(allStats);

    const mainKeywords = keywordSections.find(s => s.id === 'main')?.keywords || [];
    const mainKeywordStats = allStats.filter(stat => mainKeywords.includes(stat.keyword));
    const totalDensity = mainKeywordStats.reduce((sum, stat) => sum + stat.percentage, 0);
    
    setChecklist(prev => prev.map(item => 
      item.id === 'keyword_density'
        ? { ...item, checked: totalDensity >= 0.8 && totalDensity <= 1.2 }
        : item
    ));
  }, [content, keywordSections, checklist, countKeywordOccurrences]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const plainText = e.currentTarget.innerText || '';
    setContent(plainText);

    const headings = e.currentTarget.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const mainKeywords = keywordSections.find(s => s.id === 'main')?.keywords || [];
    let hasKeywordInHeading = false;

    headings.forEach(heading => {
      const headingText = heading.textContent?.toLowerCase() || '';
      if (mainKeywords.some(keyword => headingText.includes(keyword))) {
        hasKeywordInHeading = true;
      }
    });

    setChecklist(prev => prev.map(item => 
      item.id === 'keyword_heading'
        ? { ...item, checked: hasKeywordInHeading }
        : item
    ));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editorRef.current) {
        editorRef.current.innerHTML = event.target.result as string;
        handleContentChange({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!editorRef.current) return;

    const content = editorRef.current.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertTable = () => {
    const rows = prompt('Enter number of rows:', '3');
    const cols = prompt('Enter number of columns:', '3');
    
    if (!rows || !cols) return;
    
    let table = '<table class="border-collapse w-full mb-4">';
    for (let i = 0; i < parseInt(rows); i++) {
      table += '<tr>';
      for (let j = 0; j < parseInt(cols); j++) {
        if (i === 0) {
          table += '<th class="border border-gray-300 p-2">Header</th>';
        } else {
          table += '<td class="border border-gray-300 p-2">Cell</td>';
        }
      }
      table += '</tr>';
    }
    table += '</table>';
    
    document.execCommand('insertHTML', false, table);
  };

  const triggerCongratulations = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => {
      const newChecklist = prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      
      const allChecked = newChecklist.every(item => item.checked);
      if (allChecked && !hasShownCongrats) {
        setShowCongrats(true);
        setHasShownCongrats(true);
        triggerCongratulations();
      }
      
      return newChecklist;
    });
  };

  const scrollToParagraph = useCallback((index: number) => {
    if (!editorRef.current) return;
    
    const paragraphs = Array.from(editorRef.current.children);
    if (paragraphs[index]) {
      paragraphs[index].scrollIntoView({ behavior: 'smooth' });
      setSelectedParagraph(index);
      
      paragraphs[index].classList.add('bg-yellow-50');
      setTimeout(() => {
        paragraphs[index].classList.remove('bg-yellow-50');
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(analyzeContent, 500);
    return () => clearTimeout(timeoutId);
  }, [analyzeContent]);

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col h-screen">
        <h2 className="text-xl font-semibold mb-4">Keywords</h2>
        
        {/* Keyword Sections */}
        <div className="flex gap-2 mb-4">
          {keywordSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors
                ${activeSection === section.id 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'}`}
            >
              {section.icon}
              {section.title}
            </button>
          ))}
        </div>

        {/* Keyword Input */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              placeholder={`Add ${activeSection === 'main' ? 'main' : 'supporting'} keyword`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Keywords List with Stats */}
        <div className="flex-1 overflow-y-auto">
          {keywordSections.map(section => (
            <div 
              key={section.id}
              className={`mb-6 ${activeSection !== section.id && 'opacity-50'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {section.icon}
                <h3 className="font-medium text-sm">{section.title}</h3>
              </div>
              <div className="space-y-2">
                {section.keywords.map((keyword) => {
                  const stat = stats.find(s => s.keyword === keyword);
                  return (
                    <div key={keyword} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{keyword}</span>
                        <button
                          onClick={() => removeKeyword(section.id, keyword)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between items-center mb-1">
                          <span>Occurrences:</span>
                          <span className="font-medium">{stat ? stat.count : 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Density:</span>
                          <span className={`font-medium ${
                            stat && stat.percentage >= 0.8 && stat.percentage <= 1.2 
                              ? 'text-green-600' 
                              : 'text-gray-600'
                          }`}>
                            {stat ? `${stat.percentage}%` : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-blue-600">
                <PenTool size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className={`typing-animation ${typingComplete ? 'typing-complete' : ''}`}>
                  Article Writing - RBS
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer Section */}
              <div className="flex items-center gap-3 mr-4">
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Play size={20} />
                    Start Writing
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Timer size={20} className="text-blue-600" />
                    <span className="font-mono font-medium text-lg">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* File Import/Export buttons */}
              <input
                type="file"
                accept=".html"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Upload size={20} />
                Choose File
              </label>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={20} />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Formatting Toolbar */}
            <div className="bg-white border border-gray-200 rounded-t-lg p-2 flex items-center gap-2 sticky top-0 z-10">
              <button
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={() => formatText('formatBlock', '<h1>')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Heading 1"
              >
                <Heading1 size={18} />
              </button>
              <button
                onClick={() => formatText('formatBlock', '<h2>')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Heading 2"
              >
                <Heading2 size={18} />
              </button>
              <button
                onClick={() => formatText('formatBlock', '<h3>')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Heading 3"
              >
                <Heading3 size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={() => formatText('justifyLeft')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>
              <button
                onClick={() => formatText('justifyCenter')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>
              <button
                onClick={() => formatText('justifyRight')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>
              <button
                onClick={() => formatText('justifyFull')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Justify"
              >
                <AlignJustify size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={() => formatText('insertUnorderedList')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Bullet List"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => formatText('insertOrderedList')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Numbered List"
              >
                <ListOrdered size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={insertTable}
                className="p-2 hover:bg-gray-100 rounded"
                title="Insert Table"
              >
                <Table size={18} />
              </button>
              <button
                onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) formatText('createLink', url);
                }}
                className="p-2 hover:bg-gray-100 rounded"
                title="Insert Link"
              >
                <Link size={18} />
              </button>
              <button
                onClick={() => formatText('formatBlock', '<blockquote>')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Quote"
              >
                <Quote size={18} />
              </button>
              <button
                onClick={() => formatText('formatBlock', '<pre>')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Code Block"
              >
                <Code size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={() => formatText('undo')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Undo"
              >
                <Undo size={18} />
              </button>
              <button
                onClick={() => formatText('redo')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Redo"
              >
                <Redo size={18} />
              </button>
            </div>

            {/* Content Editor */}
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[calc(100vh-16rem)] p-6 animated-gradient border border-t-0 border-gray-200 rounded-b-lg focus:outline-none transition-all duration-300"
              onInput={handleContentChange}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col h-screen">
        <h2 className="text-xl font-semibold mb-4">Publishing Checklist</h2>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => toggleChecklistItem(item.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.checked ? (
                    <CheckSquare size={20} className="text-green-600" />
                  ) : (
                    <Square size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex-shrink-0 text-gray-500">{item.icon}</span>
                  <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Word Count:</span>
            <span className="text-sm font-medium">{getWordCount(content)}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-600" />
              <span>Completed: {checklist.filter(item => item.checked).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span>Remaining: {checklist.filter(item => !item.checked).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl animate-scale-in">
            <div className="text-center">
              <div className="flex justify-center mb-4 text-yellow-500">
                <PartyPopper size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-slide-up">
                Congratulations! 🎉
              </h2>
              <p className="text-gray-600 mb-6 animate-slide-up delay-100">
                You've completed all the checklist items! Your article is ready for publishing.
              </p>
              <button
                onClick={() => setShowCongrats(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors animate-slide-up delay-200"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;