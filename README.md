# Grounded Finitist Connexive Logic Engine

This project is an interactive, browser-based logic engine designed to explore the behaviour of a specific non-classical, first-order logic. It is built entirely in TypeScript and runs in the user's browser, providing a terminal-like interface for experimentation.

The logic implemented here deliberately departs from classical logic in several key areas, creating a system that is finitist in nature, assumes a closed world for reasoning, and employs a highly restrictive form of implication that values relevance and coherence.

## What's in a Name?

The name of the engine reflects its three core philosophical foundations:

  * **Grounded**: The logic is "grounded" in a set of discrete, atomic facts that are explicitly defined by the user via the `fact` command. Reasoning proceeds from this known ground truth. This is strongly supported by the **Closed-World Assumption**, where any proposition not explicitly known to be true is assumed to be false, leaving no room for unknown truth values.

  * **Finitist**: The universe of discourse is always a finite, countable set of objects. All quantification (`forall`) operates only over this known set. A direct consequence of this finitist approach is the rejection of the classical principle of "vacuous truth," where universal statements over an empty domain are considered true.

  * **Connexive**: The logic adheres to the principles of connexive logic, which demands a stronger and more coherent connection between the antecedent (premise) and consequent (conclusion) of an implication. The `RELEVANTLY_IMPLIES` operator enforces this by validating key connexive theses, such as **Aristotle's Thesis** (`¬(¬P → P)`) and **Boethius's Thesis** (`(P → Q) → ¬(P → ¬Q)`), ensuring that implications are not just classically valid but also internally consistent.

## Core Principles

The engine's behaviour is guided by three fundamental non-classical principles:

1.  **Grounded Finitism**: All quantification (`forall`) operates exclusively over a known, finite domain of objects. This system rejects the classical notion of "vacuous truth," where universal statements over an empty set are considered true. A universal claim can only be assessed if a domain of objects actually exists.

2.  **Closed-World Assumption (CWA)**: Any proposition not explicitly defined as `TRUE` is assumed to be `FALSE`. This is a pragmatic principle borrowed from database theory and artificial intelligence, which contrasts with classical logic where such a proposition would have an 'unknown' or 'undetermined' truth value.

3.  **Relevant Connexive Implication**: The engine's conditional operator, `RELEVANTLY_IMPLIES`, is significantly stricter than classical material implication. For an implication to hold, it must not only be classically true but also satisfy principles of relevance (the conclusion cannot introduce new topics) and connexive coherence (a proposition cannot be implied by its negation).

## Usage

The engine is used via the in-browser terminal. Commands are typed at the `logic>` prompt. The state of the universe (its objects and their facts) is held in memory for the duration of the browser session. **Reloading the page will reset the universe to an empty state.**

### Command Reference

| Command | Description |
|---|---|
| `help` | Displays the help message and command list. |
| `state` | Shows all objects currently in the domain and their defined facts. |
| `clear` | Clears the terminal screen. |
| `exit` | Closes the session. |
| `domain add ObjectName` | Adds a new object to the universe. Object names are single words. |
| `fact ObjectName predicateName` | Defines a simple atomic proposition as `TRUE` for a given object. |
| `query ObjectName Expression?` | Evaluates a complex expression in the context of a single object. |
| `check forall Expression?` | Evaluates if an expression is `TRUE` for every object in the current universe. |

### Expression Syntax

  * **Predicates**: Must be single words, without spaces (e.g., `isMortal`, `is_human`).
  * **Operators**: `NOT`, `AND`, `OR`, `RELEVANTLY_IMPLIES`.
  * **Precedence**: `NOT` \> `AND` \> `OR` \> `RELEVANTLY_IMPLIES`.
  * **Grouping**: Use parentheses `()` to group sub-expressions.

## Key Departures from Classical Logic

The following examples demonstrate the practical differences between this engine and a classical system.

### The Empty Domain & Quantifier Duality

In classical logic, quantifiers exhibit a duality defined by negation. For instance, "for all x, P is true" is equivalent to "it is not the case that there exists an x for which P is false."

  - Classical Duality: $\\forall x P(x) \\Leftrightarrow \\neg \\exists x \\neg P(x)$

This equivalence relies on the principle of *vacuous truth*. This engine rejects that principle, causing the duality to break down.

**Demonstration:**
Start with a fresh, empty domain.

1.  **Analyse the universal statement:**

    ```bash
    logic> check forall isMortal?
    ```

    **Output:**

    ```
    Final Result: FALSE
    [Heuristic: Rejection of Vacuous Truth]
    The result is FALSE because the domain of objects is empty...
    ```

    Classically, this would be `TRUE`. In this finitist system, it is `FALSE`.

