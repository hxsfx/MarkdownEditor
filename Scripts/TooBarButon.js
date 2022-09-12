var TitleButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(3) > button:nth-child(1)");
var TitleButtonMenuElement = document.querySelector("#js_TitleButtonMenu");
//点击标题按钮
TitleButtonElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();
    CalcPullDownMenuShow(this, TitleButtonMenuElement);
};

var ListButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(5) > button:nth-child(1)");
var ListButtonMenuElement = document.querySelector("#js_ListButtonMenu");
//点击列表按钮
ListButtonElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();
    CalcPullDownMenuShow(this, ListButtonMenuElement);
};
var MoreButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(9) > button:nth-child(3)");
var MoreButtonMenuElement = document.querySelector("#js_MoreButtonMenu");
//点击更多按钮
MoreButtonElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();
    CalcPullDownMenuShow(this, MoreButtonMenuElement);
};
function 处理光标选中后操作(buttonType) {

    if (SelectionInfoJson.Type == "Range") {
    } //有选择文字
    else if (SelectionInfoJson.Type == "Caret") {
        if (buttonType == "h1") {
            var insertText = "# ";
            var oldTextContent = SelectionInfoJson.StartNode.data;
            if (oldTextContent) {
                SelectionInfoJson.StartNode.textContent = oldTextContent.substring(0, SelectionInfoJson.StartAnchorOffset) + insertText + oldTextContent.substring(SelectionInfoJson.StartAnchorOffset);
            }
            else {
                SelectionInfoJson.StartNode.textContent = insertText;

            }
        }
        else if (buttonType == "h2") {
            SelectionInfoJson.Range.insertNode(SelectionInfoJson.Range.createContextualFragment("##&nbsp;"));
        }
        else if (buttonType == "strong") {
            SelectionInfoJson.Range.insertNode(SelectionInfoJson.Range.createContextualFragment("****"));
        }
        //	el.focus();
        //创建一个range范围对象
        var range = document.createRange();
        //用于设置 Range，使其包含一个 Node的内容。
        range.selectNodeContents(SelectionInfoJson.EndNode);
        //将包含着的这段内容的光标设置到最后去，true 折叠到 Range 的 start 节点，false 折叠到 end 节点。如果省略，则默认为 false .
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

    } //插入模式

    //if (startNodeElementIndex == endNodeElementIndex) {
    //    var minAnchorOffset = startAnchorOffset;
    //    if (minAnchorOffset > endAnchorOffset) {
    //    }
    //} //开始和结束是同一行
    //else if (startNodeElementIndex < endNodeElementIndex) {
    //} //开始行在结束行前面
    //else if (startNodeElementIndex > endNodeElementIndex) {
    //}
}

//计算下拉菜单展示情况
function CalcPullDownMenuShow(_this, menuElement) {

    var pos = _this.getBoundingClientRect();
    //关闭同级下拉菜单
    var menuNodes = menuElement.parentNode.children;
    for (var i = 0; i < menuNodes.length; i++) {
        if (menuNodes[i] != menuElement) {
            menuNodes[i].style.display = "none";
        }

    }
    //重置所有按钮下拉class
    var buttonNodes = _this.parentNode.parentNode.querySelectorAll("button");
    for (var i = 0; i < buttonNodes.length; i++) {
        if (buttonNodes[i] != _this) {
            buttonNodes[i].className = buttonNodes[i].className.replace("open", "");
        }
    }
    //展示二级菜单
    if (menuElement.style.display == "none") {

        menuElement.style.display = "block";
        _this.className += " open";
        menuElement.parentElement.style.top = pos.y + _this.offsetHeight + 8 + "px";
        menuElement.parentElement.style.left = pos.x + _this.offsetWidth / 2 - menuElement.parentElement.offsetWidth / 2 + "px";
    }
    else {
        menuElement.style.display = "none";
        _this.className = menuElement.className.replace("open", "");
    }
}


var TitleButtonMenuElement_TitleFirstLevel = TitleButtonMenuElement.children[0];
//点击一级标题
TitleButtonMenuElement_TitleFirstLevel.onclick = function () {
    ButtonStyleFunction("h1");
    ResetPullMenuAndButtonStatus();
    ClearUndo();
}
var TitleButtonMenuElement_TitleSecondLevel = TitleButtonMenuElement.children[1];
//点击二级标题
TitleButtonMenuElement_TitleSecondLevel.onclick = function () {
    ButtonStyleFunction("h2");
    ResetPullMenuAndButtonStatus();
    ClearUndo();
}
var TitleButtonMenuElement_TitleThirdevel = TitleButtonMenuElement.children[2];
//点击三级标题
TitleButtonMenuElement_TitleThirdevel.onclick = function () {
    ButtonStyleFunction("h3");
    ResetPullMenuAndButtonStatus();
    ClearUndo();
}
var TitleButtonMenuElement_TitleFourthLevel = TitleButtonMenuElement.children[3];
//点击四级标题
TitleButtonMenuElement_TitleFourthLevel.onclick = function () {
    ButtonStyleFunction("h4");
    ResetPullMenuAndButtonStatus();
    ClearUndo();
}

var ListButtonMenuElement_ULButton = ListButtonMenuElement.children[0];
//点击无序列表
ListButtonMenuElement_ULButton.onclick = function () {
    ButtonStyleFunction("ul");
    ResetPullMenuAndButtonStatus();
    ClearUndo();
}
var ListButtonMenuElement_OLButton = ListButtonMenuElement.children[1];
//点击有序列表
ListButtonMenuElement_OLButton.onclick = function () {
    ButtonStyleFunction("ol");
    ResetPullMenuAndButtonStatus();
    ClearUndo();
}

var StrongButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(3) > button:nth-child(2)");
//点击加粗按钮
StrongButtonElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();
    ButtonStyleFunction("strong");
    ClearUndo();
}

var EmButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(3) > button:nth-child(3)");
//点击斜体按钮
EmButtonElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();

    ButtonStyleFunction("em");
    ClearUndo();
}


var BlockquoteElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(5) > button:nth-child(2)");
//点击引用按钮
BlockquoteElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();

    ButtonStyleFunction("blockquote");
    ClearUndo();
}
var SeparatorElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(5) > button:nth-child(3)");
//点击分割线按钮
SeparatorElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();

    ButtonStyleFunction("separator");
    ClearUndo();
}
var CodeBlockElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(5) > button:nth-child(4)");
//点击代码块按钮
CodeBlockElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();

    ButtonStyleFunction("codeBlock");
    ClearUndo();
}
//按钮样式功能
function ButtonStyleFunction(buttonType) {
    if (SelectionInfoJson != null && SelectionInfoJson.Type != "None") {
        var insertStartContext = "";
        var insertEndContext = "";
        var isCodeBlockSpetial = false;
        var isULSpetial = false;
        var isOLSpetial = false;
        switch (buttonType) {
            case "em":
                insertStartContext = "*";
                insertEndContext = "*";
                break;
            case "strong":
                insertStartContext = "**";
                insertEndContext = "**";
                break;
            case "blockquote":
                insertStartContext = ">";
                break;
            case "separator":
                insertStartContext = "---";
                break;
            case "codeBlock":
                insertStartContext = "```";
                insertEndContext = "```";
                isCodeBlockSpetial = true;
                break;
            case "h1":
                insertStartContext = "# ";
                break;
            case "h2":
                insertStartContext = "## ";
                break;
            case "h3":
                insertStartContext = "### ";
                break;
            case "h4":
                insertStartContext = "#### ";
                break;
            case "ul":
                insertStartContext = "- ";
                isULSpetial = true;
                break;
            case "ol":
                insertStartContext = "1. ";
                isOLSpetial = true;
                break;
        }

        var setStartNode = { node: null, index: null };
        var setEndNode = { node: null, index: null };
        if (SelectionInfoJson.StartNodeElementIndex == SelectionInfoJson.EndNodeElementIndex) {
            var startDivElement = editDivElement.children[SelectionInfoJson.StartNodeElementIndex];
            var startCharIndex = SelectionInfoJson.StartAnchorOffset;
            var endCharIndex = SelectionInfoJson.EndAnchorOffset;
            if (startCharIndex > endCharIndex) {
                startCharIndex = SelectionInfoJson.EndAnchorOffset;
                endCharIndex = SelectionInfoJson.StartAnchorOffset;
            } //当选择顺序从后往前时，需要将选择顺序重新排列
            if (startDivElement.textContent == "") {
                if (isCodeBlockSpetial) {
                    startDivElement.innerHTML = insertStartContext.replace(/\s/g, "&nbsp;");
                    // 创建中间空节点
                    let middleElement = document.createElement('div');
                    middleElement.innerHTML = "";
                    editDivElement.insertBefore(middleElement, startDivElement.nextElementSibling);
                    // 创建尾部语法节点
                    let suffixElement = document.createElement('div');
                    suffixElement.innerHTML = insertEndContext.replace(/\s/g, "&nbsp;");
                    editDivElement.insertBefore(suffixElement, middleElement.nextElementSibling);

                    setStartNode.node = middleElement;//.childNodes[0];
                    setEndNode.node = setStartNode.node;
                    setStartNode.index = 0;
                    setEndNode.index = setStartNode.index;
                }
                else {
                    startDivElement.innerHTML = insertStartContext.replace(/\s/g, "&nbsp;") + insertEndContext.replace(/\s/g, "&nbsp;");
                    setStartNode.node = startDivElement.childNodes[0];
                    setEndNode.node = startDivElement.childNodes[0];

                    setStartNode.index = startCharIndex + insertStartContext.length;
                    setEndNode.index = endCharIndex + insertEndContext.length;
                    if (insertEndContext == "") {
                        setStartNode.index = insertStartContext.length;
                        setEndNode.index = setStartNode.index;
                    }//语法没有结尾标识，需要将光标移动到前置语法结尾
                }
            }
            else {
                var prefix = startDivElement.textContent.substring(0, startCharIndex);
                var middle = startDivElement.textContent.substring(startCharIndex, endCharIndex);
                var suffix = startDivElement.textContent.substring(endCharIndex);
                if (isCodeBlockSpetial) {

                    startDivElement.innerHTML = prefix;
                    // 创建前部语法节点
                    let prefixElement = document.createElement('div');
                    prefixElement.innerHTML = insertStartContext.replace(/\s/g, "&nbsp;");
                    editDivElement.insertBefore(prefixElement, startDivElement.nextElementSibling);
                    // 创建截取包裹内容节点
                    let middleElement = document.createElement('div');
                    middleElement.innerHTML = middle;
                    editDivElement.insertBefore(middleElement, prefixElement.nextElementSibling);
                    // 创建尾部语法节点
                    let suffixElement = document.createElement('div');
                    suffixElement.innerHTML = insertEndContext.replace(/\s/g, "&nbsp;");
                    editDivElement.insertBefore(suffixElement, middleElement.nextElementSibling);
                    // 创建尾部内容节点
                    let endElement = document.createElement('div');
                    endElement.innerHTML = suffix;
                    editDivElement.insertBefore(endElement, suffixElement.nextElementSibling);

                    setStartNode.node = middleElement.childNodes[0];
                    setEndNode.node = setStartNode.node;
                    setStartNode.index = 0;
                    setEndNode.index = middle.length;

                }
                else {
                    startDivElement.innerHTML = prefix + insertStartContext.replace(/\s/g, "&nbsp;") + middle + insertEndContext.replace(/\s/g, "&nbsp;") + suffix;
                    setStartNode.index = startCharIndex;
                    setEndNode.index = endCharIndex + insertStartContext.length + insertEndContext.length;

                    setStartNode.node = startDivElement.childNodes[0];
                    setEndNode.node = startDivElement.childNodes[0];
                }

            }
        } //开始和结束是一行
        else {
            var startNodeElementIndex = SelectionInfoJson.StartNodeElementIndex;
            var endNodeElementIndex = SelectionInfoJson.EndNodeElementIndex;
            var startCharIndex = SelectionInfoJson.StartAnchorOffset;
            var endCharIndex = SelectionInfoJson.EndAnchorOffset;
            if (startNodeElementIndex > endNodeElementIndex) {
                startNodeElementIndex = SelectionInfoJson.EndNodeElementIndex;
                endNodeElementIndex = SelectionInfoJson.StartNodeElementIndex;
                startCharIndex = SelectionInfoJson.EndAnchorOffset;
                endCharIndex = SelectionInfoJson.StartAnchorOffset;
            } //当选择顺序从后往前时，需要将选择顺序重新排列
            var divElements = editDivElement.children;
            if (isCodeBlockSpetial) {
                var setStartElement = null;
                var setEndNodeElement = null;
                for (var i = divElements.length - 1; i >= 0; i--) {

                    if (startNodeElementIndex <= i && i <= endNodeElementIndex) {
                        if (i == startNodeElementIndex) {
                            var prefix = divElements[i].textContent.substring(0, startCharIndex);
                            var suffix = divElements[i].textContent.substring(startCharIndex, divElements[i].textContent.length);
                            if (prefix == "") {

                                divElements[i].innerHTML = insertStartContext.replace(/\s/g, "&nbsp;");
                                setStartElement = divElements[i];
                                let ele = document.createElement('div');
                                ele.innerHTML = suffix;
                                editDivElement.insertBefore(ele, divElements[i].nextElementSibling);
                            } else {
                                divElements[i].innerHTML = prefix;

                                let ele1 = document.createElement('div');
                                ele1.innerHTML = insertStartContext.replace(/\s/g, "&nbsp;");
                                editDivElement.insertBefore(ele1, divElements[i].nextElementSibling);
                                setStartElement = ele1;

                                let ele2 = document.createElement('div');
                                ele2.innerHTML = suffix;
                                editDivElement.insertBefore(ele2, ele1.nextElementSibling);
                            }

                        } else if (i == endNodeElementIndex) {

                            var prefix = divElements[i].textContent.substring(0, endCharIndex);
                            var suffix = divElements[i].textContent.substring(endCharIndex, divElements[i].innerHTML.length);
                            if (suffix == "") {
                                let ele = document.createElement('div');
                                ele.innerHTML = insertEndContext.replace(/\s/g, "&nbsp;");
                                editDivElement.insertBefore(ele, divElements[i].nextElementSibling);

                                setEndNodeElement = ele;
                            } else {


                                divElements[i].innerHTML = prefix;

                                let ele1 = document.createElement('div');
                                ele1.innerHTML = insertEndContext.replace(/\s/g, "&nbsp;");
                                editDivElement.insertBefore(ele1, divElements[i].nextElementSibling);
                                setEndNodeElement = ele1;

                                let ele2 = document.createElement('div');
                                ele2.innerHTML = suffix;
                                editDivElement.insertBefore(ele2, ele1.nextElementSibling);
                            }

                        }
                    }
                }
                setStartNode.index = 0;
                setEndNode.index = insertEndContext.length;
                setStartNode.node = setStartElement.childNodes[0];
                setEndNode.node = setEndNodeElement.childNodes[0];
            }
            else {
                for (var i = 0; i < divElements.length; i++) {
                    if (startNodeElementIndex <= i && i <= endNodeElementIndex) {
                        var _innerHTML = "";
                        if (i == startNodeElementIndex) {
                            _innerHTML = divElements[i].textContent.substring(0, startCharIndex) + insertStartContext.replace(/\s/g, "&nbsp;") + divElements[i].textContent.substring(startCharIndex, divElements[i].textContent.length) + insertEndContext;
                        }
                        else if (i == endNodeElementIndex) {
                            if (isOLSpetial) {
                                insertStartContext = insertStartContext.replace(/\d+/, function (val) {
                                    val++;
                                    return val.toString();
                                });
                            }//有序列表前面的数字需要根据情况进行递增
                            _innerHTML = insertStartContext.replace(/\s/g, "&nbsp;") + divElements[i].textContent.substring(0, endCharIndex) + insertEndContext.replace(/\s/g, "&nbsp;") + divElements[i].textContent.substring(endCharIndex, divElements[i].innerHTML.length);
                        }
                        else {
                            if (divElements[i].textContent != "") {
                                insertStartContext = insertStartContext.replace(/\d+/, function (val) {
                                    val++;
                                    return val.toString();
                                });
                                _innerHTML += insertStartContext.replace(/\s/g, "&nbsp;") + divElements[i].innerHTML + insertEndContext.replace(/\s/g, "&nbsp;");
                            }
                        }
                        divElements[i].innerHTML = _innerHTML;
                    }
                }
                setStartNode.index = startCharIndex;
                setEndNode.index = endCharIndex + insertStartContext.length + insertEndContext.length;
                setStartNode.node = divElements[startNodeElementIndex].childNodes[0];
                setEndNode.node = divElements[endNodeElementIndex].childNodes[0];
            }

        }

        SetRangeSelectAndCourse(setStartNode, setEndNode);
    }

}

