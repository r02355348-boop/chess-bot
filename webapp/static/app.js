// Main Telegram Mini App for Chess
const tg = window.Telegram.WebApp;

const PIECES_SVG = {
    "bB": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDM2YzMuMzktLjk3IDkuMTEtMiAxMy41LTJzMTAuMTEgMS4wMyAxMy41IDJjMCAwIDEtMiAxLTNzLTEtMS0xLTEtMS40Mi0xLTIuNS0xLjVjLTEuMDgtLjUtMS41LTEtMS41LTEtMS4wMS0xLjM3IDItMy4zNSAyLTUuNSAwLTMuNTktMi40Ni02LjUtNS41LTYuNVMxOSAyMy40MSAxOSAyN2MwIDIuMTUuOTkgNC4xMyAyIDUuNSAwIDAtLjQyLjUtMS41IDFzLTIuNSAxLjUtMi41IDEuNWMwIDAtMSAwLTEgMXMxIDMgMSAzeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAwIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPjwvc3ZnPg==",
    "bK": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNMjIuNSAxMS42M1Y2TTIwIDhoNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMi41IDI1czQuNS03LjUgNC41LTExYzAtMi40OC0yLjAxLTQuNS00LjUtNC41cy00LjUgMi4wMi00LjUgNC41YzAgMy41IDQuNSAxMSA0LjUgMTF6IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTEuNSAzN2M1LjUgMy41IDE1LjUgMy41IDIxIDB2LTdzOS00LjUgNi0xMC41Yy00LTEtMS0xLjUtNi0yVjEzczEuNS0zLjUtMy0zLjVjLTMgMC0zIDIuNS0zIDIuNXMtMS41LTQuNS01LTQuNS01IDQuNS01IDQuNSAwLTIuNS0zLTIuNWMtNC41IDAtMyAzLjUtMyAzLjV2NC41Yy01IC41LTIgMS02IDItMyA2IDYgMTAuNSA2IDEwLjV2N3oiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMS41IDMwYzUuNS0zIDE1LjUtMyAyMSAwbS0yMSAzLjVjNS41LTMgMTUuNS0zIDIxIDBtLTIxIDMuNWM1LjUtMyAxNS41LTMgMjEgMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPjwvc3ZnPg==",
    "bN": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNMjIgMTBjMTAuNSAxIDE2LjUgOCAxNiAyOUgxNWMwLTkgMTAtNi41IDgtMjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNCAxOGMuMzggMi40My00LjY1IDEuNzUtNSAzIDUtMSA1IDMgNSAzcy0xMC0xLjUtMTAgMTBjMCAxLjUgMSAyLjUgMiAyLjUgNSAwIDggMSAxMiAyaDVjMy41IDAgMy0xMCAzLTEwczEtMS0xLTJjLTEtMS0xLTEtMS0xcy0zLTItNS0yLTEuNS0xLTEuNS0xLTEuNS0xLTIuNS0yLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik05LjUgMjUuNUEuNS41IDAgMSAxIDkgMjUuNS41LjUgMCAxIDEgOS41IDI1LjV6TTE1IDE1LjVBLjUuNSAwIDEgMSAxNC41IDE1LjUuNS41IDAgMSAxIDE1IDE1LjV6IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTI4IDIzYy0xIDAtMS41IDEtMS41IDEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L3N2Zz4=",
    "bP": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyA5LjExLTIgMTMuNS0yczEwLjExIDEuMDMgMTMuNSAyYzAgMCAxLTIgMS0zcy0xLTEtMS0xLTEuNDItMS0yLjUtMS41Yy0xLjA4LS41LTEuNS0xLTEuNS0xIDEuMDEtMS4zNyAyLTMuMzUgMi01LjUgMC0zLjU5LTIuNDYtNi41LTUuNS02LjVTMTkgMjMuNDEgMTkgMjdjMCAyLjE1Ljk5IDQuMTMgMiA1LjUgMCAwLS40Mi41LTEuNSAxcy0yLjUgMS41LTIuNSAxLjVjMCAwLTEgMC0xIDFzMSAzIDEgM3oiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAwIDEgNSAweiIvPjwvZz48L3N2Zz4=",
    "bQ": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNOSAyNmM4LjUtMS41IDIxLTEuNSAyNyAwbDItMTItNyAxMVYxMWwtNS41IDEzLjUtMy0xNS0zIDE1LTUuNS0xMy41VjI1TDcgMTRsMiAxMnoiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik05IDI2YzAgMiAxLjUgMiAyLjUgNCAxIDEuNSAxIDEgLjUgMy41LTEuNSAxLTEuNSAyLjUtMS41IDIuNS0xLjUgMS41LjUgMi41LjUgMi41IDYuNSAxIDE2LjUgMSAyMyAwIDAgMCAyLTEgLjUtMi41IDAgMCAwLTEuNS0xLjUtMi41LS41LTIuNS0uNS0yIDEtMy41IDEtMiAyLjUtMiAyLjUtNC04LjUtMS41LTE4LjUtMS41LTI3IDB6IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTEuNSAzMGMzLjUtMSAxOC41LTEgMjIgME0xMiAzMy41YzYtMSAxNS0xIDIxIDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvZz48L3N2Zz4=",
    "bR": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNOSAzOWgyN3YtM0g5djN6TTEyIDM2di00aDIxdjRIMTJ6TTExIDE0VjloNHYyaDVWOWg1djJoNVY5aDR2NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTM0IDE0bC0zIDNIMTRsLTMtMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTMxIDE3djEyLjVIMTRWMTciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zMSAyOS41bDEuNSAyLjVoLTIwbDEuNS0yLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMSAxNGgyMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPjwvc3ZnPg==",
    "wB": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48ZyBmaWxsPSIjZmZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDM2YzMuMzktLjk3IDkuMTEtMiAxMy41LTJzMTAuMTEgMS4wMyAxMy41IDJjMCAwIDEtMiAxLTNzLTEtMS0xLTEtMS40Mi0xLTIuNS0xLjVjLTEuMDgtLjUtMS41LTEtMS41LTEgMS4wMS0xLjM3IDItMy4zNSAyLTUuNSAwLTMuNTktMi40Ni02LjUtNS41LTYuNVMxOSAyMy40MSAxOSAyN2MwIDIuMTUuOTkgNC4xMyAyIDUuNSAwIDAtLjQyLjUtMS41IDFzLTIuNSAxLjUtMi41IDEuNWMwIDAtMSAwLTEgMXMxIDMgMSAzeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAwIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPjwvc3ZnPg==",
    "wK": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNMjIuNSAxMS42M1Y2TTIwIDhoNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMi41IDI1czQuNS03LjUgNC41LTExYzAtMi40OC0yLjAxLTQuNS00LjUtNC41cy00LjUgMi4wMi00LjUgNC41YzAgMy41IDQuNSAxMSA0LjUgMTF6IiBmaWxsPSIjZmZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTEuNSAzN2M1LjUgMy41IDE1LjUgMy41IDIxIDB2LTdzOS00LjUgNi0xMC41Yy00LTEtMS0xLjUtNi0yVjEzczEuNS0zLjUtMy0zLjVjLTMgMC0zIDIuNS0zIDIuNXMtMS41LTQuNS01LTQuNS01IDQuNS01IDQuNSAwLTIuNS0zLTIuNWMtNC41IDAtMyAzLjUtMyAzLjV2NC41Yy01IC41LTIgMS02IDItMyA2IDYgMTAuNSA2IDEwLjV2N3oiIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMS41IDMwYzUuNS0zIDE1LjUtMyAyMSAwbS0yMSAzLjVjNS41LTMgMTUuNS0zIDIxIDBtLTIxIDMuNWM1LjUtMyAxNS41LTMgMjEgMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPjwvc3ZnPg==",
    "wN": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNMjIgMTBjMTAuNSAxIDE2LjUgOCAxNiAyOUgxNWMwLTkgMTAtNi41IDgtMjEiIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNCAxOGMuMzggMi40My00LjY1IDEuNzUtNSAzIDUtMSA1IDMgNSAzcy0xMC0xLjUtMTAgMTBjMCAxLjUgMSAyLjUgMiAyLjUgNSAwIDggMSAxMiAyaDVjMy41IDAgMy0xMCAzLTEwczEtMS0xLTJjLTEtMS0xLTEtMS0xcy0zLTItNS0yLTEuNS0xLTEuNS0xLTEuNS0xLTIuNS0yLjUiIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik05LjUgMjUuNUEuNS41IDAgMSAxIDkgMjUuNS41LjUgMCAxIDEgOS41IDI1LjV6TTE1IDE1LjVBLjUuNSAwIDEgMSAxNC41IDE1LjUuNS41IDAgMSAxIDE1IDE1LjV6IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTI4IDIzYy0xIDAtMS41IDEtMS41IDEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L3N2Zz4=",
    "wP": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyA5LjExLTIgMTMuNS0yczEwLjExIDEuMDMgMTMuNSAyYzAgMCAxLTIgMS0zcy0xLTEtMS0xLTEuNDItMS0yLjUtMS41Yy0xLjA4LS41LTEuNS0xLTEuNS0xIDEuMDEtMS4zNyAyLTMuMzUgMi01LjUgMC0zLjU5LTIuNDYtNi41LTUuNS02LjVTMTkgMjMuNDEgMTkgMjdjMCAyLjE1Ljk5IDQuMTMgMiA1LjUgMCAwLS40Mi41LTEuNSAxcy0yLjUgMS41LTIuNSAxLjVjMCAwLTEgMC0xIDFzMSAzIDEgM3oiIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAwIDEgNSAweiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=",
    "wQ": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNOSAyNmM4LjUtMS41IDIxLTEuNSAyNyAwbDItMTItNyAxMVYxMWwtNS41IDEzLjUtMy0xNS0zIDE1LTUuNS0xMy41VjI1TDcgMTRsMiAxMnoiIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik05IDI2YzAgMiAxLjUgMiAyLjUgNCAxIDEuNSAxIDEgLjUgMy41LTEuNSAxLTEuNSAyLjUtMS41IDIuNS0xLjUgMS41LjUgMi41LjUgMi41IDYuNSAxIDE2LjUgMSAyMyAwIDAgMCAyLTEgLjUtMi41IDAgMCAwLTEuNS0xLjUtMi41LS41LTIuNS0uNS0yIDEtMy41IDEtMiAyLjUtMiAyLjUtNC04LjUtMS41LTE4LjUtMS41LTI3IDB6IiBmaWxsPSIjZmZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTEuNSAzMGMzLjUtMSAxOC41LTEgMjIgME0xMiAzMy41YzYtMSAxNS0xIDIxIDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvZz48L3N2Zz4=",
    "wR": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNOSAzOWgyN3YtM0g5djN6TTEyIDM2di00aDIxdjRIMTJ6TTExIDE0VjloNHYyaDVWOWg1djJoNVY5aDR2NSIgZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTM0IDE0bC0zIDNIMTRsLTMtMyIgZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTMxIDE3djEyLjVIMTRWMTciIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zMSAyOS41bDEuNSAyLjVoLTIwbDEuNS0yLjUiIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMSAxNGgyMyIgZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPjwvc3ZnPg=="
};

class ChessApp {
    constructor() {
        this.socket = null;
        this.game = new Chess();
        this.userId = null;
        this.gameId = null;
        this.playerColor = null;
        this.selectedSquare = null;
        this.validMoves = [];
        this.isMyTurn = false;
        this.timeLeft = { w: 300000, b: 300000 };
        this.timerInterval = null;
        this.lastMove = null;
        
        // Audio Context for procedural sounds
        this.audioCtx = null;
        
        this.init();
    }

    initAudio() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playSound(type) {
        if (!this.audioCtx) this.initAudio();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        switch(type) {
            case 'move':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'capture':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'check':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'game_over':
                [440, 554, 659].forEach((freq, i) => {
                    const o = this.audioCtx.createOscillator();
                    const g = this.audioCtx.createGain();
                    o.type = 'sine';
                    o.connect(g);
                    g.connect(this.audioCtx.destination);
                    o.frequency.setValueAtTime(freq, now + i * 0.1);
                    g.gain.setValueAtTime(0.1, now + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
                    o.start(now + i * 0.1);
                    o.stop(now + i * 0.1 + 0.4);
                });
                break;
        }
    }

    init() {
        tg.ready();
        tg.expand();
        
        // Get user data from Telegram
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            this.userId = tg.initDataUnsafe.user.id;
        }
        
        this.setupEventListeners();
        this.renderBoard();
    }

