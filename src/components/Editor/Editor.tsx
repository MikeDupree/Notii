import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { invoke } from "@tauri-apps/api/tauri";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import { unified } from "unified";
import parse from "remark-parse";
import { TFile } from "../Files";
import LexicalEditor from "./LexicalEditor";
import {
  EditorState,
  SerializedEditorState,
  SerializedLexicalNode,
} from "lexical";
import { v4 as uuidv4 } from "uuid";

// Function to extract the first header from Markdown
const getFirstHeader = (markdown: string): string | null => {
  // Create a unified processor with the remark-parse parser
  const processor = unified().use(parse);

  // Parse the Markdown content
  const tree = processor.parse(markdown);

  // Find the first heading in the parsed tree
  const firstHeadingNode = tree.children.find(
    (node) => node.type === "heading",
  );

  const heading = firstHeadingNode?.children?.[0]?.value;

  return heading || "Untitled";
};

interface EditorProps {
  filename?: string;
}

const defaultEditorState =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

/**
 * Editor component
 */
function Editor({ filename }: EditorProps) {
  const [file, setFile] = useState<{
    filename: string;
    editorState: string;
  }>();
  const [editorState, setEditorState] = useState<string>();

  useEffect(() => {
    if (filename) {
      invoke("read_file", { fileName: filename })
        .then((res) => {
          try {
            const data = JSON.parse(res as string);
            if (data?.editor_state) {
              setEditorState(data.editor_state);
            } else {
              setEditorState(undefined);
            }
          } catch (err) {
            console.log("Error parsing file!");
          }
        })
        .catch(console.log);
    }
  }, [filename]);

  // Catch any errors that occur during Lexical updates and log them
  // or throw them as needed. If you don't throw them, Lexical will
  // try to recover gracefully without losing user data.
  function onError(error: Error) {
    console.error(error);
  }

  function onChange(data: EditorState) {
    console.log("Editor :: onChange", JSON.stringify(data.toJSON()));
    const json = data.toJSON();
    const file = {
      filename: json?.root?.children?.[0]?.children?.[0]?.text,
      editorState: JSON.stringify(data.toJSON()),
    };
    console.log("json", json?.root?.children?.[0]?.children?.[0]?.text);
    //    setFile(file);
    //setEditorState(JSON.stringify(data.toJSON()));
  }

  return (
    <div className="container h-full w-full" key={`editor-cont--${uuidv4()}`}>
      <LexicalEditor
        key={`editor--${uuidv4()}`}
        initialEditorState={editorState}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
}

export default Editor;
