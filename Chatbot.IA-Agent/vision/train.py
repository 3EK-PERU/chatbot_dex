"""Entry point de entrenamiento YOLOv8 usando configuracion YAML."""

from __future__ import annotations

import argparse
import json
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from ultralytics import YOLO


@dataclass(frozen=True)
class TrainingPaths:
    vision_root: Path
    dataset_file: Path
    project_config_file: Path
    models_root: Path
    exports_root: Path
    logs_root: Path


@dataclass(frozen=True)
class TrainingOptions:
    model: str
    device: str
    imgsz: int
    batch: int
    epochs: int
    workers: int
    patience: int
    optimizer: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Entrenamiento YOLOv8 para Chatbot IA Agent")
    parser.add_argument("--dataset", default="dataset.yaml", help="Ruta al dataset YAML")
    parser.add_argument(
        "--config",
        default="configs/project.yaml",
        help="Ruta al archivo de configuracion del proyecto",
    )
    parser.add_argument(
        "--model",
        default=None,
        help="Modelo base YOLO (ej: yolov8n.pt). Sobrescribe la configuracion.",
    )
    parser.add_argument(
        "--run-name",
        default=None,
        help="Nombre del run; si no se indica se genera automaticamente.",
    )
    return parser.parse_args()


def load_yaml(file_path: Path) -> dict[str, Any]:
    if not file_path.exists():
        raise FileNotFoundError(f"No existe el archivo requerido: {file_path}")

    with file_path.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}

    if not isinstance(data, dict):
        raise ValueError(f"Formato YAML invalido en {file_path}")

    return data


def resolve_paths(args: argparse.Namespace) -> TrainingPaths:
    vision_root = Path(__file__).resolve().parent
    dataset_file = (vision_root / args.dataset).resolve()
    project_config_file = (vision_root / args.config).resolve()

    project_config = load_yaml(project_config_file)
    configured_paths = project_config.get("paths", {}) if isinstance(project_config.get("paths"), dict) else {}

    models_root = (vision_root / configured_paths.get("models_root", "./models")).resolve()
    exports_root = (vision_root / configured_paths.get("exports_root", "./exports")).resolve()
    logs_root = (vision_root / configured_paths.get("logs_root", "./models/logs")).resolve()

    return TrainingPaths(
        vision_root=vision_root,
        dataset_file=dataset_file,
        project_config_file=project_config_file,
        models_root=models_root,
        exports_root=exports_root,
        logs_root=logs_root,
    )


def resolve_training_options(
    project_config: dict[str, Any], model_override: str | None
) -> TrainingOptions:
    training = project_config.get("training", {}) if isinstance(project_config.get("training"), dict) else {}

    return TrainingOptions(
        model=model_override or str(training.get("model", "yolov8n.pt")),
        device=str(training.get("device", "auto")),
        imgsz=int(training.get("imgsz", 640)),
        batch=int(training.get("batch", 16)),
        epochs=int(training.get("epochs", 100)),
        workers=int(training.get("workers", 8)),
        patience=int(training.get("patience", 20)),
        optimizer=str(training.get("optimizer", "auto")),
    )


def ensure_directories(paths: TrainingPaths) -> None:
    paths.models_root.mkdir(parents=True, exist_ok=True)
    paths.exports_root.mkdir(parents=True, exist_ok=True)
    paths.logs_root.mkdir(parents=True, exist_ok=True)


def detect_run_name(custom_run_name: str | None) -> str:
    if custom_run_name:
        return custom_run_name
    return f"train_{datetime.now(tz=timezone.utc).strftime('%Y%m%d_%H%M%S')}"


def ensure_dataset_exists(dataset_file: Path) -> None:
    if not dataset_file.exists():
        raise FileNotFoundError(
            f"No se encontro dataset YAML en '{dataset_file}'. "
            "Asegura que exista y que el dataset haya sido exportado desde CVAT."
        )


def write_summary(
    summary_file: Path,
    run_name: str,
    options: TrainingOptions,
    dataset_file: Path,
    artifacts: dict[str, str],
) -> None:
    payload = {
        "runName": run_name,
        "datasetFile": str(dataset_file),
        "modelBase": options.model,
        "parameters": {
            "device": options.device,
            "imgsz": options.imgsz,
            "batch": options.batch,
            "epochs": options.epochs,
            "workers": options.workers,
            "patience": options.patience,
            "optimizer": options.optimizer,
        },
        "artifacts": artifacts,
        "generatedAtUtc": datetime.now(tz=timezone.utc).isoformat(),
    }

    with summary_file.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)


def copy_if_exists(source: Path, destination: Path) -> bool:
    if not source.exists():
        return False

    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    return True


def main() -> None:
    args = parse_args()

    paths = resolve_paths(args)
    project_config = load_yaml(paths.project_config_file)
    options = resolve_training_options(project_config, args.model)

    ensure_dataset_exists(paths.dataset_file)
    ensure_directories(paths)

    run_name = detect_run_name(args.run_name)
    print(f"[train] Ejecutando run: {run_name}")
    print(f"[train] Dataset: {paths.dataset_file}")
    print(f"[train] Modelo base: {options.model}")

    model = YOLO(options.model)
    train_result = model.train(
        data=str(paths.dataset_file),
        device=options.device,
        imgsz=options.imgsz,
        batch=options.batch,
        epochs=options.epochs,
        workers=options.workers,
        patience=options.patience,
        optimizer=options.optimizer,
        project=str(paths.logs_root),
        name=run_name,
        exist_ok=False,
    )

    run_dir = Path(train_result.save_dir)
    weights_dir = run_dir / "weights"
    best_pt = weights_dir / "best.pt"
    last_pt = weights_dir / "last.pt"

    latest_model = paths.models_root / "latest.pt"
    best_model = paths.models_root / "best.pt"
    last_model = paths.models_root / "last.pt"

    copied_best = copy_if_exists(best_pt, best_model)
    copy_if_exists(last_pt, last_model)

    if copied_best:
        shutil.copy2(best_model, latest_model)
    elif last_model.exists():
        shutil.copy2(last_model, latest_model)

    summary_file = paths.exports_root / f"{run_name}.summary.json"
    write_summary(
        summary_file=summary_file,
        run_name=run_name,
        options=options,
        dataset_file=paths.dataset_file,
        artifacts={
            "runDir": str(run_dir),
            "best": str(best_model) if best_model.exists() else "",
            "last": str(last_model) if last_model.exists() else "",
            "latest": str(latest_model) if latest_model.exists() else "",
        },
    )

    print("[train] Entrenamiento finalizado.")
    print(f"[train] Resumen: {summary_file}")


if __name__ == "__main__":
    main()
