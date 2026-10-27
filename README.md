# Task 4: Game Feel, Accessibility, and Playtest
Builds on Task 3. **Objective:** use player evidence to improve usability and feel.

| Deliverable | File |
|---|---|
| Revised playable build | `index.html` + scripts in this folder |
| Playtest notes + before/after evidence | [PLAYTEST.md](PLAYTEST.md) (fill in with your 3+ testers) |

**Added over Task 3**
- Feedback without hiding gameplay: glowing animated beam, mirror rotation tween, particle burst when a target lights, screen shake on loss, synthesized sounds (Web Audio, no files).
- Controls: **Mute** and **Reduced motion** toggles (saved; default follows the OS `prefers-reduced-motion`).
- Keyboard play: arrows/WASD move an on-board cursor, `Space`/`Enter` flips, plus visible focus rings on every control.
- Screen-reader text: cursor cell description and move updates via a polite live region.
- Not colour-only: rings, crystals, mirrors and splitters differ by shape.

**Your part:** run the playtest (same 5 questions, 3+ people), record issues, make fixes, paste before/after screenshots in PLAYTEST.md.