//设置文本选择区域和光标位置
function SetRangeSelectAndCourse(setStartNode, setEndNode) {
    //setStartNode = {
    //    node: divElements[startNodeElementIndex].childNodes[0],
    //    index: startCharIndex
    //};
    //setEndNode = {
    //    node: divElements[endNodeElementIndex].childNodes[0],
    //    index: endCharIndex + 4
    //};
    if (setStartNode != null && setEndNode != null) {
        //创建一个range范围对象
        var range = document.createRange();
        range.setStart(setStartNode.node, setStartNode.index);
        range.setEnd(setEndNode.node, setEndNode.index);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        //设置完就调用渲染
        Preview();
    }
}

//记录光标位置（含选中内容信息）
var SelectionInfoJson = null;
function RecordSelectionInfo() {
    var selectionInfoJson = {};
    var selectionInfo = window.getSelection();
    selectionInfoJson.Type = selectionInfo.type;

    if (selectionInfoJson.Type != "None") {
        var isStartInEditor = true;
        var startNodeParentNode = selectionInfo.anchorNode;
        while (editDivElement.compareDocumentPosition(startNodeParentNode) != 20) {
            startNodeParentNode = startNodeParentNode.parentElement;
            if (startNodeParentNode.tagName.toLowerCase() == "body") {
                isStartInEditor = false;
                break;
            }
        }
        var isEndInEditor = true;
        var endNodeParentNode = selectionInfo.focusNode;
        while (editDivElement.compareDocumentPosition(endNodeParentNode) != 20) {
            endNodeParentNode = endNodeParentNode.parentElement;
            if (endNodeParentNode.tagName.toLowerCase() == "body") {
                isEndInEditor = false;
                break;
            }
        }
        if (isStartInEditor && isEndInEditor) {
            selectionInfoJson.Range = selectionInfo.getRangeAt(0);
            selectionInfoJson.StartNode = selectionInfo.anchorNode;
            console.log(selectionInfoJson.StartNode.nodeName);
            if (selectionInfoJson.StartNode.nodeName == "DIV") {
                selectionInfoJson.StartNode = selectionInfoJson.StartNode.childNodes[0];
            }
            selectionInfoJson.StartAnchorOffset = selectionInfo.anchorOffset;
            selectionInfoJson.EndNode = selectionInfo.focusNode;
            if (selectionInfoJson.EndNode.nodeName == "DIV") {
                selectionInfoJson.EndNode = selectionInfoJson.EndNode.childNodes[0];
            }
            selectionInfoJson.EndAnchorOffset = selectionInfo.focusOffset;

            //document.querySelector("#MenuLeft2").textContent = ("开始节点：" + editDivElement.compareDocumentPosition(selectionInfoJson.StartNode.parentElement.parentElement) + "，结束节点" + editDivElement.compareDocumentPosition(selectionInfoJson.EndNode));



            var startNodeElement = selectionInfoJson.StartNode.parentElement; //选取开始元素
            var endNodeElement = selectionInfoJson.EndNode.parentElement; //选取结束元素


            var cursorElementParentChildrenElements = startNodeElement.parentElement.children; //选取开始元素父级元素的全部子元素
            if (startNodeElement.className == editDivElement.className) {
                cursorElementParentChildrenElements = startNodeElement.children;
                var startNodeElement = selectionInfoJson.StartNode; //选取开始元素
                var endNodeElement = selectionInfoJson.EndNode; //选取结束元素
            }
            selectionInfoJson.StartNodeElementIndex = Array.prototype.indexOf.call(cursorElementParentChildrenElements, startNodeElement);
            selectionInfoJson.EndNodeElementIndex = Array.prototype.indexOf.call(cursorElementParentChildrenElements, endNodeElement);
        } else {
            selectionInfoJson = null;
        }
    }
    return selectionInfoJson;
}



var LinkButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(7) > button:nth-child(1)");
var LinkTitleElement = document.querySelector("#AddLinkToolbarPopupMenu > div.popupMenuBody > input[type=text]:nth-child(2)");
var LinkAddressElement = document.querySelector("#AddLinkToolbarPopupMenu > div.popupMenuBody > input[type=text]:nth-child(5)");
//点击链接按钮
LinkButtonElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();
    ButtonToPopup("AddLinkToolbarPopupMenu");

    LinkTitleElement.value = "";
    LinkAddressElement.value = "";
}
var TableButtonELement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(7) > button:nth-child(2)");
var TableRowCountELement = document.querySelector("#AddTableToolbarPopupMenu > div.popupMenuBody > input[type=number]:nth-child(3)");
var TableColumnCountELement = document.querySelector("#AddTableToolbarPopupMenu > div.popupMenuBody > input[type=number]:nth-child(5)");
var TableTextCenterELement = document.querySelector("#AddTableToolbarPopupMenu > div.popupMenuBody > button.alignmentBtn.alignmentCenter.selected");
var TableTextLeftELement = document.querySelector("#AddTableToolbarPopupMenu > div.popupMenuBody > button.alignmentBtn.alignmentLeft");
var TableTextRightELement = document.querySelector("#AddTableToolbarPopupMenu > div.popupMenuBody > button.alignmentBtn.alignmentRight");
//点击表格按钮
TableButtonELement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();
    ButtonToPopup("AddTableToolbarPopupMenu");
    TableRowCountELement.value = "2";
    TableColumnCountELement.value = "2";
    if (TableTextCenterELement.className.indexOf("selected") < 0) {
        TableTextCenterELement.className += " selected";
    }
    TableTextLeftELement.className = TableTextLeftELement.className.replace("selected", "");
    TableTextRightELement.className = TableTextLeftELement.className.replace("selected", "");
}
var PicButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(7) > button:nth-child(3)");
//点击图片按钮
var PicInputElement = document.querySelector("#AddPic > input[type=file]");
var PicSelectInfoStrElement = document.querySelector("#AddPicToolbarPopupMenu > div.popupMenuBody > p");
PicButtonElement.onclick = function () {
    SelectionInfoJson = RecordSelectionInfo();
    ButtonToPopup("AddPicToolbarPopupMenu");
    PicInputElement.value = "";
    PicSelectInfoStrElement.textContent = "";
}
var ImportDocumentButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(9) > button:nth-child(1)")
//点击导入按钮
ImportDocumentButtonElement.onclick = function () {
    ButtonToPopup("ImportDocumentToolbarPopupMenu");
}
var ExportDocumentButtonElement = document.querySelector("#hxsfx_MarkdownEditor > div.toolbar-top > div:nth-child(9) > button:nth-child(2)")
//点击导出按钮
ExportDocumentButtonElement.onclick = function () {
    ButtonToPopup("ExportDocumentToolbarPopupMenu");
}

var PopupMenuCloseButtonElement = document.querySelectorAll("#ToolbarPopupMenuWrapper>div.toolbarPopupMenu button.close");
var PopupMenuCanceleButtonElement = document.querySelectorAll("#ToolbarPopupMenuWrapper>div.toolbarPopupMenu button.cancel");
//初始化点击弹出框上的关闭按钮点击事件
PopupMenuCloseButtonElement.forEach(item => {
    // 建立监听
    //Click_PopupMenuCloseButton(item.parentElement.parentElement);
    item.onclick = function () {
        Click_PopupMenuCloseButton(this.parentElement.parentElement);
    };
});
//初始化点击弹出框上的取消按钮点击事件
PopupMenuCanceleButtonElement.forEach(item => {
    // 建立监听
    //Click_PopupMenuCloseButton(item.parentElement.parentElement);
    item.onclick = function () {
        Click_PopupMenuCloseButton(this.parentElement.parentElement);
    };
});

//点击按钮弹出对话框函数
function ButtonToPopup(popupId) {
    ResetPullMenuAndButtonStatus();
    var popupCoverElement = document.querySelector("#PopupCover");
    popupCoverElement.style.width = document.documentElement.clientWidth + "px";
    popupCoverElement.style.height = document.documentElement.clientHeight + "px";
    popupCoverElement.style.display = "block";
    var popupElement = document.getElementById(popupId);
    popupElement.style.display = "block";

    popupElement.parentElement.style.top = (document.documentElement.scrollTop + (document.documentElement.clientHeight - popupElement.offsetHeight) / 3) + "px";
    popupElement.parentElement.style.left = (document.documentElement.scrollLeft + (document.documentElement.clientWidth - popupElement.offsetWidth) / 2) + "px";
}

