import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, TrendingUp, MessageSquare, Send, Users, AlertTriangle, 
  CheckCircle, Clock, BarChart3, Zap, Brain, Eye, Settings, Play, 
  Pause, Youtube, ThumbsUp, ThumbsDown, Heart, Share2, Calendar,
  User, Hash, Globe, Smile, Frown, Meh, Filter, Search, RefreshCw
} from 'lucide-react';

// Enhanced WebSocket hook for YouTube analytics
const useYouTubeWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [comments, setComments] = useState([]);
  const [videoInfo, setVideoInfo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [connected, setConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:8765');
      
      ws.onopen = () => {
        console.log('Connected to YouTube Analytics WebSocket');
        setConnected(true);
        reconnectAttempts.current = 0;
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
          case 'video_info':
            setVideoInfo(data.data);
            break;
          case 'new_comments':
            setComments(prev => [...data.data, ...prev].slice(0, 100));
            break;
          case 'analytics_update':
            setAnalytics(data.data);
            break;
          default:
            setMessages(prev => [...prev.slice(-19), { ...data, timestamp: new Date(), id: Date.now() }]);
        }
      };
      
      ws.onclose = () => {
        console.log('YouTube Analytics WebSocket disconnected');
        setConnected(false);
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, 3000 * reconnectAttempts.current);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      setSocket(ws);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      simulateData();
    }
  }, []);

  const simulateData = useCallback(() => {
    setVideoInfo({
      title: "VIJAYFOCUS - Sample Political Video",
      channel_name: "VIJAYFOCUS",
      view_count: 15420,
      like_count: 892,
      comment_count: 156,
      upload_date: new Date().toISOString(),
      duration: "PT10M30S"
    });

    setAnalytics({
      total_comments: 156,
      avg_sentiment: 0.23,
      positive_percentage: 45.2,
      negative_percentage: 32.1,
      neutral_percentage: 22.7,
      engagement_score: 5.7,
      top_words: [
        ['great', 23], ['good', 18], ['thanks', 15], ['excellent', 12],
        ['helpful', 10], ['amazing', 8], ['perfect', 7], ['love', 6]
      ],
      time_trend: Array.from({length: 10}, (_, i) => ({
        timestamp: new Date(Date.now() - (9-i) * 3600000).toISOString(),
        sentiment: (Math.random() - 0.5) * 2
      }))
    });

    const mockComments = [
      { 
        comment_id: '1', author: 'PoliticalViewer123', 
        text: 'Great analysis! This really helps understand the current political landscape.',
        likes: 15, sentiment_score: 0.8, sentiment_label: 'positive',
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      { 
        comment_id: '2', author: 'ConcernedCitizen', 
        text: 'I disagree with some points made here. The data seems incomplete.',
        likes: 3, sentiment_score: -0.4, sentiment_label: 'negative',
        timestamp: new Date(Date.now() - 600000).toISOString()
      },
      { 
        comment_id: '3', author: 'NewsWatcher', 
        text: 'This is very informative. Thanks for breaking it down so clearly.',
        likes: 8, sentiment_score: 0.6, sentiment_label: 'positive',
        timestamp: new Date(Date.now() - 900000).toISOString()
      },
      { 
        comment_id: '4', author: 'SkepticalMind', 
        text: 'I need to see more evidence before I can agree with these conclusions.',
        likes: 2, sentiment_score: -0.1, sentiment_label: 'neutral',
        timestamp: new Date(Date.now() - 1200000).toISOString()
      },
      { 
        comment_id: '5', author: 'SupporterFan', 
        text: 'Excellent content as always! Keep up the great work!',
        likes: 12, sentiment_score: 0.9, sentiment_label: 'positive',
        timestamp: new Date(Date.now() - 1500000).toISOString()
      }
    ];

    setComments(mockComments);
    setConnected(true);

    const interval = setInterval(() => {
      const newComment = {
        comment_id: Date.now().toString(),
        author: `User${Math.floor(Math.random() * 1000)}`,
        text: [
          "This is really helpful information!",
          "I'm not sure I agree with this perspective.",
          "Great video, very well explained.",
          "Could you provide more sources for this?",
          "This changed my mind on the topic.",
          "I think there are some flaws in this argument.",
          "Excellent analysis, thank you for sharing!",
          "This seems biased to me.",
          "Very informative content!"
        ][Math.floor(Math.random() * 9)],
        likes: Math.floor(Math.random() * 20),
        sentiment_score: (Math.random() - 0.5) * 2,
        sentiment_label: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toISOString()
      };

      setComments(prev => [newComment, ...prev].slice(0, 100));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return { socket, messages, comments, videoInfo, analytics, connected };
};

// Video Information Card
const VideoInfoCard = ({ videoInfo }) => {
  if (!videoInfo) return null;

  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Youtube className="w-6 h-6 text-red-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Video Information</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{videoInfo.title}</h3>
          <p className="text-sm text-gray-600">by {videoInfo.channel_name}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">
              {videoInfo.view_count?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-600">Views</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <ThumbsUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">
              {videoInfo.like_count?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-600">Likes</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">
              {videoInfo.comment_count?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-600">Comments</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">
              {formatDuration(videoInfo.duration || 'PT0M')}
            </div>
            <div className="text-xs text-gray-600">Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sentiment Analytics Dashboard
const SentimentAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.3) return 'text-green-600';
    if (sentiment < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.3) return <Smile className="w-5 h-5 text-green-500" />;
    if (sentiment < -0.3) return <Frown className="w-5 h-5 text-red-500" />;
    return <Meh className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Sentiment Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            {getSentimentIcon(analytics.avg_sentiment)}
          </div>
          <div className={`text-xl font-bold ${getSentimentColor(analytics.avg_sentiment)}`}>
            {analytics.avg_sentiment?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-600">Avg Sentiment</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Smile className="w-5 h-5 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-600">
            {analytics.positive_percentage?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs text-gray-600">Positive</div>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg">
          <Frown className="w-5 h-5 text-red-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-red-600">
            {analytics.negative_percentage?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs text-gray-600">Negative</div>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <Meh className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-yellow-600">
            {analytics.neutral_percentage?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs text-gray-600">Neutral</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-800 mb-3">Sentiment Distribution</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${analytics.positive_percentage || 0}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">Positive</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${analytics.negative_percentage || 0}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">Negative</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${analytics.neutral_percentage || 0}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">Neutral</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-3">Top Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {analytics.top_words?.slice(0, 8).map(([word, count], index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {word} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Live Comments Feed
const LiveCommentsFeed = ({ comments }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComments = comments.filter(comment => {
    const matchesFilter = filter === 'all' || comment.sentiment_label === filter;
    const matchesSearch = comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSentimentColor = (label) => {
    switch(label) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getSentimentIcon = (label) => {
    switch(label) {
      case 'positive': return <Smile className="w-4 h-4" />;
      case 'negative': return <Frown className="w-4 h-4" />;
      default: return <Meh className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Live Comments</h2>
          <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {comments.length}
          </span>
        </div>
        
        <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredComments.map((comment) => (
          <div key={comment.comment_id} className="border-l-4 border-gray-200 pl-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-800 text-sm">{comment.author}</span>
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getSentimentColor(comment.sentiment_label)}`}>
                  {getSentimentIcon(comment.sentiment_label)}
                  <span className="ml-1 capitalize">{comment.sentiment_label}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {comment.likes}
                </div>
                <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-2">{comment.text}</p>
            
            <div className="text-xs text-gray-500">
              Sentiment Score: {comment.sentiment_score?.toFixed(2) || '0.00'}
            </div>
          </div>
        ))}
        
        {filteredComments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No comments match your filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

// System Status Component
const SystemStatus = ({ connected, videoInfo }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-800">
            {connected ? 'Live Monitoring' : 'Disconnected'}
          </span>
        </div>
        
        {videoInfo && (
          <div className="text-xs text-gray-500">
            Monitoring: {videoInfo.title?.substring(0, 30)}...
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const YouTubeDashboard = () => {
  const { socket, messages, comments, videoInfo, analytics, connected } = useYouTubeWebSocket();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'comments', label: 'Live Comments', icon: MessageSquare },
    { id: 'analytics', label: 'Deep Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Youtube className="w-8 h-8 text-red-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">YouTube Analytics Dashboard</h1>
            </div>
            <SystemStatus connected={connected} videoInfo={videoInfo} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <VideoInfoCard videoInfo={videoInfo} />
            <SentimentAnalytics analytics={analytics} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LiveCommentsFeed comments={comments.slice(0, 10)} />
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Insights Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Engagement Trends</h4>
                    <p className="text-sm text-blue-700">
                      Comments are trending {analytics?.avg_sentiment > 0 ? 'positively' : 'negatively'} 
                      with an average sentiment of {analytics?.avg_sentiment?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Top Performing Content</h4>
                    <p className="text-sm text-green-700">
                      Keywords like "{analytics?.top_words?.[0]?.[0] || 'great'}" are driving positive engagement
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Real-time Activity</h4>
                    <p className="text-sm text-purple-700">
                      {comments.length} comments analyzed with live sentiment tracking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LiveCommentsFeed comments={comments} />
            </div>
            <div className="space-y-6">
              <SentimentAnalytics analytics={analytics} />
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Comment Velocity</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {comments.length > 0 ? Math.floor(comments.length / 10) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Comments per minute</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <SentimentAnalytics analytics={analytics} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Sentiment Timeline</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Sentiment trend chart would go here</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Word Cloud</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">Most mentioned words:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {analytics?.top_words?.slice(0, 10).map(([word, count], index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          style={{ fontSize: `${Math.max(12, Math.min(20, count))}px` }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">YouTube Analytics Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://www.youtube.com/watch?v=..."
                  defaultValue="https://www.youtube.com/watch?v=O6DTtVOPwEU&ab_channel=VIJAYFOCUS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Frequency (seconds)
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Enable Real-time Monitoring</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Export Analytics Data</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeDashboard;