import { useEffect, useState } from "react";
import Editor from "./Editor/Editor";
import Files from "./Files";
import { Toaster } from "react-hot-toast";
import { invoke } from "@tauri-apps/api";

export default function Layout() {
  const [filename, setFilename] = useState<string>();
  const [fileData, setFileData] = useState<string>();
  const [searchText, setSearchText] = useState();

  console.log("filename", filename);
  console.log("markdown");
  useEffect(() => {
    console.log("Load file", filename);
    if (filename) {
      invoke("read_file", { fileName: filename })
        .then((res) => {
          console.log("read file", res);
          try {
            const data = JSON.parse(res as string);
            console.log("file data", data);
            setFileData(data.markdown);
          } catch (err) {
            console.log("Error parsing file!");
          }
        })
        .catch(console.log);
    }
  }, [filename]);

  console.log("layout::file", filename);
  return (
    <section className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <header className="flex items-center justify-between h-14 px-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <svg
            className=" h-6 w-6"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <input
          className="bg-white dark:bg-gray-800 text-black dark:text-white m-1 h-10 w-80"
          placeholder="[CMD+K] ...Search Files"
          type="search"
        />
        X Dropdownmenu
      </header>

      <div className="flex flex-1">
        <aside className="w-40 border-r border-gray-700 p-4">
          <Files
            onClick={(f: string) => {
              console.log("Set File", f);
              setFilename(f);
            }}
          />
        </aside>
        <main className="flex-1 p-4 bg-gray-700">
          <div className="editor-container h-full">
            <Editor filename={filename} data={fileData} />
          </div>
        </main>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </section>
  );
}