//初始化点击弹出框上的关闭按钮点击事件对应的函数
function Click_PopupMenuCloseButton(_popupElement) {
    _popupElement.style.display = "none";
    document.getElementById("PopupCover").style.display = "none";
}

var AddLinkButtonElement = document.getElementById("AddLink");
//点击链接按钮
AddLinkButtonElement.onclick = function () {
    //SelectionInfoJson = RecordSelectionInfo();
    var PopupElement = this.parentElement.parentElement;
    var linkTitle = LinkTitleElement.value;
    var linkAddress = LinkAddressElement.value;
    CreateLinkByButton(linkTitle, linkAddress, PopupElement, false);
    ClearUndo();
}

var AddTableButtonElement = document.getElementById("AddTable");
//点击表格按钮
AddTableButtonElement.onclick = function () {
    //SelectionInfoJson = RecordSelectionInfo();
    var tableRowCount = TableRowCountELement.value;
    var tableColumnCount = TableColumnCountELement.value;



    var tableTextAlign = "";
    if (TableTextCenterELement.className.indexOf("selected") > 0) {
        tableTextAlign = ":---:";
    }
    else if (TableTextLeftELement.className.indexOf("selected") > 0) {
        tableTextAlign = ":---";
    }
    else if (TableTextRightELement.className.indexOf("selected") > 0) {
        tableTextAlign = "---:";
    }
    var tableRowElement = new Array();
    for (var i = 0; i < parseInt(tableRowCount) + 2; i++) {
        var _rowInnerHTML = "|";
        for (var j = 0; j < parseInt(tableColumnCount); j++) {
            if (i == 1) {
                _rowInnerHTML += tableTextAlign + "|";
            } else {
                _rowInnerHTML += " |";
            }
        }
        var ele = document.createElement("div");
        ele.innerHTML = _rowInnerHTML;
        tableRowElement.push(ele);
    }

    var setStartNode = {};
    var setEndNode = {};
    if (SelectionInfoJson == null || SelectionInfoJson.Type == "None") {

        for (var i = 0; i < tableRowElement.length; i++) {
            editDivElement.appendChild(tableRowElement[i]);
        }
        setStartNode = {
            node: tableRowElement[0].childNodes[0],
            index: 0
        }
        setEndNode = {
            node: tableRowElement[tableRowElement.length - 1].childNodes[0],
            index: tableRowElement[tableRowElement.length - 1].innerHTML.length
        }
        editDivElement.scrollTop = editDivElement.scrollHeight - editDivElement.clientHeight;

    } else {

        var endDivElement = editDivElement.children[SelectionInfoJson.EndNodeElementIndex];
        if (endDivElement.textContent == "") {
            endDivElement.innerHTML = tableRowElement[0].innerHTML;

            for (var i = tableRowElement.length - 1; i > 0; i--) {
                editDivElement.insertBefore(tableRowElement[i], endDivElement.nextElementSibling);
            }
            setStartNode = {
                node: endDivElement.childNodes[0],
                index: 0
            }
            setEndNode = {
                node: tableRowElement[tableRowElement.length - 1].childNodes[0],
                index: tableRowElement[tableRowElement.length - 1].innerHTML.length
            }

        }//选择末行为空
        else {
            for (var i = tableRowElement.length - 1; i >= 0; i--) {
                editDivElement.insertBefore(tableRowElement[i], endDivElement.nextElementSibling);
            }
            setStartNode = {
                node: tableRowElement[0].childNodes[0],
                index: 0
            }
            setEndNode = {
                node: tableRowElement[tableRowElement.length - 1].childNodes[0],
                index: tableRowElement[tableRowElement.length - 1].innerHTML.length
            }
        }
    }
    SetRangeSelectAndCourse(setStartNode, setEndNode);

    Click_PopupMenuCloseButton(this.parentElement.parentElement);
    ClearUndo();
}

