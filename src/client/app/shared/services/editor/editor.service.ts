import { Injectable } from '@angular/core';

// Ace imports
import * as ace from 'brace';
const Range = ace.acequire('ace/range').Range;

@Injectable()
export class EditorService {
  private _editor: any;
  private _marker: any;

  gotoLine(lineNumber: number, columnNumber: number): void {
    this._editor.focus();
    this._editor.resize();
    this._editor.gotoLine(lineNumber, columnNumber - 1, true);
  }

  //basic editor functions

  highlightLine(lineNumber: number): void {
    if (this._marker) {
      this.removeMarker();
    }
    this._marker = this._editor.getSession().addMarker(new Range(lineNumber - 1, 0, lineNumber - 1, 1),
                                                       'highlighted-line',
                                                       'fullLine');
  }

  removeMarker(): void {
    this._editor.getSession().removeMarker(this._marker);
  }

  set editor(editor: any) {
    this._editor = editor;
  }

  get content(): string {
    return this._editor ? this._editor.getValue() : '';
  }

  set content(content: string) {
    this._editor.setValue(content, -1);
  }
}
