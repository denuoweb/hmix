import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ContextMenuModule } from './ext/ngx-contextmenu/ngx-contextmenu';

// Components
import { EditorComponent } from './components/editor/editor.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FileTreeComponent } from './components/sidebar/file-tree/file-tree.component';
import { TreeNodeComponent } from './components/sidebar/tree-node/tree-node.component';
import { TabsComponent } from './components/tabs/tabs.component';

// Services
import { StorageService } from './services/storage/storage.service';
import { FileService } from './services/file/file.service';
import { EditorService } from './services/editor/editor.service';

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [CommonModule, RouterModule, ContextMenuModule.forRoot()],
  declarations: [SidebarComponent, EditorComponent, FileTreeComponent, TreeNodeComponent, TabsComponent],
  exports: [SidebarComponent, EditorComponent, FileTreeComponent, TreeNodeComponent, TabsComponent,
    CommonModule, FormsModule, RouterModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [StorageService, FileService, EditorService]
    };
  }
}
