import { commands, window, ExtensionContext } from 'vscode';
import { setupCodeTemplate } from './modules/codeTemplate';
import { setupFunctionComments } from './modules/functionComments';

export function activate(context: ExtensionContext) {
    console.log('Congratulations, your extension "new-extension" is now active!');

    context.subscriptions.push(
        commands.registerCommand('new-extension.helloWorld', () => {
            window.showInformationMessage('Hello World');
        })
    );

    setupCodeTemplate(context);
    setupFunctionComments(context);
}

export function deactivate() {}
