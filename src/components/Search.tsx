import { useEffect, useRef } from "react";

export interface SearchProps {
  onSearch?: (searchText: string) => void;
}

export const Search = (props: SearchProps) => {
  const { onSearch } = props;
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.debug({
        event,
      });
      // Check if the key combination is Ctrl/Meta + K
      // Focus search
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "k") {
          event.preventDefault();
          searchRef.current?.focus();
        }
      }

      // Handle Enter press when search has focus
      if (event.key === "Enter") {
        const searchText = searchRef.current?.value;
        if (searchText && document.activeElement === searchRef.current) {
          event.preventDefault();
          onSearch?.(searchText);
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

  return (
    <div>
      <input
        className="bg-white dark:bg-gray-800 text-black dark:text-white m-1 h-10 w-80"
        placeholder="[CMD+K] Search Files"
        type="search"
        ref={searchRef}
      />
    </div>
  );
};
