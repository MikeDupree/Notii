import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { invoke } from "@tauri-apps/api";

import { EditorState, LexicalEditor } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

const theme = {
  // Theme styling goes here
};

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

function MySavePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key combination is Ctrl/Meta + S
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "s") {
          event.preventDefault(); // Prevent the default browser save action
          const editorState = editor.getEditorState();
          const json = editorState.toJSON();
          const file = {
            title: json?.root?.children?.[0]?.children?.[0]?.text,
            editorState: JSON.stringify(editorState.toJSON()),
          };
          console.debug("Saving File::", file);
          toast.promise(invoke("save_file", file), {
            loading: "Saving...",
            success: () => {
              return <b>File saved!</b>;
            },
            error: (res) => {
              console.error("save_file::error", res);
              return <b>Could not save.</b>;
            },
          });
        }
      }
    };

    // Attach the event listener when the component mounts
    document.addEventListener("keydown", handleKeyDown);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}

export interface CustomLexicalEditorProps {
  initialEditorState: any;
  onChange: (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>,
  ) => void;
  onError: (error: Error, editor: LexicalEditor) => void;
}

export default function CustomLexicalEditor(props: CustomLexicalEditorProps) {
  const { initialEditorState, onChange, onError } = props;

  const initialConfig = {
    namespace: "NotiiEditor",
    theme,
    onError,
    editorState: initialEditorState,
  };

  if (!initialEditorState) {
    return <>No file loaded</>;
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <PlainTextPlugin
        contentEditable={<ContentEditable className="h-full" />}
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <MyCustomAutoFocusPlugin />
      <OnChangePlugin
        onChange={(state, editor, tags) => {
          onChange?.(state, editor, tags);
        }}
      />
      <MySavePlugin />
    </LexicalComposer>
  );
}
