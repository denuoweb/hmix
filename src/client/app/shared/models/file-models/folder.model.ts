import { IFileItem } from './file-item.model';
import { IFile, File } from './file.model';

export interface IFolder extends IFileItem {
  contents: (IFile|IFolder)[];
}

export class Folder implements IFolder {
  itemType = 'folder';
  expanded: boolean;
  name: string;
  contents: (File|Folder)[];

  constructor(name: string, contents: (File|Folder)[] = [], expanded: boolean = false) {
    this.name = name;
    this.contents = contents;
    this.expanded = expanded;
  }

  toObject(): Object { 
    return {
      itemType: this.itemType,
      name: this.name,
      contents: this.contents.map((item: File|Folder) => {
        return item.toObject();
      }),
      expanded: this.expanded
    }
  }

  deleteFileItem(fileItem: File|Folder): void {
    for (let i = 0; i < this.contents.length; i++) {
      let _fileItem = this.contents[i];
      if (_fileItem instanceof File && _fileItem === fileItem) {
        this.contents.splice(i, 1);
        i--;
      } else if (_fileItem instanceof Folder) {
        if (_fileItem === fileItem) {
          this.contents.splice(i, 1);
          i--;
        } else {
          _fileItem.deleteFileItem(fileItem);
        }
      }
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
  
  get files(): File[] {
    let files: File[] = [];
    this.contents.forEach((fileItem: File|Folder) => {
      if (fileItem instanceof File) {
        files.push(fileItem);
      } else if (fileItem instanceof Folder) {
        files = files.concat(fileItem.openFiles);
      }
    });
    return files;
  }

  get openFiles(): File[] {
    return this.files.filter((file) => {
      return file.open;
    });
  }

  get sortedContents(): (File|Folder)[] {
    return this.contents.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }
}
