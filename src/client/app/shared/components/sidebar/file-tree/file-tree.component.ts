import { Component } from '@angular/core';
import { FileService } from '../../../services/file/file.service';

@Component({
  moduleId: module.id,
  selector: 'sd-file-tree',
  templateUrl: 'file-tree.component.html',
  styleUrls: ['file-tree.component.css']
})
export class FileTreeComponent {
  constructor(private fileService: FileService) { }
}
