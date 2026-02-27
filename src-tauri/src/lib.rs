use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use uuid::Uuid;
use chrono::Utc;

// ── Domain types ────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub title: String,
    pub status: TaskStatus,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskStatus {
    #[serde(rename = "todo")]
    Todo,
    #[serde(rename = "done")]
    Done,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskInput {
    pub title: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTaskInput {
    pub status: Option<TaskStatus>,
}

// ── Persistence ─────────────────────────────────────────────────────────────

fn get_tasks_path(app: &tauri::AppHandle) -> PathBuf {
    let data_dir = app.path().app_data_dir().expect("Failed to resolve app data dir");
    fs::create_dir_all(&data_dir).expect("Failed to create app data dir");
    data_dir.join("tasks.json")
}

fn load_tasks(app: &tauri::AppHandle) -> Vec<Task> {
    let path = get_tasks_path(app);
    if !path.exists() {
        return vec![];
    }
    let content = fs::read_to_string(&path).unwrap_or_default();
    serde_json::from_str(&content).unwrap_or_default()
}

fn save_tasks(app: &tauri::AppHandle, tasks: &Vec<Task>) {
    let path = get_tasks_path(app);
    let content = serde_json::to_string_pretty(tasks).expect("Failed to serialize tasks");
    fs::write(path, content).expect("Failed to write tasks file");
}

// ── Commands ─────────────────────────────────────────────────────────────────

#[tauri::command]
fn get_all_tasks(app: tauri::AppHandle) -> Vec<Task> {
    load_tasks(&app)
}

#[tauri::command]
fn create_task(app: tauri::AppHandle, input: CreateTaskInput) -> Task {
    let mut tasks = load_tasks(&app);

    let task = Task {
        id: Uuid::new_v4().to_string(),
        title: input.title,
        status: TaskStatus::Todo,
        created_at: Utc::now().to_rfc3339(),
    };

    tasks.push(task.clone());
    save_tasks(&app, &tasks);
    task
}

#[tauri::command]
fn update_task(app: tauri::AppHandle, id: String, input: UpdateTaskInput) -> Option<Task> {
    let mut tasks = load_tasks(&app);

    if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
        if let Some(status) = input.status {
            task.status = status;
        }

        let updated = task.clone();
        save_tasks(&app, &tasks);
        return Some(updated);
    }

    None
}

#[tauri::command]
fn delete_task(app: tauri::AppHandle, id: String) {
    let mut tasks = load_tasks(&app);
    tasks.retain(|t| t.id != id);
    save_tasks(&app, &tasks);
}

// ── Entry point ──────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_all_tasks,
            create_task,
            update_task,
            delete_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}