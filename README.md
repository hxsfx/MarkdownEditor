# 前言
在这个人人都是自媒体的时代，为了扩大个人影响力同时预防文章被盗版至其他平台，多平台发布文章就成了创作者们的一大痛点，为了解决这一痛点就需要将文章的编辑到发布无缝集成。
现在要实现这一功能，开发一个完全可控的Markdown编辑器就是第一步。
**本文源码已上传Github：[Github hxsfx MarkdownEditor](https://github.com/hxsfx/MarkdownEditor)**
# 界面草图
![](https://github.com/hxsfx/MarkdownEditor/blob/main/doc/img/草图.gif)
# 技术选型
考虑到编辑器解析渲染放在前端更合适，采用了HTML+JS+CSS实现Markdown编辑器模块。
# 功能演示及代码分享
各位小伙伴可以访问在线演示地址：[https://md.hxsfx.com/](https://md.hxsfx.com/)
## 1、标题语法
+ 功能演示
![](https://github.com/hxsfx/MarkdownEditor/blob/main/doc/img/01 标题语法.gif)
+ 代码分享
```JavaScript
var h4_start = "#### ";
var h3_start = "### ";
var h2_start = "## ";
var h1_start = "# ";
if (textContent.startsWith(h4_start)) {
    html = textContent.substring(h4_start.length, textContent.length);
    tagName = "h4";
}//四级标题
else if (textContent.startsWith(h3_start)) {
    html = textContent.substring(h3_start.length, textContent.length);
    tagName = "h3";
}//三级标题
else if (textContent.startsWith(h2_start)) {
    html = textContent.substring(h2_start.length, textContent.length);
    tagName = "h2";
}//二级标题
else if (textContent.startsWith(h1_start)) {
    html = textContent.substring(h1_start.length, textContent.length);
    tagName = "h1";
}//一级标题
```
## 2、强调语法
+ 功能演示

+ 代码分享
```JavaScript
//提取强调语法
function ExtractEmphasisGrammar(html) {
    //粗斜体
    var html = html.replace(/\*\*\*.*?\*\*\*/g, function (strongAndem_val) {
        var _strongAndem_val = strongAndem_val.substring(3, strongAndem_val.length - 3)
        return CreatePreviewSectionHTML("strong,em", _strongAndem_val);
    });
    //粗体
    var html = html.replace(/\*\*.*?\*\*/g, function (strong_val) {
        var _strong_val = strong_val.substring(2, strong_val.length - 2);
        return CreatePreviewSectionHTML("strong", _strong_val);
    });
    //斜体
    var html = html.replace(/\*.*?\*/g, function (em_val) {
        var _em_val = em_val.substring(1, em_val.length - 1);
        return CreatePreviewSectionHTML("em", _em_val);
    });
    return html;
}
//根据标签和内部内容生成预览区域内行块html
function CreatePreviewSectionHTML(tagName, innerHTML) {
    var html = innerHTML;
    if (tagName == "code") {
        html = html.replace(/(\s)/g, "&nbsp;");//.replace("/ /g","&nbsp;");
    }//将空格替换为转义字符防止多个空格在html显示为一个

    if (tagName == "" || tagName == null || tagName == undefined) {
    } else if (tagName == "hr") {
        html = "
<hr>";
    } else {
        var start_tagName = "";
        var end_tagName = "";
        var tagNameSplit = tagName.split(",");
        for (var i = 0; i < tagNameSplit.length; i++) {
            start_tagName += "<" + tagNameSplit[i] + ">";
            end_tagName = end_tagName + "</" + tagNameSplit[i] + ">";
        }
        html = start_tagName + html + end_tagName;
    }
    return html;
}
```
## 3、引用语法
+ 功能演示

+ 代码分享
```JavaScript
var blockquote_start = "&gt;";
if (textContent.startsWith(blockquote_start)) {
    isBlockquote = true;
    html = textContent.substring(blockquote_start.length, textContent.length);
    tagName = "blockquote";
}//引用
```
## 4、列表语法
+ 功能演示

+ 代码分享
```JavaScript
var olli_pattern = /^ {0,3}[1-9]*\. /; //有序列表正则表达式
var ulli_pattern = /^[ ]{0,3}(\* |- |\+ )/; //有序列表正则表达式

if (olli_pattern.test(textContent)) {
    //有序列表项
    if (textContent.startsWith(" ")) {
        isOL2 = true;
    } else {
        isOL = true;
    }
    html = textContent.replace(olli_pattern, "");
    tagName = "ol";
}
else if (ulli_pattern.test(textContent)) {
    //无序列表项
    if (textContent.startsWith(" ")) {
        isUL2 = true;
    } else {
        isUL = true;
    }
    html = textContent.replace(ulli_pattern, "");
    tagName = "ul";
}
//提取列表语法
function ExtractList(analysisResult, prevAnalysisResult) {
    var isExtractTable = true;
    if (prevAnalysisResult == null || prevAnalysisResult.ListInfo == null) {
        isExtractTable = CreateListInfo(analysisResult, isExtractTable);
    }//没有上一行 或者 上一行不是列表
    else {
        var liHTML = analysisResult.AnalysisHTML;
        if ((prevAnalysisResult.IsOL && analysisResult.IsOL) ||
            (prevAnalysisResult.IsUL && analysisResult.IsUL)) {
            //接着上一行继续
            analysisResult.ListInfo = prevAnalysisResult.ListInfo;
            analysisResult.ListInfo.LiInfoArray.push({ LiHtml: liHTML, LiInfoArray: [] });
            analysisResult.ListInfo.IsMergePrevHTML = true;
        }//同为一级标题且标签相同
        else if ((prevAnalysisResult.IsOL && analysisResult.IsUL) ||
            (prevAnalysisResult.IsUL && analysisResult.IsOL)) {
            isExtractTable = CreateListInfo(analysisResult, isExtractTable);
        }
        else if ((prevAnalysisResult.IsOL && (analysisResult.IsOL2 || analysisResult.IsUL2)) ||
            (prevAnalysisResult.IsUL && (analysisResult.IsOL2 || analysisResult.IsUL2))) {
            var currentFisrtLevelLiInfoArray = prevAnalysisResult.ListInfo.LiInfoArray.slice(-1)[0];
            var secondLevelLiInfoArray = currentFisrtLevelLiInfoArray.LiInfoArray;
            var isFindPeer = false;
            for (var i = 0; i < secondLevelLiInfoArray.length; i++) {
                var _secondLevelLiInfo = secondLevelLiInfoArray[i];
                if (_secondLevelLiInfo.TagName == analysisResult.TagName) {
                    isFindPeer = true;
                    _secondLevelLiInfo.LiHtmlList.push(liHTML);
                }
            }
            if (!isFindPeer) {
                secondLevelLiInfoArray.push({ TagName: analysisResult.TagName, LiHtmlList: [liHTML] });
            }
            analysisResult.ListInfo = prevAnalysisResult.ListInfo;
            analysisResult.ListInfo.IsMergePrevHTML = true;
        }
        else if ((prevAnalysisResult.IsOL2 && (analysisResult.IsOL || analysisResult.IsUL)) ||
            (prevAnalysisResult.IsUL2 && (analysisResult.IsOL || analysisResult.IsUL))) {
            if (prevAnalysisResult.ListInfo.TagName == analysisResult.TagName) {
                prevAnalysisResult.ListInfo.LiInfoArray.push({ LiHtml: liHTML, LiInfoArray: [] });
                analysisResult.ListInfo = prevAnalysisResult.ListInfo;
                analysisResult.ListInfo.IsMergePrevHTML = true;
            }//此二级有序项对应一级项的列表项跟当前一致且为一级
            else {
                isExtractTable = CreateListInfo(analysisResult, isExtractTable);
            }//当前一级与上一个一级标签不同无法合并，再生成一个新的
        }
        else if ((prevAnalysisResult.IsOL2 && analysisResult.IsOL2) ||
            (prevAnalysisResult.IsUL2 && analysisResult.IsUL2)) {
            var currentFisrtLevelLiInfoArray = prevAnalysisResult.ListInfo.LiInfoArray.slice(-1)[0];
            var secondLevelLiInfoArray = currentFisrtLevelLiInfoArray.LiInfoArray.slice(-1)[0];
            secondLevelLiInfoArray.LiHtmlList.push(liHTML);
            analysisResult.ListInfo = prevAnalysisResult.ListInfo;
            analysisResult.ListInfo.IsMergePrevHTML = true;
        }//同为二级同标签，直接追加
        else if ((prevAnalysisResult.IsOL2 && analysisResult.IsUL2) ||
            (prevAnalysisResult.IsUL2 && analysisResult.IsOL2)) {
            var currentFisrtLevelLiInfoArray = prevAnalysisResult.ListInfo.LiInfoArray.slice(-1)[0];
            //这儿是要新添加不同的二级标签跟上面不一样所以不要属性
            currentFisrtLevelLiInfoArray.LiInfoArray.push({ TagName: analysisResult.TagName, LiHtmlList: [liHTML] });
            analysisResult.ListInfo = prevAnalysisResult.ListInfo;
            analysisResult.ListInfo.IsMergePrevHTML = true;
        }//虽然同时二级，但标签不同，需生成新的二级
    }
    return isExtractTable;
}
function CreateListInfo(analysisResult, isExtractTable) {
    if (analysisResult.IsUL || analysisResult.IsOL) {
        analysisResult.ListInfo = {
            IsMergePrevHTML: false,
            TagName: analysisResult.TagName,
            LiInfoArray: [
                {
                    LiHtml: analysisResult.AnalysisHTML,
                    LiInfoArray: []
                    //LiInfoArray: [{
                    // TagName: "",
                    // LiHtmlList: []
                    //}],
                },
            ]
        };
    } //识别为一级无序列表项 或者 识别为一级有序列表项
    else {
        isExtractTable = false;
    } //第一行识别为二级列表项，做普通处理
    return isExtractTable;
}
```
## 5、代码块语法
+ 功能演示

+ 代码分享
```JavaScript
var isCodeBlock = false;
if (analysisResult.IsCodeBlock) {
    isCodeBlock = analysisResult.IsCodeBlock;
    //当前是代码块结束或开始
    if (prevAnalysisResult == null) {
        //代码块开始
        analysisResult.TextContent = "";
        previewHTMLArray.push(CreatePreviewSectionHTML("pre", analysisResult.TextContent));
    }
    else {
        if (prevAnalysisResult.IsCodeBlock) {
            //结束
            analysisResult.IsCodeBlock = false;
            analysisResult.TextContent = prevAnalysisResult.TextContent;
            previewHTMLArray[previewHTMLArray.length - 1] = CreatePreviewSectionHTML("pre", analysisResult.TextContent);
        }
        else {
            //开始
            analysisResult.TextContent = "";
            previewHTMLArray.push(CreatePreviewSectionHTML("pre", analysisResult.TextContent));
        }
    }
}

if (prevAnalysisResult.IsCodeBlock) {
    //当前在代码块内
    isCodeBlock = true;
    analysisResult.IsCodeBlock = true;
    var _textContent = "";
    if (analysisResult.TextContent != "" && analysisResult.TextContent != null) {
        _textContent = CreatePreviewSectionHTML("code", analysisResult.TextContent);
    }
    analysisResult.TextContent = prevAnalysisResult.TextContent + _textContent;
    previewHTMLArray[previewHTMLArray.length - 1] = CreatePreviewSectionHTML("pre", analysisResult.TextContent);
}
```
## 6、分隔线语法
+ 功能演示

+ 代码分享
```JavaScript
var separator_pattern = /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/;//分隔线正则表达式
if (separator_pattern.test(textContent)) {
    tagName = "hr";
}//分隔线
```
## 7、链接语法
+ 功能演示

+ 代码分享
```JavaScript
var def_pattern = /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/;
if (def_pattern.test(textContent)) {
    html = "textContent";
    tagName = "a";
}//链接
//提取链接和图片语法
function ExtractLink(html) {
    var link_pattern = /!?\[(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?\]\(\s*(?:<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*)(?:\s+(?:"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/g;
    if (link_pattern.test(html)) {
        var link_pattern2 = /^!?\[((?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;
        html = html.replace(link_pattern, function (val) {
            var getVals = link_pattern2.exec(val);
            var text = getVals[1];
            var href = getVals[2];
            href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
            href = href.replace(/<strong><em>/, "***");
            href = href.replace(/<\/strong><\/em>/, "***");
            href = href.replace(/<strong>/, "**");
            href = href.replace(/<\/strong>/, "**");
            href = href.replace(/<em>/, "*");
            href = href.replace(/<\/em>/, "*");
            var title = getVals[3];
            title = getVals[3] ? getVals[3].slice(1, -1) : '';
            title = title.replace(/<strong><em>/, "***");
            title = title.replace(/<\/strong><\/em>/, "***");
            title = title.replace(/<strong>/, "**");
            title = title.replace(/<\/strong>/, "**");
            title = title.replace(/<em>/, "*");
            title = title.replace(/<\/em>/, "*");
            if (getVals[0].startsWith("!")) {
                return "<img src=\"" + href + "\" title=\"" + title + "\" alt=\"" + text + "\"/>";
            } else {
                var text = ExtractLink(text);
                return "<a href=\"" + href + "\" title=\"" + title + "\">" + text + "</a>";
            }
        });
    }
    return html;
}
```
## 8、图片语法
+ 功能演示

+ 代码分享
**参考第7点的链接语法**
## 9、表格语法
+ 功能演示

+ 代码分享
```JavaScript
var table_tag_pattern = /^[ ]{0,3}((\|[ ]*?(?:[:]{0,1}- *){3,}[:]{0,1}[ ]*)+\|){1,}[ | ]{0,}$/;//表格出现的标识
if (table_tag_pattern.test(textContent)) {
    html = textContent;
}//表格
//提取表格语法
function ExtractTable(analysisResult, prevAnalysisResult) {
    var isExtractTable = true;
    if (prevAnalysisResult == null) {
        isExtractTable = false;
    }//但因为是第一行，所以不能转为表格
    else {
        //把当前内容根据|分隔进行拆分
        var currentSplitArray = analysisResult.AnalysisHTML.split('|');
        if (analysisResult.IsTable && prevAnalysisResult.TableInfo == null) {
            if (/^[ ]{0,3}\|/.test(prevAnalysisResult.AnalysisHTML)) {
                var headerTHTextArray = prevAnalysisResult.AnalysisHTML.split('|');
                analysisResult.TableInfo = {};
                analysisResult.TableInfo.TextAlignArray = new Array();
                var columnCount = currentSplitArray.length - 2;
                if (columnCount > headerTHTextArray.length - 2) {
                    columnCount = headerTHTextArray.length - 2;
                }
                var thHTML = "";
                for (var i = 0; i < columnCount; i++) {
                    var _tagText = currentSplitArray[i + 1].trim();
                    var textAlign = "";
                    if (_tagText.startsWith("-") && _tagText.endsWith("-")) {
                        textAlign = ""
                    } else if (_tagText.startsWith(":") && _tagText.endsWith(":")) {
                        textAlign = "center";
                    } else if (_tagText.startsWith(":")) {
                        textAlign = "left";
                    } else if (_tagText.endsWith(":")) {
                        textAlign = "right";
                    }
                    var textAlignStyle = ""
                    if (textAlign != "") {
                        textAlignStyle = "style=\"text-align:" + textAlign + "\";";
                    }
                    analysisResult.TableInfo.TextAlignArray.push(textAlignStyle);
                    thHTML += "<th " + textAlignStyle + ">" + headerTHTextArray[i + 1] + "</th>"
                }
                analysisResult.TableInfo.THeadHTML = "<thead><tr>" + thHTML + "</tr></thead>";
                analysisResult.TableInfo.TBodyHTMLArray = new Array();
            }//检查上一行是不是符合做表头内容文本的格式条件
            else {
                isExtractTable = false;
            }//此行虽然是表格标识出现，但因为上一行格式不对，不满足生成表格的条件
        }//当表头还未生成的时候先生成表头
        else if (prevAnalysisResult.TableInfo != null) {
            analysisResult.TableInfo = prevAnalysisResult.TableInfo;
            var tdHtml = "";
            for (var i = 0; i < analysisResult.TableInfo.TextAlignArray.length; i++) {
                var text = currentSplitArray[i + 1];
                if (text === undefined) {
                    text = "";
                }
                tdHtml += "<td " + analysisResult.TableInfo.TextAlignArray[i] + ">" + text + "</td>"
            }
            analysisResult.TableInfo.TBodyHTMLArray.push("<tr>" + tdHtml + "</tr>");
        }//当表头生成后生成表体
        else {
            isExtractTable = false;
        }
    }
    if (isExtractTable == false) {
        analysisResult.TableInfo = null;
    }
    return isExtractTable;
}
```
## 10、其他功能
+ 功能演示

+ 代码分享
```JavaScript
//通过使用localStorage实现本地缓存
//缓存输入至localStorage
function LocalStorageInputMD(mdInputHTML){
    localStorage.setItem('ls_mdInput',mdInputHTML);
}
//实现输入内容导出
function exportRaw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(ev);
}
//通过将输入缓存至EditorElementRecordHistoryArray中，实现撤销和重做功能
//点击撤销按钮
UndoButtonElement.onclick = function () {
    //document.execCommand("Undo");
    if (EditorElementRecordHistoryArray === undefined ||
        EditorElementRecordHistoryArray == null) {
        EditorElementRecordHistoryArray = new Array();
    }
    else {
        if (EditorElementRecordHistoryArray.length >= 2) {
            if (EditorElementRecordHistoryArray.length <= 2) {
                UndoButtonElement.className += " disable";
            }//当记录元素小于等于1个，就可以撤销了
            if (EditorElementRecordHistoryArray_undo === undefined ||
                EditorElementRecordHistoryArray_undo == null) {
                EditorElementRecordHistoryArray_undo = new Array();
            }//先判断重做队列是否为null
            RedoButtonElement.className = RedoButtonElement.className.replace("disable", "");//将重做按钮点亮
            EditorElementRecordHistoryArray_undo.push(EditorElementRecordHistoryArray.pop());//将保存的历史记录最后一条取出来（这是当前条，取出来要放到重做队列）
            editDivElement.innerHTML = EditorElementRecordHistoryArray.pop();//将当前条的前一条取出来
            Preview();//渲染
        }
    }
}
//点击重做按钮
RedoButtonElement.onclick = function () {
    //document.execCommand("Redo");
    if (EditorElementRecordHistoryArray_undo !== undefined &&
        EditorElementRecordHistoryArray_undo != null &&
        EditorElementRecordHistoryArray_undo.length > 0) {
        editDivElement.innerHTML = EditorElementRecordHistoryArray_undo.pop();
        Preview();//渲染
    }
    if (EditorElementRecordHistoryArray_undo === undefined ||
        EditorElementRecordHistoryArray_undo == null ||
        EditorElementRecordHistoryArray_undo.length <= 0) {
        if (RedoButtonElement.className.indexOf("disable") < 0) {
            RedoButtonElement.className += " disable";
        }
    }
}
//只要有输入动作就清空重做记录
function ClearUndo() {
    EditorElementRecordHistoryArray_undo = new Array();
    if (RedoButtonElement.className.indexOf("disable") < 0) {
        RedoButtonElement.className += " disable";
    }
}
```
# 写在最后
本次开发代码质量只能说有手就行哈哈。接下来除了完成新功能的添加，也会预留一部分的时间来重构代码。如果各位小伙伴有什么建议的可以通过评论或者私信的方式告诉我，让我们一起学习吧。
# 预告一下
后期将对接各平台发布功能（初步预计5个平台，包括博客园、知乎、今日头条、CSDN、简书），预期1个月左右完成一个平台对接，争取春节前完成5个平台的一键发布功能。
