import { commands, ExtensionContext, window, Range } from 'vscode';

interface Code {
    name: string;
    template: string;
}

const codes: Code[] = [
    {
        name: 'function-0',
        template: `export interface ArrangeSeatData {
    span?: number
}
export function arrangeSeat(arr: ArrangeSeatData[], defaultSpan: number = 8): ArrangeSeatData[][] {
    const l = arr.length
    let n = 0

    const oneArray: Array<ArrangeSeatData[]> = []
    let twoArray: ArrangeSeatData[] = []
    let surplus = 24

    while (n < l) {
        const span = arr[n]?.span || defaultSpan

        surplus = surplus - span
        if (surplus > 0) {
            twoArray.push(arr[n])
            n++
            if (n === l) {
                oneArray.push(twoArray)
            }
        } else if (surplus === 0) {
            twoArray.push(arr[n])
            appendRow()
            n++
        } else {
            appendRow()
        }
    }

    function appendRow() {
        oneArray.push(twoArray)
        surplus = 24
        twoArray = []
    }
    return oneArray
}`
    }
];

export function setupCodeTemplate(context: ExtensionContext) {
    codes.forEach((code, index) => {
        let disposable3 = commands.registerCommand('new-extension.' + code.name, () => {
            const editor = window.activeTextEditor;
            if (editor) {
                const { selections } = editor;

                editor.edit(editBuilder => {
                    selections.forEach(selection => {
                        const { start, end } = selection;
                        const range = new Range(start, end);
                        editBuilder.replace(range, code.template);
                    });
                });
            } else {
                window.showWarningMessage('new-extension: 只有在编辑文本的时候才可以使用!');
            }
        });

        context.subscriptions.push(disposable3);
    });
}
