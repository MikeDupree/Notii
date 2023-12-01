// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// For System tray menu
use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};

// For file saving
use serde::{Deserialize, Serialize};
use serde_json::{Number, Value};
use std::fs::{self, File, OpenOptions};
use std::io::prelude::*;
use std::io::{self, BufRead, Read};
use walkdir::WalkDir;

// For determining home dir
use dirs::home_dir;

#[derive(Serialize, Deserialize, Debug)]
struct NoteData {
    title: String,
    editor_state: String,
    // Add more fields as needed
}

#[tauri::command]
fn save_file(title: &str, editorState: &str) -> String {
    // Create an instance of your data structure
    let data_to_save = NoteData {
        title: title.to_lowercase().replace(" ", "_").to_string(),
        editor_state: editorState.to_string(),
    };

    let filename = format!("{}.json", data_to_save.title);

    // Serialize the data to JSON
    let serialized_data = serde_json::to_string(&data_to_save).expect("Unable to serialize data");

    // Obtain the user's home directory
    let home_dir = home_dir().expect("Unable to determine home directory");

    // Specify the file path relative to the home directory
    let file_path = home_dir.join(".notii").join(filename);

    println!("Save filepath: {:?}", file_path);

    // Remove the existing file if it exists
    if file_path.exists() {
        match std::fs::remove_file(&file_path) {
            Ok(_) => println!("File deleted successfully."),
            Err(err) => eprintln!("Error deleting file: {:?}", err),
        }
    }

    // Create the directory if it doesn't exist
    if let Some(parent_dir) = file_path.parent() {
        if let Err(err) = fs::create_dir_all(parent_dir) {
            eprintln!("Error creating directory: {:?}", err);
            return format!("Error saving data");
        }
    }

    // Open the file in write mode and create it if it doesn't exist
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(&file_path)
        .expect("Unable to open or create file");

    // Write the serialized data to the file
    if let Err(err) = file.write_all(serialized_data.as_bytes()) {
        eprintln!("Error writing to file: {:?}", err);
        return format!("Error saving data");
    }

    format!("Data has been saved!")
}

#[derive(Serialize, Deserialize, Debug)]
struct DirectoryEntry {
    name: String,
    // Add more fields as needed
}

#[tauri::command]
fn read_file(file_name: &str) -> String {
    let mut result: String = "{}".to_string();

    let home_dir = home_dir().expect("Unable to determine home directory");
    let path_to_check = home_dir.join(".notii").join(file_name);

    println!("Filepath:: {:#?}", path_to_check);
    match read_json(path_to_check.to_str().unwrap()) {
        Ok(json_data) => {
            println!("File content: {:#?}", json_data);
            result = json_data.to_string();
        }
        Err(error) => {
            println!("Error reading file: {}", error);
        }
    }

    result
}

fn read_json(file_path: &str) -> Result<Value, io::Error> {
    // Open the file
    let mut file = File::open(file_path)?;

    // Read the content of the file into a String
    let mut file_content = String::new();
    file.read_to_string(&mut file_content)?;

    // Parse the JSON content
    let json_data: Value = serde_json::from_str(&file_content)?;

    Ok(json_data)
}

#[tauri::command]
fn read_directory(path: &str) -> String {
    let home_dir = home_dir().expect("Unable to determine home directory");

    // Specify the file path relative to the home directory
    let path_to_check = home_dir.join(".notii");
    let entries: Vec<DirectoryEntry> = fs::read_dir(path_to_check)
        .unwrap()
        .filter_map(|entry| {
            entry.ok().map(|e| DirectoryEntry {
                name: e.file_name().to_string_lossy().into_owned(),
            })
        })
        .collect();

    let json_result = serde_json::to_string(&entries);
    json_result.ok().unwrap().to_string()
}

#[derive(Serialize, Deserialize, Debug)]
struct FileMatch {
    filename: String,
    line_number: usize,
}

#[tauri::command]
fn search_files(search_text: &str) -> String {
    let mut file_matches: Vec<FileMatch> = vec![];

    let home_dir = home_dir().expect("Unable to determine home directory");
    // Specify the file path relative to the home directory
    let path_to_check = home_dir.join(".notii");
    for entry in WalkDir::new(path_to_check)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            if let Some(file_name) = entry.file_name().to_str() {
                println!("Checking {}", file_name);

                if let Ok(file) = File::open(entry.path()) {
                    println!("File Opened");
                    let reader = io::BufReader::new(file);
                    for (line_number, line) in reader.lines().enumerate() {
                        println!("Line {}", line_number);
                        if let Ok(line) = line {
                            if line.contains(search_text) {
                                // Create an instance of your data structure
                                let file_match = FileMatch {
                                    filename: file_name.to_string(),
                                    line_number,
                                };
                                file_matches.push(file_match);
                                println!(
                                    "Found '{}' in {}:{} - {}",
                                    search_text,
                                    file_name,
                                    line_number + 1,
                                    line
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    // Serialize the data to JSON
    let serialized_data = serde_json::to_string(&file_matches).expect("Unable to serialize data");
    serialized_data
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let system_tray_menu = SystemTrayMenu::new();
    tauri::Builder::default()
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                // toggle application window
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            read_file,
            save_file,
            read_directory,
            search_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
