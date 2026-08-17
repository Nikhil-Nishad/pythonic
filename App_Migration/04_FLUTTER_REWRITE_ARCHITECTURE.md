# 04. Flutter & Flame Engine Architecture Blueprint

If you choose to do a 100% native Flutter rewrite (or wish to migrate to Flutter in the future), this document provides the architectural blueprint mapping every JavaScript module into clean, idiomatic Dart and Flutter components using the **Flame Game Engine**.

---

## 1. Flutter Project Dependencies (`pubspec.yaml`)

```yaml
name: modern_snake
description: Modern 60FPS Snake Game with A* AI Rival, Skins, Audio Synthesizer, and Leaderboards.
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flame: ^1.18.0              # 60FPS Game loop, Canvas rendering, Component system
  flutter_riverpod: ^2.5.1    # State management for scores, skins, quests
  shared_preferences: ^2.2.3  # LocalStorage replacement for high scores
  audioplayers: ^6.0.0        # Sound effect playback / audio engine
  vibration: ^2.0.0           # Haptic telemetry
  google_fonts: ^6.2.0        # Space Grotesk & JetBrains Mono fonts

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

---

## 2. Directory Structure Mapping

```
lib/
├── core/
│   ├── constants.dart            # Grid dimensions, colors, base speed
│   ├── theme.dart                # Dark/Light theme colors, glassmorphism styles
│   └── audio_engine.dart         # Procedural sound synthesizer / soundpool
├── models/
│   ├── position.dart             # Grid coordinates (x, y)
│   ├── snake_skin.dart           # Skin definition (colors, glow, unlock conditions)
│   ├── quest.dart                # Daily quest model & progress
│   └── score_entry.dart          # Leaderboard entry model
├── providers/
│   ├── game_state_provider.dart  # Score, level, combo multiplier, pause state
│   ├── skin_provider.dart        # Unlocked skins, selected skin
│   ├── quest_provider.dart       # Active daily quests & completion
│   └── leaderboard_provider.dart # Persistent top-10 leaderboard
├── game/
│   ├── modern_snake_game.dart    # FlameGame master loop & input routing
│   ├── components/
│   │   ├── snake_player.dart     # Player snake body segments & movement logic
│   │   ├── snake_ai_bot.dart     # Rival bot snake driven by A* pathfinding
│   │   ├── food_component.dart   # Normal, bonus, and specialty food spawning
│   │   ├── particle_system.dart  # Canvas particle explosion effects
│   │   └── grid_background.dart  # Grid lines, background gradient & glow
│   └── ai/
│       ├── astar_pathfinder.dart # Dart port of src/ai/pathfinding.js
│       └── bot_controller.dart   # Dart port of src/ai/botController.js
└── ui/
    ├── main_menu_screen.dart     # Start overlay, mode selector (Classic / VS Bot)
    ├── game_over_dialog.dart     # Final score, level, length, share card
    ├── skin_selector_modal.dart  # Skin gallery & unlock triggers
    ├── quest_dialog.dart         # Daily quest list & claim buttons
    └── leaderboard_modal.dart    # Top-10 leaderboard table
```

---

## 3. Core Component Translations

### 3.1. A* Pathfinding Engine (`lib/game/ai/astar_pathfinder.dart`)
Translating [`src/ai/pathfinding.js`](file:///d:/TimePass/v2.0/pythonic/src/ai/pathfinding.js) into strongly-typed Dart:

```dart
import 'dart:math';
import 'package:collection/collection.dart';
import '../../models/position.dart';

class Node {
  final Position pos;
  double g = double.infinity;
  double h = 0;
  double get f => g + h;
  Node? parent;

  Node(this.pos);
}

class AStarPathfinder {
  final int gridWidth;
  final int gridHeight;

  AStarPathfinder({required this.gridWidth, required this.gridHeight});

