import { ExtensionContext, window, Position, commands } from 'vscode';
import type { TextEditor } from 'vscode';
import * as dayjs from 'dayjs';

interface Comment {
    key: string;
    type?: string;
    value?: string;
}

/**
 * @date 2022-10-14 17:32:26
 * @description
 */
export default function functionComments() {
    const editor = window.activeTextEditor;

    editor?.edit(editBuilder => {
        const position = getPosition(editor);

        const activeLine = editor.selection.active.line;
        const lineProperty = editor.document.lineAt(activeLine);

        const text = lineProperty.text;
        let params =
            matchFunction(text)?.[2] ||
            arrowFunction(text)?.[3] ||
            matchClassFunction(text)?.[3] ||
            matchObjFunction(text)?.[2] ||
            '';

        // 匹配参数
        const arr = parsing(params);

        // TODO():
        const comments: Comment[] = [
            {
                key: 'date',
                value: dayjs().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                key: 'description',
                value: ''
            },
            ...arr.map(el => {
                return {
                    key: 'param',
                    value: el.param,
                    type: el.type
                };
            })
        ];

        const template = transformToString(comments);

        editBuilder.insert(position, template);
    });
}

function transformToString(comments: Comment[]): string {
    let str = `/**\n`;

    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const param = ' * @' + comment.key + ' ';
        const type = comment.type ? '{' + comment.type + '} ' : '';
        const value = comment.value || '';
        str = str + param + type + value + '\n';
    }

    str += `*/`;
    return str;
}

function getPosition(editor: TextEditor) {
    const activeLine = editor.selection.active.line;
    const lineProperty = editor.document.lineAt(activeLine);

    if (lineProperty.isEmptyOrWhitespace) {
        return new Position(activeLine, 0);
    }

    return new Position(activeLine - 1, 0);
}

// 匹配函数关键字
function matchFunction(text: string) {
    // 匹配function关键字 必须的空格 匹配函数名 可能的空格 可能的泛型 匹配一个括号
    // eslint-disable-next-line no-useless-escape
    const reg = /\bfunction\b\s*([A-Za-z_]\w*?)\s*[^\(\)]*\((.*)\)/;
    return reg.exec(text);
}

// 箭头函数
function arrowFunction(text: string) {
    // 函数名 匹配可能的类型声明和泛型等 匹配= 匹配参数和其他的匹配=>
    const reg = /([A-Za-z_]\w*?)\s*[^=]*=\s*(async)?\s*\(?(.+)\)?.*=>/;
    return reg.exec(text);
}

// 匹配对象或者class 的函数
function matchClassFunction(text: string) {
    // 开头是可能的空格 函数名 可能有泛型 匹配括号 匹配括号内的一切 可能的空格 可能的一切(返回值类型) 匹配 {
    // eslint-disable-next-line no-useless-escape
    const reg = /^(\s*\w*?\s+)?\s*([A-Za-z_]\w*?)[^\(\)]*\((.*)\)\s*.*?{/;
    return reg.exec(text);
}

// 匹配对象的函数
function matchObjFunction(text: string) {
    // 开头是可能的空格 函数名 可能的空格: function 可能的函数名和泛型(除了括号) 括号
    // eslint-disable-next-line no-useless-escape
    const reg = /^\s*([A-Za-z_]\w*?)\s*:\s*\bfunction\b[^\(\)]*\((.*)\)/;
    return reg.exec(text);
}

function parsing(params: string) {
    let res;
    const paramsArr = []; // 参数列表

    const reg = /\s*([...\s]*)([A-Za-z_]\w*)(\s*\??\s*:\s*(\w+))?[^,]*/g;
    // 切割函数数组对象防止其中的逗号干扰
    params = params.replace(/\(.*?\)/g, ' korofunction ');
    // eslint-disable-next-line no-useless-escape
    params = params.replace(/\[+[^\[\]]+\]+/g, ' koroarray ');
    params = params.replace(/{+[^{}]+}+/g, ' koroobject ');
    // 捕获函数参数
    while ((res = reg.exec(params))) {
        if (!res) break;
        if (res[4] !== undefined) {
            res[4] = res[4].replace(/\s+/g, '');
        } else {
            res[4] = '*';
        }
        const index = paramsArr.length;
        // 参数是数组或者对象函数 直接转化为params1234
        res[2] = res[2].replace(/koro\w+/g, `param${index + 1}`);
        // 还原数组对象函数的类型
        res[4] = res[4].replace('koro', '');
        const obj = {
            type: res[4],
            param: res[2]
        };
        if (res[1].startsWith('...')) {
            obj.type = 'array';
        }
        paramsArr.push(obj);
    }
    return paramsArr;
}

export function setupFunctionComments(context: ExtensionContext) {
    let disposable2 = commands.registerCommand('new-extension.functionComments', () => {
        functionComments();
    });

    context.subscriptions.push(disposable2);
}
