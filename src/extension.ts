import * as vscode from 'vscode';
import { getWebviewContent } from './webview';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'whatTodo.todoEditor',
      new TodoEditorProvider(context),
      {
        supportsMultipleEditorsPerDocument: false,
      }
    )
  );
}

export class TodoEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = { enableScripts: true };

    const updateWebview = () => {
      webviewPanel.webview.html = getWebviewContent(document.getText());
    };

    updateWebview();

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    // Auto-save functionality
    const autoSave = () => {
      // Use the save() method to automatically save the document
      vscode.commands.executeCommand('workbench.action.files.save', document.uri);
    };

    webviewPanel.webview.onDidReceiveMessage(
      message => {
        const edit = new vscode.WorkspaceEdit();

        switch (message.command) {
          case 'addTodo':
            edit.insert(
              document.uri,
              new vscode.Position(document.lineCount, 0),
              `\n[ ] ${message.text}`
            );
            break;
          case 'toggleTodo':
            const lines = document.getText().split('\n');
            const lineIndex = message.line;

            if (lineIndex >= 0 && lineIndex < lines.length) {
              const lineText = lines[lineIndex];
              const updatedText = lineText.startsWith('[x]')
                ? lineText.replace('[x]', '[ ]')
                : lineText.replace('[ ]', '[x]');

              edit.replace(
                document.uri,
                new vscode.Range(
                  new vscode.Position(lineIndex, 0),
                  new vscode.Position(lineIndex, lineText.length)
                ),
                updatedText
              );
            }
            break;
          case 'removeTodo':
            edit.delete(
              document.uri,
              document.lineAt(message.line).rangeIncludingLineBreak
            );
            break;
        }

        return vscode.workspace.applyEdit(edit).then(() => {
          autoSave(); // Trigger the auto-save after any modification
        });
      },
      undefined,
      this.context.subscriptions
    );

    webviewPanel.onDidDispose(() => changeDocumentSubscription.dispose());
  }
}



export function deactivate() {}
