import React, { useState, useEffect } from "react";
import { Word, WordType, LexiconLevel, SurfaceSubtype } from "./types";
import { getWordsFromStorage, saveWordsToStorage } from "./storage";


function App() {
  const [words, setWords] = useState<Word[]>(getWordsFromStorage());
  const [form, setForm] = useState<Omit<Word, "id">>({
    word: "",
    translation: "",
    type: "noun",
    semanticField: "",
    favorite: false,
    lexicon: {
      level: "surface",
      subtype: "general",
    },
  });

  const [filterType, setFilterType] = useState<string>("");
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [filterField, setFilterField] = useState<string>("");

  // Cargar palabras guardadas desde localStorage
  useEffect(() => {
    saveWordsToStorage(words);
  }, [words]);


  // Guardar palabras en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem("words", JSON.stringify(words));
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
      lexicon: {
        level: "surface",
        subtype: "general",
      },
    });
  };

  // Filtrar palabras según los filtros activos
  const filteredWords = words.filter((w) => {
    // Filtrar por tipo
    if (filterType && w.type !== filterType) return false;

    // Filtrar por favorito
    if (filterFavorite && !w.favorite) return false;

    // Filtrar por campo semántico
    if (filterField && !w.semanticField.toLowerCase().includes(filterField.toLowerCase())) return false;

    return true;
  });

  // Funcion para exportar vocabulario
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

  // Funcion para importar vocabulario
  const importWords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const imported = JSON.parse(result);
        if (Array.isArray(imported)) {
          setWords(imported); // carga en el estado
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (error) {
        alert("Error al importar el archivo.");
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  // Funcion para Eliminar todas las palabras
  const clearAllWords = () => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar todas las palabras?");
    if (confirmDelete) {
      setWords([]);
    }
  };

  // No se que hace
  const handleLexiconChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" ? (target as HTMLInputElement).checked : undefined;

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





  return (
    <div style={{ padding: 20 }}>
      <h1>Vocax</h1>

      <h2>Agregar nueva palabra</h2>
      <input
        name="word"
        placeholder="Palabra"
        value={form.word}
        onChange={handleChange}
      />
      <br />
      <input
        name="translation"
        placeholder="Traducción"
        value={form.translation}
        onChange={handleChange}
      />
      <br />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="noun">Sustantivo</option>
        <option value="verb">Verbo</option>
        <option value="adjective">Adjetivo</option>
        <option value="adverb">Adverbio</option>
      </select>
      <br />
      <input
        name="semanticField"
        placeholder="Campo semántico"
        value={form.semanticField}
        onChange={handleChange}
      />
      <select name="lexicon.level" value={form.lexicon.level} onChange={handleLexiconChange}>
        <option value="surface">Surface</option>
        <option value="deep">Deep</option>
      </select>

      {form.lexicon.level === "surface" && (
        <select name="lexicon.subtype" value={form.lexicon.subtype} onChange={handleLexiconChange}>
          <option value="general">General</option>
          <option value="verbalBrand">Verbal Brand</option>
        </select>
      )}
      <br />
      <label>
        <input
          type="checkbox"
          name="favorite"
          checked={form.favorite}
          onChange={handleChange}
        />
        Favorita
      </label>
      <br />
      <button onClick={addWord}>Añadir</button>

      <h2>Filtrar palabras</h2>
      <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
        <option value="">Todos los tipos</option>
        <option value="noun">Sustantivos</option>
        <option value="verb">Verbos</option>
        <option value="adjective">Adjetivos</option>
        <option value="adverb">Adverbios</option>
      </select>

      <label style={{ marginLeft: "1em" }}>
        <input
          type="checkbox"
          checked={filterFavorite}
          onChange={(e) => setFilterFavorite(e.target.checked)}
        />
        Solo favoritos
      </label>

      <br />
      <input
        placeholder="Buscar por campo semántico"
        value={filterField}
        onChange={(e) => setFilterField(e.target.value)}
      />

      <h2>Palabras guardadas</h2>
      <ul>
        {filteredWords.length === 0 ? (
          <li>No hay palabras que coincidan con los filtros aplicados.</li>
        ) : (
          filteredWords.map((w) => (
            <li key={w.id}>
              <strong>{w.word}</strong> ({w.translation}) - {w.type} / {w.semanticField}{" "}
              {w.favorite && "★"}
            </li>
          ))
        )}
      </ul>

      <h2>Importar/Exportar Vocabulario</h2>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={exportWords}>Exportar vocabulario</button>

        <label style={{ marginLeft: "1rem", cursor: "pointer" }}>
          Importar vocabulario
          <input type="file" accept=".json" onChange={importWords} style={{ display: "none" }} />
        </label>
      </div>

      <h2>Clear Vocabulary</h2>
      <button onClick={clearAllWords} style={{ marginLeft: "1rem", color: "red" }}>
        Borrar todo
      </button>

    </div>
  );
}

export default App;