    connectSocket() {
        const wsUrl = `wss://${window.location.host}/ws`;
        console.log('Connecting to:', wsUrl);
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.socket.send(JSON.stringify({
                event: 'connect',
                userId: this.userId
            }));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            this.handleServerMessage(data);
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            // Auto reconnect
            setTimeout(() => this.connectSocket(), 3000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleServerMessage(data) {
        const event = data.event || data.type;
        
        switch (event) {
            case 'game_found':
                this.gameId = data.gameId;
                this.playerColor = data.color;
                this.startGame(data.fen);
                break;
            case 'opponent_move':
                this.handleOpponentMove(data.move);
                break;
            case 'game_over':
                this.endGame(data.result, data.reason);
                break;
            case 'time_update':
                this.timeLeft = data.times;
                this.updateTimers();
                break;
            case 'error':
                this.showNotification(data.message, 'error');
                break;
        }
    }

    sendMessage(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('btn-find-game').addEventListener('click', () => this.findGame());
        document.getElementById('btn-cancel').addEventListener('click', () => this.cancelMatchmaking());
        document.getElementById('btn-resign').addEventListener('click', () => this.resign());
        document.getElementById('btn-draw').addEventListener('click', () => this.offerDraw());
        document.getElementById('btn-new-game').addEventListener('click', () => this.showMainMenu());
        
        // Board click handler
        document.getElementById('chessboard').addEventListener('click', (e) => this.handleBoardClick(e));
    }

    findGame() {
        document.getElementById('matchmaking-status').classList.remove('hidden');
        document.querySelector('.menu-buttons').classList.add('hidden');

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.connectSocket();
            // Wait for open event
            const checkConnection = setInterval(() => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.sendMessage({ event: 'find_game', userId: this.userId });
                    clearInterval(checkConnection);
                }
            }, 100);
        } else {
            this.sendMessage({ event: 'find_game', userId: this.userId });
        }
    }

    cancelMatchmaking() {
        document.getElementById('matchmaking-status').classList.add('hidden');
        document.querySelector('.menu-buttons').classList.remove('hidden');
        
        this.sendMessage({ event: 'cancel_matchmaking' });
    }

    startGame(fen) {
        this.showScreen('game-screen');
        
        // Reset game
        this.game = new Chess();
        this.selectedSquare = null;
        this.validMoves = [];
        this.isMyTurn = this.playerColor === 'w';
        
        this.renderBoard();
        this.updatePlayerInfo();
        this.startTimer();
    }

    renderBoard() {
        const board = document.getElementById('chessboard');
        const fragment = document.createDocumentFragment();
        
        const isFlipped = this.playerColor === 'b';
        
        for (let row = 0; row < 8; row++) {
            const displayRow = isFlipped ? 7 - row : row;
            const rowEl = document.createElement('div');
            rowEl.className = 'board-row';
            
            for (let col = 0; col < 8; col++) {
                const displayCol = isFlipped ? 7 - col : col;
                const square = document.createElement('div');
                square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = displayRow;
                square.dataset.col = displayCol;
                
                // Highlight last move
                if (this.lastMove) {
                    if ((this.lastMove.from.row === displayRow && this.lastMove.from.col === displayCol) ||
                        (this.lastMove.to.row === displayRow && this.lastMove.to.col === displayCol)) {
                        square.classList.add('last-move');
                    }
                }

                const piece = this.game.board[displayRow][displayCol];
                if (piece) {
                    const pieceEl = document.createElement('img');
                    pieceEl.className = `piece`;
                    const pieceName = (piece === piece.toUpperCase() ? 'w' : 'b') + piece.toUpperCase();
                    pieceEl.src = PIECES_SVG[pieceName];
                    square.appendChild(pieceEl);
                }
                
                // Highlight selected square
                if (this.selectedSquare && 
                    this.selectedSquare.row === displayRow && 
                    this.selectedSquare.col === displayCol) {
                    square.classList.add('selected');
                }
                
                // Highlight valid moves
                const validMove = this.validMoves.find(m => 
                    m.to.row === displayRow && m.to.col === displayCol
                );
                if (validMove) {
                    if (validMove.capture) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
                
                rowEl.appendChild(square);
            }
            fragment.appendChild(rowEl);
        }
        
        board.innerHTML = '';
        board.appendChild(fragment);
    }

    handleBoardClick(e) {
        if (!this.isMyTurn) return;
        
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Check if clicking a valid move target
        const validMove = this.validMoves.find(m => m.to.row === row && m.to.col === col);
        if (validMove) {
            this.makeMove(validMove);
            return;
        }
        
        // Select piece
        const piece = this.game.board[row][col];
        if (piece && this.game.isOwnPiece(piece, this.playerColor)) {
            this.selectedSquare = { row, col };
            this.validMoves = this.game.getMoves(row, col);
            this.renderBoard();
        } else {
            this.selectedSquare = null;
            this.validMoves = [];
            this.renderBoard();
        }
    }

    makeMove(move) {
        // Handle promotion
        if (move.promotion) {
            this.showPromotionModal(move);
            return;
        }
        
        this.executeMove(move);
    }

    showPromotionModal(pendingMove) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Выберите фигуру</h3>
                <div class="promotion-pieces">
                    <div class="promotion-piece" data-piece="q">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'Q' : 'q')}</div>
                    <div class="promotion-piece" data-piece="r">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'R' : 'r')}</div>
                    <div class="promotion-piece" data-piece="b">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'B' : 'b')}</div>
                    <div class="promotion-piece" data-piece="n">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'N' : 'n')}</div>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            const piece = e.target.closest('.promotion-piece');
            if (piece) {
                pendingMove.promotion = piece.dataset.piece;
                document.body.removeChild(modal);
                this.executeMove(pendingMove);
            }
        });
        
        document.body.appendChild(modal);
    }

    executeMove(move) {
        this.lastMove = move;
        // Apply move locally
        this.game.makeMove(move);
        
        if (move.capture) {
            this.playSound('capture');
        } else {
            this.playSound('move');
        }

        // Send to server
        this.sendMessage({
            event: 'move',
            gameId: this.gameId,
            move: move
        });
        
        // Update UI
        this.selectedSquare = null;
        this.validMoves = [];
        this.isMyTurn = false;
        this.renderBoard();
        this.updateStatus();
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
    }

    handleOpponentMove(moveData) {
        this.lastMove = moveData;
        this.game.makeMove(moveData);
        this.isMyTurn = true;
        
        if (moveData.capture) {
            this.playSound('capture');
        } else {
            this.playSound('move');
        }

        if (this.game.isInCheck(this.playerColor)) {
            this.playSound('check');
        }

        this.renderBoard();
        this.updateStatus();
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    }

    updateStatus() {
        if (this.game.isInCheck(this.playerColor)) {
            this.showNotification('Ваш король под шахом!');
        }
    }

    checkGameEnd() {
        let result = null;
        let reason = '';
        
        if (this.game.isCheckmate()) {
            result = this.game.turn === this.playerColor ? 'loss' : 'win';
            reason = 'Мат';
        } else if (this.game.isStalemate()) {
            result = 'draw';
            reason = 'Пат';
        } else if (this.game.isDraw()) {
            result = 'draw';
            reason = 'Ничья';
        }
        
        if (result) {
            this.sendMessage({ event: 'game_end', gameId: this.gameId, result, reason });
            this.endGame(result, reason);
        }
    }

    endGame(result, reason) {
        this.stopTimer();
        this.playSound('game_over');
        
        const resultEl = document.getElementById('game-result');
        const reasonEl = document.getElementById('game-result-reason');
        
        const resultText = {
            'win': 'Победа! 🎉',
            'loss': 'Поражение ❌',
            'draw': 'Ничья 🤝'
        };
        
        resultEl.textContent = resultText[result] || 'Игра окончена';
        resultEl.className = result;
        reasonEl.textContent = reason;
        
        document.getElementById('game-over-screen').classList.add('active');

        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred(result === 'win' ? 'success' : 'error');
        }
    }

    resign() {
        if (confirm('Вы уверены, что хотите сдаться?')) {
            this.sendMessage({ event: 'resign', gameId: this.gameId });
        }
    }

    offerDraw() {
        this.sendMessage({ event: 'offer_draw', gameId: this.gameId });
        this.showNotification('Предложение ничьи отправлено');
    }

    showMainMenu() {
        this.showScreen('main-menu');
        document.getElementById('matchmaking-status').classList.add('hidden');
        document.querySelector('.menu-buttons').classList.remove('hidden');
        
        // Reset game state
        this.game = new Chess();
        this.gameId = null;
        this.playerColor = null;
        this.selectedSquare = null;
        this.validMoves = [];
        this.isMyTurn = false;
        
        // Stop timer
        this.stopTimer();
        
        // Close old socket if exists
        if (this.socket) {
            this.socket.onclose = null; // Remove auto-reconnect
            this.socket.close();
            this.socket = null;
        }
        
        this.renderBoard();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        // Handle special screen logic
        if (screenId !== 'game-over-screen') {
            document.getElementById('game-over-screen').classList.remove('active');
        }
    }

    updatePlayerInfo() {
        // Update player names and times
        document.getElementById('player-info').querySelector('.player-name').textContent = 
            this.playerColor === 'w' ? 'Вы (Белые)' : 'Вы (Черные)';
        document.getElementById('opponent-info').querySelector('.player-name').textContent = 
            this.playerColor === 'w' ? 'Противник (Черные)' : 'Противник (Белые)';
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (this.isMyTurn) {
                this.timeLeft[this.playerColor] -= 1000;
            } else {
                this.timeLeft[this.playerColor === 'w' ? 'b' : 'w'] -= 1000;
            }
            this.updateTimers();
            
            // Check timeout
            if (this.timeLeft[this.playerColor] <= 0) {
                this.sendMessage({ event: 'timeout', gameId: this.gameId, color: this.playerColor });
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimers() {
        const formatTime = (ms) => {
            const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const playerTime = this.playerColor === 'w' ? this.timeLeft.w : this.timeLeft.b;
        const opponentTime = this.playerColor === 'w' ? this.timeLeft.b : this.timeLeft.w;

        document.getElementById('player-info').querySelector('.player-time').textContent = formatTime(playerTime);
        document.getElementById('opponent-info').querySelector('.player-time').textContent = formatTime(opponentTime);

        // Highlight low time
        const playerTimeEl = document.getElementById('player-info').querySelector('.player-time');
        playerTimeEl.classList.toggle('low', playerTime < 60000);
    }

    showNotification(message, type = 'info') {
        // Use Telegram's native popup or custom notification
        if (tg.showPopup) {
            tg.showPopup({ title: type === 'error' ? 'Ошибка' : 'Информация', message });
        } else {
            alert(message);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chessApp = new ChessApp();
});
