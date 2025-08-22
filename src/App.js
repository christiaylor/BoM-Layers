import "./index.css";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  Search,
  BarChart3,
  X,
  Menu,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Layers,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
} from "lucide-react";

// --- Components ---

// Splash Screen Component
const SplashScreen = () => (
  <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
    <div className="w-full max-w-md h-auto rounded-lg overflow-hidden shadow-2xl">
      <img
        src="ChatGPT Image Jul 30, 2025, 09_47_20 PM.png"
        alt="The Book of Mormon"
        className="w-full h-full object-cover"
      />
    </div>
    <h1
      className="text-4xl font-bold text-white mt-6"
      style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
    >
      The Book of Mormon Layering Project
    </h1>
  </div>
);

// Panel Frame Component
const Panel = ({ title, icon, children, onClose }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-col h-full shadow-2xl">
    <div className="flex items-center justify-between p-3 bg-gray-900/80 border-b border-gray-700 rounded-t-lg">
      <div className="flex items-center gap-2 text-blue-300">
        {icon}
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
    <div className="p-4 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {children}
    </div>
  </div>
);

const ProgressTracker = ({ book, chapter, bookOfMormonData, totals }) => {
  const [scope, setScope] = useState("book");

  const progress = useMemo(() => {
    if (!totals.totalChapters || !book) return null;

    const currentBookIndex = bookOfMormonData.books.findIndex(
      (b) => b.book === book
    );
    const currentBookData = bookOfMormonData.books[currentBookIndex];
    if (!currentBookData) return null;

    let chaptersLeft = 0;
    let versesLeft = 0;

    if (scope === "book") {
      chaptersLeft = currentBookData.chapters.length - chapter;
      for (let i = chapter; i < currentBookData.chapters.length; i++) {
        versesLeft += currentBookData.chapters[i].verses.length;
      }
    } else {
      // scope === 'total'
      // Remaining in current book
      chaptersLeft += currentBookData.chapters.length - chapter;
      for (let i = chapter; i < currentBookData.chapters.length; i++) {
        versesLeft += currentBookData.chapters[i].verses.length;
      }
      // Add all subsequent books
      for (
        let i = currentBookIndex + 1;
        i < bookOfMormonData.books.length;
        i++
      ) {
        const subsequentBook = bookOfMormonData.books[i];
        chaptersLeft += subsequentBook.chapters.length;
        subsequentBook.chapters.forEach((c) => {
          versesLeft += c.verses.length;
        });
      }
    }

    return { versesLeft, chaptersLeft };
  }, [book, chapter, scope, bookOfMormonData, totals]);

  if (!progress) return null;

  return (
    <div className="mt-6 p-3 bg-gray-900/50 rounded-lg text-center text-sm">
      <p className="text-gray-300">
        <span className="font-bold">{progress.chaptersLeft}</span> chapters and{" "}
        <span className="font-bold">{progress.versesLeft}</span> verses
        remaining.
      </p>
      <div className="flex justify-center items-center mt-2">
        <span className="mr-2 text-gray-400">Progress to end of:</span>
        <button
          onClick={() => setScope("book")}
          className={`px-3 py-1 rounded-l-md ${
            scope === "book" ? "bg-blue-600 text-white" : "bg-gray-700"
          }`}
        >
          Book
        </button>
        <button
          onClick={() => setScope("total")}
          className={`px-3 py-1 rounded-r-md ${
            scope === "total" ? "bg-blue-600 text-white" : "bg-gray-700"
          }`}
        >
          Total
        </button>
      </div>
    </div>
  );
};

