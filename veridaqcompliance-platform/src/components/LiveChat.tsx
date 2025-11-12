import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send } from 'lucide-react';

const LiveChat: React.FC = () => {
  const { t } = useTranslation('liveChat');
  const [isOpen, setIsOpen] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, text: string, isBot: boolean, timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Show initial prompt after 30 seconds
    const timer = global.setTimeout(() => {
      setShowInitialPrompt(true);
    }, 30000);

    return () => global.clearTimeout(timer);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowInitialPrompt(false);
    
    if (!isOpen && messages.length === 0) {
      // Add initial bot message
      setMessages([
        {
          id: 1,
          text: t('initialMessage'),
          isBot: true,
          timestamp: new Date()
        }
      ]);
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate bot response
    global.setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: t('autoResponse'),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const quickActions = [
    { text: t('quickActions.demo'), action: () => window.location.href = '#contact' },
    { text: t('quickActions.pricing'), action: () => window.location.href = '#contact' },
    { text: t('quickActions.compliance'), action: () => window.location.href = '#eu-compliance' }
  ];

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showInitialPrompt && !isOpen && (
          <div className="absolute bottom-16 right-0 bg-white p-4 rounded-lg shadow-modern-lg border border-neutral-200 max-w-xs animate-bounce">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">{t('prompt')}</p>
                <button
                  onClick={toggleChat}
                  className="text-xs text-primary-600 font-semibold hover:text-primary-700"
                >
                  {t('startChat')}
                </button>
              </div>
              <button
                onClick={() => setShowInitialPrompt(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={toggleChat}
          className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 border-2 border-white"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-modern-lg border border-neutral-200 z-40 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{t('title')}</h3>
                <p className="text-xs text-neutral-600">{t('subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start gap-2 max-w-xs ${message.isBot ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.isBot ? 'bg-primary-600' : 'bg-neutral-600'
                  }`}>
                    {message.isBot ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${
                    message.isBot 
                      ? 'bg-neutral-100 text-neutral-800' 
                      : 'bg-primary-600 text-white'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-600 text-center">{t('quickActionsTitle')}</p>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full p-2 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('inputPlaceholder')}
                className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChat;