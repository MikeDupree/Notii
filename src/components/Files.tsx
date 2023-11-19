import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";

type Props = {
  onClick: (file: string) => void;
};

export type TFile = {
  name: string;
};

const Files = ({ onClick }: Props) => {
  const [files, setFiles] = useState<TFile[]>([]);

  useEffect(() => {
    // TODO path is currently not being used.
    invoke("read_directory", { path: "" })
      .then((files) => {
        let filesParsed = [];
        try {
          filesParsed = JSON.parse(String(files));
        } catch (err) {
          console.error("Files:: error parsing files", err);
        }
        setFiles(filesParsed);
      })
      .catch(console.log);
  }, []);

  async function handleFileClick(filename: string) {
    onClick?.(filename);
  }

  return (
    <nav className="space-y-1 text-sm">
      {files
        ? files.map((file) => (
            <button
              className="flex w-full p-1 shadow-none border-transparent hover:border-transparent bg-transparent hover:color-gray-200 focus:outline-none focus:bg-gray-200 transition duration-300 ease-in-out"
              onClick={() => {
                handleFileClick(file.name);
              }}
            >
              <div key={`file--${file.name}`} className="w-full text-left">
                {`> ${file.name.replace(".json", "")}`}
              </div>
            </button>
          ))
        : null}
    </nav>
  );
};

export default Files;
