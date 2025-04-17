import React, { useState, useEffect } from "react";
import { Word, WordType } from "./types";

function App() {
  const [words, setWords] = useState<Word[]>([]);
  const [form, setForm] = useState<Omit<Word, "id">>({
    word: "",
    translation: "",
    type: "noun",
    semanticField: "",
    favorite: false,
  });

  const [filterType, setFilterType] = useState<string>("");
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [filterField, setFilterField] = useState<string>("");

  // Cargar palabras guardadas desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("words");
    if (saved) {
      setWords(JSON.parse(saved));
    }
  }, []);

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

  return (
    <div style={{ padding: 20 }}>
      <h1>VocaMuse</h1>

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
    </div>
  );
}

export default App;

