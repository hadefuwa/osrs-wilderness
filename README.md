# OSRS Wilderness Deaths App

A simple React app to track and display deaths in the Old School RuneScape (OSRS) Wilderness. This project is designed for beginners and uses only basic JavaScript and React.

<img width="1843" height="850" alt="image" src="https://github.com/user-attachments/assets/3a9738de-a1fb-4e09-959a-edeb3ae2ca23" />


## Features
- Track deaths in the OSRS Wilderness
- Simple and clean user interface
- Easy to run locally or deploy online

## Getting Started

Follow these steps to run the app on your computer:

### 1. Clone the Repository
```
git clone https://github.com/hadefuwa/osrs-wilderness.git
cd osrs-wilderness
```

### 2. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed.
```
npm install
```

### 3. Start the App
```
npm start
```
This will open the app in your web browser at `http://localhost:3000`.

## Deployment (GitHub Pages)
You can deploy your app online for free using GitHub Pages:

1. Make sure the `homepage` field in `package.json` is set to:
   ```json
   "homepage": "https://hadefuwa.github.io/osrs-wilderness"
   ```
2. Build and deploy:
   ```
   npm run deploy
   ```
3. Your app will be available at: [https://hadefuwa.github.io/osrs-wilderness](https://hadefuwa.github.io/osrs-wilderness)

## Project Structure
```
osrs-wilderness/
  public/         # Static files (index.html, icons, etc.)
  src/            # React source code
  package.json    # Project settings and dependencies
  README.md       # Project documentation
```

## Contributing
Contributions are welcome! If you have ideas or improvements, feel free to open an issue or submit a pull request.

## License
This project is open source and free to use.
