import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Word } from "../types";
import { getWordsFromStorage, saveWordsToStorage } from "../storage";

const AllWords = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [filterField, setFilterField] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<number | "">("");

  useEffect(() => {
    const storedWords = getWordsFromStorage();
    setWords(storedWords);
  }, []);

  // Convertir el nivel del formato existente al nuevo formato (1, 2, 3)
  const getWordLevel = (word: Word): number => {
    if (word.lexicon.level === "deep") {
      return 1;
    } else {
      return word.lexicon.subtype === "verbalBrand" ? 3 : 2;
    }
  };

  const filteredWords = words.filter((w) => {
    if (filterType && w.type !== filterType) return false;
    if (filterFavorite && !w.favorite) return false;
    if (filterField && !w.semanticField.toLowerCase().includes(filterField.toLowerCase())) return false;
    if (filterLevel !== "" && getWordLevel(w) !== filterLevel) return false;
    return true;
  });

  const toggleFavorite = (id: string) => {
    const updatedWords = words.map(word =>
      word.id === id ? { ...word, favorite: !word.favorite } : word
    );
    setWords(updatedWords);
    saveWordsToStorage(updatedWords);
  };

  const deleteWord = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta palabra?")) {
      const updatedWords = words.filter(word => word.id !== id);
      setWords(updatedWords);
      saveWordsToStorage(updatedWords);
    }
  };

  // Función para convertir el nivel al formato legible
  const getLevelText = (word: Word): string => {
    const level = getWordLevel(word);
    if (level === 1) return "1 - Deep";
    if (level === 3) return "3 - Verbal Brand";
    return "2 - General";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todas las Palabras</h1>
        <div className="space-x-2">
          <Link to="/add-word" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Añadir Palabra
          </Link>
          <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Volver al Inicio
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Todos los Tipos</option>
          <option value="noun">Sustantivos</option>
          <option value="verb">Verbos</option>
          <option value="adjective">Adjetivos</option>
          <option value="adverb">Adverbios</option>
        </select>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value === "" ? "" : Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value="">Todos los Niveles</option>
          <option value={1}>1 - Deep</option>
          <option value={2}>2 - General</option>
          <option value={3}>3 - Verbal Brand</option>
        </select>

        <input
          type="text"
          placeholder="Campo Semántico"
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="p-2 border rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterFavorite}
            onChange={(e) => setFilterFavorite(e.target.checked)}
          />
          Solo Favoritos
        </label>
      </div>

      {filteredWords.length === 0 ? (
        <p className="text-gray-500">No hay palabras que coincidan con tus filtros.</p>
      ) : (
        <ul className="space-y-2">
          {filteredWords.map((w) => (
            <li key={w.id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-bold text-lg">{w.word}</span>
                    <span className="text-gray-600 mx-2">({w.translation})</span>
                    <span className="text-gray-500 text-sm">— {w.type} / {w.semanticField}</span>
                    <button
                      onClick={() => toggleFavorite(w.id)}
                      className={`ml-2 text-lg ${w.favorite ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  </div>
                  {w.example && <p className="italic mb-1 text-gray-600">"{w.example}"</p>}
                  <p className="text-sm text-gray-500">
                    Nivel: {getLevelText(w)}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Link
                    to={`/edit-word/${w.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteWord(w.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllWords;