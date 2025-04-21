import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getQuotesFromStorage, saveQuotesToStorage } from "../storage";

const Quotes = () => {
  const [quotes, setQuotes] = useState<string[]>([]);
  const [newQuote, setNewQuote] = useState<string>("");

  useEffect(() => {
    // Load quotes from storage on component mount
    const storedQuotes = getQuotesFromStorage();
    setQuotes(storedQuotes);
  }, []);

  const addQuote = () => {
    if (newQuote.trim() !== "") {
      const updatedQuotes = [...quotes, newQuote];
      setQuotes(updatedQuotes);
      saveQuotesToStorage(updatedQuotes);
      setNewQuote("");
    }
  };

  const deleteQuote = (index: number) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      const updatedQuotes = quotes.filter((_, i) => i !== index);
      setQuotes(updatedQuotes);
      saveQuotesToStorage(updatedQuotes);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Quotes</h1>
        <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Back to Home
        </Link>
      </div>

      <div className="mb-4">
        <textarea
          placeholder="Write a quote..."
          value={newQuote}
          onChange={(e) => setNewQuote(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          rows={3}
        />

        <button 
          onClick={addQuote} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Quote
        </button>
      </div>

      {quotes.length === 0 ? (
        <p className="text-gray-500">No quotes saved yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {quotes.map((q, i) => (
            <li key={i} className="relative border p-3 rounded italic bg-gray-50">
              "{q}"
              <button
                onClick={() => deleteQuote(i)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete quote"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Quotes;
