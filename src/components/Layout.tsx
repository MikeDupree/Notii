import { useEffect, useState } from "react";
import Editor from "./Editor/Editor";
import Files from "./Files";
import { Toaster } from "react-hot-toast";
import { invoke } from "@tauri-apps/api";
import { Search } from "./Search";
import Menu from "./Menu";

export default function Layout() {
  const [filename, setFilename] = useState<string>();
  const [fileData, setFileData] = useState<string>();

  function onSearch(searchText: string) {
    console.log("::Searching for ", searchText);
    invoke("search_files", { searchText })
      .then((res) => {
        const searchResult = JSON.parse(res as string);
        console.log("Search result:", res);
        console.log("Search result parsed:", searchResult);
      })
      .catch(console.error);
  }

  console.log("layout::file", filename);
  return (
    <section className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <div className="bg-gray-800 h-8 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button className="rounded-full bg-red-500 p-2 hover:bg-red-700">
            <span className="text-white"></span>
          </button>
          <button className="rounded-full bg-yellow-500 p-2 hover:bg-yellow-700"></button>
          <button className="rounded-full bg-green-500 p-2 hover:bg-green-700"></button>
        </div>
      </div>
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
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <p className="">Notii</p>
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
          </svg>
        </div>
        <Search onSearch={onSearch} />
        <Menu />
      </header>

      <div className="flex flex-1">
        {/*
        <aside className="w-40 border-r border-gray-700 p-4">
          <Files onClick={setFilename} />
        </aside>
        <main className="flex-1 p-4 bg-gray-700">
          <div className="editor-container h-full">
            <Editor filename={filename} />
          </div>
        </main>

           */}
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </section>
  );
}
