# 🕰️ useGameClock — A Drift-Resistant React Timer Hook Powered by Web Workers

In most browsers, JavaScript timers (`setTimeout`, `setInterval`) degrade in accuracy when a tab is inactive or throttled. This causes issues in time-sensitive applications like games, countdowns, or live sports timers — where **drift** can’t be tolerated.

**`useGameClock`** is a custom React hook that avoids this problem by offloading timing responsibilities to a **Web Worker**. The worker ensures consistent tick intervals, even when the main thread is inactive or the tab is backgrounded.

It also incorporates **drift compensation**, adjusting for any discrepancy between expected and actual tick times to maintain accurate, smooth countdown behavior over long periods.

## ✅ Features

- ⚙️ Accurate timing even when the tab is inactive
- ⏱️ Drift-adjusted countdown for long-running timers
- 🧵 Web Worker–based isolation for reliable timing off the main thread
- ⚛️ Designed for React with a simple hook-based API
