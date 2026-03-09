# Proto RPG Bar — Project Context

## Vision

Prototype d’un mini moteur 2D en JavaScript pour un environnement narratif interactif (bar RPG).
Le joueur se déplace dans un espace, interagit avec des objets, déclenche des dialogues ou des missions.

## Objectifs

* Tester un moteur simple basé sur Canvas
* Séparer clairement les responsabilités (player, camera, interaction, rendering)
* Créer une architecture extensible pour de futurs projets narratifs ou pédagogiques

## Principes d’architecture

1. **Un système = une responsabilité**
2. **Ne pas mélanger logique moteur et logique narrative**
3. **Les interactions passent toujours par un système dédié**
4. **Les objets du monde sont décrits par des données + comportements**

## Modules principaux (actuels ou prévus)

### Player

Responsable du mouvement et de l’orientation.

### Camera

Suit le joueur avec une dead zone et un mouvement lissé.

### World Objects

Objets interactifs du décor avec :

* zone de collision
* zone d’interaction
* état (locked / available / done)

### Interaction System

Détecte si le joueur peut interagir avec un objet.

### Rendering

Dessine le monde, les objets et le HUD.

## Conventions de nommage

player
camera
objects
interactionZone
collisionBox

Important :
➡️ éviter de renommer ces éléments sans discussion.

## Règles de refactorisation

* modifier **un module à la fois**
* préserver les interfaces existantes
* documenter toute modification importante dans `SESSION_LOG.md`

## Vision long terme

Transformer le prototype en un petit moteur narratif réutilisable.
