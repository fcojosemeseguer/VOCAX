import React, { useState, useEffect, useRef } from 'react';
import { Word, WordType } from './types';
import { getWordsFromStorage, saveWordsToStorage, getQuotesFromStorage, saveQuotesToStorage } from './storage';

const SCREENS = {
  MAIN: 'main',
  ADD_WORD: 'add_word',
  ADD_QUOTE: 'add_quote',
  VIEW_WORDS: 'view_words',
  VIEW_QUOTES: 'view_quotes',
  EDIT_WORD: 'edit_word'
};

export default function TerminalVocax() {
  const [screen, setScreen] = useState(SCREENS.MAIN);
  const [words, setWords] = useState<Word[]>([]);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [output, setOutput] = useState<string[]>(['-------- V O C A X --------', 'Terminal-style vocabulary assistant', '', 'What would you like to do?', '1: Add Word', '2: Add Quote', '3: View Words', '4: View Quotes', '5: Exit']);

  // Para añadir palabras
  const [wordForm, setWordForm] = useState({
    step: 0,
    word: '',
    translation: '',
    type: 'noun' as WordType,
    semanticField: '',
    example: '',
    favorite: false,
    level: 2 // Por defecto: nivel 2 (general)
  });

  // Para editar palabras
  const [editWordId, setEditWordId] = useState<string | null>(null);

  // Para añadir citas
  const [quoteForm, setQuoteForm] = useState({
    step: 0,
    quote: '',
    author: ''
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar datos del almacenamiento
    setWords(getWordsFromStorage());
    setQuotes(getQuotesFromStorage());

    // Enfocar el campo de entrada
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Desplazarse al final de la salida
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }

    // Enfocar la entrada cada vez que cambia la salida
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [output]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Manejar flechas arriba/abajo para historial
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  // Limpiar terminal
  const clearTerminal = () => {
    setOutput([]);
  };

  // Mostrar menú principal
  const showMainMenu = () => {
    clearTerminal();
    setOutput(['-------- V O C A X --------', 'Terminal-style vocabulary assistant', '', 'What would you like to do?', '1: Add Word', '2: Add Quote', '3: View Words', '4: View Quotes', '5: Exit']);
  };

  const handleCommand = () => {
    // Añadir al historial
    if (input.trim()) {
      setHistory([...history, input]);
      setHistoryIndex(-1);
    }

    // Procesar comando según la pantalla actual
    if (screen === SCREENS.MAIN) {
      handleMainCommand();
    } else if (screen === SCREENS.ADD_WORD) {
      handleAddWordCommand();
    } else if (screen === SCREENS.EDIT_WORD) {
      handleEditWordCommand();
    } else if (screen === SCREENS.ADD_QUOTE) {
      handleAddQuoteCommand();
    } else if (screen === SCREENS.VIEW_WORDS) {
      handleViewWordsCommand();
    } else if (screen === SCREENS.VIEW_QUOTES) {
      // Volver al menú principal
      setScreen(SCREENS.MAIN);
      showMainMenu();
    }

    // Limpiar entrada
    setInput('');
  };

  const handleMainCommand = () => {
    if (input === '1') {
      // Añadir Palabra
      setScreen(SCREENS.ADD_WORD);
      setWordForm({ ...wordForm, step: 0 });
      clearTerminal();
      setOutput(['-------- ADD WORD --------', '', 'Enter the word:']);
    } else if (input === '2') {
      // Añadir Cita
      setScreen(SCREENS.ADD_QUOTE);
      setQuoteForm({ ...quoteForm, step: 0 });
      clearTerminal();
      setOutput(['-------- ADD QUOTE --------', '', 'Enter the quote:']);
    } else if (input === '3') {
      // Ver Palabras
      setScreen(SCREENS.VIEW_WORDS);
      clearTerminal();
      displayWords();
    } else if (input === '4') {
      // Ver Citas
      setScreen(SCREENS.VIEW_QUOTES);
      clearTerminal();
      displayQuotes();
    } else if (input === '5') {
      // Salir
      clearTerminal();
      setOutput(['Thank you for using VOCAX!', 'Refresh the page to restart.']);
    } else {
      clearTerminal();
      setOutput(['-------- V O C A X --------', 'Terminal-style vocabulary assistant', '', `Invalid option: ${input}`, 'Please choose 1-5.', '', 'What would you like to do?', '1: Add Word', '2: Add Quote', '3: View Words', '4: View Quotes', '5: Exit']);
    }
  };

  const handleAddWordCommand = () => {
    let newOutput: string[] = [];

    if (wordForm.step === 0) {
      // Palabra ingresada
      setWordForm({ ...wordForm, word: input, step: 1 });
      clearTerminal();
      newOutput = ['-------- ADD WORD --------', '', `Word: ${input}`, '', 'Enter the translation:'];
    } else if (wordForm.step === 1) {
      // Traducción ingresada
      setWordForm({ ...wordForm, translation: input, step: 2 });
      clearTerminal();
      newOutput = ['-------- ADD WORD --------', '', `Word: ${wordForm.word}`, `Translation: ${input}`, '', 'Enter the type (noun, verb, adjective, adverb):'];
    } else if (wordForm.step === 2) {
      // Tipo ingresado
      const type = input.toLowerCase();
      if (!['noun', 'verb', 'adjective', 'adverb'].includes(type)) {
        clearTerminal();
        newOutput = ['-------- ADD WORD --------', '', `Word: ${wordForm.word}`, `Translation: ${wordForm.translation}`, '', 'Invalid type. Please enter noun, verb, adjective, or adverb:'];
      } else {
        setWordForm({ ...wordForm, type: type as WordType, step: 3 });
        clearTerminal();
        newOutput = ['-------- ADD WORD --------', '', `Word: ${wordForm.word}`, `Translation: ${wordForm.translation}`, `Type: ${type}`, '', 'Enter the semantic field:'];
      }
    } else if (wordForm.step === 3) {
      // Campo semántico ingresado
      setWordForm({ ...wordForm, semanticField: input, step: 4 });
      clearTerminal();
      newOutput = ['-------- ADD WORD --------', '', `Word: ${wordForm.word}`, `Translation: ${wordForm.translation}`, `Type: ${wordForm.type}`, `Semantic field: ${input}`, '', 'Enter an example (press Enter to skip):'];
    } else if (wordForm.step === 4) {
      // Ejemplo ingresado
      setWordForm({ ...wordForm, example: input, step: 5 });
      clearTerminal();
      newOutput = ['-------- ADD WORD --------', '', `Word: ${wordForm.word}`, `Translation: ${wordForm.translation}`, `Type: ${wordForm.type}`, `Semantic field: ${wordForm.semanticField}`, `Example: ${input || '(none)'}`, '',
        'Enter level (1: Deep, 2: General, 3: Verbal Brand) [Default: 2]:'];
    } else if (wordForm.step === 5) {
      // Nivel ingresado
      let level = 2; // Por defecto: nivel 2 (general)
      if (input.trim()) {
        const inputLevel = parseInt(input);
        if ([1, 2, 3].includes(inputLevel)) {
          level = inputLevel;
        }
      }

      setWordForm({ ...wordForm, level, step: 6 });
      clearTerminal();
      newOutput = ['-------- ADD WORD --------', '',
        `Word: ${wordForm.word}`,
        `Translation: ${wordForm.translation}`,
        `Type: ${wordForm.type}`,
        `Semantic field: ${wordForm.semanticField}`,
        `Example: ${wordForm.example || '(none)'}`,
        `Level: ${level} (${level === 1 ? 'Deep' : level === 3 ? 'Verbal Brand' : 'General'})`,
        '', 'Mark as favorite? (y/n):'];
    } else if (wordForm.step === 6) {
      // Favorito ingresado
      const favorite = input.toLowerCase() === 'y';

      // Convertir el nivel al formato existente
      let lexiconLevel: "deep" | "surface" = "surface";
      let surfaceSubtype: "general" | "verbalBrand" | undefined = undefined;

      if (wordForm.level === 1) {
        lexiconLevel = "deep";
      } else {
        lexiconLevel = "surface";
        surfaceSubtype = wordForm.level === 3 ? "verbalBrand" : "general";
      }

      // Crear nueva palabra
      const newWord: Word = {
        id: Date.now().toString(),
        word: wordForm.word,
        translation: wordForm.translation,
        type: wordForm.type,
        semanticField: wordForm.semanticField,
        favorite: favorite,
        example: wordForm.example,
        lexicon: {
          level: lexiconLevel,
          ...(lexiconLevel === "surface" && { subtype: surfaceSubtype })
        }
      };

      // Guardar palabra
      const updatedWords = [...words, newWord];
      setWords(updatedWords);
      saveWordsToStorage(updatedWords);

      // Mostrar mensaje y reiniciar
      clearTerminal();
      newOutput = ['Word saved successfully!', ''];

      // Restablecer formulario y volver al menú principal después de un breve retraso
      setTimeout(() => {
        setWordForm({
          step: 0,
          word: '',
          translation: '',
          type: 'noun',
          semanticField: '',
          example: '',
          favorite: false,
          level: 2
        });
        setScreen(SCREENS.MAIN);
        showMainMenu();
      }, 1500);
    }

    setOutput(newOutput);
  };

  const handleEditWordCommand = () => {
    let newOutput: string[] = [];

    if (!editWordId) {
      setScreen(SCREENS.VIEW_WORDS);
      displayWords();
      return;
    }

    const wordToEdit = words.find(w => w.id === editWordId);

    if (!wordToEdit) {
      setOutput(['Word not found!', '']);
      setTimeout(() => {
        setScreen(SCREENS.VIEW_WORDS);
        displayWords();
      }, 1500);
      return;
    }

    if (wordForm.step === 0) {
      // Editar palabra
      setWordForm({
        ...wordForm,
        step: 1,
        word: input || wordToEdit.word
      });
      clearTerminal();
      newOutput = [
        '-------- EDIT WORD --------', '',
        `Original: ${wordToEdit.word}`,
        `New word: ${input || wordToEdit.word}`,
        '', 'Enter the translation (current: ' + wordToEdit.translation + '):'];
    } else if (wordForm.step === 1) {
      // Traducción ingresada
      setWordForm({
        ...wordForm,
        translation: input || wordToEdit.translation,
        step: 2
      });
      clearTerminal();
      newOutput = [
        '-------- EDIT WORD --------', '',
        `Word: ${wordForm.word}`,
        `Translation: ${input || wordToEdit.translation}`,
        '', `Enter the type (current: ${wordToEdit.type}):`,
        'Options: noun, verb, adjective, adverb'
      ];
    } else if (wordForm.step === 2) {
      // Tipo ingresado
      const type = input.toLowerCase();
      if (input && !['noun', 'verb', 'adjective', 'adverb'].includes(type)) {
        clearTerminal();
        newOutput = [
          '-------- EDIT WORD --------', '',
          `Word: ${wordForm.word}`,
          `Translation: ${wordForm.translation}`,
          '', 'Invalid type. Please enter noun, verb, adjective, or adverb (or press Enter to keep current):'];
      } else {
        setWordForm({
          ...wordForm,
          type: (input ? type : wordToEdit.type) as WordType,
          step: 3
        });
        clearTerminal();
        newOutput = [
          '-------- EDIT WORD --------', '',
          `Word: ${wordForm.word}`,
          `Translation: ${wordForm.translation}`,
          `Type: ${input || wordToEdit.type}`,
          '', `Enter the semantic field (current: ${wordToEdit.semanticField}):`];
      }
    } else if (wordForm.step === 3) {
      // Campo semántico ingresado
      setWordForm({
        ...wordForm,
        semanticField: input || wordToEdit.semanticField,
        step: 4
      });
      clearTerminal();
      newOutput = [
        '-------- EDIT WORD --------', '',
        `Word: ${wordForm.word}`,
        `Translation: ${wordForm.translation}`,
        `Type: ${wordForm.type}`,
        `Semantic field: ${input || wordToEdit.semanticField}`,
        '', `Enter an example (current: ${wordToEdit.example || '(none)'}):`];
    } else if (wordForm.step === 4) {
      // Ejemplo ingresado
      // Si input está vacío pero hay un ejemplo actual, mantenerlo
      const exampleToUse = input !== "" ? input : wordToEdit.example;

      setWordForm({
        ...wordForm,
        example: exampleToUse,
        step: 5
      });

      // Convertir el nivel actual al nuevo formato (1, 2, 3)
      let currentLevel = 2;
      if (wordToEdit.lexicon.level === "deep") {
        currentLevel = 1;
      } else if (wordToEdit.lexicon.level === "surface") {
        currentLevel = wordToEdit.lexicon.subtype === "verbalBrand" ? 3 : 2;
      }

      clearTerminal();
      newOutput = [
        '-------- EDIT WORD --------', '',
        `Word: ${wordForm.word}`,
        `Translation: ${wordForm.translation}`,
        `Type: ${wordForm.type}`,
        `Semantic field: ${wordForm.semanticField}`,
        `Example: ${exampleToUse || '(none)'}`,
        '', `Enter level (1: Deep, 2: General, 3: Verbal Brand) [current: ${currentLevel}]:`];
    } else if (wordForm.step === 5) {
      // Nivel ingresado
      // Convertir el nivel actual al nuevo formato (1, 2, 3)
      let currentLevel = 2;
      if (wordToEdit.lexicon.level === "deep") {
        currentLevel = 1;
      } else if (wordToEdit.lexicon.level === "surface") {
        currentLevel = wordToEdit.lexicon.subtype === "verbalBrand" ? 3 : 2;
      }

      let level = currentLevel;
      if (input.trim()) {
        const inputLevel = parseInt(input);
        if ([1, 2, 3].includes(inputLevel)) {
          level = inputLevel;
        }
      }

      setWordForm({ ...wordForm, level, step: 6 });
      clearTerminal();
      newOutput = [
        '-------- EDIT WORD --------', '',
        `Word: ${wordForm.word}`,
        `Translation: ${wordForm.translation}`,
        `Type: ${wordForm.type}`,
        `Semantic field: ${wordForm.semanticField}`,
        `Example: ${wordForm.example || '(none)'}`,
        `Level: ${level} (${level === 1 ? 'Deep' : level === 3 ? 'Verbal Brand' : 'General'})`,
        '', `Mark as favorite? (y/n) [current: ${wordToEdit.favorite ? 'yes' : 'no'}]:`];
    } else if (wordForm.step === 6) {
      // Favorito ingresado
      const favorite = input.toLowerCase() === 'y' ? true :
        input.toLowerCase() === 'n' ? false :
          wordToEdit.favorite;

      // Convertir el nivel al formato existente
      let lexiconLevel: "deep" | "surface" = "surface";
      let surfaceSubtype: "general" | "verbalBrand" | undefined = undefined;

      if (wordForm.level === 1) {
        lexiconLevel = "deep";
      } else {
        lexiconLevel = "surface";
        surfaceSubtype = wordForm.level === 3 ? "verbalBrand" : "general";
      }

      // Actualizar palabra
      const updatedWord: Word = {
        id: editWordId,
        word: wordForm.word,
        translation: wordForm.translation,
        type: wordForm.type,
        semanticField: wordForm.semanticField,
        favorite: favorite,
        example: wordForm.example,
        lexicon: {
          level: lexiconLevel,
          ...(lexiconLevel === "surface" && { subtype: surfaceSubtype })
        }
      };

      // Guardar palabra actualizada
      const updatedWords = words.map(w => w.id === editWordId ? updatedWord : w);
      setWords(updatedWords);
      saveWordsToStorage(updatedWords);

      // Mostrar mensaje y reiniciar
      clearTerminal();
      newOutput = ['Word updated successfully!', ''];

      // Restablecer formulario y volver a ver palabras después de un breve retraso
      setTimeout(() => {
        setWordForm({
          step: 0,
          word: '',
          translation: '',
          type: 'noun',
          semanticField: '',
          example: '',
          favorite: false,
          level: 2
        });
        setEditWordId(null);
        setScreen(SCREENS.VIEW_WORDS);
        displayWords();
      }, 1500);
    }

    setOutput(newOutput);
  };

  const handleViewWordsCommand = () => {
    const commandParts = input.trim().split(' ');
    const command = commandParts[0]?.toLowerCase();

    // Obtener el resto de la entrada como parámetro (para palabras)
    const wordParam = commandParts.slice(1).join(' ').trim();

    if (command === 'b' || command === 'back') {
      // Volver al menú principal
      setScreen(SCREENS.MAIN);
      showMainMenu();
    } else if (command === 'f' || command === 'favorite') {
      // Marcar/desmarcar como favorito usando la palabra en lugar del ID
      if (wordParam) {
        const wordToFavorite = words.find(w =>
          w.word.toLowerCase() === wordParam.toLowerCase()
        );

        if (wordToFavorite) {
          const updatedWords = words.map(w =>
            w.id === wordToFavorite.id ? { ...w, favorite: !w.favorite } : w
          );
          setWords(updatedWords);
          saveWordsToStorage(updatedWords);
          clearTerminal(); // Limpiar terminal antes de mostrar palabras actualizadas
          displayWords(); // Actualizar vista
        } else {
          setOutput([...output, '', `Error: Word "${wordParam}" not found`]);
        }
      } else {
        setOutput([...output, '', 'Error: Please specify a word to favorite', 'Example: f apple']);
      }
    } else if (command === 'd' || command === 'delete') {
      // Eliminar palabra usando la palabra en lugar del ID
      if (wordParam) {
        const wordToDelete = words.find(w =>
          w.word.toLowerCase() === wordParam.toLowerCase()
        );

        if (wordToDelete) {
          if (window.confirm(`Are you sure you want to delete "${wordToDelete.word}"?`)) {
            const updatedWords = words.filter(w => w.id !== wordToDelete.id);
            setWords(updatedWords);
            saveWordsToStorage(updatedWords);
            clearTerminal(); // Limpiar terminal antes de mostrar palabras actualizadas
            displayWords(); // Actualizar vista
          }
        } else {
          setOutput([...output, '', `Error: Word "${wordParam}" not found`]);
        }
      } else {
        setOutput([...output, '', 'Error: Please specify a word to delete', 'Example: d apple']);
      }
    } else if (command === 'e' || command === 'edit') {
      // Editar palabra usando la palabra en lugar del ID
      if (wordParam) {
        const wordToEdit = words.find(w =>
          w.word.toLowerCase() === wordParam.toLowerCase()
        );

        if (wordToEdit) {
          setEditWordId(wordToEdit.id);
          setWordForm({
            step: 0,
            word: wordToEdit.word,
            translation: wordToEdit.translation,
            type: wordToEdit.type,
            semanticField: wordToEdit.semanticField,
            example: wordToEdit.example || '',
            favorite: wordToEdit.favorite,
            level: wordToEdit.lexicon.level === "deep" ? 1 :
              wordToEdit.lexicon.subtype === "verbalBrand" ? 3 : 2
          });
          setScreen(SCREENS.EDIT_WORD);
          clearTerminal();
          setOutput(['-------- EDIT WORD --------', '',
            `Editing: ${wordToEdit.word} (${wordToEdit.translation})`,
            '', `Enter the new word (current: ${wordToEdit.word}):`]);
        } else {
          setOutput([...output, '', `Error: Word "${wordParam}" not found`]);
        }
      } else {
        setOutput([...output, '', 'Error: Please specify a word to edit', 'Example: e apple']);
      }
    } else {
      // Regresar al menú principal para cualquier otro comando
      setScreen(SCREENS.MAIN);
      showMainMenu();
    }
  };

  const handleAddQuoteCommand = () => {
    let newOutput: string[] = [];

    if (quoteForm.step === 0) {
      // Cita ingresada
      setQuoteForm({ ...quoteForm, quote: input, step: 1 });
      clearTerminal();
      newOutput = ['-------- ADD QUOTE --------', '', `Quote: "${input}"`, '', 'Enter the author (press Enter to skip):'];
    } else if (quoteForm.step === 1) {
      // Autor ingresado
      const author = input;

      // Formatear cita
      let formattedQuote = quoteForm.quote;
      if (author) {
        formattedQuote += ` - ${author}`;
      }

      // Guardar cita
      const updatedQuotes = [...quotes, formattedQuote];
      setQuotes(updatedQuotes);
      saveQuotesToStorage(updatedQuotes);

      // Mostrar mensaje
      clearTerminal();
      newOutput = ['Quote saved successfully!', ''];

      // Reiniciar formulario y volver al menú principal
      setTimeout(() => {
        setQuoteForm({ ...quoteForm, step: 0, quote: '', author: '' });
        setScreen(SCREENS.MAIN);
        showMainMenu();
      }, 1500);
    }

    setOutput(newOutput);
  };

  const displayWords = () => {
    const wordOutput = ['-------- SAVED WORDS --------', ''];

    if (words.length === 0) {
      wordOutput.push('No words saved yet.');
    } else {
      words.forEach((word) => {
        // Convertir el nivel al formato legible
        let levelText = "2 - General";
        if (word.lexicon.level === "deep") {
          levelText = "1 - Deep";
        } else if (word.lexicon.level === "surface" && word.lexicon.subtype === "verbalBrand") {
          levelText = "3 - Verbal Brand";
        }

        wordOutput.push(`- ${word.word} (${word.translation}) - ${word.type}${word.favorite ? ' ★' : ''}`);
        wordOutput.push(`  Level: ${levelText}`);
        if (word.semanticField) {
          wordOutput.push(`  Semantic field: ${word.semanticField}`);
        }
        if (word.example) {
          wordOutput.push(`  Example: "${word.example}"`);
        }
        wordOutput.push('----------------------------------------');
      });
    }

    wordOutput.push('');
    wordOutput.push('Commands:');
    wordOutput.push('- f [word] : Toggle favorite');
    wordOutput.push('- e [word] : Edit word');
    wordOutput.push('- d [word] : Delete word');
    wordOutput.push('- b : Back to main menu');
    wordOutput.push('');

    setOutput(wordOutput);
  };

  const displayQuotes = () => {
    const quoteOutput = ['-------- SAVED QUOTES --------', ''];

    if (quotes.length === 0) {
      quoteOutput.push('No quotes saved yet.');
    } else {
      quotes.forEach((quote, index) => {
        quoteOutput.push(`${index + 1}. "${quote}"`);
      });
      quoteOutput.push('');
    }

    quoteOutput.push('Press Enter to return to the main menu');
    setOutput(quoteOutput);
  };

  return (
    <div className="bg-black text-green-400 p-4 font-mono h-screen flex flex-col">
      <div
        ref={outputRef}
        className="flex-1 overflow-auto whitespace-pre-wrap mb-4"
      >
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <div className="flex items-center border-t border-green-500 pt-2">
        <span className="mr-2">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
          className="flex-1 bg-black text-green-400 outline-none border-none"
          autoFocus
        />
      </div>
    </div>
  );
}