  List<Position>? findPath({
    required Position start,
    required Position target,
    required Set<Position> obstacles,
  }) {
    final openSet = PriorityQueue<Node>((a, b) => a.f.compareTo(b.f));
    final allNodes = <String, Node>{};

    Node getNode(Position p) => allNodes.putIfAbsent('${p.x},${p.y}', () => Node(p));

    final startNode = getNode(start)..g = 0..h = _manhattan(start, target);
    openSet.add(startNode);

    final closedSet = <String>{};

    while (openSet.isNotEmpty) {
      final current = openSet.removeFirst();

      if (current.pos == target) {
        return _reconstructPath(current);
      }

      closedSet.add('${current.pos.x},${current.pos.y}');

      for (final neighborPos in _getNeighbors(current.pos)) {
        final key = '${neighborPos.x},${neighborPos.y}';
        if (closedSet.contains(key) || obstacles.contains(neighborPos)) continue;

        final tentativeG = current.g + 1;
        final neighbor = getNode(neighborPos);

        if (tentativeG < neighbor.g) {
          neighbor.parent = current;
          neighbor.g = tentativeG;
          neighbor.h = _manhattan(neighborPos, target);

          if (!openSet.unorderedElements.contains(neighbor)) {
            openSet.add(neighbor);
          }
        }
      }
    }
    return null; // No path found
  }

  double _manhattan(Position a, Position b) =>
      (a.x - b.x).abs().toDouble() + (a.y - b.y).abs().toDouble();

  List<Position> _getNeighbors(Position p) => [
    Position((p.x + 1) % gridWidth, p.y),
    Position((p.x - 1 + gridWidth) % gridWidth, p.y),
    Position(p.x, (p.y + 1) % gridHeight),
    Position(p.x, (p.y - 1 + gridHeight) % gridHeight),
  ];

  List<Position> _reconstructPath(Node endNode) {
    final path = <Position>[];
    Node? curr = endNode;
    while (curr != null) {
      path.insert(0, curr.pos);
      curr = curr.parent;
    }
    return path;
  }
}
```

---

## 4. Flame Master Game Loop (`lib/game/modern_snake_game.dart`)

```dart
import 'package:flame/game.dart';
import 'package:flame/input.dart';
import 'package:flutter/material.dart';

class ModernSnakeGame extends FlameGame with PanDetector, KeyboardEvents {
  late SnakePlayer player;
  late FoodComponent food;
  late GridBackground grid;

  double stepInterval = 0.12; // Base speed: 120ms per step
  double timer = 0;

  @override
  Future<void> onLoad() async {
    grid = GridBackground();
    player = SnakePlayer();
    food = FoodComponent();

    addAll([grid, player, food]);
  }

  @override
  void update(double dt) {
    super.update(dt);
    timer += dt;
    if (timer >= stepInterval) {
      timer = 0;
      player.step();
      _checkCollisions();
    }
  }

  void _checkCollisions() {
    if (player.head == food.position) {
      player.grow();
      food.respawn(avoidPositions: player.body);
      // Trigger haptics & sound synthesis
    }
  }

  @override
  void onPanUpdate(DragUpdateInfo info) {
    final delta = info.delta.global;
    if (delta.x.abs() > delta.y.abs()) {
      if (delta.x > 0) player.setDirection(Direction.right);
      else player.setDirection(Direction.left);
    } else {
      if (delta.y > 0) player.setDirection(Direction.down);
      else player.setDirection(Direction.up);
    }
  }
}
```

---

## 5. Migration Effort & Assessment

- **Timeline**: 3–4 weeks for complete Dart rewrite, audio tuning, and UI fidelity match.
- **Hardware Requirement**: Building locally requires Flutter SDK + Android SDK (~10GB disk space, 4GB+ build RAM).
- **Recommendation**: Launch with **Capacitor 6** first to capture Google Play Store traffic and test player demand, then execute the Flutter rewrite if cross-platform desktop/iOS native binary releases are planned.
