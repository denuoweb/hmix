let ace = (<any>window)['ace'];

ace.define('ace/theme/hmix', ['require', 'exports', 'module', 'ace/lib/dom'], function(acequire: any, exports: any, module: any) {

  const indentGuideImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC';

  exports.isDark = true;
  exports.cssClass = 'ace-hmix';
  exports.cssText = `.ace-hmix .ace_gutter {\
  background: #232328;\
  color: #2e9ad0\
  }\
  .ace-hmix .ace_print-margin {\
  width: 1px;\
  background: #555651\
  }\
  .ace-hmix {\
  background-color: #232328;\
  color: #F8F8F2\
  }\
  .ace-hmix .ace_cursor {\
  color: #F8F8F0\
  }\
  .ace-hmix .ace_marker-layer .ace_selection {\
  background: #49483E\
  }\
  .ace-hmix.ace_multiselect .ace_selection.ace_start {\
  box-shadow: 0 0 3px 0px #272822;\
  }\
  .ace-hmix .ace_marker-layer .ace_step {\
  background: rgb(102, 82, 0)\
  }\
  .ace-hmix .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid #49483E\
  }\
  .ace-hmix .ace_marker-layer .ace_active-line {\
  background: #202020\
  }\
  .ace-hmix .ace_gutter-active-line {\
  background-color: #272727\
  }\
  .ace-hmix .ace_marker-layer .ace_selected-word {\
  border: 1px solid #49483E\
  }\
  .ace-hmix .ace_invisible {\
  color: #52524d\
  }\
  .ace-hmix .ace_entity.ace_name.ace_tag,\
  .ace-hmix .ace_keyword,\
  .ace-hmix .ace_meta.ace_tag,\
  .ace-hmix .ace_storage {\
  color: #F92672\
  }\
  .ace-hmix .ace_punctuation,\
  .ace-hmix .ace_punctuation.ace_tag {\
  color: #fff\
  }\
  .ace-hmix .ace_constant.ace_character,\
  .ace-hmix .ace_constant.ace_language,\
  .ace-hmix .ace_constant.ace_numeric,\
  .ace-hmix .ace_constant.ace_other {\
  color: #AE81FF\
  }\
  .ace-hmix .ace_invalid {\
  color: #F8F8F0;\
  background-color: #F92672\
  }\
  .ace-hmix .ace_invalid.ace_deprecated {\
  color: #F8F8F0;\
  background-color: #AE81FF\
  }\
  .ace-hmix .ace_support.ace_constant,\
  .ace-hmix .ace_support.ace_function {\
  color: #66D9EF\
  }\
  .ace-hmix .ace_fold {\
  background-color: #A6E22E;\
  border-color: #F8F8F2\
  }\
  .ace-hmix .ace_storage.ace_type,\
  .ace-hmix .ace_support.ace_class,\
  .ace-hmix .ace_support.ace_type {\
  color: #66D9EF\
  }\
  .ace-hmix .ace_entity.ace_name.ace_function,\
  .ace-hmix .ace_entity.ace_other,\
  .ace-hmix .ace_entity.ace_other.ace_attribute-name,\
  .ace-hmix .ace_variable {\
  color: #A6E22E\
  }\
  .ace-hmix .ace_variable.ace_parameter {\
  color: #FD971F\
  }\
  .ace-hmix .ace_string {\
  color: #E6DB74\
  }\
  .ace-hmix .ace_comment {\
  color: #75715E\
  }\
  .ace-hmix .ace_indent-guide {\
  background: url(data:image/png;base64, ${indentGuideImage}) right repeat-y\
  }`;

  const dom = acequire('../lib/dom');
  dom.importCssString(exports.cssText, exports.cssClass);
});
