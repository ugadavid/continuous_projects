# Proto RPG Bar — Interfaces

Les interfaces définissent les **contrats entre les modules**.

Elles servent à :

* stabiliser l’architecture
* éviter les dérives lors des refactorisations
* garder une vision claire des responsabilités.

---

# PLAYER

## Interface fonctionnelle

### Rôle

Représente le joueur dans le monde.

### Responsabilités

* se déplacer
* stocker son orientation
* fournir sa position aux autres systèmes

### Ne doit pas faire

* gérer la caméra
* détecter les interactions
* gérer la progression du jeu

---

## Interface technique

Propriétés minimales

```
x
y
w
h
speed
dir
```

Méthodes attendues

```
update(dt, input)
getRect()
draw(ctx, camera)
```

Garanties

* `dir` ∈ {up, down, left, right}
* `getRect()` retourne toujours un rectangle monde.

---

# CAMERA

## Interface fonctionnelle

### Rôle

Afficher une portion du monde centrée sur le joueur.

### Responsabilités

* suivre le joueur
* appliquer la dead zone
* lisser les mouvements

### Ne doit pas faire

* déplacer le joueur
* gérer les collisions
* gérer les interactions

---

## Interface technique

Propriétés

```
x
y
targetX
targetY
w
h
smooth
deadZone
```

Méthodes

```
update(player)
worldToScreen(x, y)
```

---

# WORLD OBJECT

## Interface fonctionnelle

### Rôle

Représenter un objet interactif dans le monde.

### Responsabilités

* posséder une zone de collision
* posséder une zone d’interaction
* déclencher une action

---

## Interface technique

Propriétés

```
id
label
collision
interaction
state
active
```

Méthodes

```
onInteract()
draw(ctx, camera)
```

---

# INTERACTION SYSTEM

## Interface fonctionnelle

### Rôle

Détecter les objets activables par le joueur.

### Responsabilités

* détecter les intersections avec les zones d’interaction
* déterminer l’objet actif
* déclencher les interactions

---

## Interface technique

Entrées

```
player
objects
```

Méthodes

```
update(player, objects)
getActiveObject()
tryInteract()
```

---

# RENDERER

## Interface fonctionnelle

### Rôle

Dessiner le monde et les entités.

### Responsabilités

* dessiner le fond
* dessiner les objets
* dessiner le joueur
* dessiner le HUD

---

## Interface technique

Méthodes

```
drawWorld()
drawObjects()
drawPlayer()
drawHUD()
render()
```

---

# Règle fondamentale

Un module **ne doit jamais assumer la responsabilité d’un autre module**.

Si un module commence à gérer plusieurs responsabilités, il doit être **refactorisé en système séparé**.
