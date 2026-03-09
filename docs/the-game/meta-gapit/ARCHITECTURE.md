# Proto RPG Bar — Architecture

## Vision générale

Le projet repose sur un **mini moteur 2D orienté interaction**.

Le moteur gère :

* le monde
* le joueur
* la caméra
* les objets interactifs
* la détection d’interaction
* le rendu

Le gameplay (progression, narration, missions) doit rester **séparé de la logique moteur**.

---

# Architecture logique

Le moteur peut être conceptualisé en **trois couches**.

```
INPUT
  ↓
SYSTEMS
  ↓
ENTITIES
  ↓
RENDERING
```

---

# Entités (Entities)

Les entités représentent les objets du monde.

Principales entités :

* Player
* WorldObject

Ces entités contiennent :

* leur position
* leurs dimensions
* leur état

Elles **ne contiennent pas la logique globale du moteur**.

---

# Systèmes (Systems)

Les systèmes appliquent de la logique sur les entités.

Principaux systèmes :

### Movement System

Gère les déplacements du joueur.

### Collision System

Empêche les intersections avec les objets solides.

### Interaction System

Détecte les objets interactifs proches du joueur.

### Progression System

Gère l’avancement dans les étapes du scénario.

---

# Caméra

La caméra suit le joueur avec :

* une **dead zone**
* un **lissage du mouvement**
* une contrainte dans les limites du monde.

La caméra transforme :

```
world coordinates → screen coordinates
```

---

# Rendering

Le rendu dessine :

1. le fond du monde
2. les objets
3. le joueur
4. les halos d’interaction
5. le HUD

Le rendu **ne doit jamais modifier la logique du jeu**.

---

# Boucle principale

La boucle principale suit ce flux :

```
Input
 ↓
Movement
 ↓
Collision
 ↓
Camera
 ↓
Interaction
 ↓
Rendering
```

Cette boucle est exécutée à chaque frame.

---

# Séparation des responsabilités

Chaque module doit avoir **une seule responsabilité**.

Exemples :

| Module            | Responsabilité                      |
| ----------------- | ----------------------------------- |
| Player            | stocker la position et la direction |
| Camera            | gérer la vue                        |
| InteractionSystem | détecter les objets actifs          |
| Renderer          | dessiner le monde                   |

---

# Objectif long terme

Faire évoluer ce prototype vers un **moteur narratif interactif** pouvant gérer :

* dialogues
* missions
* zones
* personnages
* scènes.

Le moteur doit rester :

* simple
* modulaire
* extensible.