//图片选择监听事件
PicInputElement.onchange = function () {
    //if (this.value.indexOf("\\Images\\") < 0) {
    //    PicSelectInfoStrElement.textContent = "【图片路径错误，请看下方提示。】" + this.value;
    //} else {
    //    PicSelectInfoStrElement.textContent = this.value;
    //}
    PicSelectInfoStrElement.textContent = this.value;
    var picFileName = PicSelectInfoStrElement.textContent.substring(PicSelectInfoStrElement.textContent.lastIndexOf("\\") + 1);
    var PopupElement = this.parentElement.parentElement.parentElement.parentElement;
    CreateLinkByButton(picFileName, "Images\\" + picFileName, PopupElement, true)
    console.log(picFileName);
    ClearUndo();
}

var HelpeButtonElement = MoreButtonMenuElement.children[0];
//点击帮助文档
HelpeButtonElement.onclick = function () {
    ButtonToPopup("HelpPopupMenu");
}

//根据上方按钮功能生成链接（文本链接和图片链接）
function CreateLinkByButton(linkTitle, linkAddress, PopupElement, isPic) {
    if (isPic === undefined || isPic == null) {
        isPic = false;
    }
    else if (isPic == true) {
        isPic = true;
    }
    else if (isPic == false) {
        isPic = false;
    }
    else {
        isPic = false;
    }
    var setStartNode = {};
    var setEndNode = {};
    if (SelectionInfoJson == null || SelectionInfoJson.Type == "None") {
        var ele = document.createElement("div");
        ele.innerHTML = (isPic ? "!" : "") + "[" + linkTitle + "](" + linkAddress + " \"" + linkTitle + "\")";
        editDivElement.appendChild(ele);
        setStartNode = {
            node: ele.childNodes[0],
            index: 0
        };//ffmpeg -ss 00:00 -t 14 -i "C:/Users/Administrator/Desktop/a/标题语法.mp4" -r 25 "C:/Users/Administrator/Desktop/a/demo.gif"
        setEndNode = {
            node: ele.childNodes[0],
            index: ele.innerHTML.length
        };
        editDivElement.scrollTop = editDivElement.scrollHeight - editDivElement.clientHeight;
    }
    else {
        var endDivElement = editDivElement.children[SelectionInfoJson.EndNodeElementIndex];
        var prefix = endDivElement.textContent.substring(0, SelectionInfoJson.EndAnchorOffset);
        var suffix = endDivElement.textContent.substring(SelectionInfoJson.EndAnchorOffset);
        var text = (isPic ? "!" : "") + "[" + linkTitle + "](" + linkAddress + " \"" + linkTitle + "\")";
        endDivElement.innerHTML = prefix + text.replace(/\s/g, "&nbsp;") + suffix;
        setStartNode = {
            node: endDivElement.childNodes[0],
            index: SelectionInfoJson.EndAnchorOffset
        };
        setEndNode = {
            node: endDivElement.childNodes[0],
            index: SelectionInfoJson.EndAnchorOffset + text.length
        };
    }
    SetRangeSelectAndCourse(setStartNode, setEndNode);
    Click_PopupMenuCloseButton(PopupElement);
}


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
var ImportDocumentInputElement = document.querySelector("#ImportDocument > input[type=file]");
//点击导入按钮
ImportDocumentInputElement.onchange = function () {

    ClearUndo();
    Click_PopupMenuCloseButton(this.parentElement.parentElement.parentElement);

    var file = this.files[0];

    ReadUploadFile(file);//"gb2312");//发起异步请求


    // readAsArrayBuffer(file): void 异步按字节读取文件内容，结果用ArrayBuffer对象表示
    // readAsBinaryString(file): void 异步按字节读取文件内容，结果为文件的二进制串
    // readAsDataURL(file): void 异步读取文件内容，结果用data: url的字符串形式表示
    // readAsText(file, encoding): void 异步按字符读取文件内容，结果用字符串形式表示
}
//读取上传的文件至编辑区
function ReadUploadFile(file) {
    var fileReader = new FileReader();
    fileReader.onload = (e) => {
        try {
            var isUTF8 = false;
            var data = e.target.result;
            if (data.indexOf("�") === -1) {
                isUTF8 = true;
                var _innerHTML = "";
                data.replace(/(\r\n)/g, "\n").split("\n").forEach((item) => {

                    _innerHTML += CreatePreviewSectionHTML("div", HtmlEncode( item));
                });
                editDivElement.innerHTML = _innerHTML;
                Preview();
            } //判断是否为utf-8
            if (!isUTF8) {
                fileReader = new FileReader();
                fileReader.onload = (e) => {
                    try {
                        var data = e.target.result;
                        var _innerHTML = "";
                        data.split("\r\n").forEach((item) => {
                            _innerHTML += CreatePreviewSectionHTML("div", HtmlEncode(item));
                        });
                        editDivElement.innerHTML = _innerHTML;
                        Preview();
                    }
                    catch (ex) {
                        console.log('出错了');
                        alert(ex.message);
                        return false;
                    }
                };
                fileReader.readAsText(file, "gb2312"); //发起异步请求
            }
            ArticleTitleInputElement.value = file.name.substring(0, file.name.lastIndexOf('.'));
        }
        catch (ex) {
            console.log('出错了');
            alert(ex.message);
            return false;
        }
    };
    fileReader.readAsText(file, "utf-8");
}
//HTML编码
function HtmlEncode(html) {
    // 创建一个元素容器
    var temElement = document.createElement('div');
    // 把需要编码的字符串赋值给该元素的innerText(ie支持)或者textContent(火狐、谷歌等) 
    temElement.textContent = html
    var output = temElement.innerHTML;
    temElement = null;
    return output;
}
// 此处定义一个drop容器(省略),并取到该元素;
editDivElement.addEventListener("dragenter", function (e) {
    e.stopPropagation();
    e.preventDefault();
}, false);
editDivElement.addEventListener("dragover", function (e) {
    e.stopPropagation();
    e.preventDefault();
}, false);
editDivElement.addEventListener("drop", function (e) {
    // 当文件拖拽到dropBox区域时,可以在该事件取到files
    const files = e.dataTransfer.files;
    ReadUploadFile(files[0]);
}, false);


var ExportMDDocumentElement = document.querySelector("#ExportMDDocument");
var ArticleTitleInputElement = document.querySelector("#hxsfx_MarkdownEditor > div.articleTitleWrapper > input");
//点击md导出
ExportMDDocumentElement.onclick = function () {
    var data = "";
    var divElement = editDivElement.children;
    for (var i = 0; i < divElement.length; i++) {
        data += divElement[i].textContent + "\r\n";
    }
    exportRaw("md-" + ArticleTitleInputElement.value + ".md", data);
}
var ExportHTMLDocumentElement = document.querySelector("#ExportHTMLDocument")
//点击html导出
ExportHTMLDocumentElement.onclick = function () {
    exportRaw("html-" + ArticleTitleInputElement.value + ".html", previewContainerElement.innerHTML.trim());
}

function exportRaw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fakeClick(save_link);
}
function fakeClick(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    obj.dispatchEvent(ev);
}