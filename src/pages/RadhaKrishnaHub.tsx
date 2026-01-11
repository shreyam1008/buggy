import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flower2, Heart, Share2, RefreshCw, Sparkles, Search, Calendar, BookOpen, Music } from 'lucide-react';
import { Button } from '../components/shared/Button';

// 50+ Quotes from Jagadguru Shree Kripalu Ji Maharaj and Divine Sources
const quotes = [
  // From Prem Ras Siddhant
  { text: "Radha's love for Krishna is the highest form of devotion, and it is this love that liberates the soul.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  { text: "The mind is the cause of both bondage and liberation. Attach it to God and you will be free.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  { text: "Divine love is selfless, unconditional, and expects nothing in return.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  { text: "True devotion is when you love God more than anything in this material world.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  { text: "God resides in the heart of every being. See Him in all and serve all as God.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  
  // From Radha Govind Geet
  { text: "Radhe Radhe is the maha-mantra for Kaliyuga. Chant it with love and devotion.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Radha Govind Geet" },
  { text: "When you remember Radha, you automatically remember Krishna. They are one.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Radha Govind Geet" },
  { text: "Radha is the supreme power of divine love. Through Her grace, one attains Krishna.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Radha Govind Geet" },
  { text: "The lotus feet of Radha Krishna are the ultimate shelter for the soul.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Radha Govind Geet" },
  { text: "Sing the glories of Radha Krishna with tears of love rolling down your eyes.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Radha Govind Geet" },
  
  // From Bhakti Shatak
  { text: "Surrender everything to God - your body, mind, and soul. This is true surrender.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "The Grace of Guru is essential for spiritual progress. Without it, nothing is possible.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "Do not be attached to the fruits of your actions. Offer everything to God.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "The path of devotion is the easiest and most direct path to God-realization.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "Forgive those who hurt you. Forgiveness purifies the heart and brings peace.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  
  // General Teachings
  { text: "This human life is extremely precious. Do not waste it in material pursuits.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "The goal of life is God-realization. Everything else is temporary.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Chant the holy name of God constantly. It will purify your heart.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Serve the saints and devotees of God. Their association is transformative.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Control the senses. They are like wild horses that lead the mind astray.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  
  // From Bhagavad Gita
  { text: "Whenever righteousness declines and unrighteousness rises, I manifest myself.", author: "Shree Krishna", source: "Bhagavad Gita 4.7" },
  { text: "Fix your mind on Me, be devoted to Me, worship Me, bow down to Me.", author: "Shree Krishna", source: "Bhagavad Gita 9.34" },
  { text: "Abandon all varieties of religion and surrender unto Me alone. I shall deliver you.", author: "Shree Krishna", source: "Bhagavad Gita 18.66" },
  { text: "The soul is neither born, nor does it ever die. It is eternal and indestructible.", author: "Shree Krishna", source: "Bhagavad Gita 2.20" },
  { text: "Perform your duty without attachment to the results. This is the art of living.", author: "Shree Krishna", source: "Bhagavad Gita 2.47" },
  
  // More from Kripalu Ji Maharaj
  { text: "Maya is so powerful that even great yogis can fall prey to it. Only God's grace protects.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "The world is like a dream. Wake up to the reality of your divine nature.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Your suffering ends the moment you surrender completely to God.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Think of God constantly. In walking, eating, sleeping - always remember Him.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Love for God should be like the love of a mother for her child - unconditional.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  
  { text: "The mind that constantly thinks of Krishna becomes Krishna conscious.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  { text: "Real happiness is not in the material world. It is in connection with the Divine.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  { text: "Faith in God and Guru is the foundation of spiritual life.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "Every moment spent without remembering God is a moment wasted.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "The company of materialistic people is poison. Seek the company of devotees.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  
  { text: "Humility is the most important quality of a devotee.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "Patience in adversity is the sign of true spiritual strength.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "The Grace of Radha Krishna is the ultimate treasure of human life.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Radha Govind Geet" },
  { text: "Vrindavan is the abode of divine love where Radha and Krishna eternally play.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Tears of divine love are the rarest jewels in all the worlds.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  
  { text: "The flute of Krishna calls every soul back to its eternal home.", author: "Devotional Tradition", source: "Scriptures" },
  { text: "In the presence of Divine Love, all material desires fade away.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "Chant Radhe Krishna, Radhe Krishna, Krishna Krishna, Radhe Radhe.", author: "Maha Mantra", source: "Ancient Tradition" },
  { text: "The ocean of worldly existence can only be crossed by the boat of devotion.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "God is closer to you than your own self. Realize this truth.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  
  { text: "Where there is love of Radha Krishna, there is eternal bliss.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Prem Ras Siddhant" },
  { text: "Accept everything as the will of God. This is the secret of peace.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Lectures" },
  { text: "The divine couple Radha-Krishna are inseparable, like the sun and its light.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Radha Govind Geet" },
  { text: "Seva (selfless service) is the highest form of worship.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Bhakti Shatak" },
  { text: "May your heart become the throne of Radha Krishna.", author: "Jagadguru Shree Kripalu Ji Maharaj", source: "Blessing" },
];

const greetings = [
  "Radhey Radhey 🙏",
  "Jai Shree Krishna 🦚",
  "Jai Shree Radhe 🌸",
  "Hare Krishna 🪷",
  "Jai Shree Kripalu 🌺",
  "Radhe Govind 💫",
  "Krishna Krishna 🎵",
  "Radhe Shyam ✨",
  "Jai Shree Vrindavan 🏡",
  "Radha Krishna Ki Jai 💜",
];

// Festival Calendar
const festivals = [
  { name: "Radhashtami", date: "Aug-Sep", desc: "Appearance of Shree Radha Rani" },
  { name: "Janmashtami", date: "Aug-Sep", desc: "Appearance of Shree Krishna" },
  { name: "Holi", date: "Mar", desc: "Divine play of colors in Vrindavan" },
  { name: "Diwali", date: "Oct-Nov", desc: "Festival of lights" },
  { name: "Guru Purnima", date: "Jul", desc: "Honor the Guru" },
  { name: "Kartik Month", date: "Oct-Nov", desc: "Most sacred month for devotion" },
];

// SVG Collection
const svgCollection = [
  { name: 'krish1', label: 'Krishna with Flute' },
  { name: 'krish2', label: 'Krishna Dancing' },
  { name: 'krish3', label: 'Krishna with Cow' },
  { name: 'radha1', label: 'Radha Portrait' },
  { name: 'radha2', label: 'Radha with Flowers' },
  { name: 'radha3', label: 'Radha Krishna Together' },
  { name: 'lotus', label: 'Divine Lotus' },
];

export default function RadhaKrishnaHub() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => 
    Math.floor(Date.now() / 86400000) % quotes.length
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showAllQuotes, setShowAllQuotes] = useState(false);

  const dailyGreeting = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    return greetings[dayOfMonth % greetings.length];
  }, []);

  const currentQuote = quotes[currentQuoteIndex];

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const randomQuote = () => {
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));
  };

  const shareQuote = async () => {
    const shareData = {
      title: 'Divine Wisdom - Radha Krishna',
      text: `"${currentQuote.text}"\n\n— ${currentQuote.author}\n📖 ${currentQuote.source}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`"${currentQuote.text}" - ${currentQuote.author}`);
      alert('Quote copied to clipboard!');
    }
  };

  // Filter quotes by search and source
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = searchQuery === '' || 
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = selectedSource === 'all' || q.source === selectedSource;
      return matchesSearch && matchesSource;
    });
  }, [searchQuery, selectedSource]);

  const sources = useMemo(() => {
    return ['all', ...new Set(quotes.map(q => q.source))];
  }, []);

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '900px' }}
    >
      <div className="page-header">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <Flower2 size={64} color="var(--secondary-color)" style={{ marginBottom: '1rem' }} />
        </motion.div>
        <h1 className="page-title">Radha Krishna Hub</h1>
        <p className="page-subtitle" style={{ fontSize: '1.5rem' }}>{dailyGreeting}</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {quotes.length} Divine Quotes • {svgCollection.length} Sacred Images • {festivals.length} Festivals
        </p>
      </div>

      {/* Daily Quote Card */}
      <motion.div
        className="quote-card"
        key={currentQuoteIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="tag"><BookOpen size={12} style={{ marginRight: '0.25rem' }} />{currentQuote.source}</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            {currentQuoteIndex + 1} / {quotes.length}
          </span>
        </div>
        
        <Sparkles size={24} color="var(--accent-color)" style={{ marginBottom: '0.5rem' }} />
        <p className="quote-text" style={{ fontSize: '1.3rem' }}>"{currentQuote.text}"</p>
        <p className="quote-author">— {currentQuote.author}</p>
        
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" onClick={prevQuote}>← Prev</Button>
          <Button variant="ghost" size="sm" onClick={randomQuote}><RefreshCw size={14} /> Random</Button>
          <Button variant="ghost" size="sm" onClick={nextQuote}>Next →</Button>
          <Button variant="secondary" size="sm" onClick={shareQuote}><Share2 size={14} /> Share</Button>
        </div>
      </motion.div>

      {/* Quote Search & Browse */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><BookOpen size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Browse {quotes.length}+ Divine Quotes</h3>
          <p className="card-subtitle">From Jagadguru Shree Kripalu Ji Maharaj & Sacred Scriptures</p>
        </div>
        <div className="card-content">
          {/* Search */}
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <div className="input-wrapper">
              <div className="input-icon"><Search size={18} /></div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotes..."
                className="input input-with-icon"
                aria-label="Search quotes"
              />
            </div>
          </div>

          {/* Source Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {sources.slice(0, 5).map(source => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`tag ${selectedSource === source ? '' : ''}`}
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: selectedSource === source ? 'var(--primary-color)' : 'rgba(99, 102, 241, 0.2)',
                  color: 'white',
                }}
              >
                {source === 'all' ? 'All Sources' : source}
              </button>
            ))}
          </div>

          {/* Quote List */}
          <div style={{ maxHeight: showAllQuotes ? 'none' : '300px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {filteredQuotes.slice(0, showAllQuotes ? undefined : 5).map((quote, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    borderLeft: '3px solid var(--primary-color)',
                  }}
                  whileHover={{ x: 4 }}
                >
                  <p style={{ color: 'white', fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    "{quote.text}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'var(--secondary-color)', fontSize: '0.8rem' }}>— {quote.author}</p>
                    <span className="tag" style={{ fontSize: '0.7rem' }}>{quote.source}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            {!showAllQuotes && filteredQuotes.length > 5 && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'linear-gradient(transparent, var(--bg-color))',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '0.5rem',
              }}>
                <Button variant="secondary" size="sm" onClick={() => setShowAllQuotes(true)}>
                  Show All ({filteredQuotes.length} quotes)
                </Button>
              </div>
            )}
          </div>
          {showAllQuotes && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowAllQuotes(false)}>
                Show Less
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Divine Gallery */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Sparkles size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Divine Gallery</h3>
          <p className="card-subtitle">Sacred Radha Krishna imagery collection</p>
        </div>
        <div className="card-content">
          <div className="svg-gallery" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {svgCollection.map((item) => (
              <motion.div 
                key={item.name} 
                className="svg-item"
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                style={{ flexDirection: 'column', gap: '0.5rem' }}
              >
                <img 
                  src={`/${item.name}.svg`} 
                  alt={item.label}
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0.3';
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            SVG placeholders - Replace with beautiful Radha Krishna artwork
          </p>
        </div>
      </div>

      {/* Teachings Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Heart size={18} style={{ marginRight: '0.5rem', display: 'inline', color: '#ec4899' }} />Core Teachings</h3>
          <p className="card-subtitle">Path of Divine Love by Jagadguru Shree Kripalu Ji Maharaj</p>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { title: 'Divine Love (Prema)', desc: 'The highest goal of human life is to attain selfless, divine love for Radha Krishna. This love is beyond worldly attachments.', icon: '💜' },
              { title: 'Surrender (Sharanagati)', desc: 'Complete surrender to God and Guru is the fastest path to liberation. Give up ego and accept Divine will.', icon: '🙏' },
              { title: 'Mind Control', desc: 'The restless mind is the root cause of suffering. Attach it to God through constant remembrance (smarana).', icon: '🧘' },
              { title: 'Grace of Guru', desc: 'Without the grace of a true Guru, spiritual progress is impossible. Guru is the manifestation of God.', icon: '✨' },
              { title: 'Satsang (Holy Company)', desc: 'Association with saints and devotees purifies the heart and accelerates spiritual growth.', icon: '👥' },
              { title: 'Seva (Selfless Service)', desc: 'Serve God in all beings. True service is performed without expectation of reward.', icon: '🙌' },
            ].map((teaching, i) => (
              <motion.div
                key={i}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '1.25rem', 
                  borderRadius: '12px',
                  borderLeft: '3px solid var(--primary-color)'
                }}
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h4 style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{teaching.icon}</span>
                  {teaching.title}
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>{teaching.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Festival Calendar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Calendar size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Sacred Festivals</h3>
          <p className="card-subtitle">Important dates in the devotional calendar</p>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {festivals.map((festival, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
                whileHover={{ scale: 1.03 }}
              >
                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>{festival.name}</h4>
                <p style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{festival.date}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{festival.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Placeholder */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Music size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />🎵 Divine Audio</h3>
          <p className="card-subtitle">Bhajans & Kirtans by devotees</p>
        </div>
        <div className="card-content" style={{ textAlign: 'center', padding: '2rem' }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginBottom: '1rem' }}
          >
            <Music size={48} color="var(--secondary-color)" />
          </motion.div>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
            Audio player coming soon - place your bhajan files in /public/audio/
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="tag">Radhe Radhe Bhajan</span>
            <span className="tag">Kirtan</span>
            <span className="tag">Aarti</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
        <p>🙏 Made with love for Radha Krishna devotees worldwide 🙏</p>
        <p style={{ marginTop: '0.5rem' }}>Jai Shree Kripalu Ji Maharaj</p>
      </div>
    </motion.div>
  );
}
