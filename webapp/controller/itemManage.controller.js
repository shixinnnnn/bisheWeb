sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"./BaseController",
	"sap/ui/core/Fragment"
], function (Controller, MessageToast,JSONModel,BaseController,Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.itemManage", {
		onInit:async function(){
            let that = this;
            jQuery.get({     //save data local JSON file
                type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/getInspectionItem",
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"item");
                },
                datatype: "json"
            })
		},

		onSearch:function(){

		},
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		_showObject : function (oItem) {
			this.getRouter().navTo("appList", {
				groupId: oItem.getBindingContext("cdm").getProperty("identification").id
			});
		},
        searchChange:function(event){
            this.searchString = encodeURIComponent(event.mParameters.newValue);
        },
        freesearch:function(){
            let that = this;
			jQuery.get({     //save data local JSON file
                type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/getSearchedItem",
                headers:{
                    itemsearch:this.searchString
                },
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"item");
                },
                datatype: "json"
            })
        },
		onAdd:function(){
			if (!this._pNewItemLoaded) {
				this._pNewItemLoaded = sap.ui.core.Fragment.load({
					name: "sap.ui.demo.toolpageapp.view.itemAdd",
					id: "sap.ui.demo.toolpageapp.view.itemAdd",
					controller: this
				});
			}
			this._pNewItemLoaded.then(function (oDialog) {
				this._oAddItemDialog = oDialog;
				this.getView().addDependent(this._oAddItemDialog);
				oDialog.open();
			}.bind(this));
		},
        foreseeAddPic:function(){
            let picUrl = Fragment.byId("sap.ui.demo.toolpageapp.view.itemAdd","picture").getValue();
            Fragment.byId("sap.ui.demo.toolpageapp.view.itemAdd","foresawPic").setSrc(picUrl);
        },
        foreseeEditPic:function(){
            let picUrl = Fragment.byId("sap.ui.demo.toolpageapp.view.itemEdit","picture").getValue();
            Fragment.byId("sap.ui.demo.toolpageapp.view.itemEdit","foresawPic").setSrc(picUrl);
        },
		onSaveAdd:async function(){
			var itemName = Fragment.byId("sap.ui.demo.toolpageapp.view.itemAdd","itemName").getValue();
            var price = Fragment.byId("sap.ui.demo.toolpageapp.view.itemAdd","price").getValue();
            var result = Fragment.byId("sap.ui.demo.toolpageapp.view.itemAdd","result").getValue();
            var picture = Fragment.byId("sap.ui.demo.toolpageapp.view.itemAdd","picture").getValue();
            var description = Fragment.byId("sap.ui.demo.toolpageapp.view.itemAdd","description").getValue();
			if(!itemName || !price || !result || !picture || !description){
				MessageToast.show("请输入完整信息!");
				return;
			}
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/addItem",
                headers:{
                    itemname:encodeURIComponent(itemName),
                    price:price,
                    result:encodeURIComponent(result),
                    picture:picture,
                    description:encodeURIComponent(description)
                },
                success:function(res){
                    MessageToast.show("添加成功");
                    that._oAddItemDialog.close();
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"item");
                },
                datatype: "json"
            })
		},
		onCloseAddDialog:function(){
			this._oAddItemDialog.close();
		},
		onDelete:async function(){
			var oSelectedItems,DeletedItems = [];
			var oItem;
			var DeletedItem;
			oSelectedItems = this.byId("table").getSelectedItems();
			if(oSelectedItems.length){
				for(let i=0;i<oSelectedItems.length;i++){
					oItem = oSelectedItems[i];
					DeletedItem=oItem.getBindingContext("item").getProperty("itemID");
					DeletedItems.push(DeletedItem);
				}				
			}else{
				MessageToast.show("请至少选择一项!");
				return;
			}
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/deleteItem",
                headers:{
                    itemid:DeletedItems
                },
                success:function(res){
                    MessageToast.show("删除成功");
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"item");
                },
                datatype: "json"
            })
		},
		onEdit:function(){
			var oSelectedItem = this.byId("table").getSelectedItems();			
			if(oSelectedItem.length>1){
				MessageToast.show("您只能选择一项!");
				return;
			}
			if(oSelectedItem.length==0){
				MessageToast.show("请至少选择一项!");
				return;
			}
			this.editItemID = oSelectedItem[0].getBindingContext("item").getProperty("itemID");
            let items = this.getModel("item").oData;
            let that = this;
            let oModel = new JSONModel(items.find(function(item){
                if(item.itemID == that.editItemID){
                    return item;
                }
            }));
            this.getView().setModel(oModel,"editItem")
            if (!this._pEditItemLoaded) {
				this._pEditItemLoaded = sap.ui.core.Fragment.load({
					name: "sap.ui.demo.toolpageapp.view.itemEdit",
					id: "sap.ui.demo.toolpageapp.view.itemEdit",
					controller: this
				});
			}
			this._pEditItemLoaded.then(function (oDialog) {
				this._oEditItemDialog = oDialog;
				this.getView().addDependent(this._oEditItemDialog);
				oDialog.open();
			}.bind(this));
			
		},
		onCloseEditDialog:function(){
			this._oEditItemDialog.close();
		},
		onSaveEdit:async function(){
			var itemName = Fragment.byId("sap.ui.demo.toolpageapp.view.itemEdit","itemName").getValue();
            var price = Fragment.byId("sap.ui.demo.toolpageapp.view.itemEdit","price").getValue();
            var result = Fragment.byId("sap.ui.demo.toolpageapp.view.itemEdit","result").getValue();
            var picture = Fragment.byId("sap.ui.demo.toolpageapp.view.itemEdit","picture").getValue();
            var description = Fragment.byId("sap.ui.demo.toolpageapp.view.itemEdit","description").getValue();
			if(!itemName || !price || !result || !picture || !description){
				MessageToast.show("请输入完整信息!");
				return;
			}			
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/editItem",
                headers:{
                    itemid:that.editItemID,
                    itemname:encodeURIComponent(itemName),
                    price:price,
                    result:encodeURIComponent(result),
                    picture:picture,
                    description:encodeURIComponent(description)
                },
                success:function(res){
                    MessageToast.show("编辑成功");
                    that._oEditItemDialog.close();
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"item");
                },
                datatype: "json"
            })
		}
	});

});