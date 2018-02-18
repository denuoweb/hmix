import { Injectable } from '@angular/core';

@Injectable()
export class EditorService {
  private _editor: any;

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