const highlightTextWithLayer = (text, layers) => {
  if (!layers.deity) return text;
  const deityTerms = [
    "God",
    "Lord",
    "Jesus",
    "Christ",
    "Heavenly Father",
    "Son",
    "Holy Ghost",
    "Messiah",
    "Jehovah",
    "Savior",
    "Redeemer",
    "Almighty",
    "Lamb of God",
    "Holy One of Israel",
  ];
  const regex = new RegExp(`\\b(${deityTerms.join("|")})\\b`, "gi");

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="bg-yellow-400/30 text-yellow-300 rounded px-1"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

// Chapter Viewer Component
const ChapterViewer = ({
  book,
  chapter,
  highlightVerse,
  setReference,
  bookOfMormonData,
  totals,
  layers,
}) => {
  const chapterData = bookOfMormonData.books
    .find((b) => b.book === book)
    ?.chapters.find((c) => c.chapter === chapter);
  const highlightRef = useRef(null);
  const [activeQuestion, setActiveQuestion] = useState(null); // verse number of the answer

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightVerse, chapter, book]);

  // Reset active question when chapter changes
  useEffect(() => {
    setActiveQuestion(null);
  }, [book, chapter]);

  const handleNav = (direction) => {
    const currentBookIndex = bookOfMormonData.books.findIndex(
      (b) => b.book === book
    );
    const currentBookData = bookOfMormonData.books[currentBookIndex];

    const newChapter = chapter + direction;

    if (newChapter > 0 && newChapter <= currentBookData.chapters.length) {
      setReference({ book, chapter: newChapter, highlightVerse: null });
    } else if (newChapter > currentBookData.chapters.length) {
      // Move to next book
      const nextBook = bookOfMormonData.books[currentBookIndex + 1];
      if (nextBook) {
        setReference({ book: nextBook.book, chapter: 1, highlightVerse: null });
      }
    } else if (newChapter <= 0) {
      // Move to previous book
      const prevBook = bookOfMormonData.books[currentBookIndex - 1];
      if (prevBook) {
        setReference({
          book: prevBook.book,
          chapter: prevBook.chapters.length,
          highlightVerse: null,
        });
      }
    }
  };

  if (!chapterData) {
    return <div className="text-red-400">Chapter not found.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => handleNav(-1)}
          className="p-2 bg-blue-600 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-bold text-center text-blue-300">
          {book} {chapter}
        </h2>
        <button
          onClick={() => handleNav(1)}
          className="p-2 bg-blue-600 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
        >
          <ArrowRight size={16} />
        </button>
      </div>
      {chapterData.verses.map((v) => {
        const isQuestion = layers.qanda && v.text.trim().endsWith("?");
        const isAnswer = layers.qanda && activeQuestion === v.verse;

        return (
          <p
            key={v.verse}
            ref={v.verse === highlightVerse ? highlightRef : null}
            className={`mb-3 text-gray-300 leading-relaxed p-2 rounded-md transition-colors 
                    ${v.verse === highlightVerse ? "bg-blue-900/50" : ""}
                    ${
                      isQuestion
                        ? "bg-purple-900/50 cursor-pointer hover:bg-purple-900/80"
                        : ""
                    }
                    ${isAnswer ? "bg-purple-700/60" : ""}
                `}
            onClick={
              isQuestion
                ? () =>
                    setActiveQuestion(
                      activeQuestion === v.verse + 1 ? null : v.verse + 1
                    )
                : undefined
            }
          >
            <sup className="font-bold text-blue-400/80 mr-1">{v.verse}</sup>
            {highlightTextWithLayer(v.text, layers)}
          </p>
        );
      })}
      <ProgressTracker
        book={book}
        chapter={chapter}
        bookOfMormonData={bookOfMormonData}
        totals={totals}
      />
    </div>
  );
};

