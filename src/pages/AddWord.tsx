import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Word, WordType } from "../types";
import { getWordsFromStorage, saveWordsToStorage } from "../storage";

const AddWord = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Para editar palabras existentes
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [type, setType] = useState<WordType>("noun");
  const [semanticField, setSemanticField] = useState("");
  const [example, setExample] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [level, setLevel] = useState<number>(2); // Por defecto: 2 (general)
  const [isEditing, setIsEditing] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (id) {
      const existingWords = getWordsFromStorage();
      const wordToEdit = existingWords.find(w => w.id === id);

      if (wordToEdit) {
        setWord(wordToEdit.word);
        setTranslation(wordToEdit.translation);
        setType(wordToEdit.type);
        setSemanticField(wordToEdit.semanticField);
        setExample(wordToEdit.example || "");
        setFavorite(wordToEdit.favorite);

        // Convertir el nivel existente al nuevo formato
        if (wordToEdit.lexicon.level === "deep") {
          setLevel(1);
        } else if (wordToEdit.lexicon.level === "surface") {
          if (wordToEdit.lexicon.subtype === "verbalBrand") {
            setLevel(3);
          } else {
            setLevel(2);
          }
        }

        setIsEditing(true);
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!word || !translation || !semanticField) {
      alert("Por favor, completa todos los campos requeridos");
      return;
    }

    // Convertir el nuevo nivel al formato existente
    let lexiconLevel: "deep" | "surface" = "surface";
    let surfaceSubtype: "general" | "verbalBrand" | undefined = undefined;

    if (level === 1) {
      lexiconLevel = "deep";
    } else {
      lexiconLevel = "surface";
      surfaceSubtype = level === 3 ? "verbalBrand" : "general";
    }

    const newWord: Word = {
      id: id || Date.now().toString(), // Usa el ID existente o crea uno nuevo
      word,
      translation,
      type,
      semanticField,
      favorite,
      example,
      lexicon: {
        level: lexiconLevel,
        ...(lexiconLevel === "surface" && { subtype: surfaceSubtype })
      }
    };

    const existingWords = getWordsFromStorage();

    if (isEditing) {
      // Actualizar la palabra existente
      const updatedWords = existingWords.map(w =>
        w.id === id ? newWord : w
      );
      saveWordsToStorage(updatedWords);
      alert("¡Palabra actualizada correctamente!");
    } else {
      // Añadir nueva palabra
      saveWordsToStorage([...existingWords, newWord]);
      alert("¡Palabra añadida correctamente!");
    }

    navigate("/all-words");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Editar Palabra" : "Añadir Nueva Palabra"}
        </h1>
        <Link to="/all-words" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Volver a Palabras
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Palabra *</label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Traducción *</label>
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Tipo *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WordType)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="noun">Sustantivo</option>
            <option value="verb">Verbo</option>
            <option value="adjective">Adjetivo</option>
            <option value="adverb">Adverbio</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Campo Semántico *</label>
          <input
            type="text"
            value={semanticField}
            onChange={(e) => setSemanticField(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Ejemplo</label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Nivel</label>
          <select
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={1}>1 - Deep</option>
            <option value={2}>2 - General</option>
            <option value={3}>3 - Verbal Brand</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="favorite"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="favorite" className="text-gray-700">Marcar como favorita</label>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {isEditing ? "Actualizar Palabra" : "Añadir Palabra"}
        </button>
      </form>
    </div>
  );
};

export default AddWord;