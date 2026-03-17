use std::fs;
use std::path::PathBuf;
use std::process::Command;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use tauri::Manager;

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

// ── Data repo path ───────────────────────────────────────────────────────────

fn get_data_repo_path() -> PathBuf {
    let home = dirs::home_dir().expect("Failed to resolve home dir");
    home.join("lembreta-data")
}

fn get_tasks_path() -> PathBuf {
    get_data_repo_path().join("tasks.json")
}

// ── Git operations ───────────────────────────────────────────────────────────

#[cfg(target_os = "windows")]
fn git_pull() {
    use std::os::windows::process::CommandExt;
    let repo = get_data_repo_path();
    let _ = Command::new("git")
        .args(["pull", "--rebase"])
        .current_dir(&repo)
        .creation_flags(0x08000000)
        .output();
}

#[cfg(not(target_os = "windows"))]
fn git_pull() {
    let repo = get_data_repo_path();
    let _ = Command::new("git")
        .args(["pull", "--rebase"])
        .current_dir(&repo)
        .output();
}

#[cfg(target_os = "windows")]
fn git_push(message: &str) {
    use std::os::windows::process::CommandExt;
    let repo = get_data_repo_path();

    let _ = Command::new("git")
        .args(["add", "tasks.json"])
        .current_dir(&repo)
        .creation_flags(0x08000000)
        .output();

    let _ = Command::new("git")
        .args(["commit", "-m", message])
        .current_dir(&repo)
        .creation_flags(0x08000000)
        .output();

    let _ = Command::new("git")
        .args(["push"])
        .current_dir(&repo)
        .creation_flags(0x08000000)
        .output();
}

#[cfg(not(target_os = "windows"))]
fn git_push(message: &str) {
    let repo = get_data_repo_path();

    let _ = Command::new("git")
        .args(["add", "tasks.json"])
        .current_dir(&repo)
        .output();

    let _ = Command::new("git")
        .args(["commit", "-m", message])
        .current_dir(&repo)
        .output();

    let _ = Command::new("git")
        .args(["push"])
        .current_dir(&repo)
        .output();
}

// ── Persistence ──────────────────────────────────────────────────────────────

fn load_tasks() -> Vec<Task> {
    let path = get_tasks_path();
    if !path.exists() {
        return vec![];
    }
    let content = fs::read_to_string(&path).unwrap_or_default();
    serde_json::from_str(&content).unwrap_or_default()
}

fn save_tasks(tasks: &Vec<Task>) {
    let path = get_tasks_path();
    let content = serde_json::to_string_pretty(tasks).expect("Failed to serialize tasks");
    fs::write(path, content).expect("Failed to write tasks file");
}

// ── Commands ─────────────────────────────────────────────────────────────────

#[tauri::command]
fn get_all_tasks() -> Vec<Task> {
    git_pull();
    load_tasks()
}

#[tauri::command]
fn create_task(input: CreateTaskInput) -> Task {
    let mut tasks = load_tasks();

    let task = Task {
        id: Uuid::new_v4().to_string(),
        title: input.title.clone(),
        status: TaskStatus::Todo,
        created_at: Utc::now().to_rfc3339(),
    };

    tasks.push(task.clone());
    save_tasks(&tasks);

    let title = input.title.clone();
    std::thread::spawn(move || {
        git_push(&format!("add task: {}", title));
    });

    task
}

#[tauri::command]
fn update_task(id: String, input: UpdateTaskInput) -> Option<Task> {
    let mut tasks = load_tasks();

    if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
        if let Some(status) = input.status {
            task.status = status;
        }

        let updated = task.clone();
        save_tasks(&tasks);

        let title = updated.title.clone();
        std::thread::spawn(move || {
            git_push(&format!("update task: {}", title));
        });

        return Some(updated);
    }

    None
}

#[tauri::command]
fn delete_task(id: String) {
    let mut tasks = load_tasks();
    tasks.retain(|t| t.id != id);
    save_tasks(&tasks);

    std::thread::spawn(move || {
        git_push("delete task");
    });
}

// ── Entry point ──────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            if let Ok(Some(monitor)) = window.current_monitor() {
                let screen_size = monitor.size();
                let window_width = 400;
                let window_height = 350;
                let margin = 20;

                let x = (screen_size.width as i32) - window_width - margin;
                let y = ((screen_size.height as i32) - window_height) / 2;

                let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_tasks,
            create_task,
            update_task,
            delete_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}