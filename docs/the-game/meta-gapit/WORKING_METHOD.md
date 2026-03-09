# Proto RPG Bar — Working Method

## Objectif de ce document

Ce document définit la méthode de travail entre David et GPT pour le projet Proto RPG Bar.

Il sert à :
- préserver la continuité entre les séances
- éviter les refactorisations imprécises
- stabiliser les noms, responsabilités et décisions
- permettre une reprise rapide du projet après interruption

---

## Principe général

Nous ne travaillons pas seulement sur le code.
Nous travaillons aussi sur la manière de travailler ensemble.

Le projet doit rester :
- compréhensible
- stable
- modulaire
- agréable à reprendre

Les interfaces priment sur l’implémentation.

---

## Règles de collaboration

### 1. Un objectif par séance
Chaque séance doit avoir un objectif principal clair.

Exemples :
- refactoriser Camera
- stabiliser InteractionSystem
- définir les interfaces de WorldObject

### 2. Un périmètre limité
On évite de modifier plusieurs sous-systèmes à la fois sans nécessité.

### 3. Pas de renommage implicite
Les noms existants ne doivent pas être changés sans décision explicite.

### 4. Respect des contrats
Les contrats définis dans `INTERFACES.md` priment sur les intuitions de refactorisation.

### 5. Une responsabilité par module
Si un module devient trop large, il doit être découpé.

---

## Rituel de début de séance

Au début d’une séance, rappeler :

- le projet concerné
- l’objectif de la séance
- les fichiers concernés
- les contraintes importantes
- l’état actuel si nécessaire

Format conseillé :

Projet : Proto RPG Bar  
Objectif : [objectif du soir]  
Fichiers : [liste]  
Contraintes : [contraintes]  
Question principale : [problème à résoudre]

---

## Rituel de fin de séance

À la fin d’une séance :

1. noter ce qui a été fait dans `SESSION_LOG.md`
2. noter les décisions structurelles dans `PROJECT_CONTEXT.md` ou `ARCHITECTURE.md`
3. noter les changements de contrat dans `INTERFACES.md`
4. identifier la prochaine étape

---

## Répartition des fichiers de référence

### `PROJECT_CONTEXT.md`
Vision globale, conventions, règles stables du projet

### `ARCHITECTURE.md`
Organisation structurelle du moteur et séparation des couches

### `INTERFACES.md`
Contrats fonctionnels et techniques des modules

### `SESSION_LOG.md`
Mémoire chronologique des séances

### `WORKING_METHOD.md`
Méthode de collaboration David ↔ GPT

---

## Règles anti-dérive

Pour éviter les réponses approximatives ou incohérentes :

- toujours s’appuyer sur les fichiers de référence
- ne pas inventer une architecture non validée
- ne pas supposer des dépendances absentes
- signaler les informations manquantes au lieu de deviner
- travailler à partir du code fourni et des contrats documentés

---

## Priorité des sources

Quand une ambiguïté apparaît, l’ordre de priorité est :

1. le code actuel validé
2. `INTERFACES.md`
3. `ARCHITECTURE.md`
4. `PROJECT_CONTEXT.md`
5. `SESSION_LOG.md`

---

## Philosophie du projet

Le but n’est pas seulement de produire un prototype fonctionnel.
Le but est aussi de construire un petit moteur clair, élégant, extensible, et agréable à faire évoluer ensemble.
