sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"./BaseController",
	"sap/ui/core/Fragment"
], function (Controller, MessageToast,JSONModel,BaseController,Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.inspectorManage", {
		onInit:async function(){
            let that = this;
            jQuery.get({     //save data local JSON file
                type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/getInspector",
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"inspector");
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
                url: "http://124.222.52.43:3000/getSearchedInspector",
                headers:{
                    inspectorsearch:this.searchString
                },
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"inspector");
                },
                datatype: "json"
            })
        },
		onAdd:function(){
			if (!this._pNewInspectorLoaded) {
				this._pNewInspectorLoaded = sap.ui.core.Fragment.load({
					name: "sap.ui.demo.toolpageapp.view.inspectorAdd",
					id: "sap.ui.demo.toolpageapp.view.inspectorAdd",
					controller: this
				});
			}
			this._pNewInspectorLoaded.then(function (oDialog) {
				this._oAddInspectorDialog = oDialog;
				this.getView().addDependent(this._oAddInspectorDialog);
				oDialog.open();
			}.bind(this));
		},
		onSaveAdd:async function(){
			var inspectorID = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorAdd","inspectorID").getValue();
            var inspectorName = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorAdd","inspectorName").getValue();
            var email = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorAdd","email").getValue();
            var password = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorAdd","password").getValue();
            var itemID = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorAdd","itemID").getValue();
			if(!inspectorID || !inspectorName){
				MessageToast.show("请输入必要信息!");
				return;
			}
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/addInspector",
                headers:{
                    inspectorid:inspectorID,
                    inspectorname:encodeURIComponent(inspectorName),
                    email:email,
                    password:password,
                    itemid:itemID
                },
                success:function(res){
                    MessageToast.show("添加成功");
                    that._oAddInspectorDialog.close();
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"inspector");
                },
                datatype: "json"
            })
		},
		onCloseAddDialog:function(){
			this._oAddInspectorDialog.close();
		},
		onDelete:async function(){
			var oSelectedInspectors,DeletedInspectors = [];
			var oInspector;
			var DeletedInspector;
			oSelectedInspectors = this.byId("table").getSelectedItems();
			if(oSelectedInspectors.length){
				for(let i=0;i<oSelectedInspectors.length;i++){
					oInspector = oSelectedInspectors[i];
					DeletedInspector=oInspector.getBindingContext("inspector").getProperty("inspectorID");
					DeletedInspectors.push(DeletedInspector);
				}				
			}else{
				MessageToast.show("请至少选择一项!");
				return;
			}
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/deleteInspector",
                headers:{
                    inspectorid:DeletedInspectors
                },
                success:function(res){
                    MessageToast.show("删除成功");
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"inspector");
                },
                datatype: "json"
            })
		},
		onEdit:function(){
			var oSelectedInspector = this.byId("table").getSelectedItems();			
			if(oSelectedInspector.length>1){
				MessageToast.show("您只能选择一项!");
				return;
			}
			if(oSelectedInspector.length==0){
				MessageToast.show("请至少选择一项!");
				return;
			}
			this.editInspectorID = oSelectedInspector[0].getBindingContext("inspector").getProperty("inspectorID");
            let inspectors = this.getModel("inspector").oData;
            let that = this;
            let oModel = new JSONModel(inspectors.find(function(item){
                if(item.inspectorID == that.editInspectorID){
                    return item;
                }
            }));
            this.getView().setModel(oModel,"editInspector")
            if (!this._pEditInspectorLoaded) {
				this._pEditInspectorLoaded = sap.ui.core.Fragment.load({
					name: "sap.ui.demo.toolpageapp.view.inspectorEdit",
					id: "sap.ui.demo.toolpageapp.view.inspectorEdit",
					controller: this
				});
			}
			this._pEditInspectorLoaded.then(function (oDialog) {
				this._oEditInspectorDialog = oDialog;
				this.getView().addDependent(this._oEditInspectorDialog);
				oDialog.open();
			}.bind(this));
			
		},
		onCloseEditDialog:function(){
			this._oEditInspectorDialog.close();
		},
		onSaveEdit:async function(){
            var inspectorName = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorEdit","inspectorName").getValue();
            var email = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorEdit","email").getValue();
            var password = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorEdit","password").getValue();
            var itemID = Fragment.byId("sap.ui.demo.toolpageapp.view.inspectorEdit","itemID").getValue();
			if(!inspectorName){
				MessageToast.show("请输入必要信息!");
				return;
			}			
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/editInspector",
                headers:{
                    inspectorid:that.editInspectorID,
                    inspectorname:encodeURIComponent(inspectorName),
                    email:email,
                    password:password,
                    itemid:itemID
                },
                success:function(res){
                    MessageToast.show("编辑成功");
                    that._oEditInspectorDialog.close();
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"inspector");
                },
                datatype: "json"
            })
		}
	});

});