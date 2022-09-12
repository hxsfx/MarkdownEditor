var editDivElement = document.querySelector('#hxsfx_MarkdownEditor > div.content > div.mdInputContainer');
var previewContainerElement = document.querySelector("#hxsfx_MarkdownEditor > div.content > div.previewContainer");
var mdInputSeqElement = document.querySelector("#hxsfx_MarkdownEditor > div.content > div.mdInputSeq");
var ArticleTitleInputElement=document.querySelector("#hxsfx_MarkdownEditor > div.articleTitleWrapper > input");

var UndoButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(1) > button:nth-child(1)");
var RedoButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(1) > button:nth-child(2)");
var EditorElementRecordHistoryArray = null;
var EditorElementRecordHistoryArray_undo = [];

//读取本地缓存输入
ReadLocalStorageInputMD();
function ReadLocalStorageInputMD()
{
	editDivElement.innerHTML=localStorage.getItem('ls_mdInput');
	ArticleTitleInputElement.value=localStorage.getItem('ls_articleTitleInput');
	
}
editDivElement.addEventListener("paste", function (e) {
    e.stopPropagation();//暂停冒泡
    e.preventDefault();//阻止默认
    var text = '';
    var event = (e.originalEvent || e);
    if (event.clipboardData && event.clipboardData.getData) {
        text = event.clipboardData.getData('text/plain');
    }
    else if (window.clipboardData && window.clipboardData.getData) {
        text = window.clipboardData.getData('Text');
    }
    if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
    } else {
        document.execCommand('paste', false, text);
    }
});
editDivElement.addEventListener("input", function (e) {
    Preview();
    ClearUndo();
});
//阻止拖动文件至页面时打开新页面
document.ondragover = function (e) { e.preventDefault(); };
document.ondrop = function (e) { e.preventDefault(); };
//渲染
Preview();
function Preview() {
    RecordEditorElementChangeHistory();
    //获取div的数量
    var divElementList = editDivElement.children;

    if (editDivElement.childElementCount <= 0) {
        //editDivElement.innerHTML = "<div>" + editDivElement.textContent + "</div>";
    }
    else {
        var seqHTML = "";
        var previewHTMLArray = new Array();
        var prevAnalysisResult = null;
        for (var i = 0; i < divElementList.length; i++) {
            seqHTML += "<div style=\"height:" + divElementList[i].offsetHeight + "px;\"><p></p></div>";
            //解析MD文本，同时判断返回值是否指向将当前返回的HTML合并到前一个元素中。
            var textContent = divElementList[i].innerHTML;
            //textContent = textContent.replace(/</g, '&lt;');
            //textContent = textContent.replace(/>/g, '&gt;');
            textContent = textContent.replace(/[\r\n]*$/g, '');
            textContent = textContent.replace(/(&nbsp;)+/g, ' ');
            //textContent = textContent.replace("/[ ]{1,}/g", " ");//将textConent中的特殊空格（不知道是什么）改为认得到的空格 h\|d
            textContent = textContent.replace(/\\\|/g, '丨');//用个奇技淫巧对转义|字符替换成中文的丨，来实现转义需求
            var prevTextContent = "";
            if (i > 0) {
                prevTextContent = divElementList[i - 1].textContent;
            }
            //prevAnalysisResult = analysisResult;
            var analysisResult = AnalysisMD(textContent, prevTextContent);
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
            else {
                //当前不是代码块开始或者结束
                if (prevAnalysisResult == null) {
                    //当前不在代码块内
                }
                else {
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
                    else {
                        //当前不在代码块内
                    }
                }
            }
            if (isCodeBlock) {
                //当前属于代码块
            }
            else {
                if (analysisResult.IsBlockquote && (prevAnalysisResult != null && prevAnalysisResult.IsBlockquote)) {
                    //当为引用时，判断上一个是否也是引用，如果是则合并
                    analysisResult.AnalysisHTML = prevAnalysisResult.AnalysisHTML + "<br/>" + analysisResult.AnalysisHTML;
                    previewHTMLArray[previewHTMLArray.length - 1] = CreatePreviewSectionHTML(analysisResult.TagName, analysisResult.AnalysisHTML); //当不为内联代码和代码块时，将内容中的连续空格替换为一个空格
                } //引用
                else if (analysisResult.IsOL ||
                    analysisResult.IsOL2 ||
                    analysisResult.IsUL ||
                    analysisResult.IsUL2) {
                    if (ExtractList(analysisResult, prevAnalysisResult)) {
                        var listHTML = "";
                        var firstLevelHTML = "";
                        for (var j = 0; j < analysisResult.ListInfo.LiInfoArray.length; j++) {
                            var firstLevelLIInfo = analysisResult.ListInfo.LiInfoArray[j];
                            var firstLevelHTMLTemp = firstLevelLIInfo.LiHtml;
                            var secondLevelHTML = "";
                            for (var z = 0; z < firstLevelLIInfo.LiInfoArray.length; z++) {
                                var secondLevelLIInfo = firstLevelLIInfo.LiInfoArray[z];
                                var secondLIHTML = "";
                                for (var p = 0; p < secondLevelLIInfo.LiHtmlList.length; p++) {
                                    secondLIHTML += CreatePreviewSectionHTML("li", secondLevelLIInfo.LiHtmlList[p]);
                                }
                                secondLevelHTML += CreatePreviewSectionHTML(secondLevelLIInfo.TagName, secondLIHTML);
                            }
                            firstLevelHTMLTemp += secondLevelHTML;
                            firstLevelHTML += CreatePreviewSectionHTML("li", firstLevelHTMLTemp);
                        }
                        listHTML += CreatePreviewSectionHTML(analysisResult.ListInfo.TagName, firstLevelHTML);
                        if (analysisResult.ListInfo.IsMergePrevHTML) {
                            previewHTMLArray[previewHTMLArray.length - 1] = listHTML;
                        }
                        else {
                            previewHTMLArray.push(listHTML);
                        }
                        var v = 0;
                    }
                    else {
                        previewHTMLArray.push(CreatePreviewSectionHTML("p", analysisResult.TextContent));
                    }
                } //列表
                else if (/^[ ]{0,3}\|/.test(analysisResult.TextContent)) {
                    if (ExtractTable(analysisResult, prevAnalysisResult)) {
                        if (analysisResult.TableInfo != null) {
                            var tbodyHTML = analysisResult.TableInfo.TBodyHTMLArray.join("");
                            previewHTMLArray[previewHTMLArray.length - 1] = CreatePreviewSectionHTML("table", analysisResult.TableInfo.THeadHTML + "<tbody>" + tbodyHTML + "</tbody>");
                        } //表头已生成，具备生成表格的条件
                        else {
                            alert("create table error!");
                        }
                    }
                    else {
                        previewHTMLArray.push(CreatePreviewSectionHTML("p", analysisResult.TextContent));
                    }
                } //表格
                else {
                    if (analysisResult.AnalysisHTML == "") {
                        analysisResult.AnalysisHTML = "<br/>";
                    }
                    previewHTMLArray.push(CreatePreviewSectionHTML(analysisResult.TagName, analysisResult.AnalysisHTML));
                }
            }
            prevAnalysisResult = analysisResult;
        }
        mdInputSeqElement.innerHTML = seqHTML;
        var previewHTML_str = "";
        for (var i = 0; i < previewHTMLArray.length; i++) {
            previewHTML_str += "<div class=\"previewSection\">" + previewHTMLArray[i] + "</div>";
        }
        //将多个连续空格替换为一个后赋值
        previewContainerElement.innerHTML = previewHTML_str;
    }
	LocalStorageInputMD(editDivElement.innerHTML);
}
//本地缓存用户输入
function LocalStorageInputMD(mdInputHTML){
	localStorage.setItem('ls_mdInput',mdInputHTML);
	
}
//本地缓存文章标题
ArticleTitleInputElement.oninput=function	(){
	
	localStorage.setItem('ls_articleTitleInput',ArticleTitleInputElement.value);
}

