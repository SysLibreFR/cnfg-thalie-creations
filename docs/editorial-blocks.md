# Blocs éditoriaux — Thalie Créations

Ce document décrit les blocs éditoriaux que le frontend consomme via `GET /api/v1/artisans/{slug}/editorial-blocks/`.

Chaque bloc est identifié par son `slug`. Le frontend récupère la valeur `data` du bloc et l'utilise pour alimenter la section correspondante. Si un bloc est absent ou inactif, la section correspondante n'est pas affichée.

---

## Résumé des blocs

| Slug | Page(s) | Section |
|------|---------|---------|
| `hero` | Accueil | Bannière principale |
| `bandeau` | Accueil (global) | Bandeau défilant |
| `featured_products` | Accueil | En-tête section produits vedettes |
| `values` | Accueil, À propos | Section valeurs |
| `testimonials` | Accueil | En-tête section témoignages |
| `newsletter` | Accueil, Blog, Article | Section newsletter |
| `about_hero` | À propos | Bannière de la page |
| `timeline` | À propos | Frise chronologique |
| `atelier` | À propos | Section atelier |
| `stats` | À propos | Statistiques clés |
| `boutique_hero` | Boutique | En-tête de la page boutique |
| `blog_hero` | Blog | Bannière de la page blog |
| `about_cta` | À propos | Bloc d'appel à l'action en bas de page |

---

## Détail des blocs

### `hero`
Section principale de la page d'accueil.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Artisane créatrice"` |
| `title` | string | `"Bienvenue dans mon univers textile"` |
| `subtitle` | string | `"Des créations crochet uniques, faites avec amour"` |
| `caption` | string | `"Livraison soignée · Pièces uniques · Fait main en France"` |

---

### `bandeau`
Textes défilants dans le bandeau en haut de page (présent sur toutes les pages).

| Champ | Type | Exemple |
|-------|------|---------|
| `items` | string[] | `["✦ Fait main avec amour", "✦ Livraison soignée", "✦ Pièces uniques"]` |

Si le bloc est absent, le frontend affiche des éléments par défaut.

---

### `featured_products`
En-tête de la section "Produits vedettes" sur la page d'accueil.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Sélection du moment"` |
| `title` | string | `"Nos créations phares"` |

---

### `values`
Section des valeurs artisanales. Utilisée sur la page d'accueil et la page À propos.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Ce qui nous anime"` |
| `title` | string | `"Nos valeurs"` |
| `items` | ValueItem[] | voir ci-dessous |

**Structure `ValueItem`** :

| Champ | Type | Exemple |
|-------|------|---------|
| `icon` | string (emoji ou unicode) | `"🧶"` |
| `title` | string | `"Savoir-faire"` |
| `text` | string | `"Chaque pièce est réalisée à la main avec des matières sélectionnées."` |

---

### `testimonials`
En-tête de la section témoignages sur la page d'accueil. Les témoignages eux-mêmes viennent de l'API `/testimonials/`.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Ils nous font confiance"` |
| `title` | string | `"Ce que disent nos clientes"` |

---

### `newsletter`
Section d'inscription à la newsletter. Utilisée sur la page d'accueil, les pages blog et les articles.

| Champ | Type | Exemple |
|-------|------|---------|
| `title` | string | `"Rejoignez la communauté"` |
| `subtitle` | string | `"Recevez les nouveautés, les offres exclusives et les coulisses de l'atelier."` |

---

### `about_hero`
Bannière en haut de la page À propos.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Mon histoire"` |
| `subtitle` | string | `"Artisane depuis plus de 10 ans, je crée des pièces uniques au crochet dans mon atelier niçois."` |

Le titre principal de la bannière est le nom de l'artisane, fourni par le profil artisan (`artisan.name`).

---

### `timeline`
Frise chronologique de la page À propos.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Mon parcours"` |
| `title` | string | `"Les grandes étapes"` |
| `items` | TimelineItem[] | voir ci-dessous |

**Structure `TimelineItem`** :

| Champ | Type | Exemple |
|-------|------|---------|
| `year` | string | `"2013"` |
| `title` | string | `"Les premiers points"` |
| `text` | string | `"J'ai appris le crochet avec ma grand-mère et je n'ai plus jamais arrêté."` |

---

### `atelier`
Section de présentation de l'atelier sur la page À propos. **Si ce bloc est absent, la section n'est pas affichée.**

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Mon espace de création"` |
| `title` | string | `"L'atelier"` |
| `text1` | string | `"Un espace lumineux où chaque pièce prend vie, point après point."` |
| `text2` | string | `"Je travaille en petites séries pour garantir la qualité et l'exclusivité de chaque création."` |
| `tags` | string[] | `["Laines naturelles", "Coloris exclusifs", "Zéro déchet"]` |
| `cells` | AtelierCell[] | voir ci-dessous |

**Structure `AtelierCell`** (icônes décoratifs de la grille) :

| Champ | Type | Exemple |
|-------|------|---------|
| `icon` | string (emoji) | `"🧶"` |

Le frontend affiche les 4 premières cellules dans une grille 2×2.

---

### `stats`
Chiffres clés sur la page À propos. **Si `items` est vide, la section n'est pas affichée.**

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"En quelques chiffres"` |
| `title` | string | `"Thalie en chiffres"` |
| `items` | StatItem[] | voir ci-dessous |

**Structure `StatItem`** :

| Champ | Type | Exemple |
|-------|------|---------|
| `number` | string | `"500+"` |
| `label` | string | `"créations réalisées"` |

---

### `about_cta`
Bloc d'appel à l'action affiché en bas de la page À propos, avant la newsletter.

| Champ | Type | Exemple |
|-------|------|---------|
| `title` | string | `"Envie d'une création unique ?"` |
| `text` | string | `"Chaque commande est une belle aventure. Je serais ravie de créer quelque chose rien que pour vous."` |

Si le bloc est absent ou si un champ est manquant, le frontend utilise les valeurs par défaut ci-dessus.

---

### `boutique_hero`
En-tête de la page boutique. Si absent, le frontend replie sur le nom et la description du profil artisan.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Collections"` |
| `title` | string | `"La boutique"` |
| `subtitle` | string | `"Toutes mes créations, disponibles à la commande."` |

---

### `blog_hero`
Bannière de la page listing du blog.

| Champ | Type | Exemple |
|-------|------|---------|
| `eyebrow` | string | `"Inspirations & tutoriels"` |
| `title` | string | `"Le carnet de Thalie"` |
| `subtitle` | string | `"Découvrez les coulisses de l'atelier, des conseils crochet et mes sources d'inspiration."` |

---

## Notes d'implémentation

- **Tous les champs sont optionnels** : si un champ est absent du `data`, le frontend affiche soit une valeur par défaut soit rien.
- **`is_active: false`** : un bloc inactif est traité comme absent — `hasBlock()` retourne `false` et la section n'est pas rendue.
- **`sort_order`** : non utilisé directement par le frontend pour le rendu des sections (l'ordre est fixé dans le code), mais utile pour l'administration.
- **Création des blocs** : créer les blocs avec exactement les slugs listés ci-dessus ; une faute de frappe dans le slug empêche le frontend de retrouver le bloc.