2.  **Analyse the other side of the classical equivalence:**
    We can simulate $\\neg \\exists x \\neg P(x)$ by evaluating its other classical equivalent, $\\neg (\\forall x \\neg P(x))$.

    ```bash
    logic> check forall NOT isMortal?
    ```

    This also returns `FALSE` because the domain is empty. Therefore, negating this result gives `TRUE`.

**Conclusion:**
The engine evaluates $\\forall x P(x)$ as **`FALSE`** but evaluates $\\neg \\exists x \\neg P(x)$ as **`TRUE`**. Since `FALSE ≠ TRUE`, the classical quantifier duality does not hold.

### The Nature of Implication (`RELEVANTLY_IMPLIES`)

Classical material implication (`→`) is defined simply as $\\neg P \\lor Q$. This leads to counter-intuitive results known as the "paradoxes of material implication," such as a false statement implying any other statement. This engine's implication is much stricter.

#### 1\. Test of Relevance

An implication is only valid if its antecedent and consequent are semantically related. This is enforced by requiring that all atomic predicates in the consequent must also be present in the antecedent.

**Demonstration:**
Classically, `P → (Q → P)` is a tautology. It is always true.

```bash
logic> domain add sun
Object 'sun' added to the domain.
logic> fact sun isHot
Fact defined: sun -> 'isHot' is true.
logic> query sun isHot RELEVANTLY_IMPLIES (isYellow RELEVANTLY_IMPLIES isHot)?

==================== QUERY RESULT ====================
Expression: ("isHot" RELEVANTLY_IMPLIES ("isYellow" RELEVANTLY_IMPLIES "isHot"))
For Object: sun
Final Result: NON-CLASSICALLY FALSE (classically, the result would be TRUE)
-------------------- Derivation --------------------
Classical: true, Relevant: true, Aristotle Coherent: true, Boethius Coherent: true -> Final: false
[Heuristic: Relevance Logic]
Implication failed. The consequent cannot introduce new topics (predicates) that were not present in the antecedent.
====================================================
```

**Analysis:**
The query fails because the inner implication `isYellow RELEVANTLY_IMPLIES isHot` is `FALSE`. The antecedent `isYellow` is not relevant to the consequent `isHot` as they do not share predicates.

#### 2\. Test of Connexive Coherence (Aristotle's Thesis)

Connexive logics enforce that a proposition cannot be implied by its own negation.

**Demonstration:**
Classically, `¬P → P` is equivalent to `P`. If `P` is true, the entire statement is true. This engine considers this structure incoherent.

```bash
logic> domain add cat
Object 'cat' added to the domain.
logic> fact cat isCat
Fact defined: cat -> 'isCat' is true.
logic> query cat (NOT isCat) RELEVANTLY_IMPLIES isCat?

==================== QUERY RESULT ====================
Expression: ((NOT "isCat") RELEVANTLY_IMPLIES "isCat")
For Object: cat
Final Result: NON-CLASSICALLY FALSE (classically, the result would be TRUE)
-------------------- Derivation --------------------
Classical: true, Relevant: true, Aristotle Coherent: false, Boethius Coherent: false -> Final: false
[Heuristic: Connexive Logic (Aristotle's Thesis)]
Implication failed. A proposition cannot be implied by its own negation (form: NOT P -> P).
====================================================
```

**Analysis:**
The query is `FALSE`, explicitly because it violates the `Aristotle Coherent: false` check, even though it is true under classical material implication.

### Closed-World Assumption (CWA)

Unlike classical logic, which would treat unstated facts as having an unknown truth value, this engine assumes any fact not explicitly stated to be `TRUE` is `FALSE`.

**Demonstration:**

```bash
logic> domain add rock
Object 'rock' added to the domain.
logic> query rock isAlive?

==================== QUERY RESULT ====================
Expression: "isAlive"
For Object: rock
Final Result: FALSE
-------------------- Derivation --------------------
Fact 'isAlive' is FALSE for object 'rock'
[Heuristic: Closed-World Assumption]
The fact was not explicitly set to TRUE, so it is assumed to be FALSE. Classical logic might consider its truth value 'unknown'.
====================================================
```

## Building the Project

The project is written in TypeScript and bundled for the browser using `esbuild`.

**Prerequisites:**

  * Node.js and npm

**Commands:**

```bash
# Install dependencies
npm install

# Build the project (compiles TypeScript into deploy/bundle.js)
npm run build
```
