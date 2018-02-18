import { IFileItem } from './file-item.model';
import { IFile, File } from './file.model';

export interface IFolder extends IFileItem {
  contents: (IFile|IFolder)[];
}

export class Folder implements IFolder {
  itemType = 'folder';
  name: string;
  contents: (File|Folder)[];

  constructor(name: string, contents: (File|Folder)[] = []) {
    this.name = name;
    this.contents = contents;
  }

  toObject(): Object { 
    return {
      itemType: this.itemType,
      name: this.name,
      contents: this.contents.map((item: File|Folder) => {
        return item.toObject();
      })
    }
  }

  getFileById(fileId: string): File {
    let file;
    this.contents.forEach((fileItem: File|Folder) => {
      if (fileItem instanceof File && fileItem.id === fileId) {
        file = fileItem;
      } else if (fileItem instanceof Folder) {
        const matchingFile = fileItem.getFileById(fileId);
        if (matchingFile) {
          file = matchingFile;
        }
      }
    });
    return file;
  }

  get openFiles(): File[] {
    let openFiles: File[] = [];
    this.contents.forEach((fileItem: File|Folder) => {
      if (fileItem instanceof File && fileItem.open) {
        openFiles.push(fileItem);
      } else if (fileItem instanceof Folder) {
        openFiles = openFiles.concat(fileItem.openFiles);
      }
    });
    return openFiles;
  }
}
