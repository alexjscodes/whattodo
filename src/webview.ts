export function getWebviewContent(content: string): string {
    const lines = content.split('\n');
  
    // Filter out empty lines and map todos
    const todos = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.trim() !== '') // Filter out empty lines
      .map(({ line, index }) => {
        const checked = line.startsWith('[x]') ? 'checked' : '';
        const text = line.replace(/\[.\]/, '').trim();
  
        return `
          <li class="todo-item">
            <label class="custom-checkbox">
              <input type="checkbox" ${checked} onchange="toggle(${index})" />
              <span class="checkbox"></span>
              <span class="todo-text">${text}</span>
            </label>
            <button class="remove-btn" onclick="remove(${index})">Remove</button>
          </li>
        `;
      })
      .join('');
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

          body {
            font-family: 'Montserrat', sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            height: 100vh;
            flex-direction: column;
          }
  
          .todo-list-container {
            width: 100%;
            max-width: 100%;  /* Make container fill the entire width */
            height: 100vh;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            padding: 20px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box; /* Make sure padding doesn't overflow */
          }
  
          h1 {
            text-align: center;
            font-size: 1.8rem;
            color: #333;
            margin-bottom: 20px;
          }
  
          ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
            flex-grow: 1;
            overflow-y: auto;
          }
  
          .todo-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-radius: 8px;
            background: #f4f4f4;
            margin-bottom: 10px;
            transition: background 0.3s ease;
          }
  
          .todo-item:hover {
            background: #e2e2e2;
          }
  
          /* Style for the custom checkbox */
          .custom-checkbox {
            display: flex;
            align-items: center;
            cursor: pointer;
          }
  
          .custom-checkbox input[type="checkbox"] {
            display: none;
          }
  
          .checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #ccc;
            border-radius: 4px;
            background-color: white;
            position: relative;
            margin-right: 10px;
            transition: background-color 0.3s ease, border-color 0.3s ease;
          }
  
          .checkbox:before {
            content: '';
            width: 12px;
            height: 12px;
            background-color: transparent;
            border-radius: 2px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: background-color 0.3s ease;
          }
  
          .custom-checkbox input[type="checkbox"]:checked + .checkbox {
            background-color: #4caf50;
            border-color: #4caf50;
          }
  
          .custom-checkbox input[type="checkbox"]:checked + .checkbox:before {
            background-color: white;
          }
  
          .todo-text {
            flex-grow: 1;
            font-size: 1rem;
            color: #333;
          }
  
          /* Style for the remove button */
          .remove-btn {
            padding: 6px 10px;
            background-color: #ff6347;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
            width: auto;
            flex-shrink: 0;
          }
  
          .remove-btn:hover {
            background-color: #e55347;
            transform: scale(1.05);
          }
  
          .remove-btn:active {
            background-color: #c94435;
            transform: scale(0.95);
          }
  
          /* Add todo input and button */
          input[type="text"] {
            width: 100%;
            padding: 12px;
            font-size: 1rem;
            border: 2px solid #ccc;
            border-radius: 4px;
            margin-top: 20px;
            margin-bottom: 10px;
            outline: none;
            box-sizing: border-box;
          }
  
          input[type="text"]:focus {
            border-color: #4caf50;
          }
  
          button {
            width: 100%;
            padding: 12px;
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
          }
  
          button:hover {
            background-color: #45a049;
            transform: scale(1.05);
          }
  
          button:active {
            background-color: #3c8d3f;
            transform: scale(0.95);
          }
        </style>
      </head>
      <body>
        <div class="todo-list-container">
          <h1>Todo List</h1>
          <ul>${todos}</ul>
          <input id="newTodo" type="text" placeholder="Add a new todo..." />
          <button onclick="add()">Add Todo</button>
        </div>
  
        <script>
          const vscode = acquireVsCodeApi();
  
          function toggle(line) {
            vscode.postMessage({ command: 'toggleTodo', line });
          }
  
          function remove(line) {
            vscode.postMessage({ command: 'removeTodo', line });
          }
  
          function add() {
            const input = document.getElementById('newTodo');
            const text = input.value;
            if (text.trim()) {
              vscode.postMessage({ command: 'addTodo', text });
              input.value = '';
            }
          }
        </script>
      </body>
      </html>
    `;
  }
  