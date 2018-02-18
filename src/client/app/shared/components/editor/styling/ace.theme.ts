let ace = (<any>window)['ace'];

ace.define('ace/theme/qmix', ['require', 'exports', 'module', 'ace/lib/dom'], function(acequire: any, exports: any, module: any) {

  const indentGuideImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC';

  exports.isDark = true;
  exports.cssClass = 'ace-qmix';
  exports.cssText = `.ace-qmix .ace_gutter {\
  background: #232328;\
  color: #2e9ad0\
  }\
  .ace-qmix .ace_print-margin {\
  width: 1px;\
  background: #555651\
  }\
  .ace-qmix {\
  background-color: #232328;\
  color: #F8F8F2\
  }\
  .ace-qmix .ace_cursor {\
  color: #F8F8F0\
  }\
  .ace-qmix .ace_marker-layer .ace_selection {\
  background: #49483E\
  }\
  .ace-qmix.ace_multiselect .ace_selection.ace_start {\
  box-shadow: 0 0 3px 0px #272822;\
  }\
  .ace-qmix .ace_marker-layer .ace_step {\
  background: rgb(102, 82, 0)\
  }\
  .ace-qmix .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid #49483E\
  }\
  .ace-qmix .ace_marker-layer .ace_active-line {\
  background: #202020\
  }\
  .ace-qmix .ace_gutter-active-line {\
  background-color: #272727\
  }\
  .ace-qmix .ace_marker-layer .ace_selected-word {\
  border: 1px solid #49483E\
  }\
  .ace-qmix .ace_invisible {\
  color: #52524d\
  }\
  .ace-qmix .ace_entity.ace_name.ace_tag,\
  .ace-qmix .ace_keyword,\
  .ace-qmix .ace_meta.ace_tag,\
  .ace-qmix .ace_storage {\
  color: #F92672\
  }\
  .ace-qmix .ace_punctuation,\
  .ace-qmix .ace_punctuation.ace_tag {\
  color: #fff\
  }\
  .ace-qmix .ace_constant.ace_character,\
  .ace-qmix .ace_constant.ace_language,\
  .ace-qmix .ace_constant.ace_numeric,\
  .ace-qmix .ace_constant.ace_other {\
  color: #AE81FF\
  }\
  .ace-qmix .ace_invalid {\
  color: #F8F8F0;\
  background-color: #F92672\
  }\
  .ace-qmix .ace_invalid.ace_deprecated {\
  color: #F8F8F0;\
  background-color: #AE81FF\
  }\
  .ace-qmix .ace_support.ace_constant,\
  .ace-qmix .ace_support.ace_function {\
  color: #66D9EF\
  }\
  .ace-qmix .ace_fold {\
  background-color: #A6E22E;\
  border-color: #F8F8F2\
  }\
  .ace-qmix .ace_storage.ace_type,\
  .ace-qmix .ace_support.ace_class,\
  .ace-qmix .ace_support.ace_type {\
  color: #66D9EF\
  }\
  .ace-qmix .ace_entity.ace_name.ace_function,\
  .ace-qmix .ace_entity.ace_other,\
  .ace-qmix .ace_entity.ace_other.ace_attribute-name,\
  .ace-qmix .ace_variable {\
  color: #A6E22E\
  }\
  .ace-qmix .ace_variable.ace_parameter {\
  color: #FD971F\
  }\
  .ace-qmix .ace_string {\
  color: #E6DB74\
  }\
  .ace-qmix .ace_comment {\
  color: #75715E\
  }\
  .ace-qmix .ace_indent-guide {\
  background: url(data:image/png;base64, ${indentGuideImage}) right repeat-y\
  }`;

  const dom = acequire('../lib/dom');
  dom.importCssString(exports.cssText, exports.cssClass);
});