//记录编辑区元素变动历史
function RecordEditorElementChangeHistory() {
    //记录编辑器内变动
    if (EditorElementRecordHistoryArray !== undefined &&
        EditorElementRecordHistoryArray != null &&
        EditorElementRecordHistoryArray.length > 0) {
        UndoButtonElement.className = UndoButtonElement.className.replace("disable", "");
    }//当记录元素超过1个，就可以撤销了

    if (EditorElementRecordHistoryArray === undefined ||
        EditorElementRecordHistoryArray == null ||
        EditorElementRecordHistoryArray.length <= 0) {
        EditorElementRecordHistoryArray = new Array();
        EditorElementRecordHistoryArray.push(editDivElement.innerHTML);
    } else {
       
        EditorElementRecordHistoryArray.push(editDivElement.innerHTML);
    }

}

function getCursortPosition(ctrl) {//获取光标位置函数
    var CaretPos = 0;	// IE Support
    if (document.selection) {
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0')
        CaretPos = ctrl.selectionStart;
    return (CaretPos);
}
//同步md编辑区和行号区和渲染区的滚动距离
editDivElement.onscroll = function () {


    // 滚动条到底部的距离 = 可滚动区域的高度 - 可视区的高度 - 当前页面的滚动条纵坐标位置
    var scrollBottom = this.scrollHeight - this.clientHeight - this.scrollTop;

    var scrollRate = this.scrollTop / this.offsetHeight;

    var top = previewContainerElement.offsetHeight * scrollRate;
    previewContainerElement.scrollTop = top;
    if (scrollBottom == 0) {
        previewContainerElement.scrollTop = previewContainerElement.scrollHeight - previewContainerElement.clientHeight;
    }//当编辑区滚动到最底部，渲染区也滚动到最底部


    mdInputSeqElement.scrollTop = this.scrollTop;
}

//解析标题
function AnalysisMD(textContent) {

    var html = "";
    var tagName = "";
    var isBlockquote = false;
    var isOL = false;
    var isOL2 = false;
    var isUL = false;
    var isUL2 = false;
    var isCodeBlock = false;
    var isTable = false;

    var h4_start = "#### ";
    var h3_start = "### ";
    var h2_start = "## ";
    var h1_start = "# ";

    var blockquoteNest_start = "&gt;&gt;";//嵌套引用 暂不支持
    var blockquote_start = "&gt;";
    var olli_pattern = /^ {0,3}[1-9]*\. /; //有序列表正则表达式
    var ulli_pattern = /^[ ]{0,3}(\* |- |\+ )/; //有序列表正则表达式

    var separator_pattern = /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/;//分隔线正则表达式
    //var separator_pattern1 = /^[\s]*?\*\*\*\**/;//分隔线正则表达式
    //var separator_pattern2 = /^[\s]*?----*/;//分隔线正则表达式
    //var separator_pattern3 = /^[\s]*?____*/;//分隔线正则表达式
    var def_pattern = /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/;

    var table_tag_pattern = /^[ ]{0,3}((\|[ ]*?(?:[:]{0,1}- *){3,}[:]{0,1}[ ]*)+\|){1,}[ | ]{0,}$/;//表格出现的标识

    //textContent = textContent.trimEnd();//将尾部空格去除
    if (textContent.startsWith("```")) {
        //代码块
        isCodeBlock = true;
    }
    else {
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
        else if (textContent.startsWith(blockquote_start)) {
            isBlockquote = true;
            html = textContent.substring(blockquote_start.length, textContent.length);
            tagName = "blockquote";
        }//引用
        else if (olli_pattern.test(textContent)) {
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
        else if (separator_pattern.test(textContent)) {
            //分隔线
            tagName = "hr";
        }
        else if (def_pattern.test(textContent)) {
            //链接
            html = "textContent";
            tagName = "a";
        }
        else if (table_tag_pattern.test(textContent)) {
            //表格
            html = textContent;
            isTable = true;
        }
        else {
            html = textContent;
            tagName = "p";
        }
        html = ExtractEmphasisGrammar(html);
        html = ExtractInnerCode(html);
        html = ExtractLink(html);

    }


    var result = {};
    result.TextContent = textContent;
    result.AnalysisHTML = html;
    result.TagName = tagName;
    result.IsBlockquote = isBlockquote;
    result.IsOL = isOL;
    result.IsOL2 = isOL2;
    result.IsUL = isUL;
    result.IsUL2 = isUL2;
    result.ListInfo = null;
    result.IsCodeBlock = isCodeBlock;
    result.IsTable = isTable;
    result.TableInfo = null;

    return result;
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
                    //    TagName: "",
                    //    LiHtmlList: []
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
//提取链接和图片语法
function ExtractLink(html) {
    //[![沙漠中的[]岩石图片`](/assets/img/shiprock.jpg "Shiprock")](https://markdown.com.cn)
    //| <em>d</em>-[显示](链接 "说明") |[显示d:1](链接1)| "")
    //\[[^[]+?\]\([^\s]*?\s?\)|-*![显示](链接)

    //var v1 = "\[[^\[\]]*\]";
    //var v2 = "\\.";
    //var v3 = "`[^`]*`";
    //var v4 = "[^\[\]\\`]";
    //var _v = "!?\[(" + v1 + "|" + v2 + "|" + v3 + "|" + v4 + ")*?\]"

    var link_pattern = /!?\[(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?\]\(\s*(?:<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*)(?:\s+(?:"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/g;

    //var vv1 = "(<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*)";
    //var pt = /\s*    (?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*/;


    //var vv2 = "[^\s<>\\]";
    //var _vv = "<(?:" + vv1 + " | " + vv2 + ")*>";

    //var vvv1 = "[^\s\x00-\x1f]*";
    //var vvvv1 = "(" + _vv + " | " + vvv1 + ")";

    //var a1 = '\\"?';
    //var a2 = '[^"\\]';
    //var aa = '(?:"+a1+"|"+a2+")*"';

    //var b1 = "'(?:\\'?|[^'\\])*'";
    //var b2 =  "\((?:\\\)?|[^)\\]";
    ////var link_pattern = "\(\s*"+vvvv1+"(?:\s+(""+aa+"|"+b1+"|"+b2+")*\)))?\s*\)/";


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
                return "<img src=\"" + href + "\" title=\"" + title + "\"  alt=\"" + text + "\"/>";
            } else {
                var text = ExtractLink(text);

                return "<a href=\"" + href + "\" title=\"" + title + "\">" + text + "</a>";
            }
        });
    }
    return html;

}
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

    //var strongAndem_startAndEnd = "***";
    //var strong_startAndEnd = "**";
    //var em_startAndEnd = "*";
    //if (textContent.startsWith(strongAndem_startAndEnd) && textContent.endsWith(strongAndem_startAndEnd)) {
    //    //粗体加斜体
    //    html = textContent.substring(strongAndem_startAndEnd.length, textContent.length - strongAndem_startAndEnd.length);
    //    html = ExtractInnerCode(html);
    //    tagName = "strong,em";
    //} else if (textContent.startsWith(strong_startAndEnd) && textContent.endsWith(strong_startAndEnd)) {
    //    //粗体
    //    html = textContent.substring(strong_startAndEnd.length, textContent.length - strong_startAndEnd.length);
    //    html = ExtractInnerCode(html);
    //    tagName = "strong";
    //} else if (textContent.startsWith(em_startAndEnd) && textContent.endsWith(em_startAndEnd)) {
    //    //斜体
    //    html = textContent.substring(em_startAndEnd.length, textContent.length - em_startAndEnd.length);
    //    html = ExtractInnerCode(html);
    //    tagName = "em";
    //}
}
//提取内联代码(对传入的html进行拆解，解析后组合成新的HTML)
function ExtractInnerCode(html) {

    var l_code_pattern = /(``).*(``)/g; //行内代码正则表达式
    var code_pattern = /(`).*?(`)/g; //行内代码正则表达式

    var htmlRegroup = "";
    //(?<=``.*?``^`).*$

    //abc`s`abc``sdsd``dsd
    //大行内代码匹配开始之前的字符串
    var prev_lCodeAarry = html.match(/^.*?(?=``)/);
    var prev_lCode = "";
    if (prev_lCodeAarry != null) {
        prev_lCode = prev_lCodeAarry[0];
        htmlRegroup += ExtractInnerCode_AnalysisDismantleInnerCodeHTML(prev_lCode, l_code_pattern, code_pattern);
    }
    //大行内代码匹配开始几之后的字符串
    var prev_endLCode = html.substring(prev_lCode.length, html.length);
    //大行内代码
    var lCodeAarry = prev_endLCode.match(l_code_pattern);
    var lCode = "";
    if (lCodeAarry != null) {
        lCode = lCodeAarry[0];
        htmlRegroup += ExtractInnerCode_AnalysisDismantleInnerCodeHTML(lCode, l_code_pattern, code_pattern);
    }
    //大行内代码匹配结束之后的字符串
    var end_lCode = prev_endLCode.substring(lCode.length, prev_endLCode.length);
    if (end_lCode != null) {
        htmlRegroup += ExtractInnerCode_AnalysisDismantleInnerCodeHTML(end_lCode, l_code_pattern, code_pattern);
    }

    //var dismantleInnerCodeHTML = DismantleInnerCodeHTML(html, l_code_pattern, code_pattern);
    return htmlRegroup;
}
//根据拆解的html分开进行解析组合成新的html
function ExtractInnerCode_AnalysisDismantleInnerCodeHTML(html, l_code_pattern, code_pattern) {
    var htmlTemp = html;
    htmlTemp = htmlTemp.replace(/<strong><em>/, "***");
    htmlTemp = htmlTemp.replace(/<\/strong><\/em>/, "***");
    htmlTemp = htmlTemp.replace(/<strong>/, "**");
    htmlTemp = htmlTemp.replace(/<\/strong>/, "**");
    htmlTemp = htmlTemp.replace(/<em>/, "*");
    htmlTemp = htmlTemp.replace(/<\/em>/, "*");
    var isPatternSuccess = false;
    if (l_code_pattern.test(htmlTemp)) {
        isPatternSuccess = true;
        htmlTemp = htmlTemp.replace(l_code_pattern, function (l_code_val) {
            var _l_code_val = l_code_val.substring(2, l_code_val.length - 2);
            if (_l_code_val == "") {
                return _l_code_val = "````";
            }
            else {

                return CreatePreviewSectionHTML("code", _l_code_val);
            }
        });
        ////1``41`881`2345678
        ////补充当大行内代码替换完成后还有前后有小行内代码需要替换的情况
        ////41`881`2345678<code>`</code>ssdf<code>sdfjlj</code>asdf
        ////41`881`2345678`````ssdf``sdfjlj``asdf`j`
        //var l_code_prevStr =
        //var l_code_endStr = str.match("/(?<=``).*$/");
        //ExtractInnerCode(l_code_prevStr);
        //ExtractInnerCode(l_code_endStr);
    }
    else if (code_pattern.test(htmlTemp)) {
        isPatternSuccess = true;
        htmlTemp = htmlTemp.replace(code_pattern, function (code_val) {
            var _code_val = code_val.substring(1, code_val.length - 1);
            if (_code_val == "") {
                return _code_val = "``";
            }
            else {
                return CreatePreviewSectionHTML("code", _code_val);
            }
        });
    }
    if (isPatternSuccess) {
        html = htmlTemp;
    }
    return html;
}
//根据标签和内部内容生成预览区域内行块html
function CreatePreviewSectionHTML(tagName, innerHTML) {
    var html = innerHTML;
    if (tagName == "code") {
        //(/(&nbsp;)+/g, ' ');
        html = html.replace(/(\s)/g, "&nbsp;");//.replace("/ /g","&nbsp;"); 
    }//将空格替换为转义字符防止多个空格在html显示为一个


    if (tagName == "" || tagName == null || tagName == undefined) {
    } else if (tagName == "hr") {
        html = "<hr>";
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
editDivElement.oninput = function () {
    InitalEditDivElement();
    SynchronizeEditorAndPreviewScroll();
}
editDivElement.onmouseup = function () {
    InitalEditDivElement();
    SynchronizeEditorAndPreviewScroll();
}
editDivElement.onclick = function () {
    ResetPullMenuAndButtonStatus();
}
var EditorTooBarElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top");
//重置按钮及弹出框状态
function ResetPullMenuAndButtonStatus() {
    //关闭同级下拉菜单
    var menuNodes = document.querySelector("#ToolbarPullDownMenuWrapper").children;
    for (var i = 0; i < menuNodes.length; i++) {
        menuNodes[i].style.display = "none";
    }
    //重置所有按钮下拉class
    var buttonNodes = EditorTooBarElement.querySelectorAll("button");
    for (var i = 0; i < buttonNodes.length; i++) {
        buttonNodes[i].className = buttonNodes[i].className.replace("open", "");
    }

}
//当编辑区编辑最后一个子元素时，编辑区、渲染区和序号区均滚动到最底部
function SynchronizeEditorAndPreviewScroll() {
    var cursorElement = window.getSelection().focusNode.parentElement;//光标所在元素
    var cursorElementParentChildrenElements = cursorElement.parentElement.children;//光标所在元素父级元素的全部子元素
    if (Array.prototype.indexOf.call(cursorElementParentChildrenElements, cursorElement) + 1 == editDivElement.childElementCount) {
        //previewContainerElement.scrollTop = previewContainerElement.scrollHeight - previewContainerElement.clientHeight;

        editDivElement.scrollTop = editDivElement.scrollHeight - editDivElement.clientHeight;
    }//获光标所在元素的index（从0开始计算需要加1） 判断是否 是编辑区最后一个元素

}
//初始化编辑区元素
function InitalEditDivElement() {
    if (editDivElement.getElementsByTagName("div").length <= 0) {
        var textContent = editDivElement.textContent;
        editDivElement.innerHTML = "";
        insertHtmlAtCursor("<div>" + textContent + "</div>");
        set_focus(editDivElement);
    }
}
//插入一个HTML字符串：
function insertHtmlAtCursor(html) {
    var range, node;
    range = window.getSelection().getRangeAt(0);
    node = range.createContextualFragment(html);
    range.insertNode(node);
}
//插入一段文本
function insertTextAtCursor(txt) {
    var sel = window.getSelection();
    var iEnd = sel.anchorOffset;
    var htmldata = sel.anchorNode.data;

    if (htmldata) {
        var finaldata = htmldata.substring(0, iEnd) + txt + htmldata.substring(iEnd);
        sel.anchorNode.textContent = finaldata
    } else {
        sel.anchorNode.textContent = txt
    }
}
//光标移动到最后
function set_focus(el) {
    //	el.focus();
    //创建一个range范围对象
    var range = document.createRange();
    //用于设置 Range，使其包含一个 Node的内容。
    range.selectNodeContents(el);
    //将包含着的这段内容的光标设置到最后去，true 折叠到 Range 的 start 节点，false 折叠到 end 节点。如果省略，则默认为 false .
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);


}



