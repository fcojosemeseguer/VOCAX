import React, { useState, useEffect } from "react";
import { Word, WordType, LexiconLevel, SurfaceSubtype } from "./types";
import { getWordsFromStorage, saveWordsToStorage } from "./storage";
import './index.css';

function App() {
  const [words, setWords] = useState<Word[]>(getWordsFromStorage());
  const [form, setForm] = useState<Omit<Word, "id">>({
    word: "",
    translation: "",
    type: "noun",
    semanticField: "",
    favorite: false,
    example: "",
    lexicon: {
      level: "surface",
      subtype: "general",
    },
  });

  const [filterType, setFilterType] = useState<string>("");
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [filterField, setFilterField] = useState<string>("");

  useEffect(() => {
    saveWordsToStorage(words);
  }, [words]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" ? target.checked : undefined;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLexiconChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name === "lexicon.level") {
      setForm({
        ...form,
        lexicon: {
          level: value as LexiconLevel,
          subtype: value === "surface" ? form.lexicon.subtype || "general" : undefined,
        },
      });
    } else if (name === "lexicon.subtype") {
      setForm({
        ...form,
        lexicon: {
          ...form.lexicon,
          subtype: value as SurfaceSubtype,
        },
      });
    } else {
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const addWord = () => {
    const word: Word = {
      id: Date.now().toString(),
      ...form,
    };
    setWords([...words, word]);
    setForm({
      word: "",
      translation: "",
      type: "noun",
      semanticField: "",
      favorite: false,
      example: "",
      lexicon: {
        level: "surface",
        subtype: "general",
      },
    });
  };

  const filteredWords = words.filter((w) => {
    if (filterType && w.type !== filterType) return false;
    if (filterFavorite && !w.favorite) return false;
    if (filterField && !w.semanticField.toLowerCase().includes(filterField.toLowerCase())) return false;
    return true;
  });

  const exportWords = () => {
    const dataStr = JSON.stringify(words, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vocabulary.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importWords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const imported = JSON.parse(result);
        if (Array.isArray(imported)) {
          setWords(imported);
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (error) {
        alert("Error al importar el archivo.");
      }
    };
    reader.readAsText(file);
  };

  const clearAllWords = () => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar todas las palabras?");
    if (confirmDelete) setWords([]);
  };

  return (
    <div className="min-h-screen bg-blue-900 px-4 py-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-center text-6xl font-bold text-red-600 mb-6">VOCAX</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Agregar palabra</h2>

          <input name="word" placeholder="Palabra" value={form.word} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 mb-3" />
          <input name="translation" placeholder="Traducción" value={form.translation} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 mb-3" />
          <input name="example" placeholder="Ejemplo de uso" value={form.example} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 mb-3" />
          <input name="semanticField" placeholder="Campo semántico" value={form.semanticField} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 mb-3" />

          <select name="type" value={form.type} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3">
            <option value="noun">Sustantivo</option>
            <option value="verb">Verbo</option>
            <option value="adjective">Adjetivo</option>
            <option value="adverb">Adverbio</option>
          </select>

          <select name="lexicon.level" value={form.lexicon.level} onChange={handleLexiconChange}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3">
            <option value="surface">Surface</option>
            <option value="deep">Deep</option>
          </select>

          {form.lexicon.level === "surface" && (
            <select name="lexicon.subtype" value={form.lexicon.subtype} onChange={handleLexiconChange}
              className="w-full p-3 border border-gray-300 rounded-lg mb-3">
              <option value="general">General</option>
              <option value="verbalBrand">Verbal Brand</option>
            </select>
          )}

          <label className="flex items-center mb-4">
            <input type="checkbox" name="favorite" checked={form.favorite} onChange={handleChange}
              className="mr-2" /> Favorita
          </label>

          <div className="flex justify-center items-center">
            <button onClick={addWord} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full text-lg shadow">
              Añadir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Filtrar palabras</h2>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3">
            <option value="">Todos los tipos</option>
            <option value="noun">Sustantivos</option>
            <option value="verb">Verbos</option>
            <option value="adjective">Adjetivos</option>
            <option value="adverb">Adverbios</option>
          </select>

          <label className="flex items-center mb-4">
            <input type="checkbox" checked={filterFavorite} onChange={(e) => setFilterFavorite(e.target.checked)} className="mr-2" />
            Solo favoritos
          </label>

          <input placeholder="Buscar por campo semántico" value={filterField} onChange={(e) => setFilterField(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3" />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Palabras guardadas</h2>
          <ul>
            {filteredWords.length === 0 ? (
              <li className="text-gray-600">No hay palabras que coincidan con los filtros aplicados.</li>
            ) : (
              filteredWords.map((w) => (
                <li key={w.id} className="mb-4 border-b pb-2">
                  <strong className="text-blue-700">{w.word}</strong> ({w.translation}) - {w.type} / {w.semanticField} {" "}
                  {w.favorite && <span className="text-yellow-500 ml-1">★</span>}
                  {w.example && <div className="italic text-sm mt-1 text-gray-600">“{w.example}”</div>}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Importar / Exportar</h2>
          <div className="flex gap-4">
            <button onClick={exportWords} className="bg-blue-900 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow">Exportar</button>
            <label className="cursor-pointer bg-blue-900 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow">
              Importar
              <input type="file" accept=".json" onChange={importWords} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex justify-center items-center min-h-[100px]">
          <button onClick={clearAllWords} className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-full shadow">
            Borrar Vocabulario
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
