import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsService } from '../services/api';
import { NewsItem } from '../types';
import { formatTimeAgo, formatDate } from '../utils/formatters';
import { Newspaper, ExternalLink, Tag, X, BookOpen } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsService.getNews();
        if (res.success) {
          setNews(res.news || []);
        }
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const tags = ['ALL', 'INFY', 'TCS', 'HCLTECH', 'RELIANCE', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'ITC', 'TATAMOTORS'];
  const filteredNews = selectedTag === 'ALL'
    ? news
    : news.filter((n) => n.symbol?.toUpperCase() === selectedTag.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-400" />
            <span>Indian Financial News & Market Intelligence</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Curated Indian financial market coverage from Economic Times, Moneycontrol, Financial Express & Mint
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800 overflow-x-auto max-w-full">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedTag === t
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-400">Loading Indian financial news feed...</div>
      ) : filteredNews.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">Unable to load news feed. Please try again.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-[#111827] border border-gray-800 hover:border-gray-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-xl hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.source}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTimeAgo(item.published_at)}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-2 leading-snug hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800/60 text-xs">
                {item.symbol ? (
                  <button
                    onClick={() => navigate(`/stock/${item.symbol}`)}
                    className="inline-flex items-center gap-1 font-mono font-bold text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.symbol} →</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => setSelectedArticle(item)}
                  className="ml-auto text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Full Article →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internal Full Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedArticle.source}
              </span>
              {selectedArticle.symbol && (
                <button
                  onClick={() => {
                    const sym = selectedArticle.symbol;
                    setSelectedArticle(null);
                    if (sym) navigate(`/stock/${sym}`);
                  }}
                  className="text-xs font-mono font-bold text-blue-400 hover:underline uppercase"
                >
                  Symbol: {selectedArticle.symbol} →
                </button>
              )}
              <span className="text-xs text-gray-500 ml-auto font-mono">
                {formatDate(selectedArticle.published_at)}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white mb-4 leading-snug">
              {selectedArticle.title}
            </h2>

            <div className="text-sm text-gray-300 space-y-4 leading-relaxed border-t border-b border-gray-800/80 py-4 my-4 font-sans">
              <p className="font-semibold text-gray-200">{selectedArticle.description}</p>
              <p>{selectedArticle.content || selectedArticle.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Close Article
              </button>

              {selectedArticle.url && (
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md inline-flex items-center gap-1.5 transition-all"
                >
                  <span>Open {selectedArticle.source} Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