const BookSelection = ({ bookOfMormonData, onSelectChapter }) => {
  const [selectedBook, setSelectedBook] = useState(null);

  const handleBookClick = (book) => {
    const bookData = bookOfMormonData.books.find((b) => b.book === book.book);
    if (bookData && bookData.chapters.length === 1) {
      onSelectChapter(book.book, 1);
    } else {
      setSelectedBook(book.book);
    }
  };

  if (selectedBook) {
    const bookData = bookOfMormonData.books.find(
      (b) => b.book === selectedBook
    );
    return (
      <div>
        <button
          onClick={() => setSelectedBook(null)}
          className="text-blue-400 hover:underline mb-4 flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back to Books
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-300">
          {selectedBook}
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {bookData.chapters.map((c) => (
            <button
              key={c.chapter}
              onClick={() => onSelectChapter(selectedBook, c.chapter)}
              className="p-3 bg-gray-700 rounded-md hover:bg-blue-600 transition-colors text-center"
            >
              {c.chapter}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-blue-300">Select a Book</h2>
      <div className="space-y-2">
        {bookOfMormonData.books.map((b) => (
          <button
            key={b.book}
            onClick={() => handleBookClick(b)}
            className="w-full text-left p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
          >
            {b.book}
          </button>
        ))}
      </div>
    </div>
  );
};

// Search Panel Component
const SearchPanel = ({ bookOfMormonData, onResultClick, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(true);

  const runSearch = (searchQuery, exact) => {
    if (!searchQuery.trim()) return;

    const searchResults = [];
    const lowerCaseQuery = searchQuery.toLowerCase();
    const queryTerms = exact
      ? [lowerCaseQuery]
      : lowerCaseQuery.split(" ").filter((t) => t);

    bookOfMormonData.books.forEach((book) => {
      book.chapters.forEach((chapter) => {
        chapter.verses.forEach((verse) => {
          const lowerCaseText = verse.text.toLowerCase();
          const matches = exact
            ? lowerCaseText.includes(lowerCaseQuery)
            : queryTerms.every((term) => lowerCaseText.includes(term));

          if (matches) {
            searchResults.push({
              book: book.book,
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            });
          }
        });
      });
    });
    setResults(searchResults);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery, true);
    }
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(query, isExactMatch);
  };

  const highlightQuery = (text, highlightTerm) => {
    if (!highlightTerm) return text;
    const terms = highlightTerm
      .split(" ")
      .filter((t) => t)
      .join("|");
    const parts = text.split(new RegExp(`(${terms})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase().match(new RegExp(`^(${terms})$`, "i")) ? (
            <span key={i} className="bg-yellow-400 text-black rounded px-1">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for words or phrases..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            id="exactMatch"
            checked={isExactMatch}
            onChange={(e) => setIsExactMatch(e.target.checked)}
            className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="exactMatch">Search for exact phrase</label>
        </div>
      </form>
      {hasSearched && (
        <div>
          <p className="text-lg font-semibold mb-3">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for "
            {query}".
          </p>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                onClick={() => onResultClick(r.book, r.chapter, r.verse)}
                className="p-3 bg-gray-900/50 rounded-md border border-gray-700/50 hover:bg-blue-900/30 hover:border-blue-700 cursor-pointer transition-colors"
              >
                <p className="font-bold text-blue-400 mb-1">
                  {r.book} {r.chapter}:{r.verse}
                </p>
                <p className="text-gray-300 text-sm">
                  {highlightQuery(r.text, query)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Panel Component
const AnalyticsPanel = ({ bookOfMormonData, onResultClick }) => {
  const [terms, setTerms] = useState(["And it came to pass", "Lord", "Nephi"]);
  const [newTerm, setNewTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termResults, setTermResults] = useState([]);

  const handleAddTerm = (e) => {
    e.preventDefault();
    if (
      newTerm.trim() &&
      !terms.find((t) => t.toLowerCase() === newTerm.trim().toLowerCase())
    ) {
      setTerms([...terms, newTerm.trim()]);
      setNewTerm("");
    }
  };

  const handleTermClick = (term) => {
    if (selectedTerm === term) {
      setSelectedTerm(null);
      setTermResults([]);
      return;
    }

    const searchResults = [];
    const lowerCaseQuery = term.toLowerCase();
    bookOfMormonData.books.forEach((book) => {
      book.chapters.forEach((chapter) => {
        chapter.verses.forEach((verse) => {
          if (verse.text.toLowerCase().includes(lowerCaseQuery)) {
            searchResults.push({
              book: book.book,
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            });
          }
        });
      });
    });
    setSelectedTerm(term);
    setTermResults(searchResults);
  };

  const analyticsData = useMemo(() => {
    if (!bookOfMormonData.books) return [];
    return terms.map((phrase) => {
      const lowerCasePhrase = phrase.toLowerCase();
      let count = 0;
      bookOfMormonData.books.forEach((book) => {
        book.chapters.forEach((chapter) => {
          chapter.verses.forEach((verse) => {
            const matches = verse.text
              .toLowerCase()
              .match(new RegExp(lowerCasePhrase, "g"));
            if (matches) count += matches.length;
          });
        });
      });
      return { phrase, count };
    });
  }, [terms, bookOfMormonData]);

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-300 mb-4">Text Analytics</h2>
      <form onSubmit={handleAddTerm} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTerm}
          onChange={(e) => setNewTerm(e.target.value)}
          placeholder="Add word or phrase"
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-green-600 hover:bg-green-500 rounded-md"
        >
          <Plus size={20} />
        </button>
      </form>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-2 text-gray-300">Phrase/Word</th>
            <th className="p-2 text-gray-300 text-right">Count</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {analyticsData.map(({ phrase, count }) => (
            <tr
              key={phrase}
              onClick={() => handleTermClick(phrase)}
              className="border-b border-gray-700/50 hover:bg-gray-700/50 cursor-pointer"
            >
              <td className="p-2">{phrase}</td>
              <td className="p-2 text-right font-mono">{count}</td>
              <td className="p-2 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTerms(terms.filter((t) => t !== phrase));
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedTerm && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">
            Results for "{selectedTerm}" ({termResults.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {termResults.map((r, i) => (
              <div
                key={i}
                onClick={() => onResultClick(r.book, r.chapter, r.verse)}
                className="p-3 bg-gray-900/50 rounded-md border border-gray-700/50 hover:bg-blue-900/30 hover:border-blue-700 cursor-pointer transition-colors"
              >
                <p className="font-bold text-blue-400 mb-1">
                  {r.book} {r.chapter}:{r.verse}
                </p>
                <p className="text-gray-300 text-sm">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LayersPanel = ({ layers, setLayers }) => {
  const toggleLayer = (layerName) =>
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  return (
    <div>
      <h2 className="text-xl font-bold text-blue-300 mb-4">Content Layers</h2>
      <p className="text-sm text-gray-400 mb-4">
        Toggle layers to highlight specific content across all scripture
        viewers.
      </p>
      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer">
          <span className="font-semibold">References to Deity</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={layers.deity}
              onChange={() => toggleLayer("deity")}
            />
            <div
              className={`block w-14 h-8 rounded-full ${
                layers.deity ? "bg-blue-600" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                layers.deity ? "transform translate-x-6" : ""
              }`}
            ></div>
          </div>
        </label>
        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer">
          <span className="font-semibold">Questions & Answers</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={layers.qanda}
              onChange={() => toggleLayer("qanda")}
            />
            <div
              className={`block w-14 h-8 rounded-full ${
                layers.qanda ? "bg-blue-600" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                layers.qanda ? "transform translate-x-6" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>
    </div>
  );
};

const RecommendationsPanel = () => {
  const SUGGESTIONS_KEY = "bom-layering-suggestions";
  const VOTES_KEY = "bom-layering-votes";

  const [suggestions, setSuggestions] = useState(() => {
    try {
      const localData = localStorage.getItem(SUGGESTIONS_KEY);
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });
  const [newSuggestion, setNewSuggestion] = useState("");
  const [userVotes, setUserVotes] = useState(() => {
    try {
      const localData = localStorage.getItem(VOTES_KEY);
      return localData ? JSON.parse(localData) : {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem(VOTES_KEY, JSON.stringify(userVotes));
  }, [userVotes]);

  const handleVote = (suggestionId, direction) => {
    const currentVote = userVotes[suggestionId];
    let newSuggestions = [...suggestions];
    const suggestionIndex = newSuggestions.findIndex(
      (s) => s.id === suggestionId
    );
    if (suggestionIndex === -1) return;

    let suggestion = { ...newSuggestions[suggestionIndex] };
    let newVoteState = { ...userVotes };

    // Revert current vote if it exists
    if (currentVote === "up") suggestion.upvotes--;
    if (currentVote === "down") suggestion.downvotes--;

    if (currentVote === direction) {
      // Undoing vote
      delete newVoteState[suggestionId];
    } else {
      // New vote or switching vote
      if (direction === "up") suggestion.upvotes++;
      if (direction === "down") suggestion.downvotes++;
      newVoteState[suggestionId] = direction;
    }

    if (suggestion.downvotes > suggestion.upvotes) {
      newSuggestions.splice(suggestionIndex, 1);
    } else {
      newSuggestions[suggestionIndex] = suggestion;
    }

    setSuggestions(newSuggestions);
    setUserVotes(newVoteState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;
    const newSugg = {
      id: Date.now(),
      text: newSuggestion,
      upvotes: 0,
      downvotes: 0,
    };
    setSuggestions([...suggestions, newSugg]);
    setNewSuggestion("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-300 mb-4">Recommendations</h2>
      <p className="text-sm text-gray-400 mb-4">
        Suggestions are stored in your browser and will be cleared if you clear
        your cache.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSuggestion}
          onChange={(e) => setNewSuggestion(e.target.value)}
          placeholder="Suggest a new feature..."
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-green-600 hover:bg-green-500 rounded-md"
        >
          <Plus size={20} />
        </button>
      </form>
      <div className="space-y-3">
        {suggestions
          .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
          .map((s) => (
            <div
              key={s.id}
              className="p-3 bg-gray-900/50 rounded-md flex justify-between items-center"
            >
              <p className="text-gray-300">{s.text}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVote(s.id, "up")}
                  className={`flex items-center gap-1 ${
                    userVotes[s.id] === "up"
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <ThumbsUp size={16} /> {s.upvotes}
                </button>
                <button
                  onClick={() => handleVote(s.id, "down")}
                  className={`flex items-center gap-1 ${
                    userVotes[s.id] === "down"
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  <ThumbsDown size={16} /> {s.downvotes}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [panels, setPanels] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bookOfMormonData, setBookOfMormonData] = useState({ books: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [scriptureTotals, setScriptureTotals] = useState({
    totalChapters: 0,
    totalVerses: 0,
  });
  const [layers, setLayers] = useState({ deity: false, qanda: false });

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 3000);
    fetch(
      "https://raw.githubusercontent.com/bcbooks/scriptures-json/master/book-of-mormon.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setBookOfMormonData(data);
        let totalChapters = 0;
        let totalVerses = 0;
        data.books.forEach((book) => {
          totalChapters += book.chapters.length;
          book.chapters.forEach(
            (chapter) => (totalVerses += chapter.verses.length)
          );
        });
        setScriptureTotals({ totalChapters, totalVerses });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load scripture data:", error);
        setIsLoading(false);
      });
  }, []);

  const addPanel = (type, content = {}) => {
    const newPanel = {
      id: Date.now(),
      type,
      content:
        type === "viewer"
          ? { book: null, chapter: null, highlightVerse: null, ...content }
          : content,
    };
    setPanels([...panels, newPanel]);
  };

  const closePanel = (id) => setPanels(panels.filter((p) => p.id !== id));

  const updatePanelContent = (id, newContent) => {
    setPanels(
      panels.map((p) =>
        p.id === id ? { ...p, content: { ...p.content, ...newContent } } : p
      )
    );
  };

  const handleJumpToVerse = (book, chapter, verse) => {
    addPanel("viewer", { book, chapter, highlightVerse: verse });
  };

  const renderPanel = (panel) => {
    switch (panel.type) {
      case "viewer":
        if (panel.content.book && panel.content.chapter) {
          return (
            <Panel
              title={`${panel.content.book} ${panel.content.chapter}`}
              icon={<BookOpen size={16} />}
              onClose={() => closePanel(panel.id)}
            >
              <ChapterViewer
                {...panel.content}
                setReference={(newRef) => updatePanelContent(panel.id, newRef)}
                bookOfMormonData={bookOfMormonData}
                totals={scriptureTotals}
                layers={layers}
              />
            </Panel>
          );
        }
        return (
          <Panel
            title="Select Chapter"
            icon={<BookOpen size={16} />}
            onClose={() => closePanel(panel.id)}
          >
            <BookSelection
              bookOfMormonData={bookOfMormonData}
              onSelectChapter={(book, chapter) =>
                updatePanelContent(panel.id, { book, chapter })
              }
            />
          </Panel>
        );
      case "search":
        return (
          <Panel
            title="Search"
            icon={<Search size={16} />}
            onClose={() => closePanel(panel.id)}
          >
            <SearchPanel
              bookOfMormonData={bookOfMormonData}
              onResultClick={handleJumpToVerse}
              initialQuery={panel.content.initialQuery}
            />
          </Panel>
        );
      case "analytics":
        return (
          <Panel
            title="Analytics"
            icon={<BarChart3 size={16} />}
            onClose={() => closePanel(panel.id)}
          >
            <AnalyticsPanel
              bookOfMormonData={bookOfMormonData}
              onResultClick={handleJumpToVerse}
            />
          </Panel>
        );
      case "layers":
        return (
          <Panel
            title="Layers"
            icon={<Layers size={16} />}
            onClose={() => closePanel(panel.id)}
          >
            <LayersPanel layers={layers} setLayers={setLayers} />
          </Panel>
        );
      case "recommendations":
        return (
          <Panel
            title="Recommendations"
            icon={<Lightbulb size={16} />}
            onClose={() => closePanel(panel.id)}
          >
            <RecommendationsPanel />
          </Panel>
        );
      default:
        return null;
    }
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="bg-gray-900 text-white font-sans flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-gray-800/50 border-r border-gray-700 p-4 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-blue-300">Study Tools</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-700"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="space-y-3 flex-grow">
          <button
            onClick={() => addPanel("viewer")}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-blue-600/80 hover:bg-blue-600 transition-colors"
          >
            <BookOpen size={20} />
            {isSidebarOpen && (
              <span className="font-semibold">Chapter Viewer</span>
            )}
          </button>
          <button
            onClick={() => addPanel("search")}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-blue-600/80 hover:bg-blue-600 transition-colors"
          >
            <Search size={20} />
            {isSidebarOpen && <span className="font-semibold">Search</span>}
          </button>
          <button
            onClick={() => addPanel("analytics")}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-blue-600/80 hover:bg-blue-600 transition-colors"
          >
            <BarChart3 size={20} />
            {isSidebarOpen && <span className="font-semibold">Analytics</span>}
          </button>
          <button
            onClick={() => addPanel("layers")}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-blue-600/80 hover:bg-blue-600 transition-colors"
          >
            <Layers size={20} />
            {isSidebarOpen && <span className="font-semibold">Layers</span>}
          </button>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => addPanel("recommendations")}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-yellow-600/80 hover:bg-yellow-600 transition-colors"
          >
            <Lightbulb size={20} />
            {isSidebarOpen && (
              <span className="font-semibold">Recommendations</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Loading Scriptures...</p>
          </div>
        ) : panels.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Open a tool from the sidebar to get started.</p>
          </div>
        ) : (
          <div
            className="grid gap-4 h-full"
            style={{
              gridTemplateColumns: `repeat(${panels.length}, minmax(400px, 1fr))`,
            }}
          >
            {panels.map((panel) => (
              <div key={panel.id} className="min-w-[400px] h-full">
                {renderPanel(panel)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
